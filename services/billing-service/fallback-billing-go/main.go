package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

type BillingRequest struct {
	TenantSlug  string `json:"tenant_slug"`
	Timestamp   string `json:"timestamp"`
}

type DeceasedRecord struct {
	ID           int
	DeceasedID   string
	FullName     string
	DateAdmitted string
	Status       string
}

type TenantSettings struct {
	DailyRate     float64
	EmbalmingRate float64
	StorageRate   float64
}

type BillingResult struct {
	Success      bool                   `json:"success"`
	Tenant       string                 `json:"tenant"`
	Processed    int                    `json:"processed"`
	Succeeded    int                    `json:"succeeded"`
	Failed       int                    `json:"failed"`
	Errors       []BillingError         `json:"errors"`
	Timestamp    string                 `json:"timestamp"`
	FallbackUsed bool                   `json:"fallback"`
}

type BillingError struct {
	DeceasedID int    `json:"deceasedId"`
	Name       string `json:"name"`
	Error      string `json:"error"`
}

var db *sql.DB

func main() {
	// Load environment variables
	godotenv.Load()

	// Database connection
	var err error
	db, err = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		"tenant_tracking"))
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer db.Close()

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	// Routes
	http.HandleFunc("/health", healthCheck)
	http.HandleFunc("/api/billing/process", processBilling)
	http.HandleFunc("/api/billing/calculate", calculateCharges)
	http.HandleFunc("/api/billing/status", billingStatus)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5022"
	}

	log.Printf("Go Billing Fallback Service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "UP",
		"service":   "go-billing-fallback",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func billingStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"service":  "go-billing-fallback",
		"status":   "running",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func processBilling(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req BillingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Go fallback processing billing for tenant: %s", req.TenantSlug)
	result := processTenantBilling(req.TenantSlug)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"fallback": true,
		"data":     result,
	})
}

func calculateCharges(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		DeceasedID int    `json:"deceased_id"`
		TenantSlug string `json:"tenant_slug"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	charges, err := calculateDeceasedCharges(req.DeceasedID, req.TenantSlug)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    charges,
	})
}

func processTenantBilling(tenantSlug string) BillingResult {
	result := BillingResult{
		Success:      true,
		Tenant:       tenantSlug,
		Timestamp:    time.Now().Format(time.RFC3339),
		FallbackUsed: true,
	}

	// Get all active deceased for this tenant
	rows, err := db.Query(`
		SELECT id, deceased_id, full_name, date_admitted, status
		FROM deceased
		WHERE tenant_slug = ? AND status IN ('admitted', 'active')
	`, tenantSlug)

	if err != nil {
		result.Success = false
		result.FatalError = err.Error()
		return result
	}
	defer rows.Close()

	var deceasedList []DeceasedRecord
	for rows.Next() {
		var d DeceasedRecord
		if err := rows.Scan(&d.ID, &d.DeceasedID, &d.FullName, &d.DateAdmitted, &d.Status); err != nil {
			log.Printf("Error scanning deceased: %v", err)
			continue
		}
		deceasedList = append(deceasedList, d)
	}

	result.Processed = len(deceasedList)

	// Process each deceased
	for _, deceased := range deceasedList {
		charges, err := calculateDeceasedCharges(deceased.ID, tenantSlug)
		if err != nil {
			result.Failed++
			result.Errors = append(result.Errors, BillingError{
				DeceasedID: deceased.ID,
				Name:       deceased.FullName,
				Error:      err.Error(),
			})
			continue
		}

		// Save billing record
		_, err = db.Exec(`
			INSERT INTO daily_billing
			(deceased_id, tenant_slug, days_admitted, daily_rate, base_charges, additional_charges, total_charge, billing_date, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
			ON DUPLICATE KEY UPDATE
			days_admitted = VALUES(days_admitted),
			base_charges = VALUES(base_charges),
			additional_charges = VALUES(additional_charges),
			total_charge = VALUES(total_charge),
			updated_at = VALUES(created_at)
		`,
			charges["deceasedId"],
			tenantSlug,
			charges["daysAdmitted"],
			charges["dailyRate"],
			charges["baseCharges"],
			charges["additionalCharges"],
			charges["totalDailyCharge"],
			time.Now(),
		)

		if err != nil {
			result.Failed++
			result.Errors = append(result.Errors, BillingError{
				DeceasedID: deceased.ID,
				Name:       deceased.FullName,
				Error:      err.Error(),
			})
		} else {
			result.Succeeded++
			log.Printf("✓ Billed %s: KES %.2f", deceased.FullName, charges["totalDailyCharge"])
		}
	}

	return result
}

func calculateDeceasedCharges(deceasedID int, tenantSlug string) (map[string]interface{}, error) {
	// Get deceased details
	var dateAdmitted string
	var daysAdmitted int
	err := db.QueryRow(`
		SELECT date_admitted, DATEDIFF(NOW(), date_admitted)
		FROM deceased
		WHERE id = ? AND tenant_slug = ?
	`, deceasedID, tenantSlug).Scan(&dateAdmitted, &daysAdmitted)

	if err != nil {
		return nil, err
	}

	if daysAdmitted < 1 {
		daysAdmitted = 1
	}

	// Get tenant settings
	settings := getTenantSettings(tenantSlug)
	dailyRate := settings.DailyRate
	embalmingRate := settings.EmbalmingRate
	storageRate := settings.StorageRate

	// Calculate charges
	baseCharges := float64(daysAdmitted) * dailyRate
	additionalCharges := 0.0 // TODO: Add embalming/storage logic

	totalDailyCharge := baseCharges + additionalCharges

	return map[string]interface{}{
		"deceasedId":        deceasedID,
		"tenantSlug":        tenantSlug,
		"daysAdmitted":      daysAdmitted,
		"dailyRate":         dailyRate,
		"baseCharges":       baseCharges,
		"additionalCharges": additionalCharges,
		"totalDailyCharge":  totalDailyCharge,
		"calculatedAt":      time.Now().Format(time.RFC3339),
	}, nil
}

func getTenantSettings(tenantSlug string) TenantSettings {
	var settings TenantSettings
	err := db.QueryRow(`
		SELECT daily_rate, embalming_rate, storage_rate
		FROM tenant_settings
		WHERE tenant_slug = ?
	`, tenantSlug).Scan(&settings.DailyRate, &settings.EmbalmingRate, &settings.StorageRate)

	if err != nil {
		// Return defaults
		return TenantSettings{
			DailyRate:     1500.0,
			EmbalmingRate: 3000.0,
			StorageRate:   500.0,
		}
	}

	return settings
}
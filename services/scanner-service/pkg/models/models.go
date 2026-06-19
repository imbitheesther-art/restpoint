package models

import "time"

// ScannerDevice represents a detected scanner device
type ScannerDevice struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Type         string    `json:"type"`         // twain, wia, sane, escl, mobile, web
	Status       string    `json:"status"`       // available, busy, offline
	Capabilities []string  `json:"capabilities"` // color, grayscale, duplex, etc.
	Location     string    `json:"location"`     // local, network
	LastUsed     time.Time `json:"last_used"`
}

// ScanRequest represents a scan request
type ScanRequest struct {
	DeceasedID   string            `json:"deceased_id"`
	DocumentType string            `json:"document_type"` // death_certificate, id_document, etc.
	ScannerID    string            `json:"scanner_id"`
	Format       string            `json:"format"`        // pdf, jpg, png
	DPI          int               `json:"dpi"`
	ColorMode    string            `json:"color_mode"`   // color, grayscale, bw
	Pages        int               `json:"pages"`         // number of pages to scan
	Options      map[string]interface{} `json:"options"`
}

// ScanJob represents an active scan job
type ScanJob struct {
	ID          string    `json:"id"`
	DeceasedID  string    `json:"deceased_id"`
	ScannerID   string    `json:"scanner_id"`
	Status      string    `json:"status"`      // pending, scanning, processing, completed, failed
	Progress    int       `json:"progress"`    // 0-100
	CurrentPage int       `json:"current_page"`
	TotalPages  int       `json:"total_pages"`
	Message     string    `json:"message"`
	StartedAt   time.Time `json:"started_at"`
	CompletedAt time.Time `json:"completed_at"`
	FilePath    string    `json:"file_path"`
	FileName    string    `json:"file_name"`
	FileSize    int64     `json:"file_size"`
	Error       string    `json:"error,omitempty"`
}

// ScanResponse represents the response from a scan request
type ScanResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	JobID   string `json:"job_id"`
	Status  string `json:"status"`
}

// Document represents a scanned document
type Document struct {
	ID           string    `json:"id"`
	DeceasedID   string    `json:"deceased_id"`
	DocumentType string    `json:"document_type"`
	FileName     string    `json:"file_name"`
	FilePath     string    `json:"file_path"`
	FileSize     int64     `json:"file_size"`
	MimeType     string    `json:"mime_type"`
	Pages        int       `json:"pages"`
	ScannerType  string    `json:"scanner_type"`
	UploadedAt   time.Time `json:"uploaded_at"`
	TenantSlug   string    `json:"tenant_slug"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Service   string    `json:"service"`
	Scanners  int       `json:"scanners"`
	Timestamp time.Time `json:"timestamp"`
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	Type    string      `json:"type"`    // status, progress, complete, error
	JobID   string      `json:"job_id"`
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
}

// MobileScanRequest represents a mobile scan request
type MobileScanRequest struct {
	DeceasedID   string `json:"deceased_id"`
	DocumentType string `json:"document_type"`
	ImageData    string `json:"image_data"` // Base64 encoded image
	FileName     string `json:"file_name"`
}

// GetCurrentTime returns the current time in Kenya timezone
func GetCurrentTime() time.Time {
	loc, _ := time.LoadLocation("Africa/Nairobi")
	return time.Now().In(loc)
}
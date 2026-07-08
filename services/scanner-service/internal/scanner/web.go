package scanner

import (
	"context"
	"fmt"
	"time"

	"scanner-service/pkg/models"
)

// WebScannerDriver provides web-based scanning using browser APIs
// This is the fallback for systems without native scanner drivers
type WebScannerDriver struct {
	scanners []models.ScannerDevice
}

// NewWebScannerDriver creates a new web scanner driver
func NewWebScannerDriver() *WebScannerDriver {
	return &WebScannerDriver{
		scanners: []models.ScannerDevice{
			{
				ID:       "web-scanner-1",
				Name:     "Browser Scanner (Web TWAIN)",
				Type:     "web",
				Status:   "available",
				Location: "local",
				Capabilities: []string{"color", "grayscale", "bw", "pdf", "jpg", "png"},
				LastUsed: time.Now(),
			},
		},
	}
}

// Initialize initializes the web scanner driver
func (d *WebScannerDriver) Initialize() error {
	return nil
}

// GetType returns the driver type
func (d *WebScannerDriver) GetType() string {
	return "web"
}

// GetScanners returns available web scanners
func (d *WebScannerDriver) GetScanners() ([]models.ScannerDevice, error) {
	return d.scanners, nil
}

// IsAvailable checks if the scanner is available
func (d *WebScannerDriver) IsAvailable(scannerID string) (bool, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Status == "available", nil
		}
	}
	return false, fmt.Errorf("scanner not found: %s", scannerID)
}

// GetCapabilities returns scanner capabilities
func (d *WebScannerDriver) GetCapabilities(scannerID string) ([]string, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Capabilities, nil
		}
	}
	return nil, fmt.Errorf("scanner not found: %s", scannerID)
}

// GetStatus returns scanner status
func (d *WebScannerDriver) GetStatus(scannerID string) (string, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Status, nil
		}
	}
	return "offline", fmt.Errorf("scanner not found: %s", scannerID)
}

// Scan performs a web-based scan
// Note: Actual scanning is done client-side via Web TWAIN or similar
// This method handles the upload of scanned data from the client
func (d *WebScannerDriver) Scan(ctx context.Context, params ScanParameters) (*ScanResult, error) {
	// Web scanning is handled differently - the client does the actual scanning
	// and uploads the result. This method is a placeholder for the workflow.
	
	return &ScanResult{
		Success:  false,
		Error:    fmt.Errorf("web scanning requires client-side implementation. Use /api/v1/scanner/scans/upload endpoint"),
		Message:  "Web scanning requires client-side implementation",
	}, nil
}

// Cleanup releases resources
func (d *WebScannerDriver) Cleanup() error {
	return nil
}
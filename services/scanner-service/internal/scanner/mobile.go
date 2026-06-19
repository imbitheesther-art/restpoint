package scanner

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"scanner-service/pkg/models"
)

// MobileScannerDriver handles scanning from mobile devices
type MobileScannerDriver struct {
	scanners []models.ScannerDevice
}

// NewMobileScannerDriver creates a new mobile scanner driver
func NewMobileScannerDriver() *MobileScannerDriver {
	return &MobileScannerDriver{
		scanners: []models.ScannerDevice{
			{
				ID:       "mobile-scanner-1",
				Name:     "Mobile Camera Scanner",
				Type:     "mobile",
				Status:   "available",
				Location: "mobile",
				Capabilities: []string{"color", "camera", "pdf", "jpg", "png", "multi-page"},
				LastUsed: time.Now(),
			},
		},
	}
}

// Initialize initializes the mobile scanner driver
func (d *MobileScannerDriver) Initialize() error {
	return nil
}

// GetType returns the driver type
func (d *MobileScannerDriver) GetType() string {
	return "mobile"
}

// GetScanners returns available mobile scanners
func (d *MobileScannerDriver) GetScanners() ([]models.ScannerDevice, error) {
	return d.scanners, nil
}

// IsAvailable checks if the scanner is available
func (d *MobileScannerDriver) IsAvailable(scannerID string) (bool, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Status == "available", nil
		}
	}
	return false, fmt.Errorf("scanner not found: %s", scannerID)
}

// GetCapabilities returns scanner capabilities
func (d *MobileScannerDriver) GetCapabilities(scannerID string) ([]string, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Capabilities, nil
		}
	}
	return nil, fmt.Errorf("scanner not found: %s", scannerID)
}

// GetStatus returns scanner status
func (d *MobileScannerDriver) GetStatus(scannerID string) (string, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Status, nil
		}
	}
	return "offline", fmt.Errorf("scanner not found: %s", scannerID)
}

// Scan processes a mobile scan (image upload from mobile device)
func (d *MobileScannerDriver) Scan(ctx context.Context, params ScanParameters) (*ScanResult, error) {
	// Mobile scanning is handled via image upload
	// The actual scan is performed on the mobile device
	// This method processes the uploaded image
	
	return &ScanResult{
		Success:  false,
		Error:    fmt.Errorf("mobile scanning requires image upload via /api/v1/scanner/mobile/upload"),
		Message:  "Mobile scanning requires image upload",
	}, nil
}

// ProcessMobileImage processes an uploaded image from mobile device
func (d *MobileScannerDriver) ProcessMobileImage(deceasedID, documentType, base64Image, fileName string) (*ScanResult, error) {
	// Decode base64 image
	imageData, err := decodeBase64Image(base64Image)
	if err != nil {
		return &ScanResult{
			Success: false,
			Error:   err,
			Message: "Failed to decode image",
		}, err
	}

	// Determine file extension
	ext := strings.ToLower(filepath.Ext(fileName))
	if ext == "" {
		ext = ".jpg"
	}

	// Generate unique filename
	timestamp := time.Now().Format("20060102_150405")
	uniqueName := fmt.Sprintf("mobile_scan_%s_%s%s", deceasedID, timestamp, ext)
	
	// Save the image
	// Note: This will be handled by the storage backend in the actual implementation
	// For now, return a placeholder result
	
	return &ScanResult{
		Success:  true,
		FileName: uniqueName,
		FileSize: int64(len(imageData)),
		Pages:    1,
		MimeType: getMimeType(ext),
		Message:  "Mobile image processed successfully",
	}, nil
}

// Helper function to decode base64 image
func decodeBase64Image(base64Data string) ([]byte, error) {
	// Remove data URL prefix if present
	if idx := strings.Index(base64Data, ","); idx != -1 {
		base64Data = base64Data[idx+1:]
	}
	
	return base64.StdEncoding.DecodeString(base64Data)
}

// Helper function to get MIME type from extension
func getMimeType(ext string) string {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".pdf":
		return "application/pdf"
	case ".gif":
		return "image/gif"
	default:
		return "application/octet-stream"
	}
}

// Cleanup releases resources
func (d *MobileScannerDriver) Cleanup() error {
	return nil
}
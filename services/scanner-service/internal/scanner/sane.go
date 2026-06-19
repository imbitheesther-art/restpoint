package scanner

import (
	"context"
	"fmt"
	"time"

	"scanner-service/pkg/models"
)

// SANEScannerDriver provides SANE scanner support for Linux/Mac
type SANEScannerDriver struct {
	scanners []models.ScannerDevice
}

// NewSANEScannerDriver creates a new SANE scanner driver
func NewSANEScannerDriver() *SANEScannerDriver {
	return &SANEScannerDriver{
		scanners: []models.ScannerDevice{
			{
				ID:       "sane-default",
				Name:     "SANE Scanner (Linux/Mac)",
				Type:     "sane",
				Status:   "available",
				Location: "local",
				Capabilities: []string{"color", "grayscale", "bw", "duplex", "feeder", "pdf", "jpg", "png"},
				LastUsed: time.Now(),
			},
		},
	}
}

// Initialize initializes the SANE driver
func (d *SANEScannerDriver) Initialize() error {
	return nil
}

// GetType returns the driver type
func (d *SANEScannerDriver) GetType() string {
	return "sane"
}

// GetScanners returns available SANE scanners
func (d *SANEScannerDriver) GetScanners() ([]models.ScannerDevice, error) {
	return d.scanners, nil
}

// IsAvailable checks if the scanner is available
func (d *SANEScannerDriver) IsAvailable(scannerID string) (bool, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Status == "available", nil
		}
	}
	return false, fmt.Errorf("scanner not found: %s", scannerID)
}

// GetCapabilities returns scanner capabilities
func (d *SANEScannerDriver) GetCapabilities(scannerID string) ([]string, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Capabilities, nil
		}
	}
	return nil, fmt.Errorf("scanner not found: %s", scannerID)
}

// GetStatus returns scanner status
func (d *SANEScannerDriver) GetStatus(scannerID string) (string, error) {
	for _, s := range d.scanners {
		if s.ID == scannerID {
			return s.Status, nil
		}
	}
	return "offline", fmt.Errorf("scanner not found: %s", scannerID)
}

// Scan performs a SANE scan
func (d *SANEScannerDriver) Scan(ctx context.Context, params ScanParameters) (*ScanResult, error) {
	return &ScanResult{
		Success:  false,
		Error:    fmt.Errorf("SANE scanning requires SANE backend installation on Linux/Mac"),
		Message:  "SANE driver requires native implementation",
	}, nil
}

// Cleanup releases SANE resources
func (d *SANEScannerDriver) Cleanup() error {
	return nil
}
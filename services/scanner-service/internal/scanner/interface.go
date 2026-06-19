package scanner

import (
	"context"
	"fmt"
	"time"

	"scanner-service/pkg/models"
)

// ScannerDriver defines the interface for all scanner drivers
type ScannerDriver interface {
	// Initialize the scanner driver
	Initialize() error

	// Get available scanners from this driver
	GetScanners() ([]models.ScannerDevice, error)

	// Check if scanner is available
	IsAvailable(scannerID string) (bool, error)

	// Scan a document with the specified parameters
	Scan(ctx context.Context, params ScanParameters) (*ScanResult, error)

	// Get scanner capabilities
	GetCapabilities(scannerID string) ([]string, error)

	// Get scanner status
	GetStatus(scannerID string) (string, error)

	// Cleanup resources
	Cleanup() error

	// Get driver type
	GetType() string
}

// ScanParameters contains parameters for a scan operation
type ScanParameters struct {
	DeceasedID   string
	DocumentType string
	Format       string // pdf, jpg, png
	DPI          int
	ColorMode    string // color, grayscale, bw
	Pages        int
	OutputPath   string
	Options      map[string]interface{}
}

// ScanResult contains the result of a scan operation
type ScanResult struct {
	Success    bool
	FilePath   string
	FileName   string
	FileSize   int64
	Pages      int
	MimeType   string
	Error      error
	Message    string
}

// Storage interface for file operations
type Storage interface {
	SaveFile(deceasedID, fileName string, data []byte) (string, error)
	DeleteFile(filePath string) error
	GetFilePath(deceasedID, fileName string) string
	EnsureDirectory(deceasedID string) error
}

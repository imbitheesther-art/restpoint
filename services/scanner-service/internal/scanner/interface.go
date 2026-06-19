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

// ScannerManager manages all scanner drivers
type ScannerManager struct {
	drivers  map[string]ScannerDriver
	storage  Storage
	jobs     map[string]*models.ScanJob
	scanners []models.ScannerDevice
}

// Storage interface for file operations
type Storage interface {
	SaveFile(deceasedID, fileName string, data []byte) (string, error)
	DeleteFile(filePath string) error
	GetFilePath(deceasedID, fileName string) string
	EnsureDirectory(deceasedID string) error
}

// NewManager creates a new scanner manager
func NewManager(storage Storage) *ScannerManager {
	return &ScannerManager{
		drivers: make(map[string]ScannerDriver),
		storage: storage,
		jobs:    make(map[string]*models.ScanJob),
	}
}

// RegisterDriver registers a scanner driver
func (m *ScannerManager) RegisterDriver(driver ScannerDriver) {
	m.drivers[driver.GetType()] = driver
}

// DiscoverScanners discovers all available scanners from all drivers
func (m *ScannerManager) DiscoverScanners() error {
	var allScanners []models.ScannerDevice

	for driverType, driver := range m.drivers {
		scanners, err := driver.GetScanners()
		if err != nil {
			continue
		}
		allScanners = append(allScanners, scanners...)
	}

	m.scanners = allScanners
	return nil
}

// GetAvailableScanners returns all available scanners
func (m *ScannerManager) GetAvailableScanners() []models.ScannerDevice {
	return m.scanners
}

// GetScanner returns a specific scanner by ID
func (m *ScannerManager) GetScanner(scannerID string) (ScannerDriver, error) {
	for _, driver := range m.drivers {
		scanners, _ := driver.GetScanners()
		for _, scanner := range scanners {
			if scanner.ID == scannerID {
				return driver, nil
			}
		}
	}
	return nil, fmt.Errorf("scanner not found: %s", scannerID)
}

// ScanDocument initiates a scan job
func (m *ScannerManager) ScanDocument(ctx context.Context, params ScanParameters) (*models.ScanJob, error) {
	jobID := generateJobID()

	job := &models.ScanJob{
		ID:          jobID,
		DeceasedID:  params.DeceasedID,
		ScannerID:   params.OutputPath,
		Status:      "pending",
		Progress:    0,
		CurrentPage: 0,
		TotalPages:  params.Pages,
		StartedAt:   models.GetCurrentTime(),
	}

	m.jobs[jobID] = job

	// Find the appropriate driver
	driver, err := m.GetScanner(params.OutputPath)
	if err != nil {
		job.Status = "failed"
		job.Error = err.Error()
		return job, err
	}

	// Ensure output directory exists
	if err := m.storage.EnsureDirectory(params.DeceasedID); err != nil {
		job.Status = "failed"
		job.Error = err.Error()
		return job, err
	}

	// Perform scan
	go func() {
		job.Status = "scanning"
		result, err := driver.Scan(ctx, params)

		if err != nil || !result.Success {
			job.Status = "failed"
			job.Error = err.Error()
			job.CompletedAt = models.GetCurrentTime()
			return
		}

		job.Status = "completed"
		job.FilePath = result.FilePath
		job.FileName = result.FileName
		job.FileSize = result.FileSize
		job.Pages = result.Pages
		job.Progress = 100
		job.CompletedAt = models.GetCurrentTime()
	}()

	return job, nil
}

// GetJob returns a scan job by ID
func (m *ScannerManager) GetJob(jobID string) (*models.ScanJob, bool) {
	job, exists := m.jobs[jobID]
	return job, exists
}

// Cleanup releases all resources
func (m *ScannerManager) Cleanup() {
	for _, driver := range m.drivers {
		driver.Cleanup()
	}
}

// Helper function to generate unique job ID
func generateJobID() string {
	return fmt.Sprintf("scan_%d", time.Now().UnixNano())
}
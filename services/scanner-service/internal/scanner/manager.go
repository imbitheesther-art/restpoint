package scanner

import (
	"context"
	"fmt"
	"time"

	"scanner-service/pkg/models"
)

// Manager is a concrete implementation that ties all drivers together
type Manager struct {
	drivers  map[string]ScannerDriver
	storage  Storage
	jobs     map[string]*models.ScanJob
	scanners []models.ScannerDevice
}

// NewManager creates a new scanner manager with all drivers registered
func NewManager(storage Storage) *Manager {
	m := &Manager{
		drivers: make(map[string]ScannerDriver),
		storage: storage,
		jobs:    make(map[string]*models.ScanJob),
	}

	// Register all scanner drivers
	m.RegisterDriver(NewWebScannerDriver())
	m.RegisterDriver(NewMobileScannerDriver())
	m.RegisterDriver(NewTwainScannerDriver())
	m.RegisterDriver(NewWIAScannerDriver())
	m.RegisterDriver(NewSANEScannerDriver())
	m.RegisterDriver(NewESCLScannerDriver())

	return m
}

// RegisterDriver registers a scanner driver
func (m *Manager) RegisterDriver(driver ScannerDriver) {
	m.drivers[driver.GetType()] = driver
}

// DiscoverScanners discovers all available scanners from all drivers
func (m *Manager) DiscoverScanners() error {
	var allScanners []models.ScannerDevice

	for _, driver := range m.drivers {
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
func (m *Manager) GetAvailableScanners() []models.ScannerDevice {
	return m.scanners
}

// GetScanner returns a specific scanner by ID
func (m *Manager) GetScanner(scannerID string) (ScannerDriver, error) {
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
func (m *Manager) ScanDocument(ctx context.Context, params ScanParameters) (*models.ScanJob, error) {
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
		job.Progress = 100
		job.CompletedAt = models.GetCurrentTime()
	}()

	return job, nil
}

// GetJob returns a scan job by ID
func (m *Manager) GetJob(jobID string) (*models.ScanJob, bool) {
	job, exists := m.jobs[jobID]
	return job, exists
}

// Cleanup releases all resources
func (m *Manager) Cleanup() {
	for _, driver := range m.drivers {
		driver.Cleanup()
	}
}

// Helper function to generate unique job ID
func generateJobID() string {
	return fmt.Sprintf("scan_%d", time.Now().UnixNano())
}
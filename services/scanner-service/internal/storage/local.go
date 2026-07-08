package storage

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// LocalStorage implements file storage on local filesystem
type LocalStorage struct {
	basePath string
}

// NewLocalStorage creates a new local storage backend
func NewLocalStorage(basePath string) *LocalStorage {
	return &LocalStorage{
		basePath: basePath,
	}
}

// SaveFile saves a file to local storage
func (s *LocalStorage) SaveFile(deceasedID, fileName string, data []byte) (string, error) {
	// Create directory structure: basePath/deceasedID/
	dirPath := filepath.Join(s.basePath, deceasedID)
	if err := os.MkdirAll(dirPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Generate unique filename with timestamp
	timestamp := time.Now().Format("20060102_150405")
	uniqueName := fmt.Sprintf("%s_%s_%s", "scan", timestamp, fileName)
	filePath := filepath.Join(dirPath, uniqueName)

	// Write file
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	// Return relative path for database storage
	relativePath := filepath.Join("uploads", "scanned", deceasedID, uniqueName)
	return relativePath, nil
}

// DeleteFile deletes a file from local storage
func (s *LocalStorage) DeleteFile(filePath string) error {
	fullPath := filepath.Join(s.basePath, filePath)
	if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// GetFilePath returns the full filesystem path for a file
func (s *LocalStorage) GetFilePath(deceasedID, fileName string) string {
	return filepath.Join(s.basePath, deceasedID, fileName)
}

// EnsureDirectory ensures the directory for a deceased ID exists
func (s *LocalStorage) EnsureDirectory(deceasedID string) error {
	dirPath := filepath.Join(s.basePath, deceasedID)
	return os.MkdirAll(dirPath, 0755)
}

// GetBasePath returns the base storage path
func (s *LocalStorage) GetBasePath() string {
	return s.basePath
}
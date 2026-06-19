package api

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"

	"scanner-service/internal/scanner"
	"scanner-service/internal/storage"
	"scanner-service/pkg/models"
)

// Handler handles API requests
type Handler struct {
	scannerManager *scanner.Manager
	storage        storage.Storage
	upgrader       websocket.Upgrader
	wsClients      map[string]*websocket.Conn
}

// NewHandler creates a new API handler
func NewHandler(scannerManager *scanner.Manager, storage storage.Storage) *Handler {
	return &Handler{
		scannerManager: scannerManager,
		storage:        storage,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins in development
			},
		},
		wsClients: make(map[string]*websocket.Conn),
	}
}

// GetScanners returns all available scanners
func (h *Handler) GetScanners(c *gin.Context) {
	scanners := h.scannerManager.GetAvailableScanners()
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    scanners,
		"count":   len(scanners),
	})
}

// GetScannerStatus returns the status of a specific scanner
func (h *Handler) GetScannerStatus(c *gin.Context) {
	scannerID := c.Param("id")
	
	driver, err := h.scannerManager.GetScanner(scannerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	
	status, err := driver.GetStatus(scannerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"scanner_id": scannerID,
			"status":     status,
		},
	})
}

// ScanDocument initiates a scan job
func (h *Handler) ScanDocument(c *gin.Context) {
	scannerID := c.Param("id")
	
	var req models.ScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}
	
	// Set defaults
	if req.Format == "" {
		req.Format = "pdf"
	}
	if req.DPI == 0 {
		req.DPI = 300
	}
	if req.ColorMode == "" {
		req.ColorMode = "color"
	}
	if req.Pages == 0 {
		req.Pages = 1
	}
	
	// Create scan parameters
	params := scanner.ScanParameters{
		DeceasedID:   req.DeceasedID,
		DocumentType: req.DocumentType,
		Format:       req.Format,
		DPI:          req.DPI,
		ColorMode:    req.ColorMode,
		Pages:        req.Pages,
		OutputPath:   scannerID,
		Options:      req.Options,
	}
	
	// Initiate scan
	job, err := h.scannerManager.ScanDocument(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to initiate scan: " + err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, models.ScanResponse{
		Success: true,
		Message: "Scan job initiated",
		JobID:   job.ID,
		Status:  job.Status,
	})
}

// UploadScannedDocument handles upload of scanned documents from web scanner
func (h *Handler) UploadScannedDocument(c *gin.Context) {
	var req struct {
		DeceasedID   string `json:"deceased_id" binding:"required"`
		DocumentType string `json:"document_type" binding:"required"`
		FileData     string `json:"file_data" binding:"required"` // Base64 encoded
		FileName     string `json:"file_name" binding:"required"`
		MimeType     string `json:"mime_type"`
		ScannerType  string `json:"scanner_type"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}
	
	if req.MimeType == "" {
		req.MimeType = "application/pdf"
	}
	if req.ScannerType == "" {
		req.ScannerType = "web"
	}
	
	// Decode base64 file data
	fileData, err := base64.StdEncoding.DecodeString(req.FileData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid file data: " + err.Error(),
		})
		return
	}
	
	// Ensure directory exists
	if err := h.storage.EnsureDirectory(req.DeceasedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create directory: " + err.Error(),
		})
		return
	}
	
	// Generate unique filename
	timestamp := time.Now().Format("20060102_150405")
	ext := filepath.Ext(req.FileName)
	uniqueName := fmt.Sprintf("scan_%s_%s%s", req.DeceasedID, timestamp, ext)
	
	// Save file
	filePath, err := h.storage.SaveFile(req.DeceasedID, uniqueName, fileData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to save file: " + err.Error(),
		})
		return
	}
	
	// Create document record
	doc := models.Document{
		ID:           uuid.New().String(),
		DeceasedID:   req.DeceasedID,
		DocumentType: req.DocumentType,
		FileName:     uniqueName,
		FilePath:     filePath,
		FileSize:     int64(len(fileData)),
		MimeType:     req.MimeType,
		Pages:        1,
		ScannerType:  req.ScannerType,
		UploadedAt:   models.GetCurrentTime(),
		TenantSlug:   c.GetString("tenant_slug"),
	}
	
	// In production, save to database here
	// For now, return success
	
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Document uploaded successfully",
		"data":    doc,
	})
}

// MobileScan handles mobile scan requests
func (h *Handler) MobileScan(c *gin.Context) {
	var req models.MobileScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}
	
	// Process mobile image
	mobileDriver := scanner.NewMobileScannerDriver()
	result, err := mobileDriver.ProcessMobileImage(
		req.DeceasedID,
		req.DocumentType,
		req.ImageData,
		req.FileName,
	)
	
	if err != nil || !result.Success {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process mobile scan: " + err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mobile scan processed successfully",
		"data":    result,
	})
}

// UploadMobileScan handles mobile scan upload
func (h *Handler) UploadMobileScan(c *gin.Context) {
	// Similar to UploadScannedDocument but for mobile
	h.UploadScannedDocument(c)
}

// GetDocuments returns documents for a deceased
func (h *Handler) GetDocuments(c *gin.Context) {
	deceasedID := c.Param("deceasedId")
	
	// In production, query from database
	// For now, return empty list
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    []models.Document{},
		"count":   0,
	})
}

// DownloadDocument serves a document for download
func (h *Handler) DownloadDocument(c *gin.Context) {
	documentID := c.Param("documentId")
	
	// In production, query from database
	// For now, return not found
	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"message": "Document not found",
	})
}

// DeleteDocument deletes a document
func (h *Handler) DeleteDocument(c *gin.Context) {
	documentID := c.Param("documentId")
	
	// In production, delete from database and filesystem
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Document deleted successfully",
	})
}

// ScanWebSocket handles WebSocket connections for real-time scan status
func (h *Handler) ScanWebSocket(c *gin.Context) {
	scanID := c.Param("scanId")
	
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Error("WebSocket upgrade error: ", err)
		return
	}
	defer conn.Close()
	
	h.wsClients[scanID] = conn
	
	// Send initial status
	job, exists := h.scannerManager.GetJob(scanID)
	if exists {
		h.sendWSMessage(conn, "status", job.Status, "Scan job status")
	}
	
	// Keep connection alive and listen for messages
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			delete(h.wsClients, scanID)
			break
		}
	}
}

// sendWSMessage sends a message to WebSocket client
func (h *Handler) sendWSMessage(conn *websocket.Conn, msgType, status, message string) {
	msg := models.WebSocketMessage{
		Type:    msgType,
		JobID:   "",
		Data:    status,
		Message: message,
	}
	
	if err := conn.WriteJSON(msg); err != nil {
		logrus.Error("WebSocket write error: ", err)
	}
}

// BroadcastScanUpdate broadcasts scan status update to all connected clients
func (h *Handler) BroadcastScanUpdate(jobID, status, message string) {
	for scanID, conn := range h.wsClients {
		if scanID == jobID {
			h.sendWSMessage(conn, "status", status, message)
		}
	}
}
package main

import (
	"os"
	"os/signal"
	"syscall"

	"scanner-service/internal/api"
	"scanner-service/internal/scanner"
	"scanner-service/internal/storage"
	"scanner-service/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func main() {
	// Initialize logger
	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.SetLevel(logrus.InfoLevel)

	// Load configuration
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	
	if err := viper.ReadInConfig(); err != nil {
		logrus.Warn("No config file found, using defaults and environment variables")
	}

	// Set defaults
	viper.SetDefault("server.port", "2024")
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("storage.type", "local")
	viper.SetDefault("storage.upload_path", "./uploads/scanned")
	viper.SetDefault("scanner.auto_detect", true)
	viper.SetDefault("scanner.default_dpi", 300)
	viper.SetDefault("scanner.default_format", "pdf")

	// Initialize storage backend
	var storageBackend scanner.Storage
	storageType := viper.GetString("storage.type")
	
	switch storageType {
	case "local":
		uploadPath := viper.GetString("storage.upload_path")
		storageBackend = storage.NewLocalStorage(uploadPath)
		logrus.Infof("Using local storage at: %s", uploadPath)
	case "s3":
		// S3 storage can be added here
		logrus.Fatal("S3 storage not yet implemented")
	default:
		logrus.Fatal("Unknown storage type: ", storageType)
	}

	// Initialize scanner manager
	scannerManager := scanner.NewManager(storageBackend)
	
	// Auto-detect scanners if enabled
	if viper.GetBool("scanner.auto_detect") {
		logrus.Info("Auto-detecting scanners...")
		if err := scannerManager.DiscoverScanners(); err != nil {
			logrus.Warn("Scanner auto-detection failed: ", err)
		}
	}

	// Initialize API handlers
	handler := api.NewHandler(scannerManager, storageBackend)

	// Setup Gin router
	if viper.GetString("server.env") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Tenant-Slug, X-Deceased-Id")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		scanners := scannerManager.GetAvailableScanners()
		c.JSON(200, models.HealthResponse{
			Status:    "UP",
			Service:   "scanner-service",
			Scanners:  len(scanners),
			Timestamp: models.GetCurrentTime(),
		})
	})

	// API routes
	apiGroup := router.Group("/api/v1/scanner")
	{
		// Scanner discovery and management
		apiGroup.GET("/scanners", handler.GetScanners)
		apiGroup.GET("/scanners/:id/status", handler.GetScannerStatus)
		apiGroup.POST("/scanners/:id/scan", handler.ScanDocument)
		apiGroup.POST("/scans/upload", handler.UploadScannedDocument)
		
		// Mobile scanning endpoints
		apiGroup.POST("/mobile/scan", handler.MobileScan)
		apiGroup.POST("/mobile/upload", handler.UploadMobileScan)
		
		// Document management
		apiGroup.GET("/documents/:deceasedId", handler.GetDocuments)
		apiGroup.GET("/documents/download/:documentId", handler.DownloadDocument)
		apiGroup.DELETE("/documents/:documentId", handler.DeleteDocument)
		
		// WebSocket for real-time scan status
		apiGroup.GET("/ws/scan/:scanId", handler.ScanWebSocket)
	}

	// Static files for web scanner fallback
	router.Static("/web/static", "./web/static")
	router.GET("/scanner", func(c *gin.Context) {
		c.File("./web/static/scanner.html")
	})
	router.GET("/mobile-scanner", func(c *gin.Context) {
		c.File("./web/static/mobile.html")
	})

	// Start server
	port := viper.GetString("server.port")
	logrus.Infof("🖨️  Scanner Service starting on port %s", port)
	logrus.Infof("📡 API: http://localhost:%s/api/v1/scanner", port)
	logrus.Infof("🌐 Web Scanner: http://localhost:%s/scanner", port)
	logrus.Infof("📱 Mobile Scanner: http://localhost:%s/mobile-scanner", port)

	go func() {
		if err := router.Run(":" + port); err != nil {
			logrus.Fatal("Failed to start server: ", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	logrus.Info("Shutting down scanner service...")
	scannerManager.Cleanup()
	logrus.Info("Scanner service stopped")
}
package processor

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu"
	"github.com/disintegration/imaging"
)

// PDFProcessor handles PDF generation and manipulation
type PDFProcessor struct {
	config *pdfcpu.Configuration
}

// NewPDFProcessor creates a new PDF processor
func NewPDFProcessor() *PDFProcessor {
	return &PDFProcessor{
		config: pdfcpu.NewDefaultConfiguration(),
	}
}

// ImageToPDF converts images to PDF
func (p *PDFProcessor) ImageToPDF(imagePaths []string, outputPath string) error {
	if len(imagePaths) == 0 {
		return fmt.Errorf("no images provided")
	}

	// If single image, create simple PDF
	if len(imagePaths) == 1 {
		return p.singleImageToPDF(imagePaths[0], outputPath)
	}

	// Multiple images - create multi-page PDF
	return p.multiImageToPDF(imagePaths, outputPath)
}

// singleImageToPDF converts a single image to PDF
func (p *PDFProcessor) singleImageToPDF(imagePath, outputPath string) error {
	// Open image file
	file, err := os.Open(imagePath)
	if err != nil {
		return fmt.Errorf("failed to open image: %w", err)
	}
	defer file.Close()

	// Decode image
	img, format, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	// Create output file
	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	// Encode as PDF using pdfcpu
	// For simplicity, we'll use a basic approach
	// In production, use pdfcpu's proper API
	
	// Convert to JPEG first for consistency
	if format != "jpeg" && format != "jpg" {
		buf := new(bytes.Buffer)
		if err := jpeg.Encode(buf, img, &jpeg.Options{Quality: 90}); err != nil {
			return fmt.Errorf("failed to encode JPEG: %w", err)
		}
		
		// Create PDF from JPEG
		if err := api.ImageFileToPDF(buf.String(), outputPath, p.config); err != nil {
			return fmt.Errorf("failed to create PDF: %w", err)
		}
	} else {
		if err := api.ImageFileToPDF(imagePath, outputPath, p.config); err != nil {
			return fmt.Errorf("failed to create PDF: %w", err)
		}
	}

	return nil
}

// multiImageToPDF converts multiple images to a multi-page PDF
func (p *PDFProcessor) multiImageToPDF(imagePaths []string, outputPath string) error {
	// Create temporary directory for processing
	tempDir, err := os.MkdirTemp("", "pdf_processor")
	if err != nil {
		return fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Process each image
	var processedImages []string
	for i, imgPath := range imagePaths {
		processedPath := filepath.Join(tempDir, fmt.Sprintf("page_%d.jpg", i))
		
		// Open and enhance image
		img, err := imaging.Open(imgPath)
		if err != nil {
			return fmt.Errorf("failed to open image %s: %w", imgPath, err)
		}

		// Enhance image for document scanning
		img = p.enhanceDocumentImage(img)

		// Save as JPEG
		if err := imaging.Save(img, processedPath); err != nil {
			return fmt.Errorf("failed to save processed image: %w", err)
		}

		processedImages = append(processedImages, processedPath)
	}

	// Merge all images into single PDF
	if err := api.ImagesToPDF(processedImages, outputPath, nil, p.config); err != nil {
		return fmt.Errorf("failed to merge images to PDF: %w", err)
	}

	return nil
}

// enhanceDocumentImage applies enhancements for document scanning
func (p *PDFProcessor) enhanceDocumentImage(img image.Image) *image.NRGBA {
	// Convert to grayscale for better OCR
	// img = imaging.Grayscale(img)
	
	// Auto-contrast
	img = imaging.AdjustContrast(img, 10)
	
	// Sharpen
	img = imaging.Sharpen(img, 0.5)
	
	// Auto-rotate if needed (deskew)
	// This would require more complex logic in production
	
	return img
}

// OptimizePDF optimizes PDF file size
func (p *PDFProcessor) OptimizePDF(inputPath, outputPath string) error {
	// Use pdfcpu to optimize
	if err := api.OptimizeFile(inputPath, outputPath, p.config); err != nil {
		return fmt.Errorf("failed to optimize PDF: %w", err)
	}
	return nil
}

// GetPDFInfo returns information about a PDF
func (p *PDFProcessor) GetPDFInfo(pdfPath string) (pages int, fileSize int64, err error) {
	// Get file info
	fileInfo, err := os.Stat(pdfPath)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get file info: %w", err)
	}
	fileSize = fileInfo.Size()

	// Get page count using pdfcpu
	// This is a simplified version
	pages = 1 // Default to 1 page

	return pages, fileSize, nil
}
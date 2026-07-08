package processor

import (
	"image"
	"image/color"

	"github.com/disintegration/imaging"
)

// ImageProcessor handles image processing operations
type ImageProcessor struct{}

// NewImageProcessor creates a new image processor
func NewImageProcessor() *ImageProcessor {
	return &ImageProcessor{}
}

// EnhanceDocument applies enhancements to scanned document images
func (p *ImageProcessor) EnhanceDocument(img image.Image) image.Image {
	// Convert to grayscale for better OCR and smaller file size
	img = imaging.Grayscale(img)
	
	// Auto-adjust contrast
	img = imaging.AdjustContrast(img, 15)
	
	// Sharpen for better text clarity
	img = imaging.Sharpen(img, 0.7)
	
	// Adjust brightness
	img = imaging.AdjustBrightness(img, 5)
	
	return img
}

// Deskew attempts to correct image rotation
// Note: This is a simplified version. Production would use more advanced algorithms
func (p *ImageProcessor) Deskew(img image.Image) image.Image {
	// In production, implement proper deskew algorithm
	// For now, return the image as-is
	return img
}

// AutoRotate automatically rotates image based on EXIF data
func (p *ImageProcessor) AutoRotate(img image.Image, orientation int) image.Image {
	switch orientation {
	case 2:
		return imaging.FlipH(img)
	case 3:
		return imaging.Rotate180(img)
	case 4:
		return imaging.FlipV(img)
	case 5:
		return imaging.Transpose(img)
	case 6:
		return imaging.Rotate270(img)
	case 7:
		return imaging.Transverse(img)
	case 8:
		return imaging.Rotate90(img)
	default:
		return img
	}
}

// ResizeForWeb resizes image for web viewing
func (p *ImageProcessor) ResizeForWeb(img image.Image, maxWidth int) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	
	if width <= maxWidth {
		return img
	}
	
	// Calculate new height maintaining aspect ratio
	height := bounds.Dy()
	newHeight := (height * maxWidth) / width
	
	return imaging.Resize(img, maxWidth, newHeight, imaging.Lanczos)
}

// ConvertToJPEG converts image to JPEG with specified quality
func (p *ImageProcessor) ConvertToJPEG(img image.Image, quality int) []byte {
	buf := new(bytes.Buffer)
	opts := &jpeg.Options{Quality: quality}
	jpeg.Encode(buf, img, opts)
	return buf.Bytes()
}

// ConvertToPNG converts image to PNG
func (p *ImageProcessor) ConvertToPNG(img image.Image) []byte {
	buf := new(bytes.Buffer)
	png.Encode(buf, img)
	return buf.Bytes()
}

// RemoveNoise reduces noise in scanned images
func (p *ImageProcessor) RemoveNoise(img image.Image) image.Image {
	// Apply slight blur to reduce noise
	img = imaging.Blur(img, 0.5)
	return img
}

// Binarize converts image to black and white for better OCR
func (p *ImageProcessor) Binarize(img image.Image, threshold float64) image.Image {
	bounds := img.Bounds()
	result := image.NewGray(bounds)
	
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			oldColor := img.At(x, y)
			r, g, b, _ := oldColor.RGBA()
			
			// Convert to grayscale
			gray := 0.299*float64(r) + 0.587*float64(g) + 0.114*float64(b)
			gray = gray / 256.0
			
			// Apply threshold
			var newColor color.Gray
			if gray > threshold {
				newColor = color.Gray{255}
			} else {
				newColor = color.Gray{0}
			}
			
			result.Set(x, y, newColor)
		}
	}
	
	return result
}

// CropToContent crops image to remove excess whitespace
func (p *ImageProcessor) CropToContent(img image.Image) image.Image {
	bounds := img.Bounds()
	
	// Find content boundaries
	minX, minY := bounds.Dx(), bounds.Dy()
	maxX, maxY := 0, 0
	
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			_, _, _, a := img.At(x, y).RGBA()
			if a > 0 {
				if x < minX {
					minX = x
				}
				if x > maxX {
					maxX = x
				}
				if y < minY {
					minY = y
				}
				if y > maxY {
					maxY = y
				}
			}
		}
	}
	
	// Add small padding
	padding := 10
	minX = max(minX-padding, bounds.Min.X)
	minY = max(minY-padding, bounds.Min.Y)
	maxX = min(maxX+padding, bounds.Max.X)
	maxY = min(maxY+padding, bounds.Max.Y)
	
	// Crop image
	newBounds := image.Rect(minX, minY, maxX, maxY)
	return imaging.Crop(img, newBounds)
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Helper function for max
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
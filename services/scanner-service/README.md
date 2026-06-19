# Scanner Service

A production-grade Go-based document scanner service that integrates with the mortuary management system to enable scanning of death certificates and other documents from physical scanners, mobile devices, and network scanners.

## Features

### 1. Multi-Scanner Support
- **Physical Scanners**: TWAIN (Windows), WIA (Windows), SANE (Linux/Mac)
- **Mobile Devices**: Camera scanning via mobile web interface
- **Network Scanners**: eSCL/AirPrint compatible network scanners
- **Web Fallback**: Browser-based scanning using Dynamic Web TWAIN SDK

### 2. Document Processing
- **PDF Generation**: Convert scanned images to high-quality PDFs
- **Multi-Page Support**: Combine multiple pages into single PDF
- **Image Enhancement**: Auto-rotate, deskew, enhance contrast
- **File Naming**: Auto-generate filenames: `death_certificate_{deceased_id}_{timestamp}.pdf`
- **Compression**: Optimize PDFs for storage efficiency

### 3. Real-Time Features
- **WebSocket Support**: Real-time scan status updates
- **Progress Tracking**: Live progress indicators during scanning
- **Job Management**: Track multiple concurrent scan jobs

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Go Scanner Service (Port 2024)          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Scanner Manager                         │   │
│  │  - Device Discovery                                 │   │
│  │  - Connection Management                            │   │
│  │  - Multi-scanner support                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TWAIN Driver │  │ Mobile API   │  │ eSCL Driver  │      │
│  │ (Windows)    │  │ (iOS/Android)│  │ (Network)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ WIA Driver   │  │ SANE Driver  │  │ Web Scanner  │      │
│  │ (Windows)    │  │ (Linux/Mac)  │  │ (Fallback)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
scanner-service/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── scanner/
│   │   ├── interface.go         # Scanner driver interface
│   │   ├── manager.go           # Scanner manager implementation
│   │   ├── web.go               # Web/browser scanner driver
│   │   ├── mobile.go            # Mobile camera scanner driver
│   │   ├── twain.go             # TWAIN driver (Windows)
│   │   ├── wia.go               # WIA driver (Windows)
│   │   ├── sane.go              # SANE driver (Linux/Mac)
│   │   └── escl.go              # eSCL network scanner driver
│   ├── processor/
│   │   ├── pdf.go               # PDF generation and manipulation
│   │   └── image.go             # Image processing and enhancement
│   ├── storage/
│   │   └── local.go             # Local filesystem storage
│   └── api/
│       └── handlers.go          # HTTP handlers and WebSocket
├── pkg/
│   └── models/
│       └── models.go            # Data models and structures
├── web/
│   └── static/                  # Web scanner fallback pages
├── Dockerfile                   # Container configuration
├── docker-compose.yml           # Service orchestration
├── go.mod                       # Go dependencies
├── go.sum                       # Dependency checksums
└── .env.example                 # Environment configuration
```

## API Endpoints

### Scanner Management
- `GET /api/v1/scanner/scanners` - List all available scanners
- `GET /api/v1/scanner/scanners/:id/status` - Get scanner status
- `POST /api/v1/scanner/scanners/:id/scan` - Initiate scan job
- `GET /api/v1/scanner/ws/scan/:scanId` - WebSocket for real-time status

### Document Upload
- `POST /api/v1/scanner/scans/upload` - Upload scanned document
- `POST /api/v1/scanner/mobile/upload` - Upload mobile scan
- `POST /api/v1/scanner/mobile/scan` - Process mobile scan

### Document Management
- `GET /api/v1/scanner/documents/:deceasedId` - Get documents for deceased
- `GET /api/v1/scanner/documents/download/:documentId` - Download document
- `DELETE /api/v1/scanner/documents/:documentId` - Delete document

### Health Check
- `GET /health` - Service health status

## Installation

### Prerequisites
- Go 1.21 or higher
- Docker and Docker Compose (for containerized deployment)
- SANE backend (for Linux/Mac scanner support)
- TWAIN/WIA drivers (for Windows scanner support)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scanner-service
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the service**
   ```bash
   go run cmd/server/main.go
   ```

5. **Access the service**
   - API: http://localhost:2024
   - Health Check: http://localhost:2024/health
   - Web Scanner: http://localhost:2024/scanner
   - Mobile Scanner: http://localhost:2024/mobile-scanner

### Docker Deployment

1. **Build and start services**
   ```bash
   docker-compose up -d scanner-service
   ```

2. **Check service status**
   ```bash
   docker-compose ps
   docker-compose logs -f scanner-service
   ```

3. **Stop the service**
   ```bash
   docker-compose down scanner-service
   ```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SERVER_PORT` | Service port | 2024 | No |
| `SERVER_HOST` | Service host | 0.0.0.0 | No |
| `SERVER_ENV` | Environment (development/production) | development | No |
| `STORAGE_TYPE` | Storage backend (local/s3) | local | No |
| `STORAGE_UPLOAD_PATH` | Upload directory path | ./uploads/scanned | No |
| `SCANNER_AUTO_DETECT` | Auto-detect scanners on startup | true | No |
| `SCANNER_DEFAULT_DPI` | Default scan resolution | 300 | No |
| `SCANNER_DEFAULT_FORMAT` | Default output format | pdf | No |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | info | No |
| `LOG_FORMAT` | Log format (json/text) | json | No |

## Frontend Integration

### React Component

Import and use the `ScannerComponent` in your React application:

```jsx
import ScannerComponent from '../scanner/ScannerComponent';

<ScannerComponent
  deceasedId={deceasedId}
  deceasedData={deceasedData}
  onScanComplete={(scanData) => {
    console.log('Scan completed:', scanData);
    // Refresh document list
    fetchDocuments();
  }}
  onUploadSuccess={(uploadData) => {
    console.log('Upload successful:', uploadData);
    // Refresh document list
    fetchDocuments();
  }}
/>
```

### API Client Example

```javascript
// Initialize scanner
const response = await fetch('http://localhost:2024/api/v1/scanner/scanners', {
  headers: {
    'x-tenant-slug': tenantSlug,
  },
});
const { data: scanners } = await response.json();

// Start scan
const scanResponse = await fetch('http://localhost:2024/api/v1/scanner/scanners/scanner-id/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-slug': tenantSlug,
  },
  body: JSON.stringify({
    deceased_id: 'deceased-123',
    document_type: 'death_certificate',
    format: 'pdf',
    dpi: 300,
    color_mode: 'color',
    pages: 1,
  }),
});
const scanResult = await scanResponse.json();
```

## Scanner Driver Implementation

### Adding a New Scanner Driver

1. **Create driver file** in `internal/scanner/`:
   ```go
   // internal/scanner/mydriver.go
   package scanner
   
   type MyDriver struct {
       scanners []models.ScannerDevice
   }
   
   func NewMyDriver() *MyDriver {
       return &MyDriver{...}
   }
   
   // Implement ScannerDriver interface methods
   ```

2. **Register driver** in `internal/scanner/manager.go`:
   ```go
   func NewManager(storage Storage) *Manager {
       m := &Manager{...}
       m.RegisterDriver(NewMyDriver())
       return m
   }
   ```

### ScannerDriver Interface

```go
type ScannerDriver interface {
    Initialize() error
    GetScanners() ([]models.ScannerDevice, error)
    IsAvailable(scannerID string) (bool, error)
    Scan(ctx context.Context, params ScanParameters) (*ScanResult, error)
    GetCapabilities(scannerID string) ([]string, error)
    GetStatus(scannerID string) (string, error)
    Cleanup() error
    GetType() string
}
```

## Document Processing

### PDF Generation

The service uses `pdfcpu` library for PDF operations:

```go
import "github.com/pdfcpu/pdfcpu/pkg/api"

// Convert images to PDF
err := api.ImagesToPDF(imagePaths, outputPath, nil, config)

// Optimize existing PDF
err := api.OptimizeFile(inputPath, outputPath, config)
```

### Image Enhancement

Automatic enhancements applied to scanned documents:
- Grayscale conversion for better OCR
- Contrast adjustment
- Sharpening for text clarity
- Brightness correction
- Noise reduction
- Deskewing (rotation correction)

## WebSocket Protocol

### Connection
```
ws://localhost:2024/api/v1/scanner/ws/scan/{scanId}
```

### Message Format
```json
{
  "type": "status",
  "job_id": "scan_1234567890",
  "data": {
    "status": "scanning",
    "progress": 50,
    "message": "Scanning page 1 of 2"
  },
  "message": "Scan in progress"
}
```

### Message Types
- `status` - Job status update
- `progress` - Progress percentage update
- `complete` - Scan completed successfully
- `error` - Scan failed with error

## Troubleshooting

### Scanner Not Detected

1. **Check scanner connection**
   ```bash
   # Linux/Mac - List SANE devices
   scanimage -L
   
   # Windows - Check TWAIN/WIA in Device Manager
   ```

2. **Verify scanner permissions**
   ```bash
   # Linux - Add user to scanner group
   sudo usermod -aG scanner $USER
   ```

3. **Check service logs**
   ```bash
   docker-compose logs -f scanner-service
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| Scanner not found | Ensure scanner is connected and drivers installed |
| Permission denied | Check file permissions on upload directory |
| Scan timeout | Increase timeout in frontend polling configuration |
| PDF generation fails | Verify pdfcpu library compatibility |

## Production Deployment

### Security Considerations

1. **Enable authentication** on all endpoints
2. **Use HTTPS** for all communications
3. **Implement rate limiting** to prevent abuse
4. **Validate file types** and sizes
5. **Scan uploaded files** for malware
6. **Use S3 or similar** for scalable storage

### Performance Tuning

1. **Increase worker count** for concurrent scans
2. **Use connection pooling** for database operations
3. **Implement caching** for scanner metadata
4. **Enable compression** for API responses
5. **Use CDN** for static assets

### Monitoring

- Health check endpoint: `/health`
- Structured JSON logging
- Prometheus metrics (to be implemented)
- Distributed tracing (to be implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

## Roadmap

- [ ] Implement native TWAIN/WIA bindings for Windows
- [ ] Add SANE backend integration for Linux/Mac
- [ ] Implement eSCL protocol for network scanners
- [ ] Add OCR integration for text extraction
- [ ] Implement batch scanning support
- [ ] Add document preview functionality
- [ ] Integrate with cloud storage (S3, Azure Blob)
- [ ] Add multi-language support
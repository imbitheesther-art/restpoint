const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generateQRCodeForDeceased } = require('./qrCode');

const app = express();
const PORT = process.env.PORT || 8012;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'qrcode-service',
    timestamp: new Date().toISOString()
  });
});

// Generate QR code for a deceased record
app.post('/api/v1/restpoint/qrcode/generate/:deceasedId', async (req, res) => {
  try {
    const { deceasedId } = req.params;
    const qrCodeDataURL = await generateQRCodeForDeceased(deceasedId);
    res.status(200).json({
      success: true,
      message: 'QR Code generated successfully',
      data: { qrCode: qrCodeDataURL }
    });
  } catch (error) {
    console.error('❌ Error generating QR code:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR code'
    });
  }
});

// Get QR code for a deceased record (alias for GET)
app.get('/api/v1/restpoint/qrcode/:deceasedId', async (req, res) => {
  try {
    const { deceasedId } = req.params;
    const qrCodeDataURL = await generateQRCodeForDeceased(deceasedId);
    res.status(200).json({
      success: true,
      message: 'QR Code retrieved successfully',
      data: { qrCode: qrCodeDataURL }
    });
  } catch (error) {
    console.error('❌ Error retrieving QR code:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve QR code'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`QR Code Service is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('QR Code Service shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('QR Code Service shutting down...');
  process.exit(0);
});
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import   Logger   from   '../../../packages/shared-logger/dist/index'


const generateDatedCheckoutId = (): string => {
    const date = new Date();
    const dateStr = date.getFullYear().toString().slice(2) + 
                   String(date.getMonth() + 1).padStart(2, '0') +
                   String(date.getDate()).padStart(2, '0');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `RLS-${dateStr}-${random}`;
};

// Configure multer for memory storage (process in memory before Sharp)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, WEBP, GIF)'));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: fileFilter,
});     

// Signature processing function with high-quality compression
const processSignature = async (
    file: Express.Multer.File,
    options?: {
        quality?: number; // 1-100, default 90
        maxWidth?: number;
        maxHeight?: number;
        background?: string; // e.g., '#ffffff'
        grayscale?: boolean;
        outputFormat?: 'png' | 'jpeg' | 'webp';
    }
): Promise<{
    filename: string;
    path: string;
    size: number;
    width: number;
    height: number;
    format: string;
    hash: string;
}> => {
    const {
        quality = 90,
        maxWidth = 1200,
        maxHeight = 800,
        background = '#ffffff',
        grayscale = false,
        outputFormat = 'png'
    } = options || {};

    // Generate unique filename
    const id = generateDatedCheckoutId();
    const timestamp = Date.now();
    const filename = `signature_${id}_${timestamp}.png`;
    const outputPath = path.join(__dirname, '..', 'uploads', 'signatures', filename);

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    

    


    // Process image with Sharp
    let sharpInstance = sharp(file.buffer);

    // Get metadata before processing
    const metadata = await sharpInstance.metadata();

    // Resize if dimensions exceed max
    if (metadata.width && metadata.height) {
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }
    }

    // Apply grayscale if requested
    if (grayscale) {
        sharpInstance = sharpInstance.grayscale();
    }

    // Flatten with background (for transparent PNGs)
    if (background) {
        sharpInstance = sharpInstance.flatten({ background: background });
    }

    // Compress and save as PNG (lossless)
    sharpInstance = sharpInstance.png({
        compressionLevel: 9, // 0-9, 9 is highest compression
        adaptiveFiltering: true,
        palette: false, // Use true for 8-bit PNG (smaller but lossy)
        quality: quality,
    });

    // Save to disk
    const processedBuffer = await sharpInstance.toBuffer();

    // Get processed image metadata
    const processedMetadata = await sharp(processedBuffer).metadata();

    // Calculate hash for integrity
    const hash = crypto
        .createHash('sha256')
        .update(processedBuffer)
        .digest('hex')
        .slice(0, 16);

    // Save file
    fs.writeFileSync(outputPath, processedBuffer);

    // Return file info
    return {
        filename,
        path: outputPath,
        size: processedBuffer.length,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        format: processedMetadata.format || 'png',
        hash,
    };
};

// Middleware for single signature upload
const uploadCheckOutSignature = async (req: any, res: any, next: any) => {
    try {
        // Use multer to handle file upload
        const uploadSingle = upload.single('signature'); // Expect field name 'signature'

        uploadSingle(req, res, async (err: any) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload error',
                    error: err.message,
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No signature file uploaded',
                });
            }

            try {
                // Process the signature with high quality
                const result = await processSignature(req.file, {
                    quality: 95,
                    maxWidth: 1500,
                    maxHeight: 1000,
                    background: '#ffffff',
                    grayscale: false,
                    outputFormat: 'png',
                });

                // Add signature info to request for further processing
                req.signature = {
                    ...result,
                    originalName: req.file.originalname,
                    originalSize: req.file.size,
                    mimetype: req.file.mimetype,
                };

                // Log success
                console.log('Signature uploaded successfully:', {
                    filename: result.filename,
                    size: result.size,
                    dimensions: `${result.width}x${result.height}`,
                    hash: result.hash,
                });

                next();
            } catch (processingError) {
                return res.status(500).json({
                    success: false,
                    message: 'Error processing signature',
                    error: processingError instanceof Error ? processingError.message : 'Unknown error',
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Function to get signature info
const getSignatureInfo = async (filePath: string) => {
    try {
        const metadata = await sharp(filePath).metadata();
        const stats = fs.statSync(filePath);

        return {
            path: filePath,
            size: stats.size,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            hasAlpha: metadata.hasAlpha,
            channels: metadata.channels,
        };
    } catch (error) {
        throw new Error('Error reading signature file');
    }
};

// Function to delete signature
const deleteSignature = (filePath: string): boolean => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting signature:', error);
        return false;
    }
};

// Express route handler with full response
const handleSignatureUpload = async (req: any, res: any) => {
    try {
        // This would be used after uploadCheckOutSignature middleware
        const signature = req.signature;

        // Here you can save signature info to database
        // const savedSignature = await saveToDatabase(signature);

        return res.status(200).json({
            success: true,
            message: 'Signature uploaded successfully',
            data: {
                filename: signature.filename,
                path: signature.path,
                size: `${(signature.size / 1024).toFixed(2)} KB`,
                dimensions: `${signature.width}x${signature.height}`,
                hash: signature.hash,
                originalName: signature.originalName,
                compressionRatio: ((1 - signature.size / signature.originalSize) * 100).toFixed(2) + '%',
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error saving signature',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Enhanced version with additional features
const uploadEnhancedSignature = async (req: any, res: any, next: any) => {
    try {
        const uploadSingle = upload.single('signature');

        uploadSingle(req, res, async (err: any) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload error',
                    error: err.message,
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No signature file uploaded',
                });
            }

            try {
                // Process with advanced options
                const result = await processSignature(req.file, {
                    quality: 92,
                    maxWidth: 1600,
                    maxHeight: 1200,
                    background: '#ffffff',
                    grayscale: false,
                    outputFormat: 'png',
                });

                // Generate thumbnail as well
                const thumbnailPath = path.join(
                    path.dirname(result.path),
                    `thumb_${result.filename}`
                );

                await sharp(result.path)
                    .resize(200, 150, { fit: 'inside' })
                    .png({ compressionLevel: 9 })
                    .toFile(thumbnailPath);

                req.signature = {
                    ...result,
                    thumbnail: thumbnailPath,
                    originalName: req.file.originalname,
                    originalSize: req.file.size,
                    mimetype: req.file.mimetype,
                };

                next();
            } catch (processingError) {
                return res.status(500).json({
                    success: false,
                    message: 'Error processing signature',
                    error: processingError instanceof Error ? processingError.message : 'Unknown error',
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export {
    upload,
    uploadCheckOutSignature,
    uploadEnhancedSignature,
    processSignature,
    getSignatureInfo,
    deleteSignature,
    handleSignatureUpload,
    generateDatedCheckoutId,
};
import sharp from 'sharp';
import { imageUploadService } from '../../../packages/shared-services/src/imageUploadService';

/**
 * Process and save a signature buffer as an optimized image.
 * Uses the centralized image upload service with sharp for compression.
 * Enhances signature visibility by increasing boldness and contrast.
 *
 * @param inputBuffer - Raw image buffer from signature pad
 * @param filename - Unique filename identifier
 * @returns The relative URL path to the saved file
 */
export async function processSignature(
    inputBuffer: Buffer,
    filename: string,
    tenantSlug?: string
): Promise<string> {
    // Enhance signature: increase boldness and visibility
    const enhancedBuffer = await sharp(inputBuffer)
        .normalize() // Enhance contrast automatically
        .sharpen({ // Sharpen to make lines more defined
            sigma: 1.5,
        })
        .gamma(1.5) // Increase gamma to make dark areas darker and more bold
        .png({
            quality: 90,
            compressionLevel: 6,
        })
        .toBuffer();

    const result = await imageUploadService.uploadImage(
        enhancedBuffer,
        `${filename}.png`,
        'signatures',
        tenantSlug || 'system',
        undefined,
        {
            maxWidth: 800,
            maxHeight: 300,
            quality: 90,
            format: 'png',
            stripMetadata: true,
        }
    );
    return result.urlPath;
}
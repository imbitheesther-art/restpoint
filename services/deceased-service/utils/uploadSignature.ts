import sharp from "sharp";
import path from "path";
import fs from "fs/promises";


export async function processSignature(
    inputBuffer: Buffer,
    filename: string
) {

    const uploadPath =
        path.join(
            "uploads",
            "signatures"
        );


    await fs.mkdir(
        uploadPath,
        { recursive: true }
    );


    const outputFile =
        path.join(
            uploadPath,
            `${filename}.png`
        );


    await sharp(inputBuffer)

        // remove unnecessary metadata
        .rotate()

        // resize but keep quality
        .resize({
            width: 800,
            height: 300,
            fit: "inside",
            withoutEnlargement: true
        })

        // optimize PNG
        .png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true
        })

        .toFile(outputFile);


await sharp(buffer)

    .grayscale()

    .threshold(180)

    .png({
        compressionLevel: 9,
        palette: true
    })

    .toFile(output); 
    return `/uploads/signatures/${filename}.png`;

}
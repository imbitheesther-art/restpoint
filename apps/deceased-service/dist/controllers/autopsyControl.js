const asyncHandler = require('express-async-handler');
const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');
const { v4: uuidv4 } = require('uuid');
const { mergeDeceasedCached } = require('../../cachemanager/cachemanager');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const zlib = require("zlib");
const { Logger } = require('../../utilities/logger/logger');
// Spell checker library
let SpellChecker;
try {
    SpellChecker = require("simple-spellchecker");
}
catch (error) {
    Logger.warn(`Spell checker library not found. Spelling correction will be disabled`, {
        error: error,
        stack: error.stack,
        action: "Spell_chacker Liblary"
    });
    SpellChecker = null;
}
// SPELL CHECKER UTILITY (Failsafe - won't crash if fails)
const spellChecker = {
    // Spell check and correct text with fallback
    correctSpelling: (text) => {
        try {
            if (!text || typeof text !== 'string')
                return text;
            // If spell checker library is not available, return original text
            if (!SpellChecker) {
                Logger.warn(`Spell checker library not loaded. Returning original text`);
                return text;
            }
            let correctedText = text;
            const words = text.split(/\s+/);
            const corrections = [];
            // Check each word for spelling errors
            words.forEach((word, index) => {
                // Skip short words, numbers, and special medical terms
                if (word.length <= 2 ||
                    /^\d+$/.test(word) ||
                    /^[A-Z]+$/.test(word) || // Acronyms like CPR, HIV
                    /^[A-Z][a-z]+$/.test(word) || // Proper nouns
                    word.includes('-') || // Hyphenated words
                    word.includes('/')) { // Dates, ratios
                    return;
                }
                // Check if word is misspelled
                if (!SpellChecker.isMisspelled(word)) {
                    return;
                }
                // Get corrections
                const suggestions = SpellChecker.getCorrectionsForMisspelling(word);
                if (suggestions && suggestions.length > 0) {
                    // Use the first suggestion
                    const correction = suggestions[0];
                    if (this.isReasonableCorrection(word, correction)) {
                        correctedText = correctedText.replace(new RegExp(`\\b${word}\\b`, 'g'), correction);
                        corrections.push({ original: word, corrected: correction });
                    }
                }
            });
            // Log corrections for debugging
            if (corrections.length > 0) {
                Logger.info(`Spell checker applied ${corrections.length} corrections:, corrections`);
            }
            return correctedText;
        }
        catch (error) {
            // If spell checker fails, return original text
            console.warn('', error.message);
            Logger.errror(`Spell checker failed:`, {
                error: error,
                stack: error.stack,
                action: "spell_checker"
            });
            return text;
        }
    },
    // Helper to check if correction is reasonable
    isReasonableCorrection: (original, correction) => {
        // Don't correct if it's a common medical abbreviation or term
        const medicalTerms = [
            'postmortem', 'autopsy', 'deceased', 'natural', 'collapsed', 'cpr', 'pneumonea', 'malaria', 'hiv', 'aids', 'covid',
            'ct', 'mri', 'xray', 'ekg', 'ecg', 'iv', 'po', 'prn',
            'stat', 'tid', 'bid', 'qd', 'npo', 'adlib', 'hb', 'hv', 'blood cloat',
        ];
        if (medicalTerms.includes(original.toLowerCase())) {
            return false;
        }
        // Don't correct if it changes too much (likely a proper noun or technical term)
        const similarity = this.calculateSimilarity(original.toLowerCase(), correction.toLowerCase());
        return similarity > 0.7;
    },
    // Calculate similarity between two strings (Levenshtein distance based)
    calculateSimilarity: (str1, str2) => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / parseFloat(longer.length);
    },
    // Levenshtein distance algorithm
    levenshteinDistance: (s, t) => {
        if (s.length === 0)
            return t.length;
        if (t.length === 0)
            return s.length;
        const matrix = [];
        // Initialize matrix
        for (let i = 0; i <= t.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= s.length; j++) {
            matrix[0][j] = j;
        }
        // Fill in the matrix
        for (let i = 1; i <= t.length; i++) {
            for (let j = 1; j <= s.length; j++) {
                if (t.charAt(i - 1) === s.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        return matrix[t.length][s.length];
    }
};
const fallBackColor = '#2c3e50';
//Generate   Autopsy Report   PDF   thro   BUFEERING  &   Streams 
const generateReportPdfBuffer = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { autopsy_id, deceased_id, full_name, summary, findings, cause_of_death, staff_username, pathologist_name, mortuary_name, date, requesting_authority, immediate_cause_of_death, underlying_cause_of_death, contributing_conditions, manner_of_death } = data;
            // Use correct path structure
            const reportsDir = path.join(__dirname, "../../uploads/reports");
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            const pdfFileName = `${autopsy_id}.pdf`;
            const pdfPath = path.join(reportsDir, pdfFileName);
            // Optimize PDF document creation
            const doc = new PDFDocument({
                size: 'A4',
                margin: 60,
                compress: true,
                info: {
                    Title: `Autopsy Report ${autopsy_id}`,
                    Author: 'Funeral Home',
                    Subject: 'Postmortem Examination Report',
                    CreationDate: new Date()
                },
                pdfVersion: '1.5'
            });
            Logger.info(`Stream   PDF`, { actions: stream });
            const writeStream = fs.createWriteStream(pdfPath);
            writeStream.on("error", reject);
            doc.on("error", reject);
            doc.pipe(writeStream);
            let currentY = 45;
            const margin = 40;
            const contentWidth = 595 - 2 * margin;
            const pageHeight = 842;
            // Helper function to check if we need a new page
            const checkPageBreak = (neededSpace = 40) => {
                const bottomMargin = 40;
                if (currentY + neededSpace > pageHeight - bottomMargin) {
                    doc.addPage();
                    currentY = 40;
                    return true;
                }
                return false;
            };
            // HEADER
            doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a5276')
                .text('POSTMORTEM EXAMINATION REPORT.', margin, currentY, {
                align: 'start',
                width: contentWidth
            });
            currentY += 20;
            // Thin decorative line
            doc.strokeColor('#d0d0d0a8').lineWidth(0.3)
                .moveTo(margin, currentY)
                .lineTo(margin + contentWidth, currentY)
                .stroke();
            currentY += 10;
            // COMPACT METADATA
            const lineHeight = 10;
            const col1X = margin;
            const col2X = margin + 260;
            const addMetadataRow = (label, value, x, y) => {
                doc.font('Helvetica-Bold').fontSize(7).fillColor('#d0d0d0a8')
                    .text(label, x, y, { width: 70, align: 'left' });
                doc.font('Helvetica').fontSize(7).fillColor('#000000')
                    .text(value || 'N/A', x + 75, y, { width: 170, align: 'left' });
            };
            // Left column
            addMetadataRow('Case ID:', autopsy_id, col1X, currentY);
            addMetadataRow('Deceased:', full_name, col1X, currentY + lineHeight);
            addMetadataRow('Deceased ID:', deceased_id, col1X, currentY + (lineHeight * 2));
            // Right column
            addMetadataRow('Date:', new Date(date || created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }), col2X, currentY);
            addMetadataRow('Mortuary:', mortuary_name || 'Lee Funeral Services', col2X, currentY + lineHeight);
            addMetadataRow('Pathologist:', pathologist_name || staff_username || 'Dr. Peter Mumo', col2X, currentY + (lineHeight * 2));
            currentY += (lineHeight * 3) + 15;
            // REQUESTING AUTHORITY
            checkPageBreak(40);
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#1a5276')
                .text('REQUESTING AUTHORITY', margin, currentY);
            currentY += 12;
            const authorityOptions = [
                { label: 'Hospital', key: 'hospital' },
                { label: 'Police', key: 'police' },
                { label: 'Court', key: 'court' },
                { label: 'Family', key: 'family' }
            ];
            const authoritySpacing = 100;
            const authorityStartX = margin;
            authorityOptions.forEach((option, index) => {
                const xPos = authorityStartX + (index * authoritySpacing);
                // Draw checkbox
                doc.strokeColor('#666666').lineWidth(0.5)
                    .rect(xPos, currentY, 8, 8)
                    .stroke();
                // Check mark if selected
                const isSelected = requesting_authority &&
                    (requesting_authority.toLowerCase() === option.key ||
                        requesting_authority.toLowerCase().includes(option.key));
                if (isSelected) {
                    doc.strokeColor('#001EFF').lineWidth(1)
                        .moveTo(xPos + 1, currentY + 4)
                        .lineTo(xPos + 3, currentY + 6)
                        .lineTo(xPos + 7, currentY + 2)
                        .stroke();
                }
                // Label
                doc.font('Helvetica').fontSize(7).fillColor('#333333')
                    .text(option.label, xPos + 12, currentY);
            });
            currentY += 20;
            // CAUSE OF DEATH DETAILS (FIXED)
            checkPageBreak(120);
            doc.font('Helvetica-Bold')
                .fontSize(10)
                .fillColor('#1a5276')
                .text('CAUSE OF DEATH ANALYSIS', margin, currentY);
            currentY += 18;
            // Layout settings
            const causeTableWidth = contentWidth;
            const causeColWidth = causeTableWidth / 2;
            const labelWidth = 85;
            const lineGap = 2;
            // IMMEDIATE & UNDERLYING CAUSE
            const immediateCauseText = immediate_cause_of_death || 'Not specified';
            const underlyingCauseText = underlying_cause_of_death || 'Not specified';
            // Labels
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333')
                .text('Immediate Cause:', margin, currentY);
            doc.text('Underlying Cause:', margin + causeColWidth, currentY);
            // Heights
            const immediateHeight = doc.heightOfString(immediateCauseText, {
                width: causeColWidth - labelWidth,
                lineGap
            });
            const underlyingHeight = doc.heightOfString(underlyingCauseText, {
                width: causeColWidth - labelWidth,
                lineGap
            });
            // Values
            doc.font('Helvetica').fillColor('#000000')
                .text(immediateCauseText, margin + labelWidth, currentY, {
                width: causeColWidth - labelWidth,
                lineGap
            });
            doc.text(underlyingCauseText, margin + causeColWidth + labelWidth, currentY, {
                width: causeColWidth - labelWidth,
                lineGap
            });
            // Move Y by tallest column
            currentY += Math.max(immediateHeight, underlyingHeight) + 10;
            // CONTRIBUTING CONDITIONS
            const contributingText = contributing_conditions || 'None';
            doc.font('Helvetica-Bold').fillColor('#333333')
                .text('Contributing Conditions:', margin, currentY);
            const contributingHeight = doc.heightOfString(contributingText, {
                width: contentWidth - 110,
                lineGap
            });
            doc.font('Helvetica').fillColor('#000000')
                .text(contributingText, margin + 110, currentY, {
                width: contentWidth - 110,
                lineGap
            });
            currentY += contributingHeight + 12;
            //manner    of     death   radio     box  select  style  
            const mannerOptions = ['Natural', 'Accidental', 'Homicide', 'Suicide', 'Undetermined'];
            const selectedManner = manner_of_death || 'Undetermined';
            doc.font('Helvetica-Bold').fillColor('#000000')
                .text('Manner of Death:', margin, currentY);
            const mannerStartX = margin + 110;
            const mannerSpacing = 70;
            mannerOptions.forEach((option, index) => {
                const x = mannerStartX + index * mannerSpacing;
                const y = currentY + 3;
                // Radio outer
                doc.strokeColor('#666').lineWidth(0.6)
                    .circle(x, y, 4)
                    .stroke();
                // Selected
                if (option.toLowerCase() === selectedManner.toLowerCase()) {
                    doc.fillColor('#1a5276')
                        .circle(x, y, 2)
                        .fill();
                }
                // Label
                doc.font('Helvetica').fontSize(7).fillColor('#333')
                    .text(option, x - 18, y + 8, { width: 60, align: 'center' });
            });
            currentY += 30;
            //separator 
            doc.strokeColor('#e8e8e8')
                .lineWidth(0.3)
                .moveTo(margin, currentY)
                .lineTo(margin + contentWidth, currentY)
                .stroke();
            currentY += 15;
            //Examination  summary  
            checkPageBreak(50);
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a5276')
                .text('EXAMINATION SUMMARY', margin, currentY);
            currentY += 12;
            // spell checking for  grammer 
            const originalSummary = summary || 'No summary provided.';
            const checkedSummary = spellChecker.correctSpelling(originalSummary);
            const summaryHeight = Math.max(30, Math.ceil(doc.heightOfString(checkedSummary, {
                width: contentWidth,
                font: 'Helvetica',
                fontSize: 8,
                lineGap: 2
            }) + 10));
            doc.strokeColor('#e0e0e0').lineWidth(0.3)
                .rect(margin, currentY, contentWidth, summaryHeight).stroke();
            doc.font('Helvetica').fontSize(8).fillColor('#333333')
                .text(checkedSummary, margin + 5, currentY + 5, {
                width: contentWidth - 10,
                align: 'left',
                lineGap: 2
            });
            currentY += summaryHeight + 20;
            //findigs
            checkPageBreak(70);
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a5276')
                .text('DETAILED FINDINGS', margin, currentY);
            currentY += 12;
            const tableRowHeight = 20;
            const organColWidth = 100;
            const findingColWidth = contentWidth - organColWidth;
            // Parse findings
            const findingsObj = typeof findings === 'string' ? JSON.parse(findings) : findings;
            const findingsKeys = Object.keys(findingsObj || {});
            if (findingsKeys.length > 0) {
                // Table header
                const tableHeaderY = currentY;
                doc.fillColor('#f8f8f8').rect(margin, tableHeaderY, contentWidth, 15).fill();
                doc.strokeColor('#cccccc').lineWidth(0.2)
                    .rect(margin, tableHeaderY, contentWidth, 15).stroke();
                doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333')
                    .text('ORGAN', margin + 5, tableHeaderY + 4)
                    .text('FINDINGS', margin + organColWidth + 5, tableHeaderY + 4);
                currentY += 18;
                // Findings rows & spell checking
                findingsKeys.forEach((key) => {
                    if (checkPageBreak(tableRowHeight)) {
                        // Re-add header on new page
                        doc.fillColor('#f8f8f8').rect(margin, currentY, contentWidth, 15).fill();
                        doc.strokeColor('#cccccc').lineWidth(0.2)
                            .rect(margin, currentY, contentWidth, 15).stroke();
                        doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333')
                            .text('ORGAN', margin + 5, currentY + 4)
                            .text('FINDINGS', margin + organColWidth + 5, currentY + 4);
                        currentY += 18;
                    }
                    doc.strokeColor('#f0f0f0').lineWidth(0.1)
                        .rect(margin, currentY, contentWidth, tableRowHeight).stroke();
                    // Organ name
                    doc.font('Helvetica-Bold').fontSize(7).fillColor('#1a5276')
                        .text(key.charAt(0).toUpperCase() + key.slice(1), margin + 5, currentY + 6, { width: organColWidth - 10, align: 'left' });
                    // Finding details with spell checking
                    const originalFinding = findingsObj[key] || 'Not examined';
                    const checkedFinding = spellChecker.correctSpelling(originalFinding);
                    doc.font('Helvetica').fontSize(7).fillColor('#333333')
                        .text(checkedFinding, margin + organColWidth + 5, currentY + 6, { width: findingColWidth - 10, lineGap: 1, align: 'left' });
                    currentY += tableRowHeight;
                });
            }
            else {
                doc.font('Helvetica').fontSize(8).fillColor('#777777')
                    .text('No detailed findings recorded.', margin, currentY);
                currentY += 25;
            }
            currentY += 20;
            //Final  Determination
            checkPageBreak(50);
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a5276')
                .text('FINAL DETERMINATION', margin, currentY);
            currentY += 12;
            //   spell  checking  for  cause  of    death  
            const originalCause = cause_of_death || 'Undetermined';
            const checkedCause = spellChecker.correctSpelling(originalCause);
            const causeHeight = Math.max(25, Math.ceil(doc.heightOfString(checkedCause, {
                width: contentWidth - 10,
                font: 'Helvetica-Bold',
                fontSize: 9,
                align: 'center'
            }) + 10));
            doc.strokeColor('#dc2626').lineWidth(0.5)
                .rect(margin, currentY, contentWidth, causeHeight).stroke();
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#dc2626')
                .text(checkedCause, margin + 5, currentY + 8, {
                width: contentWidth - 10,
                align: 'center'
            });
            currentY += causeHeight + 25;
            //   signature  ares 
            Logger.info(`Computing  Signatures  `, { actions: "signature computes " });
            checkPageBreak(60);
            const signatureX = margin + 350;
            //    foresic   department  signature  checking        and   verification
            Logger.info(`foresic   department  signature  checking   `, {
                actions: "signature  Checks"
            });
            const forensicSignaturePath = path.join(__dirname, '../../uploads/signature/report-signature.png');
            Logger.info(`foresic   department  signature  checking sucess  `, {
                actions: "signature  Checks"
            });
            if (fs.existsSync(forensicSignaturePath)) {
                doc.image(forensicSignaturePath, signatureX, currentY, {
                    width: 60,
                    height: 20,
                });
                doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#333333')
                    .text('Forensic Dept', signatureX, currentY + 22, { width: 60, align: 'center' })
                    .font('Helvetica').fontSize(5.5)
                    .text(pathologist_name || 'Dr. Lee  FH  Forensic Department', signatureX, currentY + 28, { width: 80, align: 'center' });
            }
            else {
                doc.strokeColor('#000000').lineWidth(0.2)
                    .moveTo(signatureX, currentY + 8)
                    .lineTo(signatureX + 60, currentY + 8)
                    .stroke();
                doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#333333')
                    .text('Signature', signatureX, currentY + 12, { width: 60, align: 'center' })
                    .font('Helvetica').fontSize(5.5)
                    .text(pathologist_name || 'Dr. Peter Mumo', signatureX, currentY + 18, { width: 80, align: 'center' });
            }
            // DISCLAIMER SECTION
            checkPageBreak(40);
            // Separator line
            doc.strokeColor('#cccccc').lineWidth(0.8)
                .moveTo(margin, currentY + 5)
                .lineTo(margin + contentWidth, currentY + 5)
                .stroke();
            currentY += 10;
            // Disclaimer text
            doc.fontSize(5.5).font('Helvetica-Oblique').fillColor('#1a5276')
                .text('DISCLAIMER:', margin, currentY);
            currentY += 6;
            doc.fontSize(5).font('Helvetica').fillColor('#1a5276')
                .text('This report is generated for medical and legal purposes. The findings are based on the examination', margin, currentY, { width: contentWidth, align: 'left' });
            currentY += 4;
            doc.fontSize(5).font('Helvetica').fillColor('#1a5276')
                .text('conducted at the time of autopsy. Spell checking has been applied automatically but medical', margin, currentY, { width: contentWidth, align: 'left' });
            currentY += 4;
            doc.fontSize(5).font('Helvetica').fillColor('#1a5276')
                .text('terminology accuracy should be verified by qualified personnel. This document is confidential.', margin, currentY, { width: contentWidth, align: 'left' });
            currentY += 8;
            // Footer information
            const stamp = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 8);
            Logger.info('PDF footer generation started', {
                autopsy_id, reportId: stamp, actions: "stamps"
            });
            doc.fontSize(5.5).font('Helvetica').fillColor('#001EFF')
                .text(`Report ID: ${stamp}`, margin, currentY)
                .text(`Generated: ${new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}`, margin + 200, currentY)
                .text(`Page ${doc.bufferedPageRange().count}`, margin + contentWidth - 60, currentY);
            doc.end();
            // Streaming  to minimize  memmory  consumption
            Logger.info('PDF document finalized, streaming started', {
                autopsy_id, reportId: stamp, action: 'pdf_stream_started',
            });
            writeStream.on("finish", () => {
                const gzFileName = `${autopsy_id}.gz`;
                const gzPath = path.join(reportsDir, gzFileName);
                Logger.info('PDF write completed, starting gzip compression', {
                    autopsy_id, pdfPath, gzPath, compressionLevel: 6, action: 'compress',
                });
                const gzip = zlib.createGzip({ level: 6 });
                const input = fs.createReadStream(pdfPath);
                const output = fs.createWriteStream(gzPath);
                gzip.on("error", reject);
                input.on('error', (err) => {
                    Logger.error('PDF read stream failed', {
                        autopsy_id,
                        pdfPath,
                        error: err,
                    });
                    reject(err);
                });
                output.on("error", reject);
                input.pipe(gzip).pipe(output);
                output.on("finish", () => {
                    Logger.info('PDF gzip compression completed successfully', {
                        autopsy_id, pdfFileName, gzFileName, action: 'pdf_ready_for_delivery',
                    });
                    input.close();
                    output.close();
                    resolve({
                        pdfPath,
                        gzPath,
                        pdfFileName,
                        gzFileName
                    });
                });
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
// AUTOPSY ID GENERATOR
const generateAutopsyID = async ({ deceasedName = '', deceasedId = '', date = new Date() }) => {
    const prefix = 'LPR';
    const year = date.getFullYear().toString().slice(-2);
    const cleanName = deceasedName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 4);
    const cleanId = deceasedId
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(-6);
    const countRows = await safeQuery(`SELECT COUNT(*) as count
     FROM postmortem
     WHERE YEAR(created_at) = ?`, [date.getFullYear()]);
    const autopsyCount = countRows[0]?.count || 0;
    const nextNumber = autopsyCount + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    return `${prefix}${year}${paddedNumber}${cleanName || 'N'}-${cleanId || '000000'}`;
};
// CHECK IF COLUMN EXISTS
const checkColumnExists = async (columnName) => {
    try {
        const tableInfo = await safeQuery(`SHOW COLUMNS FROM postmortem LIKE ?`, [columnName]);
        return tableInfo.length > 0;
    }
    catch (error) {
        console.warn(`Could not check for ${columnName} column:`, error.message);
        return false;
    }
};
// CHECK IF AUTOPSY ID EXISTS
const checkAutopsyIdExists = async (autopsyId) => {
    try {
        const existingRows = await safeQuery(`SELECT autopsy_id FROM postmortem WHERE autopsy_id = ?`, [autopsyId]);
        return existingRows.length > 0;
    }
    catch (error) {
        console.warn('Could not check autopsy ID existence:', error.message);
        return false;
    }
};
// REGISTER AUTOPSY CONTROLLER
const registerAutopsy = asyncHandler(async (req, res) => {
    // REQUEST BODY   DATA
    const { deceased_id, summary, findings, cause_of_death, staff_username, mortuary_name, pathologist_name, date, requesting_authority, immediate_cause_of_death, underlying_cause_of_death, contributing_conditions, manner_of_death } = req.body;
    // Validation
    if (!deceased_id || !summary || !findings || !cause_of_death) {
        return res.status(400).json({
            message: 'Missing required fields: deceased_id, summary, findings, and cause_of_death are required'
        });
    }
    // Validate requesting_authority if provided
    if (requesting_authority && !['hospital', 'police', 'court', 'family'].includes(requesting_authority.toLowerCase())) {
        return res.status(400).json({
            message: 'Invalid requesting authority. Must be: Hospital, Police, Court, or Family'
        });
    }
    // Validate manner_of_death if provided
    if (manner_of_death && !['natural', 'accidental', 'homicide', 'suicide', 'undetermined'].includes(manner_of_death.toLowerCase())) {
        return res.status(400).json({
            message: 'Invalid manner of death. Must be: Natural, Accidental, Homicide, Suicide, or Undetermined'
        });
    }
    const created_at = getKenyaTimeISO();
    const now = new Date(date || created_at);
    //  VALIDATE DECEASED
    const deceasedRows = await safeQuery(`SELECT deceased_id, full_name 
     FROM deceased 
     WHERE deceased_id = ?`, [deceased_id]);
    if (deceasedRows.length === 0) {
        return res.status(404).json({ message: 'Deceased not found' });
    }
    const deceased = deceasedRows[0];
    // VALIDATE STAFF
    let staff = null;
    if (staff_username) {
        const staffRows = await safeQuery(`SELECT id, username 
       FROM users 
       WHERE username = ?`, [staff_username]);
        if (staffRows.length === 0) {
            return res.status(404).json({ message: 'Staff user not found' });
        }
        staff = staffRows[0];
    }
    else {
        const systemRows = await safeQuery(`SELECT id, username 
       FROM users 
       WHERE username = 'system' OR username = 'admin' 
       LIMIT 1`);
        staff = systemRows.length > 0 ? systemRows[0] : { id: 1, username: 'System' };
    }
    // GENERATE SHORTER AUTOPSY ID
    let autopsy_id;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        attempts++;
        autopsy_id = await generateAutopsyID({
            deceasedName: deceased.full_name,
            deceasedId: deceased_id,
            date: now
        });
        const idExists = await checkAutopsyIdExists(autopsy_id);
        if (!idExists) {
            break;
        }
        if (attempts === maxAttempts) {
            autopsy_id = `LPR${now.getFullYear().toString().slice(-2)}${uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
        }
    }
    //  GENERATE PDF WITH SPELL CHECKING
    const reportData = {
        autopsy_id,
        deceased_id,
        full_name: deceased.full_name,
        summary,
        findings,
        cause_of_death,
        staff_username: staff.username,
        created_at,
        pathologist_name: pathologist_name || staff.username,
        mortuary_name,
        date: now.toISOString().split('T')[0],
        requesting_authority,
        immediate_cause_of_death: immediate_cause_of_death || cause_of_death,
        underlying_cause_of_death,
        contributing_conditions,
        manner_of_death: manner_of_death || 'Undetermined'
    };
    const reportFiles = await generateReportPdfBuffer(reportData);
    // Check which columns exist
    const columnsToCheck = [
        'pathologist_name',
        'requesting_authority',
        'immediate_cause_of_death',
        'underlying_cause_of_death',
        'contributing_conditions',
        'manner_of_death'
    ];
    const columnExistence = {};
    for (const column of columnsToCheck) {
        columnExistence[column] = await checkColumnExists(column);
    }
    // Build dynamic SQL query
    const columns = [
        'autopsy_id',
        'deceased_id',
        'summary',
        'findings',
        'cause_of_death',
        'report_pdf_path',
        'report_pdf_file',
        'report_gzip_path',
        'pathologist_id',
        'mortuary_name',
        'date',
        'user_id',
        'created_at'
    ];
    const placeholders = [
        autopsy_id,
        deceased_id,
        summary,
        JSON.stringify(findings),
        cause_of_death,
        reportFiles.pdfPath,
        reportFiles.pdfFileName,
        reportFiles.gzPath,
        staff.id,
        mortuary_name || 'LEE FUNERAL SERVICES',
        now,
        staff.id,
        created_at
    ];
    // Add optional columns if they exist
    if (columnExistence.pathologist_name) {
        columns.push('pathologist_name');
        placeholders.push(pathologist_name || staff.username);
    }
    if (columnExistence.requesting_authority && requesting_authority) {
        columns.push('requesting_authority');
        placeholders.push(requesting_authority);
    }
    if (columnExistence.immediate_cause_of_death && immediate_cause_of_death) {
        columns.push('immediate_cause_of_death');
        placeholders.push(immediate_cause_of_death);
    }
    if (columnExistence.underlying_cause_of_death && underlying_cause_of_death) {
        columns.push('underlying_cause_of_death');
        placeholders.push(underlying_cause_of_death);
    }
    if (columnExistence.contributing_conditions && contributing_conditions) {
        columns.push('contributing_conditions');
        placeholders.push(contributing_conditions);
    }
    if (columnExistence.manner_of_death && manner_of_death) {
        columns.push('manner_of_death');
        placeholders.push(manner_of_death);
    }
    const sqlQuery = `
    INSERT INTO postmortem (${columns.join(', ')})
    VALUES (${columns.map(() => '?').join(', ')})
  `;
    const sqlParams = placeholders;
    // INSERT POSTMORTEM RECORD
    try {
        await safeQuery(sqlQuery, sqlParams);
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            autopsy_id = `LPR${now.getFullYear().toString().slice(-2)}${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
            const newPdfFileName = `${autopsy_id}.pdf`;
            const newPdfPath = path.join(path.dirname(reportFiles.pdfPath), newPdfFileName);
            fs.renameSync(reportFiles.pdfPath, newPdfPath);
            const newGzFileName = `${autopsy_id}.gz`;
            const newGzPath = path.join(path.dirname(reportFiles.gzPath), newGzFileName);
            fs.renameSync(reportFiles.gzPath, newGzPath);
            reportFiles.pdfFileName = newPdfFileName;
            reportFiles.pdfPath = newPdfPath;
            reportFiles.gzFileName = newGzFileName;
            reportFiles.gzPath = newGzPath;
            sqlParams[0] = autopsy_id;
            await safeQuery(sqlQuery, sqlParams);
        }
        else {
            throw error;
        }
    }
    //  UPDATE CACHE (async to not block response)
    setTimeout(() => {
        try {
            mergeDeceasedCached(deceased_id, {
                last_autopsy_id: autopsy_id,
                last_cause_of_death: cause_of_death,
                last_manner_of_death: manner_of_death,
                updated_at: created_at
            });
        }
        catch (cacheError) {
            console.warn('Cache update failed:', cacheError.message);
        }
    }, 0);
    // RESPONSE
    return res.status(201).json({
        message: 'Postmortem report created successfully',
        autopsy_id,
        deceased_name: deceased.full_name,
        pathologist: pathologist_name || staff.username,
        requesting_authority: requesting_authority || 'Not specified',
        manner_of_death: manner_of_death || 'Undetermined',
        report_date: now.toISOString().split('T')[0],
        pdf_file: reportFiles.pdfFileName,
        download_url: `/api/reports/download/${autopsy_id}`,
        status: 201
    });
});
module.exports = {
    registerAutopsy,
    generateReportPdfBuffer,
    generateAutopsyID
};

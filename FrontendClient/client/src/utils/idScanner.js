/**
 * ID Card Scanner Utility
 * 
 * A reusable utility for scanning ID cards using the device camera and OCR.
 * Captures images via react-webcam, processes them with tesseract.js for text extraction,
 * and parses common ID formats (National ID, Passport, Driver's License).
 * 
 * Dependencies:
 * - react-webcam (already installed)
 * - tesseract.js (install: npm install tesseract.js)
 * 
 * Usage:
 *   import { scanIDCard, IDScannerComponent } from '../../utils/idScanner';
 *   
 *   // Programmatic usage:
 *   const result = await scanIDCard(imageDataUrl);
 *   console.log(result.extractedText, result.parsedFields);
 *   
 *   // React component usage:
 *   <IDScannerComponent onScanComplete={(data) => console.log(data)} />
 */

import { createWorker } from 'tesseract.js';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

// ============================================================
// CONFIGURATION
// ============================================================

const OCR_CONFIG = {
  language: 'eng',
  oem: 1,
  psm: 3,
  confidenceThreshold: 60,
  maxRetries: 2,
};

// ============================================================
// KENYAN NATIONAL ID REGEX PATTERNS
// ============================================================

const ID_PATTERNS = {
  kenyanNationalId: /\b(\d{7,8})\b/,
  passportNumber: /\b([A-Z]\d{8})\b/,
  driversLicense: /\b([A-Z]{2}\d{6,7})\b/,
  dateOfBirth: /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})\b/,
  namePattern: /^(?:Name|Surname|Full Name)[:\s]+(.+)$/im,
  idNumberLabel: /(?:ID\s*No|National\s*ID|Identity\s*Card|I\.?\s*D\.?\s*Number)[:\s]*(\d{7,8})/i,
  serialNumber: /(?:Serial\s*No|S\.?\s*No\.?)[:\s]*([A-Z0-9]+)/i,
  gender: /\b(Male|Female|M|F)\b/i,
  phoneNumber: /(?:\+?254|0)?[17]\d{8}\b/,
};

// ============================================================
// INJECT KEYFRAMES (runs once)
// ============================================================

const styleId = 'id-scanner-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
    @keyframes idScanBeam {
      0%   { top: 12%; opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 82%; opacity: 0; }
    }
    @keyframes idScanPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
      50%      { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
    }
    @keyframes idScanSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes idScanFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes idScanSlideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes idScanShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes idScanCornerPop {
      from { opacity: 0; transform: scale(0.6); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes idScanDotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
}

// ============================================================
// IMAGE PREPROCESSING
// ============================================================

export const preprocessImage = async (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDimension = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        gray = gray < 128 ? gray * 0.8 : Math.min(255, gray * 1.2);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error('Failed to load image for preprocessing'));
    img.src = imageDataUrl;
  });
};

// ============================================================
// TEXT PARSING
// ============================================================

export const parseIDCardText = (text) => {
  const fields = {
    fullName: null,
    idNumber: null,
    dateOfBirth: null,
    gender: null,
    passportNumber: null,
    driversLicense: null,
    serialNumber: null,
    phoneNumber: null,
    nationality: null,
    rawText: text,
  };

  if (!text || text.trim().length === 0) return fields;

  const lines = text.split('\n').filter(line => line.trim().length > 0);

  const idLabelMatch = text.match(ID_PATTERNS.idNumberLabel);
  if (idLabelMatch) fields.idNumber = idLabelMatch[1];

  const nameMatch = text.match(ID_PATTERNS.namePattern);
  if (nameMatch) {
    fields.fullName = nameMatch[1].trim();
  }

  if (!fields.fullName) {
    for (const line of lines) {
      const words = line.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const isAllAlpha = words.every(w => /^[A-Z][a-z]+$/.test(w));
        if (isAllAlpha && !line.match(/\d/) && line.length > 5) {
          fields.fullName = line.trim();
          break;
        }
      }
    }
  }

  const dobMatch = text.match(ID_PATTERNS.dateOfBirth);
  if (dobMatch) fields.dateOfBirth = dobMatch[1];

  const genderMatch = text.match(ID_PATTERNS.gender);
  if (genderMatch) {
    const g = genderMatch[1].toLowerCase();
    fields.gender = g === 'm' ? 'Male' : g === 'f' ? 'Female' : genderMatch[1];
  }

  const passportMatch = text.match(ID_PATTERNS.passportNumber);
  if (passportMatch) fields.passportNumber = passportMatch[1];

  const licenseMatch = text.match(ID_PATTERNS.driversLicense);
  if (licenseMatch) fields.driversLicense = licenseMatch[1];

  const serialMatch = text.match(ID_PATTERNS.serialNumber);
  if (serialMatch) fields.serialNumber = serialMatch[1];

  const phoneMatch = text.match(ID_PATTERNS.phoneNumber);
  if (phoneMatch) fields.phoneNumber = phoneMatch[0];

  if (!fields.idNumber) {
    const digitMatch = text.match(ID_PATTERNS.kenyanNationalId);
    if (digitMatch) fields.idNumber = digitMatch[1];
  }

  return fields;
};

// ============================================================
// CORE OCR ENGINE
// ============================================================

let workerInstance = null;

const getWorker = async () => {
  if (workerInstance) return workerInstance;
  workerInstance = await createWorker(OCR_CONFIG.language, OCR_CONFIG.oem);
  await workerInstance.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/\\-:.,() ',
    tessedit_pageseg_mode: OCR_CONFIG.psm,
    preserve_interword_spaces: '1',
  });
  return workerInstance;
};

export const terminateWorker = async () => {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
};

export const scanIDCard = async (imageDataUrl, options = {}) => {
  const startTime = Date.now();
  const config = { ...OCR_CONFIG, ...options };
  let lastError = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const processedImage = await preprocessImage(imageDataUrl);
      const worker = await getWorker();
      const { data } = await worker.recognize(processedImage);
      const extractedText = data.text || '';
      const confidence = data.confidence || 0;
      const parsedFields = parseIDCardText(extractedText);

      return {
        success: confidence >= config.confidenceThreshold,
        extractedText,
        parsedFields,
        confidence,
        processingTime: Date.now() - startTime,
        attempt: attempt + 1,
        capturedImage: imageDataUrl,
      };
    } catch (error) {
      lastError = error;
      console.warn(`OCR attempt ${attempt + 1} failed:`, error.message);
      if (attempt < config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  return {
    success: false,
    extractedText: '',
    parsedFields: parseIDCardText(''),
    confidence: 0,
    processingTime: Date.now() - startTime,
    error: lastError?.message || 'OCR processing failed',
    attempt: config.maxRetries + 1,
    capturedImage: imageDataUrl,
  };
};

export const captureImage = (stream, width = 640, height = 480) => {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.play();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);
  video.pause();
  video.srcObject = null;
  return canvas.toDataURL('image/jpeg', 0.95);
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Animated corner bracket for the scan frame */
const CornerBracket = ({ position, color = '#3B82F6' }) => {
  const size = 28;
  const thickness = 3;
  const styles = {
    top: {
      position: 'absolute', top: '-1px', left: '-1px',
      width: size, height: size,
      borderTop: `${thickness}px solid ${color}`,
      borderLeft: `${thickness}px solid ${color}`,
      borderTopLeftRadius: '10px',
      animation: 'idScanCornerPop 0.4s ease-out both',
    },
    topR: {
      position: 'absolute', top: '-1px', right: '-1px',
      width: size, height: size,
      borderTop: `${thickness}px solid ${color}`,
      borderRight: `${thickness}px solid ${color}`,
      borderTopRightRadius: '10px',
      animation: 'idScanCornerPop 0.4s ease-out 0.1s both',
    },
    bottom: {
      position: 'absolute', bottom: '-1px', left: '-1px',
      width: size, height: size,
      borderBottom: `${thickness}px solid ${color}`,
      borderLeft: `${thickness}px solid ${color}`,
      borderBottomLeftRadius: '10px',
      animation: 'idScanCornerPop 0.4s ease-out 0.2s both',
    },
    bottomR: {
      position: 'absolute', bottom: '-1px', right: '-1px',
      width: size, height: size,
      borderBottom: `${thickness}px solid ${color}`,
      borderRight: `${thickness}px solid ${color}`,
      borderBottomRightRadius: '10px',
      animation: 'idScanCornerPop 0.4s ease-out 0.3s both',
    },
  };
  return <div style={styles[position]} />;
};

/** Pulsing dot indicator */
const StatusDot = ({ active, color = '#3B82F6' }) => (
  <span style={{
    display: 'inline-block',
    width: 8, height: 8,
    borderRadius: '50%',
    background: active ? color : '#9CA3AF',
    marginRight: 6,
    animation: active ? 'idScanDotPulse 1.4s ease-in-out infinite' : 'none',
  }} />
);

/** A single parsed field row */
const FieldRow = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #F3F4F6',
      animation: 'idScanFadeIn 0.4s ease-out both',
      marginBottom: 6,
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 8,
        background: '#EFF6FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </div>
      </div>
    </div>
  );
};

/** Three-dot loading indicator */
const DotLoader = () => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: '50%', background: '#fff',
        animation: `idScanDotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

// ============================================================
// MAIN REACT COMPONENT
// ============================================================

/**
 * IDScannerComponent – Beautiful full-screen ID scanner
 *
 * Props:
 *   onScanComplete: (result) => void
 *   onClose: () => void
 *   autoCapture: boolean  (default false – manual tap is more reliable)
 *   captureDelay: number  (ms, default 2500)
 */
export const IDScannerComponent = ({
  onScanComplete,
  onClose,
  autoCapture = false,
  captureDelay = 2500,
}) => {
  const webcamRef = useRef(null);
  const [phase, setPhase] = useState('camera'); // camera | scanning | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const timerRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Auto-capture
  useEffect(() => {
    if (autoCapture && cameraReady && phase === 'camera') {
      timerRef.current = setTimeout(() => handleCapture(), captureDelay);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoCapture, cameraReady, phase]);

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) { setPhase('error'); setError('Camera not available'); return; }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) { setPhase('error'); setError('Failed to capture image'); return; }

    setCapturedImage(imageSrc);
    setPhase('scanning');
    setError(null);

    try {
      const scanResult = await scanIDCard(imageSrc);
      if (scanResult.success) {
        setResult(scanResult);
        setPhase('result');
        if (onScanComplete) onScanComplete(scanResult);
      } else {
        setError(scanResult.error || `Low confidence (${Math.round(scanResult.confidence)}%). Try again with better lighting.`);
        setPhase('error');
      }
    } catch (err) {
      setError(err.message || 'Scanning failed');
      setPhase('error');
    }
  }, [onScanComplete]);

  const handleRetry = () => {
    setResult(null);
    setError(null);
    setCapturedImage(null);
    setPhase('camera');
  };

  // ---- Backdrop ----
  const backdropStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.88)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
    animation: 'idScanFadeIn 0.25s ease-out',
  };

  // ---- Card shell ----
  const cardStyle = {
    background: '#fff',
    borderRadius: 20,
    maxWidth: 440,
    width: '100%',
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
    animation: 'idScanSlideUp 0.35s ease-out',
  };

  // ---- Header ----
  const headerStyle = {
    padding: '16px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#FAFBFC',
    borderBottom: '1px solid #F0F0F0',
  };

  // ---- Button base ----
  const btnBase = {
    border: 'none', borderRadius: 12, cursor: 'pointer',
    fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s ease',
  };

  // =================== RENDER ===================

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>

        {/* ---------- HEADER ---------- */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15,
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                ID Card Scanner
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                {phase === 'camera' && <><StatusDot active={cameraReady} />{cameraReady ? 'Camera ready' : 'Initializing…'}</>}
                {phase === 'scanning' && <><StatusDot active color="#F59E0B" />Processing…</>}
                {phase === 'result' && <><StatusDot active color="#10B981" />Scan complete</>}
                {phase === 'error' && <><StatusDot color="#EF4444" />Scan failed</>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: '#F3F4F6', color: '#6B7280', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
          >
            ✕
          </button>
        </div>

        {/* ---------- BODY ---------- */}
        <div style={{ padding: 20 }}>

          {/* === CAMERA / SCANNING VIEW === */}
          {(phase === 'camera' || phase === 'scanning') && (
            <div style={{ animation: 'idScanFadeIn 0.3s ease-out' }}>
              {/* Webcam container */}
              <div style={{
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                background: '#0A0A0A',
                aspectRatio: '4/3',
              }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 640, height: 480, facingMode: 'environment' }}
                  onUserMedia={() => setCameraReady(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  mirrored={false}
                />

                {/* Dark vignette overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
                  pointerEvents: 'none',
                }} />

                {/* Scan frame with corners */}
                <div style={{
                  position: 'absolute',
                  top: '12%', left: '10%', right: '10%', bottom: '12%',
                  pointerEvents: 'none',
                }}>
                  <CornerBracket position="top" color={phase === 'scanning' ? '#F59E0B' : '#3B82F6'} />
                  <CornerBracket position="topR" color={phase === 'scanning' ? '#F59E0B' : '#3B82F6'} />
                  <CornerBracket position="bottom" color={phase === 'scanning' ? '#F59E0B' : '#3B82F6'} />
                  <CornerBracket position="bottomR" color={phase === 'scanning' ? '#F59E0B' : '#3B82F6'} />
                </div>

                {/* Scanning beam */}
                {phase === 'scanning' && (
                  <div style={{
                    position: 'absolute',
                    left: '12%', right: '12%',
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #3B82F6, #60A5FA, #3B82F6, transparent)',
                    boxShadow: '0 0 12px 2px rgba(59,130,246,0.5)',
                    animation: 'idScanBeam 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Bottom label */}
                <div style={{
                  position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12, fontWeight: 500,
                  padding: '5px 14px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  {phase === 'scanning' ? 'Reading ID card…' : 'Align ID card within the frame'}
                </div>

                {/* Scanning overlay */}
                {phase === 'scanning' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      border: '3px solid rgba(255,255,255,0.2)',
                      borderTop: '3px solid #fff',
                      animation: 'idScanSpin 0.8s linear infinite',
                    }} />
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
                      Scanning
                    </span>
                    <DotLoader />
                  </div>
                )}
              </div>

              {/* Instruction tip */}
              {phase === 'camera' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 10, padding: '8px 12px',
                  background: '#FFFBEB', borderRadius: 10,
                  border: '1px solid #FDE68A',
                  fontSize: 12, color: '#92400E',
                }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  Hold the ID card steady under good lighting for best results
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  style={{
                    ...btnBase,
                    flex: 1,
                    background: phase === 'scanning'
                      ? '#93C5FD'
                      : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    color: '#fff',
                    padding: '13px 0',
                    boxShadow: phase === 'scanning' ? 'none' : '0 4px 14px rgba(59,130,246,0.35)',
                    cursor: phase === 'scanning' ? 'wait' : 'pointer',
                    opacity: phase === 'scanning' ? 0.7 : 1,
                  }}
                  onClick={handleCapture}
                  disabled={phase === 'scanning'}
                >
                  {phase === 'scanning' ? (
                    <>Scanning…</>
                  ) : (
                    <>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Capture & Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* === RESULT VIEW === */}
          {phase === 'result' && result && (
            <div style={{ animation: 'idScanSlideUp 0.4s ease-out' }}>

              {/* Captured image thumbnail */}
              {capturedImage && (
                <div style={{
                  position: 'relative', borderRadius: 12, overflow: 'hidden',
                  marginBottom: 16, border: '1px solid #E5E7EB',
                }}>
                  <img
                    src={capturedImage}
                    alt="Captured ID"
                    style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(16,185,129,0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff', fontSize: 11, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 6,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Captured
                  </div>
                </div>
              )}

              {/* Success banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                borderRadius: 12,
                border: '1px solid #A7F3D0',
                marginBottom: 14,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#10B981', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                    ID Card Scanned Successfully
                  </div>
                  <div style={{ fontSize: 11, color: '#047857', marginTop: 1 }}>
                    Confidence: {Math.round(result.confidence)}% · {result.processingTime}ms
                  </div>
                </div>
              </div>

              {/* Parsed fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <FieldRow
                  label="Full Name"
                  value={result.parsedFields.fullName}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  }
                />
                <FieldRow
                  label="ID Number"
                  value={result.parsedFields.idNumber}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M2 10h20"/>
                    </svg>
                  }
                />
                <FieldRow
                  label="Date of Birth"
                  value={result.parsedFields.dateOfBirth}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  }
                />
                <FieldRow
                  label="Gender"
                  value={result.parsedFields.gender}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                  }
                />
                <FieldRow
                  label="Passport No."
                  value={result.parsedFields.passportNumber}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  }
                />
                <FieldRow
                  label="Phone Number"
                  value={result.parsedFields.phoneNumber}
                  icon={
                    <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  }
                />
              </div>

              {/* Raw text expandable */}
              {result.extractedText && (
                <details style={{ marginTop: 14 }}>
                  <summary style={{
                    fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                    cursor: 'pointer', userSelect: 'none',
                    padding: '6px 0',
                  }}>
                    View raw OCR text
                  </summary>
                  <pre style={{
                    marginTop: 6, padding: 10,
                    background: '#F9FAFB', borderRadius: 8,
                    border: '1px solid #F3F4F6',
                    fontSize: 10, color: '#6B7280',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    maxHeight: 120, overflow: 'auto',
                    lineHeight: 1.5,
                  }}>
                    {result.extractedText}
                  </pre>
                </details>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  style={{
                    ...btnBase,
                    flex: 1, padding: '13px 0',
                    background: '#F3F4F6', color: '#374151',
                  }}
                  onClick={handleRetry}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  Re-scan
                </button>
                <button
                  style={{
                    ...btnBase,
                    flex: 1, padding: '13px 0',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                  }}
                  onClick={onClose}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Done
                </button>
              </div>
            </div>
          )}

          {/* === ERROR VIEW === */}
          {phase === 'error' && (
            <div style={{ animation: 'idScanSlideUp 0.35s ease-out' }}>

              {/* Captured image (if available) */}
              {capturedImage && (
                <div style={{
                  position: 'relative', borderRadius: 12, overflow: 'hidden',
                  marginBottom: 16, border: '1px solid #FECACA',
                }}>
                  <img
                    src={capturedImage}
                    alt="Captured ID"
                    style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block', opacity: 0.6 }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(4px)',
                      color: '#fff', fontSize: 12, fontWeight: 600,
                      padding: '6px 14px', borderRadius: 8,
                    }}>
                      ✕ Scan Failed
                    </div>
                  </div>
                </div>
              )}

              {/* Error card */}
              <div style={{
                padding: '16px 14px',
                background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                borderRadius: 12,
                border: '1px solid #FECACA',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: '#EF4444', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0, marginTop: 1,
                  }}>
                    !
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>
                      Could Not Read ID Card
                    </div>
                    <div style={{ fontSize: 12, color: '#B91C1C', lineHeight: 1.5 }}>
                      {error || 'An unknown error occurred.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div style={{
                padding: '14px',
                background: '#F9FAFB', borderRadius: 12,
                border: '1px solid #E5E7EB',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                  Tips for a better scan:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Ensure good, even lighting — avoid shadows or glare',
                    'Hold the ID card flat and steady',
                    'Fill the frame with the ID card',
                    'Make sure all text is clearly visible',
                    'Use a dark, contrasting background',
                  ].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#6B7280' }}>
                      <span style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 1 }}>•</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  style={{
                    ...btnBase,
                    flex: 0, padding: '13px 20px',
                    background: '#F3F4F6', color: '#374151',
                  }}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...btnBase,
                    flex: 1, padding: '13px 0',
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
                  }}
                  onClick={handleRetry}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  scanIDCard,
  preprocessImage,
  parseIDCardText,
  captureImage,
  terminateWorker,
  IDScannerComponent,
};
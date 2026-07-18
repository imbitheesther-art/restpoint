import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';
import './SignaturePad.css';

/* ═══════════════════════════════════════════════════════════════
   MINI INLINE ICONS (zero dependencies)
   ═══════════════════════════════════════════════════════════════ */
const Ic = ({ children, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Icons = {
  undo: <Ic><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></Ic>,
  clear: <Ic><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Ic>,
  save: <Ic><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Ic>,
  pen: <Ic><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></Ic>,
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const ReusableSignaturePad = forwardRef(({
  penColor = '#1c1917',
  backgroundColor = 'transparent',
  placeholder = 'Sign here',
  disabled = false,
  showControls = true,
  showUndo = true,
  showClear = true,
  showSave = true,
  onSave,
  onChange,
  canvasProps = {},
  className = '',
  style = {},
}, ref) => {
  const containerRef = useRef(null);
  const sigCanvas = useRef(null);
  const historyRef = useRef([]);
  const [hasContent, setHasContent] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 280 });

  // Dynamically measure container and set canvas to EXACT pixel size
  // This prevents the coordinate mismatch that causes signatures to shift
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = 280; // Generous height for comfortable signing
      if (w > 0 && (w !== canvasSize.width || h !== canvasSize.height)) {
        // Save existing signature before resize
        let existingData = null;
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
          try { existingData = sigCanvas.current.toDataURL(); } catch (e) { /* ignore */ }
        }
        setCanvasSize({ width: w, height: h });
        // Restore after React re-renders with new size
        if (existingData) {
          requestAnimationFrame(() => {
            try {
              sigCanvas.current?.fromDataURL(existingData, {
                width: w,
                height: h,
                ratio: 1,
              });
            } catch (e) { /* ignore */ }
          });
        }
      }
    };

    measure();

    // Use ResizeObserver for real-time container size tracking
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => measure());
      observer.observe(containerRef.current);
    }

    // Also listen for window resize as fallback
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      if (observer) observer.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    clear: handleClear,
    isEmpty: () => sigCanvas.current?.isEmpty() ?? true,
    toDataURL: (mime, includeBg) => sigCanvas.current?.toDataURL(mime, includeBg) ?? null,
    toBlob: (cb, mime, q) => sigCanvas.current?.toBlob(cb, mime, q),
    getTrimmedCanvas: () => sigCanvas.current?.getTrimmedCanvas(),
    fromDataURL: (url, opts) => {
      sigCanvas.current?.fromDataURL(url, opts);
      setHasContent(true);
    },
    undo: handleUndo,
  }));

  const handleBegin = useCallback(() => {
    if (disabled) return;
    try {
      const currentData = sigCanvas.current?.toDataURL();
      if (currentData) {
        historyRef.current.push(currentData);
      }
    } catch (e) {
      console.warn('Signature Pad: Could not save history state', e);
    }
  }, [disabled]);

  const handleEnd = useCallback(() => {
    if (disabled) return;
    setHasContent(true);
    if (onChange) {
      try {
        const data = sigCanvas.current?.toDataURL() ?? null;
        onChange(data);
      } catch (e) {
        console.warn('Signature Pad: Error generating data URL', e);
      }
    }
  }, [disabled, onChange]);

  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    historyRef.current = [];
    setHasContent(false);
    if (onChange) onChange(null);
  }, [onChange]);

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) {
      handleClear();
      return;
    }
    const prevState = historyRef.current.pop();
    sigCanvas.current?.fromDataURL(prevState, {
      width: sigCanvas.current.getCanvas().width,
      height: sigCanvas.current.getCanvas().height,
      ratio: 1,
    });

    if (sigCanvas.current?.isEmpty()) {
      setHasContent(false);
      if (onChange) onChange(null);
    } else {
      if (onChange) onChange(prevState);
    }
  }, [handleClear, onChange]);

  const handleSave = useCallback(() => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;

    try {
      const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
      const trimmedDataUrl = trimmedCanvas.toDataURL('image/png');

      if (onSave) onSave(trimmedDataUrl);

      if (!onSave) {
        const link = document.createElement('a');
        link.download = `signature_${Date.now()}.png`;
        link.href = trimmedDataUrl;
        link.click();
      }
    } catch (e) {
      console.error('Signature Pad: Error saving signature', e);
    }
  }, [onSave]);

  return (
    <div
      ref={containerRef}
      className={`sp-wrapper ${disabled ? 'sp-disabled' : ''} ${className}`}
      style={style}
    >
      {/* Canvas Area — NO CSS scaling, canvas pixels = display pixels */}
      <div className="sp-canvas-container">
        {!hasContent && (
          <div className="sp-placeholder">
            {Icons.pen}
            <span>{placeholder}</span>
          </div>
        )}

        <ReactSignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: canvasSize.width,
            height: canvasSize.height,
            className: 'sp-canvas',
            ...canvasProps,
          }}
          penColor={penColor}
          backgroundColor={backgroundColor}
          onBegin={handleBegin}
          onEnd={handleEnd}
        />
      </div>

      {/* Signature baseline */}
      <div className="sp-line" />

      {/* Toolbar */}
      {showControls && (
        <div className="sp-controls">
          {showUndo && (
            <button
              type="button"
              className="sp-btn"
              onClick={handleUndo}
              disabled={!hasContent}
              title="Undo last stroke"
            >
              {Icons.undo} Undo
            </button>
          )}
          {showClear && (
            <button
              type="button"
              className="sp-btn sp-btn-danger"
              onClick={handleClear}
              disabled={!hasContent}
              title="Clear signature"
            >
              {Icons.clear} Clear
            </button>
          )}
          <div style={{ flex: 1 }} />
          {showSave && (
            <button
              type="button"
              className="sp-btn sp-btn-primary"
              onClick={handleSave}
              disabled={!hasContent}
              title="Save signature"
            >
              {Icons.save} Save
            </button>
          )}
        </div>
      )}
    </div>
  );
});

ReusableSignaturePad.displayName = 'ReusableSignaturePad';

export default ReusableSignaturePad;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Save, Download, Printer, Undo, Redo, ZoomIn, ZoomOut,
  Type, Pen, Eraser, Square, Circle, Trash2, RefreshCw,
  ImageIcon, X, Check, Lock, Cloud, AlertCircle, Loader, Wifi, WifiOff
} from 'lucide-react';

import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/restpoint` : 'http://localhost:5000/api/v1/restpoint';

// Debug mode
const DEBUG_MODE = true;

// Logging utility
const log = {
  info: (msg, data) => DEBUG_MODE && console.log(`[DocumentEditor] ${msg}`, data || ''),
  error: (msg, error) => {
    console.error(`[DocumentEditor] ${msg}`, error);
    if (error?.response) {
      console.error('[DocumentEditor] Response data:', error.response.data);
      console.error('[DocumentEditor] Response status:', error.response.status);
    }
  },
  warn: (msg, data) => DEBUG_MODE && console.warn(`[DocumentEditor] ${msg}`, data || '')
};

// API call with timeout
const apiCall = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios({
      url,
      signal: controller.signal,
      ...options
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const DocumentEditor = ({
  document: initialDocument,
  file: initialFile,
  template: initialTemplate,
  onClose,
  onSave,
  tenantSlug
}) => {
  // Canvas refs
  const canvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Editor state
  const [canvas, setCanvas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [securityStatus, setSecurityStatus] = useState('verified');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Document state
  const [documentTitle, setDocumentTitle] = useState(initialDocument?.title || initialTemplate?.name || 'Untitled Document');
  const [fieldValues, setFieldValues] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // Tool state
  const [activeTool, setActiveTool] = useState('select');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Signature modal
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  // Template reference
  const templateRef = useRef(initialTemplate);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize canvas immediately
  useEffect(() => {
    const initCanvas = async () => {
      try {
        log.info('Initializing canvas...');
        setLoadError(null);

        // Simulate canvas initialization
        // In real app, this would initialize Fabric.js or similar
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create a simple canvas context for demo
        const canvasEl = canvasRef.current;
        if (canvasEl) {
          const ctx = canvasEl.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

          setCanvas(canvasEl);
          setSecurityStatus('verified');
          log.info('Canvas initialized successfully');
        }

        // Load initial document content if provided
        if (initialDocument?.content) {
          log.info('Loading document content');
          // Load content into canvas
        } else if (initialFile) {
          log.info('Loading file:', initialFile.name);
          // Load file into canvas
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
              log.info('File loaded into canvas');
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(initialFile);
        } else if (initialTemplate) {
          log.info('Loading template:', initialTemplate.name);
          // Load template into canvas
        }

        setIsLoading(false);
      } catch (error) {
        log.error('Failed to initialize canvas', error);
        setLoadError('Failed to initialize editor. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initCanvas();
  }, [initialDocument, initialFile, initialTemplate]);

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty || !canvas) return;

    const autoSaveTimer = setTimeout(() => {
      setIsAutoSaving(true);
      saveDocument(true).finally(() => {
        setIsAutoSaving(false);
      });
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [isDirty, canvas]);

  // Save document
  const saveDocument = useCallback(async (isAutoSave = false) => {
    if (!canvas || isSaving) return;

    setIsSaving(true);
    try {
      const documentData = {
        title: documentTitle,
        content: canvas.toDataURL('image/png'),
        fieldValues,
        tenantSlug,
        templateId: templateRef.current?.id,
        updatedAt: new Date().toISOString()
      };

      if (isAutoSave) {
        log.info('Auto-saving document...');
      } else {
        log.info('Saving document...');
      }

      // Try to save to backend
      if (isOnline) {
        try {
          if (initialDocument?.id) {
            await apiCall(`${API_BASE_URL}/edocuments/${initialDocument.id}`, {
              method: 'PUT',
              headers: { 'x-tenant-slug': tenantSlug, 'Content-Type': 'application/json' },
              data: documentData
            }, 10000);
            log.info('Document saved to backend');
          } else {
            const response = await apiCall(`${API_BASE_URL}/edocuments`, {
              method: 'POST',
              headers: { 'x-tenant-slug': tenantSlug, 'Content-Type': 'application/json' },
              data: documentData
            }, 10000);
            log.info('Document uploaded to backend', response.data);
          }
        } catch (error) {
          log.error('Failed to save to backend, saving locally', error);
          // Save to localStorage as fallback
          const localDocs = JSON.parse(localStorage.getItem('edocuments_documents') || '[]');
          const newDoc = { ...documentData, id: Date.now(), createdAt: new Date().toISOString() };
          localStorage.setItem('edocuments_documents', JSON.stringify([newDoc, ...localDocs]));
        }
      } else {
        // Offline - save to localStorage
        log.info('Offline - saving to localStorage');
        const localDocs = JSON.parse(localStorage.getItem('edocuments_documents') || '[]');
        const newDoc = { ...documentData, id: initialDocument?.id || Date.now(), createdAt: initialDocument?.createdAt || new Date().toISOString() };
        localStorage.setItem('edocuments_documents', JSON.stringify([newDoc, ...localDocs]));
      }

      setIsDirty(false);
      setLastSaveTime(new Date().toLocaleTimeString());

      if (!isAutoSave) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Document saved successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }

      // Call parent save handler
      if (onSave) {
        onSave(documentData);
      }
    } catch (error) {
      log.error('Failed to save document', error);
      if (!isAutoSave) {
        Swal.fire('Error', 'Failed to save document', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  }, [canvas, documentTitle, fieldValues, tenantSlug, initialDocument, isOnline, onSave]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    log.info('Undo');
    // Implement undo logic
  }, []);

  const handleRedo = useCallback(() => {
    log.info('Redo');
    // Implement redo logic
  }, []);

  // Tool handlers
  const addTextBox = () => {
    log.info('Adding text box');
    setIsDirty(true);
    // Add text box to canvas
  };

  const addRectangle = () => {
    log.info('Adding rectangle');
    setIsDirty(true);
    // Add rectangle to canvas
  };

  const addCircle = () => {
    log.info('Adding circle');
    setIsDirty(true);
    // Add circle to canvas
  };

  const addLine = () => {
    log.info('Adding line');
    setIsDirty(true);
    // Add line to canvas
  };

  const addArrow = () => {
    log.info('Adding arrow');
    setIsDirty(true);
    // Add arrow to canvas
  };

  const addStamp = (text) => {
    log.info('Adding stamp:', text);
    setIsDirty(true);
    // Add stamp to canvas
  };

  const deleteSelected = () => {
    log.info('Deleting selected');
    setIsDirty(true);
    // Delete selected object
  };

  const clearCanvas = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Clear Canvas?',
      text: 'This will remove all content from the canvas.',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          setIsDirty(true);
          log.info('Canvas cleared');
        }
      }
    });
  };

  // Signature handlers
  const signatureStart = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const signatureMove = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const signatureEnd = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const applySignature = () => {
    if (!signatureData) return;
    log.info('Applying signature to document');
    setIsDirty(true);
    setShowSignatureModal(false);
    // Apply signature to main canvas
  };

  // File import handler
  const handleLogoImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    log.info('Importing image:', file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 50, 50, img.width / 4, img.height / 4);
          setIsDirty(true);
          log.info('Image imported successfully');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Download PNG
  const downloadPNG = useCallback(() => {
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 1.0 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
      a.click();
      log.info('Document downloaded as PNG');
    } catch (error) {
      log.error('Error downloading PNG:', error);
      Swal.fire('Error', 'Failed to download document', 'error');
    }
  }, [canvas, documentTitle]);

  // Print document
  const printDocument = useCallback(() => {
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 1.0 });
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print - ${documentTitle}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; height: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              @media print {
                img { max-width: 100%; height: auto; box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
      log.info('Print dialog opened');
    } catch (error) {
      log.error('Error printing document:', error);
      Swal.fire('Error', 'Failed to print document', 'error');
    }
  }, [canvas, documentTitle]);

  // ============================================
  // RENDER
  // ============================================

  const colorPresets = [
    '#000000', '#FFFFFF', '#D97706', '#DC2626', '#2563EB', '#16A34A',
    '#7C3AED', '#DB2777', '#4B5563', '#0369A1'
  ];

  if (loadError || securityStatus === 'error') {
    return (
      <div style={editorContainerStyle}>
        <div style={{ ...headerStyle, justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ ...actionButtonStyle, backgroundColor: '#b91c1c', color: '#fff' }}>
            <X size={16} /> Close
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Unable to Load Editor</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{loadError || 'Security verification failed'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={editorContainerStyle}>
        <div style={{ ...headerStyle, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...actionButtonStyle, backgroundColor: '#b91c1c', color: '#fff' }}>
            <X size={16} /> Close
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <p>Initializing editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={editorContainerStyle}>
      {/* Top Header Bar */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => { setDocumentTitle(e.target.value); setIsDirty(true); }}
            style={titleInputStyle}
            placeholder="Document Name"
            disabled={isLoading}
          />
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            {templateRef.current?.name && `| Template: ${templateRef.current.name}`}
          </span>
          {isDirty && (
            <span style={{ color: '#fbbf24', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ● Unsaved changes
            </span>
          )}
          {isAutoSaving && (
            <span style={{ color: '#60a5fa', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cloud size={12} /> Auto-saving...
            </span>
          )}
          {lastSaveTime && !isDirty && (
            <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} /> Saved at {lastSaveTime}
            </span>
          )}
          {securityStatus === 'verified' && (
            <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> {tenantSlug}
            </span>
          )}
          {!isOnline && (
            <span style={{ color: '#f59e0b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <WifiOff size={12} /> Offline
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setZoom(Math.max(50, zoom - 15))} style={actionButtonStyle} title="Zoom Out" disabled={isLoading}>
            <ZoomOut size={16} />
          </button>
          <span style={{ color: '#9ca3af', fontSize: '13px', minWidth: '45px', textAlign: 'center', fontWeight: 600 }}>
            {zoom}%
          </span>
          <button onClick={() => setZoom(Math.min(200, zoom + 15))} style={actionButtonStyle} title="Zoom In" disabled={isLoading}>
            <ZoomIn size={16} />
          </button>

          <div style={dividerStyle} />

          <button onClick={handleUndo} disabled={!canUndo || isLoading} style={{ ...actionButtonStyle, opacity: canUndo ? 1 : 0.4 }} title="Undo (Ctrl+Z)">
            <Undo size={16} />
          </button>
          <button onClick={handleRedo} disabled={!canRedo || isLoading} style={{ ...actionButtonStyle, opacity: canRedo ? 1 : 0.4 }} title="Redo (Ctrl+Y)">
            <Redo size={16} />
          </button>

          <div style={dividerStyle} />

          <button onClick={() => saveDocument(false)} disabled={isSaving || isLoading || !isDirty} style={{ ...actionButtonStyle, backgroundColor: '#059669', color: '#fff' }} title="Save Document (Ctrl+S)">
            <Save size={16} style={{ marginRight: '6px' }} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={downloadPNG} style={actionButtonStyle} title="Download PNG" disabled={isLoading}>
            <Download size={16} />
          </button>
          <button onClick={printDocument} style={actionButtonStyle} title="Print Document" disabled={isLoading}>
            <Printer size={16} />
          </button>

          <button onClick={onClose} style={{ ...actionButtonStyle, backgroundColor: '#b91c1c', color: '#fff' }} title="Close Editor" disabled={isLoading}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Toolbar */}
        <div style={toolbarStyle}>
          <h4 style={toolbarHeadingStyle}>Tools</h4>

          <div style={toolGroupStyle}>
            <ToolButton
              icon={<Type size={18} />}
              active={activeTool === 'text'}
              onClick={() => { setActiveTool('text'); addTextBox(); }}
              title="Add Editable Text"
              disabled={isLoading}
            />
            <ToolButton
              icon={<Pen size={18} />}
              active={activeTool === 'pen'}
              onClick={() => setActiveTool('pen')}
              title="Freehand Pencil"
              disabled={isLoading}
            />
            <ToolButton
              icon={<Eraser size={18} />}
              active={activeTool === 'eraser'}
              onClick={() => setActiveTool('eraser')}
              title="Eraser (White Brush)"
              disabled={isLoading}
            />
            <ToolButton
              icon={<Square size={18} />}
              active={activeTool === 'rect'}
              onClick={() => { setActiveTool('select'); addRectangle(); }}
              title="Draw Rectangle"
              disabled={isLoading}
            />
            <ToolButton
              icon={<Circle size={18} />}
              active={activeTool === 'circle'}
              onClick={() => { setActiveTool('select'); addCircle(); }}
              title="Draw Circle"
              disabled={isLoading}
            />
            <ToolButton
              icon={<div style={{ width: '18px', height: '2px', background: 'currentColor' }} />}
              active={activeTool === 'line'}
              onClick={() => { setActiveTool('select'); addLine(); }}
              title="Draw Line"
              disabled={isLoading}
            />
            <ToolButton
              icon={<div style={{ width: '0', height: '0', borderLeft: '9px solid currentColor', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />}
              active={activeTool === 'arrow'}
              onClick={() => { setActiveTool('select'); addArrow(); }}
              title="Draw Arrow"
              disabled={isLoading}
            />
          </div>

          <div style={dividerHorizontalStyle} />

          <h4 style={toolbarHeadingStyle}>Shapes & Stamps</h4>
          <div style={toolGroupStyle}>
            <button onClick={() => { setActiveTool('select'); addStamp('APPROVED'); }} style={toolbarSquareButtonStyle} title="Add Approved Stamp" disabled={isLoading}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626' }}>✓</div>
              <span style={{ fontSize: '10px', marginTop: '4px' }}>Approved</span>
            </button>
            <button onClick={() => { setActiveTool('select'); addStamp('REJECTED'); }} style={toolbarSquareButtonStyle} title="Add Rejected Stamp" disabled={isLoading}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626' }}>✗</div>
              <span style={{ fontSize: '10px', marginTop: '4px' }}>Rejected</span>
            </button>
            <button onClick={() => { setActiveTool('select'); addStamp('PENDING'); }} style={toolbarSquareButtonStyle} title="Add Pending Stamp" disabled={isLoading}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#f59e0b' }}>⏳</div>
              <span style={{ fontSize: '10px', marginTop: '4px' }}>Pending</span>
            </button>
          </div>

          <div style={dividerHorizontalStyle} />

          <h4 style={toolbarHeadingStyle}>Insert</h4>
          <div style={toolGroupStyle}>
            <button onClick={() => { setActiveTool('select'); setShowSignatureModal(true); }} style={toolbarSquareButtonStyle} title="Add Signature" disabled={isLoading}>
              <Pen size={18} />
              <span style={{ fontSize: '10px', marginTop: '4px' }}>Signature</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} style={toolbarSquareButtonStyle} title="Upload Image" disabled={isLoading}>
              <ImageIcon size={18} />
              <span style={{ fontSize: '10px', marginTop: '4px' }}>Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoImport}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div style={dividerHorizontalStyle} />

          <h4 style={toolbarHeadingStyle}>Brush Color</h4>
          <div style={colorPaletteGridStyle}>
            {colorPresets.map(color => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: brushColor === color ? '2px solid #c9a84c' : '1px solid #4b5563',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={color}
                disabled={isLoading}
              />
            ))}
          </div>

          <div style={dividerHorizontalStyle} />

          <h4 style={toolbarHeadingStyle}>Brush Size: {brushSize}px</h4>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#c9a84c', cursor: 'pointer' }}
            disabled={isLoading}
          />

          {selectedObject && (
            <>
              <div style={dividerHorizontalStyle} />
              <button onClick={deleteSelected} style={{ ...toolbarSquareButtonStyle, backgroundColor: '#7f1d1d', color: '#fca5a5', width: '100%', height: '40px' }} title="Delete Selected (Del)" disabled={isLoading}>
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                Delete
              </button>
              <button onClick={clearCanvas} style={{ ...toolbarSquareButtonStyle, backgroundColor: '#991b1b', color: '#fca5a5', width: '100%', height: '40px' }} title="Clear All" disabled={isLoading}>
                <RefreshCw size={16} style={{ marginRight: '6px' }} />
                Clear All
              </button>
            </>
          )}
        </div>

        {/* Canvas Scroll Wrapper */}
        <div style={canvasScrollWrapperStyle}>
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backgroundColor: '#fff',
              transition: 'transform 0.1s ease',
              margin: '30px auto'
            }}
          >
            <canvas ref={canvasRef} width={800} height={1000} style={{ display: 'block' }} />
          </div>
        </div>
      </div>

      {/* Digital Signature Modal */}
      {showSignatureModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#f3f4f6', margin: 0, fontSize: '18px', fontWeight: 600 }}>
                ✒️ Draw Your Signature
              </h3>
              <button onClick={() => setShowSignatureModal(false)} style={closeModalButtonStyle}>
                <X size={18} />
              </button>
            </div>

            <div style={signaturePadWrapperStyle}>
              <canvas
                ref={signatureCanvasRef}
                width={450}
                height={200}
                onMouseDown={signatureStart}
                onMouseMove={signatureMove}
                onMouseUp={signatureEnd}
                onMouseLeave={signatureEnd}
                onTouchStart={signatureStart}
                onTouchMove={signatureMove}
                onTouchEnd={signatureEnd}
                onTouchCancel={signatureEnd}
                style={{
                  width: '100%',
                  height: '200px',
                  cursor: 'crosshair',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  touchAction: 'none',
                  display: 'block'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={clearSignature} style={{ ...modalBtnStyle, backgroundColor: '#4b5563' }}>
                Clear
              </button>
              <button onClick={() => setShowSignatureModal(false)} style={{ ...modalBtnStyle, backgroundColor: '#374151' }}>
                Cancel
              </button>
              <button
                onClick={applySignature}
                disabled={!signatureData}
                style={{
                  ...modalBtnStyle,
                  backgroundColor: signatureData ? '#c9a84c' : '#4b5563',
                  color: signatureData ? '#1e293b' : '#9ca3af',
                  fontWeight: 600
                }}
              >
                <Check size={16} style={{ marginRight: '6px' }} />
                Apply Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STYLING
// ============================================

const editorContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#0f172a',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '"Inter", "Outfit", sans-serif'
};

const headerStyle = {
  backgroundColor: '#1e293b',
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '2px solid #c9a84c',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  flexWrap: 'wrap',
  gap: '10px'
};

const titleInputStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dashed #4b5563',
  color: '#f3f4f6',
  fontSize: '18px',
  fontWeight: 600,
  outline: 'none',
  width: '320px',
  padding: '4px 0',
  transition: 'border-color 0.2s'
};

const actionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 14px',
  backgroundColor: '#334155',
  color: '#f3f4f6',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  boxSizing: 'border-box'
};

const dividerStyle = {
  width: '1px',
  height: '24px',
  backgroundColor: '#475569',
  margin: '0 4px'
};

const toolbarStyle = {
  width: '180px',
  backgroundColor: '#1e293b',
  borderRight: '1px solid #334155',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px 12px',
  gap: '12px',
  overflowY: 'auto',
  boxSizing: 'border-box'
};

const toolbarHeadingStyle = {
  color: '#9ca3af',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '8px 0 4px 0'
};

const toolGroupStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '8px'
};

const dividerHorizontalStyle = {
  height: '1px',
  backgroundColor: '#334155',
  margin: '8px 0'
};

const colorPaletteGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '6px',
  justifyContent: 'center'
};

const canvasScrollWrapperStyle = {
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '20px',
  backgroundColor: '#0f172a'
};

const ToolButton = ({ icon, active, onClick, title, disabled }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    style={{
      width: '100%',
      height: '42px',
      borderRadius: '8px',
      border: active ? '1.5px solid #c9a84c' : '1px solid #475569',
      backgroundColor: active ? 'rgba(201, 168, 76, 0.15)' : '#334155',
      color: active ? '#c9a84c' : '#cbd5e1',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      opacity: disabled ? 0.5 : 1
    }}
  >
    {icon}
  </button>
);

const toolbarSquareButtonStyle = {
  width: '100%',
  height: '56px',
  borderRadius: '8px',
  border: '1px solid #475569',
  backgroundColor: '#334155',
  color: '#cbd5e1',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
  backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '24px',
  width: '90%',
  maxWidth: '500px',
  border: '1px solid #c9a84c',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
};

const signaturePadWrapperStyle = {
  border: '2px dashed #475569',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  marginBottom: '20px',
  overflow: 'hidden'
};

const modalBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 18px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#f3f4f6',
  transition: 'all 0.2s ease'
};

const closeModalButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  transition: 'background-color 0.2s'
};

export default DocumentEditor;
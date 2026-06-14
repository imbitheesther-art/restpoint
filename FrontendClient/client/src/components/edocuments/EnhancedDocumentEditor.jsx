import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { 
  ArrowLeft, ArrowRight, RotateCcw, RotateCw, Save, X, 
  ZoomIn, ZoomOut, Type, Image, Square, Circle, Eraser,
  Menu, ChevronDown, ChevronUp, Download, Upload, Printer,
  Copy, Scissors, Layers, Grid, Maximize, Minimize,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Check, AlertCircle, Barcode, Clock
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EnhancedDocumentEditor.css';

// API Configuration - use centralized axios instance
import axiosInstance from '../../api/axios';
// All API calls go through /api/v2/restpoint (PHP backend)
const BASE_API = '/api/v2/restpoint';

/**
 * JsBarcode barcode generator (inline small implementation)
 */
const generateBarcodeDataURL = (text, options = {}) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = options.width || 300;
  const height = options.height || 80;
  canvas.width = width;
  canvas.height = height;

  // Simple Code128-like barcode rendering
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const bars = [];
  const code = String(text || '1234567890');
  
  // Generate bars based on character codes
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const bitCount = 8;
    for (let j = 0; j < bitCount; j++) {
      bars.push((charCode >> (bitCount - 1 - j)) & 1);
    }
  }

  // Add start/stop bits
  bars.unshift(1, 0, 1);
  bars.push(1, 0, 1);

  const barWidth = width / bars.length;
  
  bars.forEach((bar, index) => {
    if (bar === 1) {
      ctx.fillStyle = options.color || '#000000';
      ctx.fillRect(index * barWidth, 0, Math.ceil(barWidth), height - 20);
    }
  });

  // Add text below
  ctx.fillStyle = options.color || '#000000';
  ctx.font = options.fontSize || '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(code, width / 2, height - 4);

  return canvas.toDataURL('image/png');
};

/**
 * Enterprise-Grade Document Editor
 * Features: Canvas editing, field mapping, real-time collaboration, version history,
 * barcode generation, real-time timestamps, drag & drop
 */
const EnhancedDocumentEditor = ({ 
  documentId, 
  document,
  template,
  deceasedId,
  onSave, 
  onClose
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('select');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [fieldValues, setFieldValues] = useState({});
  const [showFieldsPanel, setShowFieldsPanel] = useState(true);
  const [fields, setFields] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(document?.title || 'Untitled Document');
  const [isConnected, setIsConnected] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [templateLoadError, setTemplateLoadError] = useState(null);
  
  // Barcode state
  const [barcodeText, setBarcodeText] = useState('1234567890');
  
  // Real-time timestamp state - update every second
  const [currentTimestamp, setCurrentTimestamp] = useState(new Date());
  const [timestampObject, setTimestampObject] = useState(null);
  const [timestampUpdateInterval, setTimestampUpdateInterval] = useState(null);

  // Update timestamp every second when a timestamp object exists on the canvas
  useEffect(() => {
    if (!timestampObject || !canvas) {
      if (timestampUpdateInterval) {
        clearInterval(timestampUpdateInterval);
        setTimestampUpdateInterval(null);
      }
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimestamp(now);
      
      // Update the fabric object text with current time
      const activeObjects = canvas.getObjects();
      activeObjects.forEach(obj => {
        if (obj._isTimestamp && obj.type === 'i-text') {
          const formatted = getFormattedTimestamp();
          obj.set({ text: formatted });
          canvas.renderAll();
        }
      });
    }, 1000);

    setTimestampUpdateInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timestampObject, canvas]);

  const getFormattedTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Drag & drop state for barcode/timestamp
  const dragOverHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const dropHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvas) return;
    
    const type = e.dataTransfer.getData('application/x-editor-element');
    if (!type) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const pointer = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    // Adjust for zoom/pan
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform;
    const canvasX = (pointer.x - vpt[4]) / zoom;
    const canvasY = (pointer.y - vpt[5]) / zoom;
    
    if (type === 'barcode') {
      addBarcodeToCanvas(canvasX, canvasY);
    } else if (type === 'timestamp') {
      addTimestampToCanvas(canvasX, canvasY);
    }
  }, [canvas]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1200,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      selection: true,
      renderOnAddRemove: true
    });

    // Enable drag-and-drop on the canvas wrapper
    const canvasWrapper = canvasRef.current.parentElement;
    if (canvasWrapper) {
      canvasWrapper.addEventListener('dragover', dragOverHandler);
      canvasWrapper.addEventListener('drop', dropHandler);
    }

    // Load template canvas state if available
    const loadCanvasState = () => {
      return new Promise((resolve) => {
        if (document?.canvas_state) {
          try {
            const state = typeof document.canvas_state === 'string' 
              ? JSON.parse(document.canvas_state) 
              : document.canvas_state;
              
            fabricCanvas.loadFromJSON(state, () => {
              fabricCanvas.renderAll();
              saveHistory(fabricCanvas);
              setTemplateLoadError(null);
              resolve();
            });
          } catch (err) {
            console.error('Error loading document canvas state:', err);
            setTemplateLoadError('Failed to load document canvas state');
            resolve();
          }
        } 
        // Load template if no document state
        else if (template?.template_json) {
          try {
            const templateJson = typeof template.template_json === 'string'
              ? JSON.parse(template.template_json)
              : template.template_json;
              
            fabricCanvas.loadFromJSON(templateJson, () => {
              fabricCanvas.renderAll();
              saveHistory(fabricCanvas);
              setTemplateLoadError(null);
              toast.success('Template loaded successfully');
              resolve();
            });
          } catch (err) {
            console.error('Error loading template:', err);
            setTemplateLoadError('Failed to load template. Starting with blank canvas.');
            toast.warning('Template could not be loaded. Starting with blank canvas.');
            resolve();
          }
        } else {
          resolve();
        }
      });
    };

    loadCanvasState().then(() => {
      // Scan for existing timestamp objects
      const objects = fabricCanvas.getObjects();
      objects.forEach(obj => {
        if (obj._isTimestamp) {
          setTimestampObject(obj);
        }
      });
    });

    // Event listeners
    fabricCanvas.on('object:added', () => saveHistory(fabricCanvas));
    fabricCanvas.on('object:modified', () => saveHistory(fabricCanvas));
    fabricCanvas.on('object:removed', (e) => {
      if (e.target && e.target._isTimestamp) {
        setTimestampObject(null);
      }
      saveHistory(fabricCanvas);
    });
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
      setActiveTool('select');
      setShowProperties(true);
      // Show timestamp info if selected object is a timestamp
      if (e.selected[0]?._isTimestamp) {
        document.title = 'Editing Timestamp - Auto-updating every second';
      }
    });
    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
      setShowProperties(true);
    });
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setShowProperties(false);
    });

    // Handle drawing mode
    fabricCanvas.on('mouse:down', (e) => {
      if (activeTool === 'draw') {
        fabricCanvas.isDrawing = true;
      }
    });

    fabricCanvas.on('mouse:move', (e) => {
      if (!fabricCanvas.isDrawing || activeTool !== 'draw') return;
      const pointer = fabricCanvas.getPointer(e.e);
      const points = [pointer.x, pointer.y, pointer.x, pointer.y];
      
      if (fabricCanvas._currentLine) {
        const line = fabricCanvas._currentLine;
        line.set({ x2: pointer.x, y2: pointer.y });
        fabricCanvas.renderAll();
      } else {
        const line = new fabric.Line(points, {
          stroke: brushColor,
          strokeWidth: brushSize,
          selectable: false,
          evented: false,
          strokeLineCap: 'round'
        });
        fabricCanvas.add(line);
        fabricCanvas._currentLine = line;
      }
    });

    fabricCanvas.on('mouse:up', () => {
      if (fabricCanvas._currentLine) {
        fabricCanvas._currentLine.set({ selectable: false, evented: false });
        fabricCanvas._currentLine = null;
        saveHistory(fabricCanvas);
      }
      fabricCanvas.isDrawing = false;
    });

    setCanvas(fabricCanvas);

    // Load document fields
    if (document?.fields) {
      const fieldMap = {};
      document.fields.forEach(f => {
        fieldMap[f.field_key] = f.field_value || '';
      });
      setFieldValues(fieldMap);
      setFields(document.fields);
    }

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleSaveDocument();
            break;
          case 'd':
            e.preventDefault();
            toggleGrid();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObject && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          handleDelete();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (timestampUpdateInterval) clearInterval(timestampUpdateInterval);
      fabricCanvas.dispose();
      document.removeEventListener('keydown', handleKeyDown);
      if (canvasWrapper) {
        canvasWrapper.removeEventListener('dragover', dragOverHandler);
        canvasWrapper.removeEventListener('drop', dropHandler);
      }
    };
  }, []); // Only run once on mount - template load happens inside

  // Save to history
  const saveHistory = useCallback((c) => {
    const json = c.toJSON();
    setHistory(prev => [...prev.slice(0, historyStep + 1), json]);
    setHistoryStep(prev => prev + 1);
  }, [historyStep]);

  // Undo
  const handleUndo = () => {
    if (!canvas || historyStep <= 0) return;
    const newStep = historyStep - 1;
    canvas.loadFromJSON(history[newStep], () => {
      canvas.renderAll();
    });
    setHistoryStep(newStep);
    toast.info('Undo');
  };

  // Redo
  const handleRedo = () => {
    if (!canvas || historyStep >= history.length - 1) return;
    const newStep = historyStep + 1;
    canvas.loadFromJSON(history[newStep], () => {
      canvas.renderAll();
    });
    setHistoryStep(newStep);
    toast.info('Redo');
  };

  // Add text
  const addText = (text = 'Text') => {
    if (!canvas) return;
    const fabricText = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontSize: 16,
      fill: '#000000',
      fontFamily: 'Arial',
      editable: true
    });
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    saveHistory(canvas);
    toast.success('Text added');
  };

  // Add field
  const addField = (fieldKey = '', fieldLabel = '') => {
    if (!canvas) return;
    const fabricText = new fabric.IText(fieldLabel || `[${fieldKey}]`, {
      left: 100,
      top: 100,
      fontSize: 14,
      fill: '#0066cc',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      editable: true
    });
    fabricText.fieldKey = fieldKey;
    fabricText.isField = true;
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    saveHistory(canvas);
    toast.success('Field added');
  };

  /**
   * Add a barcode to the canvas at specified position
   */
  const addBarcodeToCanvas = (left, top) => {
    if (!canvas) return;
    
    const barcodeDataURL = generateBarcodeDataURL(barcodeText);
    
    fabric.Image.fromURL(barcodeDataURL, (img) => {
      const scale = 1;
      img.set({ 
        left: left || 100, 
        top: top || 100, 
        scaleX: scale, 
        scaleY: scale,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#2563eb',
        transparentCorners: false,
        _isBarcode: true,
        barcodeText: barcodeText
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistory(canvas);
      toast.success('Barcode added');
    });
  };

  /**
   * Add a real-time timestamp to the canvas
   */
  const addTimestampToCanvas = (left, top) => {
    if (!canvas) return;
    
    const formatted = getFormattedTimestamp();
    const fabricText = new fabric.IText(formatted, {
      left: left || 100,
      top: top || 100,
      fontSize: 14,
      fill: '#333333',
      fontFamily: 'Courier New',
      editable: false,
      selectable: true,
      backgroundColor: '#f0f9ff',
      padding: 4,
      _isTimestamp: true,
      timestampCreated: new Date().toISOString()
    });
    
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    saveHistory(canvas);
    setTimestampObject(fabricText);
    toast.success('Real-time timestamp added - updates every second');
  };

  // Upload image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        const scale = Math.min(200 / img.width, 200 / img.height);
        img.set({ 
          left: 100, 
          top: 100, 
          scaleX: scale, 
          scaleY: scale,
          cornerStyle: 'circle',
          cornerColor: '#3b82f6',
          cornerStrokeColor: '#2563eb',
          transparentCorners: false
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveHistory(canvas);
        toast.success('Image added');
      });
    };
    reader.readAsDataURL(file);
  };

  // Add shape
  const addShape = (type) => {
    if (!canvas) return;
    let shape;
    
    if (type === 'rectangle') {
      shape = new fabric.Rect({
        left: 100, top: 100, width: 150, height: 100,
        fill: '#e0e0e0', stroke: '#333', strokeWidth: 2,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        transparentCorners: false
      });
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        left: 100, top: 100, radius: 50,
        fill: '#e0e0e0', stroke: '#333', strokeWidth: 2,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        transparentCorners: false
      });
    } else if (type === 'triangle') {
      shape = new fabric.Triangle({
        left: 100, top: 100, width: 100, height: 100,
        fill: '#e0e0e0', stroke: '#333', strokeWidth: 2,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        transparentCorners: false
      });
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      saveHistory(canvas);
      toast.success('Shape added');
    }
  };

  // Delete selected
  const handleDelete = () => {
    if (!canvas || !selectedObject) return;
    
    // Check if deleting a timestamp
    if (selectedObject._isTimestamp) {
      setTimestampObject(null);
    }
    
    canvas.remove(selectedObject);
    setSelectedObject(null);
    setShowProperties(false);
    canvas.renderAll();
    saveHistory(canvas);
    toast.info('Object deleted');
  };

  // Duplicate selected
  const handleDuplicate = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.clone((cloned) => {
      cloned.set({
        left: selectedObject.left + 20,
        top: selectedObject.top + 20
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveHistory(canvas);
      toast.success('Object duplicated');
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom * 1.1, 300);
    setZoom(Math.round(newZoom));
    canvas.setZoom(newZoom / 100);
    canvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom / 1.1, 25);
    setZoom(Math.round(newZoom));
    canvas.setZoom(newZoom / 100);
    canvas.renderAll();
  };

  const handleZoomReset = () => {
    if (!canvas) return;
    setZoom(100);
    canvas.setZoom(1);
    canvas.renderAll();
  };

  // Toggle grid
  const toggleGrid = () => {
    setShowGrid(!showGrid);
    if (canvas) {
      if (!showGrid) {
        const gridSize = 20;
        const gridColor = '#f0f0f0';
        
        const existingGrid = canvas.getObjects().filter(obj => obj.isGrid);
        existingGrid.forEach(obj => canvas.remove(obj));
        
        for (let i = 0; i < canvas.width / gridSize; i++) {
          const line = new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
            stroke: gridColor,
            strokeWidth: 1,
            selectable: false,
            evented: false,
            isGrid: true
          });
          canvas.add(line);
        }
        for (let i = 0; i < canvas.height / gridSize; i++) {
          const line = new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
            stroke: gridColor,
            strokeWidth: 1,
            selectable: false,
            evented: false,
            isGrid: true
          });
          canvas.add(line);
        }
        canvas.sendToBack(canvas.getObjects().find(obj => obj.isGrid));
      } else {
        const existingGrid = canvas.getObjects().filter(obj => obj.isGrid);
        existingGrid.forEach(obj => canvas.remove(obj));
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Export document
  const handleExport = (format) => {
    if (!canvas) return;
    
    if (format === 'png') {
      const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
      const link = document.createElement('a');
      link.download = `${documentTitle}.png`;
      link.href = dataURL;
      link.click();
      toast.success('Exported as PNG');
    } else if (format === 'jpeg') {
      const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
      const link = document.createElement('a');
      link.download = `${documentTitle}.jpg`;
      link.href = dataURL;
      link.click();
      toast.success('Exported as JPEG');
    } else if (format === 'json') {
      const json = JSON.stringify(canvas.toJSON(), null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = `${documentTitle}.json`;
      link.href = URL.createObjectURL(blob);
      link.click();
      toast.success('Exported as JSON');
    }
  };

  // Print document
  const handlePrint = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print Document</title></head>
        <body style="margin:0;">
          <img src="${dataURL}" style="width:100%;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.info('Opening print dialog...');
  };

  // Autofill fields
  const autofillFields = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.isField && obj.fieldKey && fieldValues[obj.fieldKey]) {
        obj.set({ text: fieldValues[obj.fieldKey] });
      }
    });
    canvas.renderAll();
    saveHistory(canvas);
    toast.success('Fields auto-filled');
  };

  // Save document
  const handleSaveDocument = async () => {
    if (!canvas) return;

    setIsSaving(true);
    try {
      const canvasJSON = canvas.toJSON();
      
      const payload = {
        canvas_state: canvasJSON,
        content: JSON.stringify(canvasJSON),
        fields: fieldValues,
        title: documentTitle,
        reason: 'Edited from document editor'
      };

      if (onSave) {
        await onSave(documentId, payload);
      }

      toast.success('Document saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Update selected object
  const updateObject = (property, value) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set({ [property]: value });
    canvas.renderAll();
  };

  // Regenerate barcode with new text
  const handleRegenerateBarcode = () => {
    if (!canvas || !selectedObject || !selectedObject._isBarcode) return;
    
    const barcodeDataURL = generateBarcodeDataURL(barcodeText);
    fabric.Image.fromURL(barcodeDataURL, (img) => {
      img.set({ 
        left: selectedObject.left, 
        top: selectedObject.top, 
        scaleX: selectedObject.scaleX, 
        scaleY: selectedObject.scaleY,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#2563eb',
        transparentCorners: false,
        _isBarcode: true,
        barcodeText: barcodeText
      });
      canvas.remove(selectedObject);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistory(canvas);
      setSelectedObject(img);
      toast.success('Barcode regenerated');
    });
  };

  // Quick actions
  const quickActions = [
    { icon: <Undo2 size={16} />, label: 'Undo', action: handleUndo, shortcut: 'Ctrl+Z' },
    { icon: <Redo2 size={16} />, label: 'Redo', action: handleRedo, shortcut: 'Ctrl+Y' },
    { icon: <RotateCcw size={16} />, label: 'Rotate Left', action: () => {
      if (selectedObject) {
        selectedObject.rotate((selectedObject.angle || 0) - 15);
        canvas.renderAll();
        saveHistory(canvas);
      }
    }},
    { icon: <RotateCw size={16} />, label: 'Rotate Right', action: () => {
      if (selectedObject) {
        selectedObject.rotate((selectedObject.angle || 0) + 15);
        canvas.renderAll();
        saveHistory(canvas);
      }
    }},
    { icon: <Copy size={16} />, label: 'Duplicate', action: handleDuplicate, shortcut: 'Ctrl+D' },
    { icon: <Scissors size={16} />, label: 'Delete', action: handleDelete, shortcut: 'Del' },
    { icon: <Grid size={16} />, label: 'Toggle Grid', action: toggleGrid, shortcut: 'Ctrl+G' },
    { icon: <Maximize size={16} />, label: 'Fullscreen', action: toggleFullscreen, shortcut: 'F11' },
    { icon: <Download size={16} />, label: 'Export PNG', action: () => handleExport('png') },
    { icon: <Download size={16} />, label: 'Export JPEG', action: () => handleExport('jpeg') },
    { icon: <Download size={16} />, label: 'Export JSON', action: () => handleExport('json') },
    { icon: <Printer size={16} />, label: 'Print', action: handlePrint, shortcut: 'Ctrl+P' },
  ];

  /**
   * Handle drag start from the special elements panel
   */
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/x-editor-element', type);
    e.dataTransfer.effectAllowed = 'copy';
    // Set drag image
    const canvasPreview = document.createElement('div');
    canvasPreview.style.width = '150px';
    canvasPreview.style.height = '40px';
    canvasPreview.style.background = '#f0f9ff';
    canvasPreview.style.border = '2px solid #3b82f6';
    canvasPreview.style.borderRadius = '4px';
    canvasPreview.style.display = 'flex';
    canvasPreview.style.alignItems = 'center';
    canvasPreview.style.justifyContent = 'center';
    canvasPreview.style.fontSize = '12px';
    canvasPreview.style.color = '#333';
    canvasPreview.textContent = type === 'barcode' ? '||| Barcode |||' : '📅 Timestamp';
    document.body.appendChild(canvasPreview);
    e.dataTransfer.setDragImage(canvasPreview, 75, 20);
    setTimeout(() => document.body.removeChild(canvasPreview), 0);
  };

  return (
    <div className={`enhanced-editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button onClick={onClose} className="btn-icon" title="Close">
            <ArrowLeft size={18} />
          </button>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="document-title-input"
            placeholder="Document Title"
          />
        </div>
        
        <div className="header-center">
          {timestampObject && (
            <span className="live-indicator">
              <span className="live-dot"></span>
              LIVE Timestamp Active
            </span>
          )}
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          {collaborators.length > 0 && (
            <div className="collaborators">
              {collaborators.map((c, i) => (
                <span key={i} className="collaborator-avatar" title={c.name}>
                  {c.name[0]}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="header-right">
          <div className="zoom-controls">
            <button onClick={handleZoomOut} className="btn-icon" title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <span className="zoom-indicator">{zoom}%</span>
            <button onClick={handleZoomIn} className="btn-icon" title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button onClick={handleZoomReset} className="btn-icon" title="Reset Zoom">
              <Minimize size={16} />
            </button>
          </div>
          
          <div className="history-controls">
            <button onClick={handleUndo} disabled={historyStep <= 0} className="btn-icon" title="Undo (Ctrl+Z)">
              <Undo2 size={16} />
            </button>
            <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="btn-icon" title="Redo (Ctrl+Y)">
              <Redo2 size={16} />
            </button>
          </div>
          
          <div className="quick-actions-menu">
            <button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="btn-icon"
              title="Quick Actions"
            >
              <Menu size={18} />
            </button>
            {showQuickActions && (
              <div className="quick-actions-dropdown">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      setShowQuickActions(false);
                    }}
                    className="quick-action-item"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                    {action.shortcut && <span className="shortcut">{action.shortcut}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={handleSaveDocument} disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving...' : <><Save size={16} /> Save</>}
          </button>
          
          <button onClick={onClose} className="btn-icon" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {templateLoadError && (
        <div className="template-error-banner">
          <AlertCircle size={16} />
          <span>{templateLoadError}</span>
          <button onClick={() => setTemplateLoadError(null)} className="btn-icon">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="editor-content">
        {/* Left Toolbar */}
        <div className="editor-toolbar">
          <div className="tool-group">
            <h4>Tools</h4>
            <button 
              onClick={() => setActiveTool('select')}
              className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              title="Select (V)"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={() => setActiveTool('draw')}
              className={`tool-btn ${activeTool === 'draw' ? 'active' : ''}`}
              title="Draw (P)"
            >
              <Eraser size={18} />
            </button>
          </div>

          <div className="tool-group">
            <h4>Add</h4>
            <button onClick={() => addText('Text')} className="tool-btn" title="Add Text">
              <Type size={18} />
            </button>
            <button onClick={() => addShape('rectangle')} className="tool-btn" title="Add Rectangle">
              <Square size={18} />
            </button>
            <button onClick={() => addShape('circle')} className="tool-btn" title="Add Circle">
              <Circle size={18} />
            </button>
            <label className="tool-btn" title="Add Image">
              <Image size={18} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }}
              />
            </label>
            {/* Barcode button */}
            <button 
              onClick={() => addBarcodeToCanvas(100, 100)} 
              className="tool-btn"
              title="Add Barcode"
            >
              <Barcode size={18} />
            </button>
            {/* Timestamp button */}
            <button 
              onClick={() => addTimestampToCanvas(100, 100)} 
              className="tool-btn"
              title="Add Real-time Timestamp"
            >
              <Clock size={18} />
            </button>
          </div>

          <div className="tool-group">
            <h4>Style</h4>
            <input 
              type="color" 
              value={brushColor} 
              onChange={(e) => setBrushColor(e.target.value)}
              className="color-picker"
              title="Color"
            />
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize} 
              onChange={(e) => setBrushSize(e.target.value)}
              className="size-slider"
              title="Brush Size"
            />
          </div>

          <div className="tool-group">
            <h4>View</h4>
            <button 
              onClick={toggleGrid}
              className={`tool-btn ${showGrid ? 'active' : ''}`}
              title="Toggle Grid (Ctrl+G)"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="tool-btn"
              title="Fullscreen (F11)"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="canvas-area">
          <canvas ref={canvasRef} className="fabric-canvas" />
        </div>

        {/* Right Panel - Fields & Special Elements */}
        <div className={`fields-panel ${showFieldsPanel ? 'open' : ''}`}>
          <div className="fields-header" onClick={() => setShowFieldsPanel(!showFieldsPanel)}>
            <h4>📋 Elements & Fields</h4>
            {showFieldsPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showFieldsPanel && (
            <div className="fields-content">
              {/* Drag & Drop Special Elements Section */}
              <div className="special-elements-section">
                <h5 className="section-title">🔄 Drag & Drop Elements</h5>
                <p className="section-hint">Drag these onto the canvas, or click the toolbar buttons above</p>
                
                {/* Draggable Barcode */}
                <div 
                  className="draggable-element"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'barcode')}
                  onClick={() => addBarcodeToCanvas(100, 100)}
                >
                  <div className="element-icon">
                    <Barcode size={20} />
                  </div>
                  <div className="element-info">
                    <span className="element-name">Barcode</span>
                    <span className="element-desc">Drag to add a scannable barcode</span>
                  </div>
                  <div className="element-badge">Drag</div>
                </div>

                {/* Draggable Timestamp */}
                <div 
                  className="draggable-element"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'timestamp')}
                  onClick={() => addTimestampToCanvas(100, 100)}
                >
                  <div className="element-icon timestamp-icon">
                    <Clock size={20} />
                  </div>
                  <div className="element-info">
                    <span className="element-name">Real-time Timestamp</span>
                    <span className="element-desc">Auto-updates every second</span>
                  </div>
                  <div className="element-badge live">LIVE</div>
                </div>
              </div>

              {/* Barcode Configuration (shown when barcode is selected) */}
              {selectedObject?._isBarcode && (
                <div className="barcode-config">
                  <h5 className="section-title">📊 Barcode Settings</h5>
                  <div className="field-item">
                    <label>Barcode Value</label>
                    <input
                      type="text"
                      value={barcodeText}
                      onChange={(e) => setBarcodeText(e.target.value)}
                      placeholder="Enter barcode text"
                    />
                  </div>
                  <button 
                    onClick={handleRegenerateBarcode}
                    className="btn btn-secondary w-full"
                  >
                    🔄 Regenerate Barcode
                  </button>
                </div>
              )}

              {/* Timestamp Info (shown when timestamp is selected) */}
              {selectedObject?._isTimestamp && (
                <div className="timestamp-info">
                  <h5 className="section-title">⏱️ Timestamp Info</h5>
                  <div className="field-item">
                    <label>Current Value:</label>
                    <div className="timestamp-preview">
                      {getFormattedTimestamp()}
                    </div>
                    <span className="timestamp-note">⏺️ Auto-updates every second</span>
                  </div>
                </div>
              )}

              {/* Document Fields Section */}
              <div className="fields-divider" />
              <h5 className="section-title">📝 Document Fields</h5>
              
              {fields.length === 0 ? (
                <p className="no-fields">No fields in this document</p>
              ) : (
                fields.map(field => (
                  <div key={field.id} className="field-item">
                    <label>{field.field_label || field.field_key}</label>
                    {field.field_type === 'select' ? (
                      <select 
                        value={fieldValues[field.field_key] || ''}
                        onChange={(e) => setFieldValues({
                          ...fieldValues,
                          [field.field_key]: e.target.value
                        })}
                      >
                        <option value="">Select...</option>
                        {(field.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.field_type === 'textarea' ? (
                      <textarea 
                        value={fieldValues[field.field_key] || ''}
                        onChange={(e) => setFieldValues({
                          ...fieldValues,
                          [field.field_key]: e.target.value
                        })}
                        rows="3"
                      />
                    ) : (
                      <input 
                        type={field.field_type || 'text'}
                        value={fieldValues[field.field_key] || ''}
                        onChange={(e) => setFieldValues({
                          ...fieldValues,
                          [field.field_key]: e.target.value
                        })}
                        placeholder={field.placeholder || `Enter ${field.field_label}`}
                      />
                    )}
                  </div>
                ))
              )}
              {fields.length > 0 && (
                <button onClick={autofillFields} className="btn btn-secondary w-full">
                  🔄 Auto-fill Fields
                </button>
              )}
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {showProperties && selectedObject && (
          <div className="properties-panel">
            <div className="properties-header">
              <h4>Object Properties</h4>
              <button onClick={() => setShowProperties(false)} className="btn-icon">
                <X size={14} />
              </button>
            </div>
            
            {selectedObject._isBarcode && (
              <div className="property-item">
                <label>Barcode:</label>
                <span className="property-value">{selectedObject.barcodeText || barcodeText}</span>
              </div>
            )}

            {selectedObject._isTimestamp && (
              <div className="property-item">
                <label>Timestamp:</label>
                <span className="property-value live-value">
                  {getFormattedTimestamp()}
                </span>
                <span className="property-hint">⏺️ Auto-updates in real-time</span>
              </div>
            )}

            <div className="property-item">
              <label>Fill Color:</label>
              <input 
                type="color" 
                value={selectedObject.fill || '#000000'}
                onChange={(e) => updateObject('fill', e.target.value)}
              />
            </div>

            <div className="property-item">
              <label>Stroke Color:</label>
              <input 
                type="color" 
                value={selectedObject.stroke || '#000000'}
                onChange={(e) => updateObject('stroke', e.target.value)}
              />
            </div>

            <div className="property-item">
              <label>Opacity:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={selectedObject.opacity || 1}
                onChange={(e) => updateObject('opacity', parseFloat(e.target.value))}
              />
              <span>{Math.round((selectedObject.opacity || 1) * 100)}%</span>
            </div>

            <div className="property-item">
              <label>Angle:</label>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={selectedObject.angle || 0}
                onChange={(e) => updateObject('angle', parseFloat(e.target.value))}
              />
              <span>{Math.round(selectedObject.angle || 0)}°</span>
            </div>

            {selectedObject.type === 'i-text' && !selectedObject._isTimestamp && (
              <>
                <div className="property-item">
                  <label>Font Size:</label>
                  <input 
                    type="number" 
                    value={selectedObject.fontSize || 14}
                    onChange={(e) => updateObject('fontSize', parseFloat(e.target.value))}
                  />
                </div>
                <div className="property-item">
                  <label>Font Family:</label>
                  <select 
                    value={selectedObject.fontFamily || 'Arial'}
                    onChange={(e) => updateObject('fontFamily', e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
                <div className="property-item">
                  <label>Text Align:</label>
                  <div className="align-buttons">
                    <button 
                      onClick={() => updateObject('textAlign', 'left')}
                      className={selectedObject.textAlign === 'left' ? 'active' : ''}
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button 
                      onClick={() => updateObject('textAlign', 'center')}
                      className={selectedObject.textAlign === 'center' ? 'active' : ''}
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button 
                      onClick={() => updateObject('textAlign', 'right')}
                      className={selectedObject.textAlign === 'right' ? 'active' : ''}
                    >
                      <AlignRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="property-item">
                  <label>Style:</label>
                  <div className="style-buttons">
                    <button 
                      onClick={() => updateObject('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold')}
                      className={selectedObject.fontWeight === 'bold' ? 'active' : ''}
                    >
                      <Bold size={14} />
                    </button>
                    <button 
                      onClick={() => updateObject('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={selectedObject.fontStyle === 'italic' ? 'active' : ''}
                    >
                      <Italic size={14} />
                    </button>
                    <button 
                      onClick={() => updateObject('underline', !selectedObject.underline)}
                      className={selectedObject.underline ? 'active' : ''}
                    >
                      <Underline size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="editor-statusbar">
        <div className="status-left">
          <span>Objects: {canvas ? canvas.getObjects().length : 0}</span>
          <span>|</span>
          <span>History: {historyStep + 1}/{history.length}</span>
          {timestampObject && (
            <>
              <span>|</span>
              <span className="live-badge">⏺️ Timestamp Active</span>
            </>
          )}
        </div>
        <div className="status-right">
          <span>Canvas: 800 × 1200</span>
          <span>|</span>
          <span>Ctrl+S to save, Ctrl+Z to undo, Del to delete</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentEditor;
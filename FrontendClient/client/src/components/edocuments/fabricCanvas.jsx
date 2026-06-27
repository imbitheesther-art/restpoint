import React, { useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { CONFIG, getTenantInfo } from './helpers';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ============================================
// FABRIC CANVAS COMPONENT
// ============================================

const FabricCanvas = ({
    canvas,
    zoom,
    activeTool,
    brushColor,
    brushSize,
    onCanvasReady,
    onObjectSelected,
    onSelectionCleared,
    isLoading
}) => {
    const canvasRef = useRef(null);
    const signatureCanvasRef = useRef(null);

    // ============================================
    // CANVAS INITIALIZATION
    // ============================================

    useEffect(() => {
        if (!canvasRef.current) return;

        try {
            const tenantInfo = getTenantInfo();

            const fabricCanvas = new fabric.Canvas(canvasRef.current, {
                width: CONFIG.MAX_CANVAS_SIZE.width,
                height: CONFIG.MAX_CANVAS_SIZE.height,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
                selection: true,
                controlsAboveObjects: true,
                enablePointerEvents: true
            });

            onCanvasReady(fabricCanvas);

            // Event handlers
            const handleSelectionCreated = (e) => {
                onObjectSelected?.(e.selected[0]);
            };

            const handleSelectionUpdated = (e) => {
                onObjectSelected?.(e.selected[0]);
            };

            const handleSelectionCleared = () => {
                onSelectionCleared?.();
            };

            fabricCanvas.on('selection:created', handleSelectionCreated);
            fabricCanvas.on('selection:updated', handleSelectionUpdated);
            fabricCanvas.on('selection:cleared', handleSelectionCleared);

            return () => {
                fabricCanvas.off('selection:created', handleSelectionCreated);
                fabricCanvas.off('selection:updated', handleSelectionUpdated);
                fabricCanvas.off('selection:cleared', handleSelectionCleared);
                fabricCanvas.dispose();
            };
        } catch (error) {
            console.error('Error initializing canvas:', error);
        }
    }, [onCanvasReady, onObjectSelected, onSelectionCleared]);

    // ============================================
    // BRUSH CONFIGURATION
    // ============================================

    useEffect(() => {
        if (!canvas) return;

        try {
            if (activeTool === 'pen') {
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = brushColor;
                canvas.freeDrawingBrush.width = brushSize;
            } else if (activeTool === 'eraser') {
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = '#ffffff';
                canvas.freeDrawingBrush.width = brushSize * 4;
            } else {
                canvas.isDrawingMode = false;
            }
        } catch (error) {
            console.error('Error configuring brush:', error);
        }
    }, [activeTool, brushColor, brushSize, canvas]);

    // ============================================
    // RENDER
    // ============================================

    if (isLoading) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a'
            }}>
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                    <p>Initializing canvas...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px',
            backgroundColor: '#0f172a'
        }}>
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
                <canvas ref={canvasRef} style={{ display: 'block' }} />
            </div>
        </div>
    );
};

export default FabricCanvas;
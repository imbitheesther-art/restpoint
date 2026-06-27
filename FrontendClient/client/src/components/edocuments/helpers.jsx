// ============================================
// PRODUCTION CONFIGURATION
// ============================================

export const CONFIG = {
    AUTO_SAVE_INTERVAL: 30000,
    MAX_CANVAS_SIZE: { width: 800, height: 1131 },
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    HISTORY_MAX_STATES: 50,
    SUPPORTED_FILE_TYPES: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ],
    PRODUCTION: process.env.NODE_ENV === 'production',
    ENABLE_AUTO_SAVE: true,
    ISOLATION_LEVEL: 'strict',
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v2/restpoint'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const dataURItoBlob = (dataURI) => {
    try {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    } catch (error) {
        console.error('Error converting data URI to blob:', error);
        throw error;
    }
};

export const getTenantInfo = () => {
    const tenantSlug = localStorage.getItem('tenantSlug') ||
        localStorage.getItem('tenant_slug') ||
        (() => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                return user.tenantSlug || user.tenant?.slug || null;
            } catch {
                return null;
            }
        })();

    if (!tenantSlug && CONFIG.PRODUCTION && CONFIG.ISOLATION_LEVEL === 'strict') {
        throw new Error('SECURITY: Tenant not identified. Operation aborted.');
    }

    return {
        slug: tenantSlug || 'default',
        isValid: !!tenantSlug
    };
};

export const getTenantSlug = () => {
    return localStorage.getItem('tenantSlug') ||
        localStorage.getItem('tenant_slug') ||
        (() => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                return user.tenantSlug || user.tenant?.slug || 'default';
            } catch {
                return 'default';
            }
        })();
};

// ============================================
// COLOR PRESETS
// ============================================

export const COLOR_PRESETS = [
    '#000000', '#FFFFFF', '#D97706', '#DC2626', '#2563EB', '#16A34A',
    '#7C3AED', '#DB2777', '#4B5563', '#0369A1', '#F59E0B', '#10B981'
];

// ============================================
// ALIGNMENT HELPERS
// ============================================

export const alignObjects = (canvas, alignment) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    switch (alignment) {
        case 'left':
            activeObject.set('left', 0);
            break;
        case 'center-horizontal':
            activeObject.set('left', (canvasWidth - activeObject.width * activeObject.scaleX) / 2);
            break;
        case 'right':
            activeObject.set('left', canvasWidth - activeObject.width * activeObject.scaleX);
            break;
        case 'top':
            activeObject.set('top', 0);
            break;
        case 'center-vertical':
            activeObject.set('top', (canvasHeight - activeObject.height * activeObject.scaleY) / 2);
            break;
        case 'bottom':
            activeObject.set('top', canvasHeight - activeObject.height * activeObject.scaleY);
            break;
        case 'center-both':
            activeObject.set({
                left: (canvasWidth - activeObject.width * activeObject.scaleX) / 2,
                top: (canvasHeight - activeObject.height * activeObject.scaleY) / 2
            });
            break;
        default:
            break;
    }

    activeObject.setCoords();
    canvas.renderAll();
};

export const distributeObjects = (canvas, direction) => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) return;

    const sortedObjects = [...activeObjects].sort((a, b) => {
        if (direction === 'horizontal') {
            return a.left - b.left;
        } else {
            return a.top - b.top;
        }
    });

    const canvasSize = direction === 'horizontal' ? canvas.width : canvas.height;
    const totalSize = sortedObjects.reduce((sum, obj) => {
        return sum + (direction === 'horizontal' ? obj.width * obj.scaleX : obj.height * obj.scaleY);
    }, 0);

    const spacing = (canvasSize - totalSize) / (sortedObjects.length - 1);

    sortedObjects.forEach((obj, index) => {
        if (direction === 'horizontal') {
            obj.set('left', index * (obj.width * obj.scaleX + spacing));
        } else {
            obj.set('top', index * (obj.height * obj.scaleY + spacing));
        }
        obj.setCoords();
    });

    canvas.renderAll();
};

// ============================================
// BARCODE & QR CODE GENERATORS
// ============================================

export const generateBarcode = (text, canvas) => {
    if (!canvas || !text) return null;

    // Simple barcode visualization using Fabric.js
    const barcodeWidth = 200;
    const barcodeHeight = 60;
    const barWidth = 2;
    const gap = 1;

    const group = new fabric.Group([], {
        left: 100,
        top: 100,
        borderColor: '#c9a84c',
        cornerColor: '#c9a84c',
        cornerSize: 8,
        transparentCorners: false
    });

    // Generate bars based on text hash
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let xPos = 0;

    for (let i = 0; i < barcodeWidth / (barWidth + gap); i++) {
        const isBar = ((hash * (i + 1)) % 3) !== 0;
        if (isBar) {
            const bar = new fabric.Rect({
                width: barWidth,
                height: barcodeHeight,
                fill: '#000000',
                left: xPos,
                top: 0
            });
            group.addWithUpdate(bar);
        }
        xPos += barWidth + gap;
    }

    return group;
};

export const generateQRCode = (text, canvas) => {
    if (!canvas || !text) return null;

    // Simple QR-like pattern (for production, use a proper QR library)
    const size = 100;
    const cellSize = 5;
    const group = new fabric.Group([], {
        left: 100,
        top: 100,
        borderColor: '#c9a84c',
        cornerColor: '#c9a84c',
        cornerSize: 8,
        transparentCorners: false
    });

    // Create finder patterns (corners)
    const createFinderPattern = (x, y) => {
        const pattern = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
                const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
                if (isOuter || isInner) {
                    pattern.push(new fabric.Rect({
                        width: cellSize,
                        height: cellSize,
                        fill: '#000000',
                        left: x + i * cellSize,
                        top: y + j * cellSize
                    }));
                }
            }
        }
        return pattern;
    };

    group.addWithUpdate(...createFinderPattern(0, 0));
    group.addWithUpdate(...createFinderPattern(size - 35, 0));
    group.addWithUpdate(...createFinderPattern(0, size - 35));

    // Add data pattern (simplified)
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 10; i < size - 10; i += cellSize) {
        for (let j = 10; j < size - 10; j += cellSize) {
            if ((hash * (i + j)) % 2 === 0) {
                group.addWithUpdate(new fabric.Rect({
                    width: cellSize,
                    height: cellSize,
                    fill: '#000000',
                    left: i,
                    top: j
                }));
            }
        }
    }

    return group;
};

// ============================================
// DOCUMENT TEMPLATES
// ============================================

export const createBlankDocument = (canvas) => {
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();

    // Add default margins
    const margin = new fabric.Rect({
        left: 50,
        top: 50,
        width: canvas.width - 100,
        height: canvas.height - 100,
        fill: 'transparent',
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        isBackground: true
    });

    canvas.add(margin);
    canvas.sendToBack(margin);
    canvas.renderAll();
};

export const createDocumentFromTemplate = (canvas, templateType) => {
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    const templates = {
        'death-certificate': {
            title: 'Death Certificate',
            fields: [
                { label: 'Full Name:', x: 100, y: 150 },
                { label: 'Date of Birth:', x: 100, y: 200 },
                { label: 'Date of Death:', x: 100, y: 250 },
                { label: 'Place of Death:', x: 100, y: 300 },
                { label: 'Cause of Death:', x: 100, y: 350 }
            ]
        },
        'burial-permit': {
            title: 'Burial Permit',
            fields: [
                { label: 'Deceased Name:', x: 100, y: 150 },
                { label: 'Burial Date:', x: 100, y: 200 },
                { label: 'Cemetery:', x: 100, y: 250 },
                { label: 'Permit Number:', x: 100, y: 300 }
            ]
        },
        'invoice': {
            title: 'Invoice',
            fields: [
                { label: 'Invoice #:', x: 100, y: 150 },
                { label: 'Date:', x: 100, y: 200 },
                { label: 'Amount:', x: 100, y: 250 },
                { label: 'Description:', x: 100, y: 300 }
            ]
        },
        'release-form': {
            title: 'Release Form',
            fields: [
                { label: 'Released To:', x: 100, y: 150 },
                { label: 'Relationship:', x: 100, y: 200 },
                { label: 'ID Number:', x: 100, y: 250 },
                { label: 'Release Date:', x: 100, y: 300 }
            ]
        }
    };

    const template = templates[templateType];
    if (!template) return;

    // Add title
    const titleText = new fabric.Text(template.title, {
        left: canvas.width / 2,
        top: 80,
        fontSize: 28,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#000000',
        originX: 'center'
    });
    canvas.add(titleText);

    // Add form fields
    template.fields.forEach(field => {
        const label = new fabric.Text(field.label, {
            left: field.x,
            top: field.y,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: '#374151',
            fontWeight: '600'
        });
        canvas.add(label);

        const line = new fabric.Line(
            [field.x + 150, field.y + 15, field.x + 400, field.y + 15],
            {
                stroke: '#9ca3af',
                strokeWidth: 1
            }
        );
        canvas.add(line);
    });

    canvas.renderAll();
};

// ============================================
// EXPORT UTILITIES
// ============================================

export const exportToPDF = async (canvas, filename) => {
    if (!canvas) return;

    try {
        const dataUrl = canvas.toDataURL({ format: 'png', quality: 1.0 });

        // Create a simple PDF using print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; height: auto; }
            @media print {
              @page { size: A4; margin: 0; }
              img { max-width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
        printWindow.document.close();
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw error;
    }
};

export const exportToPNG = (canvas, filename) => {
    if (!canvas) return;

    try {
        const dataUrl = canvas.toDataURL({ format: 'png', quality: 1.0 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
        a.click();
    } catch (error) {
        console.error('Error exporting to PNG:', error);
        throw error;
    }
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const validateFileType = (file) => {
    return CONFIG.SUPPORTED_FILE_TYPES.includes(file.type);
};

export const validateFileSize = (file) => {
    return file.size <= CONFIG.MAX_FILE_SIZE;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
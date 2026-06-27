// components/PdfJsViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfJsViewer = ({ pdfUrl, invoice, onClose }) => {
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadPdf();
  }, [pdfUrl]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdf && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, scale]);

  const renderPage = async (pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (loading) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content bg-dark text-white">
            <div className="modal-body text-center py-5">
              <i className="fas fa-spinner fa-spin fa-3x mb-3"></i>
              <p>Loading PDF document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content bg-dark border-0">
          {/* Header */}
          <div className="modal-header bg-dark border-secondary">
            <div className="d-flex align-items-center w-100">
              <h5 className="modal-title text-white me-3">
                <i className="fas fa-file-pdf text-danger me-2"></i>
                {invoice?.invoice_number}
              </h5>

              {/* Page Controls */}
              <div className="btn-group me-3">
                <button className="btn btn-outline-light btn-sm" onClick={prevPage} disabled={currentPage <= 1}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="btn btn-outline-light btn-sm disabled">
                  {currentPage} / {totalPages}
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={nextPage} disabled={currentPage >= totalPages}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="btn-group me-3">
                <button className="btn btn-outline-light btn-sm" onClick={zoomOut}>
                  <i className="fas fa-search-minus"></i>
                </button>
                <span className="btn btn-outline-light btn-sm disabled">
                  {Math.round(scale * 100)}%
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={zoomIn}>
                  <i className="fas fa-search-plus"></i>
                </button>
              </div>

              <div className="ms-auto">
                <button className="btn btn-danger btn-sm" onClick={onClose}>
                  <i className="fas fa-times"></i> Close
                </button>
              </div>
            </div>
          </div>

          {/* PDF Content */}
          <div className="modal-body bg-dark d-flex justify-content-center align-items-center p-3">
            <div className="pdf-canvas-container" style={{ overflow: 'auto', maxHeight: '80vh' }}>
              <canvas ref={canvasRef} className="shadow-lg rounded" />
            </div>
          </div>


          {/* Footer */}

          <div className="modal-footer bg-dark border-secondary">
            <small className="text-muted">
              {invoice?.deceased_name} • Total: KES {invoice?.total_amount} •
              Use mouse wheel to zoom • Drag to navigate
            </small>
          </div>


        </div>
      </div>
    </div>
  );
};

export default PdfJsViewer;
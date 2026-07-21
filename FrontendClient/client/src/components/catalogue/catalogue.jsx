import React, { useState, useCallback, useEffect } from 'react';
import {
  Search, Eye, ShoppingCart, X, Star, Box, Package, AlertTriangle,
  CheckCircle, Clock, Share2, Copy, ExternalLink, Grid, List,
  Wallet, Heart
} from '../../utils/icons/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Badge, InputGroup, Form, Modal, Spinner, Alert } from 'react-bootstrap';

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_CATEGORIES = ['All', 'Caskets', 'Coffins', 'Urns', 'Ash Containers', 'Memorial Items'];

const IMGS = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513519245088-0a12902e35ca?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513519245088-0a12902e35ca?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513519245088-0a12902e35ca?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&h=300&fit=crop',
];

const MOCK_COFFINS = [
  { id:'CFN-001', name:'Mahogany Crown', category:'Coffins', price:185000, image:IMGS[0], status:'in_stock', stockCount:12, material:'Solid Mahogany', description:'Premium hand-finished mahogany coffin with velvet interior and brass fittings. High-gloss lacquer finish with hand-carved detailing.', rating:5, isFeatured:true, dateAdded:'2025-01-15' },
  { id:'CFN-002', name:'Oak Heritage', category:'Coffins', price:145000, image:IMGS[1], status:'in_stock', stockCount:8, material:'European Oak', description:'Classic oak coffin with traditional design and satin lining. Natural wood grain visible through clear coat finish.', rating:4, dateAdded:'2025-01-20' },
  { id:'CFN-003', name:'White Steel Vault', category:'Caskets', price:220000, image:IMGS[2], status:'low_stock', stockCount:2, material:'18-gauge Steel', description:'Protective steel casket with gasket seal and white crepe interior. Includes a protective vault with welded seams.', rating:5, isFeatured:true, dateAdded:'2025-02-01' },
  { id:'CFN-004', name:'Willow Natural', category:'Coffins', price:65000, image:IMGS[3], status:'in_stock', stockCount:15, material:'Natural Willow', description:'Eco-friendly woven willow coffin, fully biodegradable. Suitable for green burials and natural burial grounds.', rating:4, dateAdded:'2025-02-10' },
  { id:'URN-001', name:'Brass Legacy Urn', category:'Urns', price:35000, image:IMGS[4], status:'in_stock', stockCount:20, material:'Solid Brass', description:'Handcrafted brass urn with engraving option. Capacity: 200 cubic inches. Threaded secure lid.', rating:5, dateAdded:'2025-02-15' },
  { id:'CFN-005', name:'Pine Simple', category:'Coffins', price:38000, image:IMGS[5], status:'out_of_stock', stockCount:0, material:'Pine Wood', description:'Simple unvarnished pine coffin. Minimalist, affordable, and environmentally conscious.', rating:3, dateAdded:'2025-03-01' },
  { id:'CFN-006', name:'Cherry Blossom', category:'Caskets', price:195000, image:IMGS[6], status:'reserved', stockCount:3, material:'Cherry Wood', description:'Elegant cherry wood casket with rose gold hardware and pink velvet interior. Half-couch design.', rating:5, isFeatured:true, dateAdded:'2025-03-05' },
  { id:'ASH-001', name:'Keepsake Heart Box', category:'Ash Containers', price:12000, image:IMGS[7], status:'in_stock', stockCount:30, material:'Wood Composite', description:'Small heart-shaped keepsake box for sharing ashes among family members. Lined with velvet.', rating:4, dateAdded:'2025-03-10' },
  { id:'MEM-001', name:'Memorial Photo Frame', category:'Memorial Items', price:8500, image:IMGS[8], status:'in_stock', stockCount:25, material:'Brushed Steel', description:'Elegant double-frame memorial display with engraved plaque space. Holds two 5x7 photos.', rating:4, dateAdded:'2025-03-12' },
  { id:'CFN-007', name:'Walnut Executive', category:'Coffins', price:168000, image:IMGS[9], status:'low_stock', stockCount:1, material:'American Walnut', description:'Premium walnut coffin with half-couch design and tailored interior. Rich dark finish.', rating:5, dateAdded:'2025-03-15' },
  { id:'URN-002', name:'Ceramic Artisan Urn', category:'Urns', price:28000, image:IMGS[10], status:'in_stock', stockCount:14, material:'Handmade Ceramic', description:'Unique hand-thrown ceramic urn with glazed finish in ocean blue. Each piece is one-of-a-kind.', rating:4, dateAdded:'2025-03-18' },
  { id:'CFN-008', name:'Poplar Economy', category:'Coffins', price:32000, image:IMGS[11], status:'in_stock', stockCount:18, material:'Poplar Wood', description:'Budget-friendly poplar coffin with basic interior lining. Painted finish available in multiple colors.', rating:3, dateAdded:'2025-03-20' },
];

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const formatPrice = (p) => `KSh ${p.toLocaleString()}`;

const getStatusBadge = (status, count) => {
  const configs = {
    in_stock: { bg: 'success', text: `${count} in Stock` },
    low_stock: { bg: 'warning', text: `Only ${count} Left` },
    out_of_stock: { bg: 'danger', text: 'Out of Stock' },
    reserved: { bg: 'info', text: `${count} Reserved` },
  };
  const config = configs[status] || configs.in_stock;
  return <Badge bg={config.bg}>{config.text}</Badge>;
};

// ═══════════════════════════════════════════════════════════════════════════
//  PRODUCT CARD
// ═══════════════════════════════════════════════════════════════════════════

const ProductCard = ({ item, view, onBuy, onView, isPreview }) => {
  const hasImg = item.image && item.image.length > 0;

  if (view === 'list') {
    return (
      <Card className="mb-3 shadow-sm">
        <Row className="g-0">
          <Col md={3} className="d-none d-md-block">
            <div 
              className="h-100 bg-light d-flex align-items-center justify-content-center"
              style={{ 
                backgroundImage: hasImg ? `url(${item.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '120px'
              }}
            >
              {!hasImg && <Box size={40} className="text-muted" />}
            </div>
          </Col>
          <Col md={9}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <small className="text-muted text-uppercase fw-semibold">{item.category}</small>
                  <Card.Title className="mb-1">{item.name}</Card.Title>
                  <p className="text-muted small mb-2">{item.material}</p>
                  {getStatusBadge(item.status, item.stockCount)}
                </div>
                <div className="text-end ms-3">
                  <h5 className="mb-0 fw-bold">{formatPrice(item.price)}</h5>
                  <small className="text-muted">per unit</small>
                </div>
              </div>
              {!isPreview && (
                <div className="mt-3 d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => onView?.(item)}>
                    <Eye size={13} className="me-1" /> Details
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onBuy?.(item)}
                    disabled={item.status === 'out_of_stock'}
                  >
                    <ShoppingCart size={13} className="me-1" /> Buy Now
                  </Button>
                </div>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    );
  }

  return (
    <Card className="h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: '16px' }}>
      <div className="position-relative" style={{ height: '220px', background: '#f5f2ee' }}>
        {hasImg ? (
          <div 
            className="w-100 h-100"
            style={{ 
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'transform 0.5s ease'
            }}
          />
        ) : (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
            <Box size={48} className="text-muted" />
          </div>
        )}
        <div className="position-absolute top-0 start-0 m-2">
          {getStatusBadge(item.status, item.stockCount)}
        </div>
        {item.isFeatured && (
          <div className="position-absolute top-0 end-0 m-2">
            <Badge bg="warning" style={{ color: '#fff' }}>
              <Star size={9} fill="#fff" className="me-1" /> Featured
            </Badge>
          </div>
        )}
        {!isPreview && (
          <div className="position-absolute bottom-0 start-0 end-0 p-2 d-flex gap-2" style={{ 
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            opacity: 0,
            transition: 'all 0.25s ease'
          }}>
            <Button variant="light" size="sm" className="flex-fill" onClick={() => onView?.(item)}>
              <Eye size={13} className="me-1" /> Quick View
            </Button>
            <Button 
              variant="light" 
              size="sm" 
              className="flex-fill"
              onClick={() => onBuy?.(item)}
              disabled={item.status === 'out_of_stock'}
            >
              <ShoppingCart size={13} className="me-1" /> Add
            </Button>
          </div>
        )}
      </div>
      <Card.Body>
        <small className="text-muted text-uppercase fw-semibold" style={{ color: '#b8941f !important' }}>{item.category}</small>
        <Card.Title className="mb-1">{item.name}</Card.Title>
        <p className="text-muted small mb-2">{item.material}</p>
        {item.rating && (
          <div className="mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                style={{ 
                  color: i < item.rating ? '#d4b44a' : '#e8e4df',
                  fill: i < item.rating ? '#d4b44a' : 'none'
                }} 
              />
            ))}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <div>
            <h5 className="mb-0 fw-bold">{formatPrice(item.price)}</h5>
            <small className="text-muted">per unit</small>
          </div>
          {!isPreview && (
            <Button 
              variant="dark" 
              size="sm"
              onClick={() => onBuy?.(item)}
              disabled={item.status === 'out_of_stock'}
            >
              <ShoppingCart size={13} className="me-1" /> Buy Now
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SHARE MODAL
// ═══════════════════════════════════════════════════════════════════════════

const ShareModal = ({ isOpen, onClose, funeralHomeName }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://memorialcare.co.ke/catalogue/${funeralHomeName.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '20px', border: '1px solid #e8e4df' }}>
          <div className="modal-header border-0 pb-0">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ 
                width: '40px', height: '40px', background: 'rgba(184,148,31,0.06)', border: '1px solid rgba(184,148,31,0.18)', color: '#b8941f' 
              }}>
                <Share2 size={18} />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-semibold">Share Catalogue</h5>
                <small className="text-muted">Send to clients via link</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label small fw-semibold text-uppercase text-muted">Catalogue Link</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control bg-light border" 
                  value={shareUrl} 
                  readOnly 
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
                <Button variant={copied ? 'success' : 'outline-secondary'} onClick={handleCopy}>
                  <Copy size={13} className="me-1" /> {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-uppercase text-muted">Share via</label>
              <div className="row g-2">
                <div className="col-4">
                  <Button variant="outline-success" className="w-100">
                    <ExternalLink size={11} className="me-1" /> WhatsApp
                  </Button>
                </div>
                <div className="col-4">
                  <Button variant="outline-primary" className="w-100">
                    <ExternalLink size={11} className="me-1" /> Email
                  </Button>
                </div>
                <div className="col-4">
                  <Button variant="outline-dark" className="w-100">
                    <ExternalLink size={11} className="me-1" /> SMS
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-3" style={{ background: '#fef9ec', border: '1px solid #f0d88a' }}>
              <div className="d-flex gap-2">
                <AlertTriangle size={15} style={{ color: '#a16207', flexShrink: 0, marginTop: '2px' }} />
                <p className="small text-muted mb-0">
                  This link provides read-only access to your catalogue. Clients can browse items but cannot modify inventory or place orders directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  DETAIL DRAWER
// ═══════════════════════════════════════════════════════════════════════════

const DetailDrawer = ({ item, isOpen, onClose, onBuy, isPreview }) => {
  if (!isOpen || !item) return null;
  const hasImg = item.image && item.image.length > 0;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-end" style={{ maxWidth: '520px' }}>
        <div className="modal-content h-100" style={{ borderRadius: '0', border: 'none', boxShadow: '-5px 0 30px rgba(0,0,0,0.15)' }}>
          <div className="modal-header sticky-top bg-white border-bottom">
            <h5 className="modal-title fw-semibold">Product Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-0 overflow-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
            <div className="position-relative" style={{ height: '280px', background: '#f5f2ee' }}>
              {hasImg ? (
                <div 
                  className="w-100 h-100"
                  style={{ 
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                  <Box size={64} className="text-muted" />
                </div>
              )}
              <div className="position-absolute top-0 start-0 m-3">
                {getStatusBadge(item.status, item.stockCount)}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="d-flex align-items-start gap-2">
                  <h2 className="h4 fw-bold mb-0">{item.name}</h2>
                  {item.isFeatured && <Star size={20} style={{ color: '#b8941f', fill: '#b8941f', flexShrink: 0, marginTop: '4px' }} />}
                </div>
                <p className="text-muted small mt-1 mb-0">{item.category} · {item.material}</p>
              </div>
              
              <div className="p-3 rounded-3 mb-3" style={{ 
                background: 'linear-gradient(135deg, rgba(184,148,31,0.06), rgba(184,148,31,0.03))',
                border: '1px solid rgba(184,148,31,0.18)'
              }}>
                <small className="text-muted text-uppercase fw-semibold d-block mb-1">Price</small>
                <h3 className="fw-bold mb-0">{formatPrice(item.price)}</h3>
                <small className="text-muted">per unit, exclusive of VAT</small>
              </div>

              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div className="p-2 rounded-2 bg-light border">
                    <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '10px' }}>Material</small>
                    <p className="small fw-medium mb-0 mt-1">{item.material}</p>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-2 rounded-2 bg-light border">
                    <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '10px' }}>Category</small>
                    <p className="small fw-medium mb-0 mt-1">{item.category}</p>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-2 rounded-2 bg-light border">
                    <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '10px' }}>Stock</small>
                    <p className="small fw-medium mb-0 mt-1">{item.stockCount} units</p>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-2 rounded-2 bg-light border">
                    <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '10px' }}>Added</small>
                    <p className="small fw-medium mb-0 mt-1">
                      {new Date(item.dateAdded).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </Col>
              </Row>

              {item.rating && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} style={{ color: i < item.rating ? '#d4b44a' : '#e8e4df', fill: i < item.rating ? '#d4b44a' : 'none' }} />
                    ))}
                  </div>
                  <span className="text-muted small">{item.rating}.0 rating</span>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-block text-uppercase fw-semibold mb-2" style={{ fontSize: '11px' }}>Description</small>
                <p className="text-muted small mb-0" style={{ lineHeight: '1.7' }}>{item.description}</p>
              </div>

              {!isPreview && (
                <div className="d-flex gap-2 pt-2">
                  <Button variant="dark" className="flex-fill" onClick={() => onBuy?.(item)} disabled={item.status === 'out_of_stock'}>
                    <ShoppingCart size={16} className="me-2" /> Buy Now
                  </Button>
                  <Button variant="outline-secondary">
                    <Heart size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN CATALOGUE
// ═══════════════════════════════════════════════════════════════════════════

export const FuneralCatalogue = ({
  funeralHomeName = 'Memorial Care Funeral Home',
  items = MOCK_COFFINS,
  isPreview = false,
  onAddToBooking,
  onViewDetails,
}) => {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [shareOpen, setShareOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetActive, setBudgetActive] = useState(false);

  const budgetNum = budgetInput ? parseInt(budgetInput.replace(/[^0-9]/g, ''), 10) || 0 : 0;

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.material.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchBudget = !budgetActive || item.price <= budgetNum;
    return matchSearch && matchCat && matchBudget;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'newest': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      default: return 0;
    }
  });

  const applyBudget = () => {
    if (budgetInput && budgetNum > 0) setBudgetActive(true);
  };

  const clearBudget = () => {
    setBudgetInput('');
    setBudgetActive(false);
  };

  return (
    <div className="min-vh-100" style={{ background: '#faf9f7' }}>
      {/* Hero Banner */}
      <div 
        className="position-relative w-100 overflow-hidden"
        style={{ 
          height: '320px',
          backgroundImage: "url('/coffin.bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="position-relative h-100 d-flex flex-column justify-content-end" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px 40px', width: '100%' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="small" style={{ color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>Home</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>›</span>
            <span className="small" style={{ color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>Shop</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>›</span>
            <span className="small fw-medium" style={{ color: '#d4b44a' }}>Catalogue</span>
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '38px', color: '#fff', letterSpacing: '-0.03em', lineHeight: '1.15' }}>Our Collection</h1>
          <p className="mb-0" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', maxWidth: '520px', lineHeight: '1.5' }}>
            Browse our curated selection of premium caskets, coffins, urns, and memorial items. Every piece crafted with dignity and care.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '0 32px 60px', position: 'relative', zIndex: 5 }}>
        {/* Budget Bar */}
        <Card className="shadow-sm mb-4" style={{ borderRadius: '16px', border: '1px solid #e8e4df' }}>
          <Card.Body className="p-3">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ 
                  width: '36px', height: '36px', background: 'rgba(184,148,31,0.06)', border: '1px solid rgba(184,148,31,0.18)', color: '#b8941f' 
                }}>
                  <Wallet size={16} />
                </div>
                <span className="fw-semibold small">What's your budget?</span>
              </div>
              <div className="flex-grow-1" style={{ minWidth: '240px', maxWidth: '400px' }}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border fw-semibold small">KSh</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter amount e.g. 100000"
                    value={budgetInput}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setBudgetInput(val ? parseInt(val).toLocaleString() : '');
                      if (!val) setBudgetActive(false);
                    }}
                    onKeyDown={e => e.key === 'Enter' && applyBudget()}
                    className="bg-light border"
                    style={{ fontSize: '15px', fontWeight: '600' }}
                  />
                  <InputGroup.Text className="bg-light border small text-muted">max</InputGroup.Text>
                </InputGroup>
              </div>
              <Button variant="dark" onClick={applyBudget}>
                <Search size={13} className="me-1" /> Find Coffins
              </Button>
              {budgetActive && (
                <Button variant="outline-secondary" size="sm" onClick={clearBudget}>Clear</Button>
              )}
              {budgetActive && (
                <div className="ms-auto d-flex align-items-center gap-2">
                  <span className="fw-bold" style={{ fontSize: '24px', color: '#b8941f' }}>{filtered.length}</span>
                  <span className="small text-muted">coffins within KSh {budgetNum.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Toolbar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div className="d-flex flex-wrap gap-2">
            {MOCK_CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'dark' : 'outline-secondary'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                style={{ borderRadius: '100px', fontSize: '13px' }}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Showing {filtered.length} of {items.length} results</span>
            <Form.Select 
              size="sm" 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              style={{ width: 'auto', borderRadius: '10px' }}
            >
              <option value="newest">Sort by latest</option>
              <option value="name">Name A-Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Form.Select>
            <div className="btn-group" role="group">
              <Button 
                variant={view === 'grid' ? 'dark' : 'outline-secondary'} 
                size="sm"
                onClick={() => setView('grid')}
                style={{ borderRadius: '8px' }}
              >
                <Grid size={14} />
              </Button>
              <Button 
                variant={view === 'list' ? 'dark' : 'outline-secondary'} 
                size="sm"
                onClick={() => setView('list')}
                style={{ borderRadius: '8px' }}
              >
                <List size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="position-relative mb-4" style={{ maxWidth: '400px' }}>
          <div className="position-absolute top-50 start-0 translate-middle-y ps-3" style={{ color: '#9e9890' }}>
            <Search size={16} />
          </div>
          <Form.Control
            type="text"
            placeholder="Search by name or material..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-5 pe-5"
            style={{ borderRadius: '10px', border: '1px solid #e8e4df', background: '#fff' }}
          />
          {search && (
            <button 
              className="position-absolute top-50 end-0 translate-middle-y pe-3 border-0 bg-transparent"
              style={{ color: '#9e9890', cursor: 'pointer' }}
              onClick={() => setSearch('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-5">
            <div className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ 
              width: '72px', height: '72px', background: '#faf9f7', border: '1px solid #e8e4df', color: '#9e9890' 
            }}>
              <Package size={32} />
            </div>
            <h3 className="fw-semibold mb-2">No products found</h3>
            <p className="text-muted small mb-3" style={{ maxWidth: '340px', margin: '6px auto 20px' }}>
              {budgetActive
                ? `No coffins found within KSh ${budgetNum.toLocaleString()}. Try increasing your budget or clearing the filter.`
                : "Try adjusting your search or filter criteria to find what you're looking for."}
            </p>
            <Button 
              variant="outline-secondary"
              onClick={() => { setSearch(''); setActiveCategory('All'); clearBudget(); }}
            >
              Clear all filters
            </Button>
          </div>
        ) : view === 'grid' ? (
          <Row className="g-4">
            {filtered.map((item, i) => (
              <Col key={item.id} xs={12} md={6} lg={4}>
                <ProductCard
                  item={item}
                  view="grid"
                  onBuy={onAddToBooking}
                  onView={setDetailItem}
                  isPreview={isPreview}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map((item, i) => (
              <ProductCard
                key={item.id}
                item={item}
                view="list"
                onBuy={onAddToBooking}
                onView={setDetailItem}
                isPreview={isPreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} funeralHomeName={funeralHomeName} />
      <DetailDrawer item={detailItem} isOpen={!!detailItem} onClose={() => setDetailItem(null)} onBuy={onAddToBooking} isPreview={isPreview} />
    </div>
  );
};

export const CatalogueDemo = () => {
  return (
    <FuneralCatalogue
      funeralHomeName="Memorial Care Funeral Home"
      onAddToBooking={(item) => console.log('Buy:', item.name)}
      onViewDetails={(item) => console.log('View:', item.name)}
    />
  );
};

export default FuneralCatalogue;
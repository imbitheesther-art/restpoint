import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Filter, Grid, List, Share2, Eye, ShoppingCart, X, ChevronDown,
  Package, AlertTriangle, CheckCircle, Clock, Plus, MoreVertical,
  SlidersHorizontal, Copy, ExternalLink, Star, Heart, Box, Layers, Tag
} from '../../utils/icons/icons';

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_CATEGORIES = [
  'All', 'Caskets', 'Coffins', 'Urns', 'Ash Containers', 'Memorial Items'
];

const MOCK_COFFINS = [
  {
    id: 'CFN-001', name: 'Mahogany Crown', category: 'Coffins', price: 185000,
    image: '', status: 'in_stock', stockCount: 12, material: 'Solid Mahogany',
    description: 'Premium hand-finished mahogany coffin with velvet interior and brass fittings.',
    rating: 5, isFeatured: true, dateAdded: '2025-01-15'
  },
  {
    id: 'CFN-002', name: 'Oak Heritage', category: 'Coffins', price: 145000,
    image: '', status: 'in_stock', stockCount: 8, material: 'European Oak',
    description: 'Classic oak coffin with traditional design and satin lining.',
    rating: 4, dateAdded: '2025-01-20'
  },
  {
    id: 'CFN-003', name: 'White Steel Vault', category: 'Caskets', price: 220000,
    image: '', status: 'low_stock', stockCount: 2, material: '18-gauge Steel',
    description: 'Protective steel casket with gasket seal and white crepe interior.',
    rating: 5, isFeatured: true, dateAdded: '2025-02-01'
  },
  {
    id: 'CFN-004', name: 'Willow Natural', category: 'Coffins', price: 65000,
    image: '', status: 'in_stock', stockCount: 15, material: 'Natural Willow',
    description: 'Eco-friendly woven willow coffin, biodegradable, suitable for green burials.',
    rating: 4, dateAdded: '2025-02-10'
  },
  {
    id: 'URN-001', name: 'Brass Legacy Urn', category: 'Urns', price: 35000,
    image: '', status: 'in_stock', stockCount: 20, material: 'Solid Brass',
    description: 'Handcrafted brass urn with engraving option. Capacity: 200 cubic inches.',
    rating: 5, dateAdded: '2025-02-15'
  },
  {
    id: 'CFN-005', name: 'Pine Simple', category: 'Coffins', price: 38000,
    image: '', status: 'out_of_stock', stockCount: 0, material: 'Pine Wood',
    description: 'Simple unvarnished pine coffin. Minimalist and affordable.',
    rating: 3, dateAdded: '2025-03-01'
  },
  {
    id: 'CFN-006', name: 'Cherry Blossom', category: 'Caskets', price: 195000,
    image: '', status: 'reserved', stockCount: 3, material: 'Cherry Wood',
    description: 'Elegant cherry wood casket with rose gold hardware and pink velvet interior.',
    rating: 5, isFeatured: true, dateAdded: '2025-03-05'
  },
  {
    id: 'ASH-001', name: 'Keepsake Heart Box', category: 'Ash Containers', price: 12000,
    image: '', status: 'in_stock', stockCount: 30, material: 'Wood Composite',
    description: 'Small heart-shaped keepsake box for sharing ashes among family members.',
    rating: 4, dateAdded: '2025-03-10'
  },
  {
    id: 'MEM-001', name: 'Memorial Photo Frame', category: 'Memorial Items', price: 8500,
    image: '', status: 'in_stock', stockCount: 25, material: 'Brushed Steel',
    description: 'Elegant double-frame memorial display with engraved plaque space.',
    rating: 4, dateAdded: '2025-03-12'
  },
  {
    id: 'CFN-007', name: 'Walnut Executive', category: 'Coffins', price: 168000,
    image: '', status: 'low_stock', stockCount: 1, material: 'American Walnut',
    description: 'Premium walnut coffin with half-couch design and tailored interior.',
    rating: 5, dateAdded: '2025-03-15'
  },
  {
    id: 'URN-002', name: 'Ceramic Artisan Urn', category: 'Urns', price: 28000,
    image: '', status: 'in_stock', stockCount: 14, material: 'Handmade Ceramic',
    description: 'Unique hand-thrown ceramic urn with glazed finish in ocean blue.',
    rating: 4, dateAdded: '2025-03-18'
  },
  {
    id: 'CFN-008', name: 'Poplar Economy', category: 'Coffins', price: 32000,
    image: '', status: 'in_stock', stockCount: 18, material: 'Poplar Wood',
    description: 'Budget-friendly poplar coffin with basic interior lining.',
    rating: 3, dateAdded: '2025-03-20'
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════

const StatusBadge = ({ status, count }) => {
  const config = {
    in_stock: { label: `${count} in Stock`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    low_stock: { label: `Only ${count} Left`, cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle size={12} /> },
    out_of_stock: { label: 'Out of Stock', cls: 'bg-red-50 text-red-700 border-red-200', icon: <X size={12} /> },
    reserved: { label: `${count} Reserved`, cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock size={12} /> },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  COFFIN CARD (Catalogue Item)
// ═══════════════════════════════════════════════════════════════════════════

const CoffinCard = ({ item, view, onAdd, onView, isPreview }) => {
  const [liked, setLiked] = useState(false);
  const formatPrice = (p) => `KES ${p.toLocaleString()}`;

  if (view === 'list') {
    return (
      <div className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
          <Box size={32} className="text-gray-400" />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
            {item.isFeatured && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-600">{item.material}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-600">{item.category}</span>
          </div>
        </div>
        {/* Status */}
        <StatusBadge status={item.status} count={item.stockCount} />
        {/* Price */}
        <div className="text-right shrink-0 w-32">
          <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
          <p className="text-xs text-gray-500">per unit</p>
        </div>
        {/* Actions */}
        {!isPreview && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onView?.(item)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="View details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onAdd?.(item)}
              disabled={item.status === 'out_of_stock'}
              className="p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Add to booking"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-200">
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Box size={48} className="text-gray-300 group-hover:text-gray-400 transition-colors duration-300" />
        </div>
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <StatusBadge status={item.status} count={item.stockCount} />
        </div>
        {item.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Star size={10} className="fill-amber-500" /> Featured
            </span>
          </div>
        )}
        {/* Hover overlay */}
        {!isPreview && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onView?.(item)}
              className="p-2 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white transition-colors shadow-md"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onAdd?.(item)}
              disabled={item.status === 'out_of_stock'}
              className="p-2 rounded-lg bg-emerald-50 backdrop-blur-sm border border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-md"
              title="Add to booking"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
            <p className="text-xs text-gray-600 mt-1">{item.material} · {item.category}</p>
          </div>
          {!isPreview && (
            <button
              onClick={() => setLiked(!liked)}
              className="p-1 rounded-md text-gray-400 hover:text-red-600 transition-colors shrink-0 mt-0.5"
            >
              <Heart size={14} className={liked ? 'fill-red-600 text-red-600' : ''} />
            </button>
          )}
        </div>
        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-0.5 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < (item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
              />
            ))}
          </div>
        )}
        {/* Price + Action */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-base font-bold text-gray-900">{formatPrice(item.price)}</p>
          </div>
          {!isPreview && (
            <button
              onClick={() => onAdd?.(item)}
              disabled={item.status === 'out_of_stock'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700
                border border-gray-200 hover:border-emerald-200
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:text-gray-700
                transition-all duration-150"
            >
              <Plus size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SHARE MODAL
// ═══════════════════════════════════════════════════════════════════════════

const ShareModal = ({ isOpen, onClose, funeralHomeName }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://memorialcare.co.ke/catalogue/${funeralHomeName.toLowerCase().replace(/\s+/g, '-')}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Share2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Share Catalogue</h3>
              <p className="text-xs text-gray-600">Send to clients via link</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-5">
          {/* URL Input */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 block">Catalogue Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 truncate font-mono">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 shrink-0 ${copied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          {/* Share Options */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-3 block">Share via</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                { label: 'Email', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                { label: 'SMS', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
              ].map(opt => (
                <button
                  key={opt.label}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${opt.color}`}
                >
                  <ExternalLink size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Info */}
          <div className="flex items-start gap-2.5 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700 leading-relaxed">
              This link provides read-only access to your catalogue. Clients can browse items but cannot modify inventory or place orders directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  DETAIL DRAWER
// ═══════════════════════════════════════════════════════════════════════════

const DetailDrawer = ({ item, isOpen, onClose, onAdd, isPreview }) => {
  if (!isOpen || !item) return null;

  const formatPrice = (p) => `KES ${p.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white border-l border-gray-200 shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Item Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        {/* Image */}
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <Box size={64} className="text-gray-300" />
          <div className="absolute top-24 left-6">
            <StatusBadge status={item.status} count={item.stockCount} />
          </div>
        </div>
        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              {item.isFeatured && <Star size={16} className="text-amber-500 fill-amber-500" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.category} · {item.material}</p>
          </div>

          {/* Price */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Price</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(item.price)}</p>
            <p className="text-xs text-gray-600 mt-1">per unit, exclusive of VAT</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Material', value: item.material },
              { label: 'Category', value: item.category },
              { label: 'Stock', value: `${item.stockCount} units` },
              { label: 'Added', value: new Date(item.dateAdded).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].map(d => (
              <div key={d.label} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase tracking-wider">{d.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Rating */}
          {item.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < (item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{item.rating}.0 rating</span>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
          </div>

          {/* Actions */}
          {!isPreview && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onAdd?.(item)}
                disabled={item.status === 'out_of_stock'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400
                  transition-colors duration-150 shadow-sm hover:shadow-md"
              >
                <ShoppingCart size={16} />
                Add to Booking
              </button>
              <button className="px-4 py-3 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors">
                <Heart size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN: FUNERAL CATALOGUE
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
  const [showFilters, setShowFilters] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter logic
  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.material.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchCategory && matchPrice && matchStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'newest': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      default: return 0;
    }
  });

  // Stats
  const totalItems = items.length;
  const inStock = items.filter(i => i.status === 'in_stock').length;
  const lowStock = items.filter(i => i.status === 'low_stock').length;
  const outOfStock = items.filter(i => i.status === 'out_of_stock').length;
  const totalValue = items.reduce((sum, i) => sum + i.price * i.stockCount, 0);

  return (
    <div className={`h-full flex flex-col bg-white ${isPreview ? '' : 'rounded-xl border border-gray-200'}`}>
      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <Layers size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">Product Catalogue</h2>
                <p className="text-sm text-gray-600 truncate">{funeralHomeName}</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          {!isPreview && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                  bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <Share2 size={14} /> Share
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={14} /> Add Item
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4">
          {[
            { label: 'Total Items', value: totalItems, color: 'text-gray-900' },
            { label: 'In Stock', value: inStock, color: 'text-emerald-600' },
            { label: 'Low Stock', value: lowStock, color: 'text-amber-600' },
            { label: 'Out of Stock', value: outOfStock, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`text-base font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-600">{s.label}</span>
            </div>
          ))}
          <div className="ml-auto text-right">
            <span className="text-xs text-gray-600">Inventory Value </span>
            <span className="text-sm font-bold text-gray-900 ml-1">KES {totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white border border-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-white'}`}
            title="Filters"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-200">
            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Price:</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-24 px-2 py-1 rounded bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-400"
                placeholder="Min"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-24 px-2 py-1 rounded bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-400"
                placeholder="Max"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none px-2.5 py-1 rounded bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
            <button
              onClick={() => { setPriceRange([0, 500000]); setStatusFilter('all'); }}
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ─── Content Area ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No products found</h3>
            <p className="text-sm text-gray-600 mt-1 max-w-xs">Try adjusting your search or filter criteria to find what you're looking for.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); setStatusFilter('all'); setPriceRange([0, 500000]); }}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <CoffinCard
                key={item.id}
                item={item}
                view="grid"
                onAdd={onAddToBooking}
                onView={setDetailItem}
                isPreview={isPreview}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <CoffinCard
                key={item.id}
                item={item}
                view="list"
                onAdd={onAddToBooking}
                onView={setDetailItem}
                isPreview={isPreview}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {filtered.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Showing {filtered.length} of {totalItems} products
            </p>
          </div>
        )}
      </div>

      {/* ─── Modals ─────────────────────────────────────────────────── */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        funeralHomeName={funeralHomeName}
      />
      <DetailDrawer
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        onAdd={onAddToBooking}
        isPreview={isPreview}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO: How to use ResizableCard with different content
// ═══════════════════════════════════════════════════════════════════════════

export const CatalogueDemo = () => {
  const [chartSize, setChartSize] = useState({ w: 0, h: 0 });
  const [bookingSize, setBookingSize] = useState({ w: 0, h: 0 });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Demo Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Resizable Card + Catalogue Demo</h1>
        <p className="text-sm text-gray-600 mt-1">
          Drag the bottom-right corner of each card to resize in real time.
        </p>
      </div>

      {/* Row 1: Small resizable cards for charts/bookings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Example: Chart Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue Overview</h3>
          <div className="h-full flex items-end gap-1.5 px-2 pb-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                style={{ height: `${h}%`, minHeight: 4 }}
              />
            ))}
          </div>
        </div>

        {/* Example: Bookings Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Bookings</h3>
          <div className="space-y-2">
            {[
              { name: 'John Doe', service: 'Cremation', time: '10:30 AM', status: 'Confirmed' },
              { name: 'Jane Smith', service: 'Burial', time: '2:00 PM', status: 'Pending' },
              { name: 'Alex Mwangi', service: 'Viewing', time: '4:00 PM', status: 'Confirmed' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {b.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                  <p className="text-xs text-gray-600">{b.service} · {b.time}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${b.status === 'Confirmed'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
                  }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Example: Quick Stats Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Coffin Inventory</h3>
          <div className="space-y-3">
            {[
              { name: 'Mahogany Crown', stock: 12, max: 20, status: 'ok' },
              { name: 'White Steel Vault', stock: 2, max: 10, status: 'low' },
              { name: 'Pine Simple', stock: 0, max: 15, status: 'out' },
              { name: 'Walnut Executive', stock: 1, max: 8, status: 'low' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 truncate">{item.name}</span>
                  <span className={`text-xs font-medium ${item.status === 'ok' ? 'text-emerald-600' : item.status === 'low' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                    {item.stock}/{item.max}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.status === 'ok' ? 'bg-emerald-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${(item.stock / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Full Catalogue */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <FuneralCatalogue
            funeralHomeName="Memorial Care Funeral Home"
            onAddToBooking={(item) => console.log('Add to booking:', item.name)}
            onViewDetails={(item) => console.log('View details:', item.name)}
          />
        </div>
      </div>
    </div>
  );
};

export default FuneralCatalogue;
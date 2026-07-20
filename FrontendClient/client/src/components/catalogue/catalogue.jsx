import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Filter, Grid, List, Share2, Eye, ShoppingCart, X, ChevronDown,
  Package, AlertTriangle, CheckCircle, Clock, Plus, MoreVertical,
  SlidersHorizontal, Copy, ExternalLink, Star, Heart, Box, Layers, Tag
} from './Icons';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ResizableCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  initialWidth?: number;
  initialHeight?: number;
  resizable?: boolean;
  onResize?: (w: number, h: number) => void;
  accent?: 'red' | 'blue' | 'green' | 'amber' | 'purple' | 'default';
  noPadding?: boolean;
}

interface CoffinItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved';
  stockCount: number;
  material: string;
  description: string;
  rating?: number;
  isFeatured?: boolean;
  dateAdded: string;
}

interface CatalogueProps {
  funeralHomeName?: string;
  items?: CoffinItem[];
  isPreview?: boolean;
  onAddToBooking?: (item: CoffinItem) => void;
  onViewDetails?: (item: CoffinItem) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_CATEGORIES = [
  'All', 'Caskets', 'Coffins', 'Urns', 'Ash Containers', 'Memorial Items'
];

const MOCK_COFFINS: CoffinItem[] = [
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
//  RESIZABLE CARD
// ═══════════════════════════════════════════════════════════════════════════

export const ResizableCard: React.FC<ResizableCardProps> = ({
  title, subtitle, children, className = '', headerRight, footer,
  minWidth = 280, minHeight = 180, maxWidth = 1200, maxHeight = 900,
  initialWidth, initialHeight, resizable = true,
  onResize, accent = 'default', noPadding = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ w: initialWidth || 0, h: initialHeight || 0 });
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const accentColors = {
    red: { border: 'border-l-red-500', dot: 'bg-red-500', glow: 'shadow-red-500/5' },
    blue: { border: 'border-l-blue-500', dot: 'bg-blue-500', glow: 'shadow-blue-500/5' },
    green: { border: 'border-l-emerald-500', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/5' },
    amber: { border: 'border-l-amber-500', dot: 'bg-amber-500', glow: 'shadow-amber-500/5' },
    purple: { border: 'border-l-purple-500', dot: 'bg-purple-500', glow: 'shadow-purple-500/5' },
    default: { border: 'border-l-transparent', dot: 'bg-transparent', glow: '' },
  };

  const ac = accentColors[accent];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable || !cardRef.current) return;
    e.preventDefault();
    const rect = cardRef.current.getBoundingClientRect();
    startPos.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    setIsResizing(true);
  }, [resizable]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const newW = Math.min(maxWidth, Math.max(minWidth, startPos.current.w + dx));
      const newH = Math.min(maxHeight, Math.max(minHeight, startPos.current.h + dy));
      setSize({ w: newW, h: newH });
      onResize?.(newW, newH);
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, minHeight, maxWidth, maxHeight, onResize]);

  const style: React.CSSProperties = size.w > 0 ? {
    width: size.w,
    height: size.h,
    minHeight: minHeight,
  } : { minHeight };

  return (
    <div
      ref={cardRef}
      className={`
        relative bg-[#0C1222] border border-[#1E293B] rounded-xl overflow-hidden
        transition-shadow duration-200 ${ac.glow}
        ${isResizing ? 'shadow-2xl shadow-black/40 z-50 ring-1 ring-white/10' : 'shadow-lg shadow-black/20'}
        ${className}
      `}
      style={style}
    >
      {/* Accent left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${ac.border.replace('border-l-', 'bg-')} opacity-0 ${ac.dot !== 'bg-transparent' ? '!opacity-100' : ''}`} />

      {/* Header */}
      {(title || headerRight) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 min-w-0">
            {accent !== 'default' && (
              <span className={`w-2 h-2 rounded-full ${ac.dot} shrink-0`} />
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-[13px] font-semibold text-[#E2E8F0] truncate leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-[#64748B] truncate leading-tight mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerRight && (
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {headerRight}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`${noPadding ? '' : 'p-4'} ${!title && !headerRight ? '' : ''} overflow-auto`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-2.5 border-t border-[#1E293B] bg-[#080E1A]">
          {footer}
        </div>
      )}

      {/* Resize Handle */}
      {resizable && (
        <div
          onMouseDown={handleMouseDown}
          className={`
            absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10
            group
          `}
        >
          <svg
            width="20" height="20" viewBox="0 0 20 20"
            className={`absolute bottom-0.5 right-0.5 transition-opacity duration-150
              ${isResizing ? 'opacity-100' : 'opacity-30 group-hover:opacity-70'}`}
          >
            <line x1="14" y1="14" x2="19" y2="19" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="10" x2="19" y2="15" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="14" x2="15" y2="19" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="14" y1="6" x2="19" y2="11" stroke="#475569" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="6" y1="14" x2="11" y2="19" stroke="#475569" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════

const StatusBadge: React.FC<{ status: CoffinItem['status']; count: number }> = ({ status, count }) => {
  const config = {
    in_stock: { label: `${count} in Stock`, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle size={12} /> },
    low_stock: { label: `Only ${count} Left`, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <AlertTriangle size={12} /> },
    out_of_stock: { label: 'Out of Stock', cls: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <X size={12} /> },
    reserved: { label: `${count} Reserved`, cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Clock size={12} /> },
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

const CoffinCard: React.FC<{
  item: CoffinItem;
  view: 'grid' | 'list';
  onAdd?: (item: CoffinItem) => void;
  onView?: (item: CoffinItem) => void;
  isPreview?: boolean;
}> = ({ item, view, onAdd, onView, isPreview }) => {
  const [liked, setLiked] = useState(false);
  const formatPrice = (p: number) => `KES ${p.toLocaleString()}`;

  if (view === 'list') {
    return (
      <div className="group flex items-center gap-4 p-3 rounded-lg border border-[#1E293B] bg-[#0C1222] hover:border-[#334155] hover:bg-[#111827] transition-all duration-150">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg bg-[#1E293B] shrink-0 overflow-hidden flex items-center justify-center">
          <Box size={24} className="text-[#475569]" />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-semibold text-[#E2E8F0] truncate">{item.name}</h4>
            {item.isFeatured && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-[#64748B]">{item.material}</span>
            <span className="text-[11px] text-[#475569]">·</span>
            <span className="text-[11px] text-[#64748B]">{item.category}</span>
          </div>
        </div>
        {/* Status */}
        <StatusBadge status={item.status} count={item.stockCount} />
        {/* Price */}
        <div className="text-right shrink-0 w-28">
          <p className="text-[13px] font-bold text-[#E2E8F0]">{formatPrice(item.price)}</p>
          <p className="text-[10px] text-[#64748B]">per unit</p>
        </div>
        {/* Actions */}
        {!isPreview && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onView?.(item)}
              className="p-1.5 rounded-md text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
              title="View details"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => onAdd?.(item)}
              disabled={item.status === 'out_of_stock'}
              className="p-1.5 rounded-md text-[#64748B] hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Add to booking"
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="group rounded-xl border border-[#1E293B] bg-[#0C1222] overflow-hidden hover:border-[#334155] transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
      {/* Image area */}
      <div className="relative h-40 bg-[#111827] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Box size={40} className="text-[#1E293B] group-hover:text-[#334155] transition-colors duration-300" />
        </div>
        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <StatusBadge status={item.status} count={item.stockCount} />
        </div>
        {item.isFeatured && (
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Star size={10} className="fill-amber-400" /> Featured
            </span>
          </div>
        )}
        {/* Hover overlay */}
        {!isPreview && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onView?.(item)}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onAdd?.(item)}
              disabled={item.status === 'out_of_stock'}
              className="p-2 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Add to booking"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-[#E2E8F0] truncate">{item.name}</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">{item.material} · {item.category}</p>
          </div>
          {!isPreview && (
            <button
              onClick={() => setLiked(!liked)}
              className="p-1 rounded-md text-[#475569] hover:text-red-400 transition-colors shrink-0 mt-0.5"
            >
              <Heart size={14} className={liked ? 'fill-red-400 text-red-400' : ''} />
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
                className={i < (item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-[#1E293B]'}
              />
            ))}
          </div>
        )}
        {/* Price + Action */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1E293B]">
          <div>
            <p className="text-[15px] font-bold text-[#E2E8F0]">{formatPrice(item.price)}</p>
          </div>
          {!isPreview && (
            <button
              onClick={() => onAdd?.(item)}
              disabled={item.status === 'out_of_stock'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                bg-[#1E293B] text-[#94A3B8] hover:bg-emerald-500/15 hover:text-emerald-400
                border border-transparent hover:border-emerald-500/20
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1E293B] disabled:hover:text-[#94A3B8]
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

const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  funeralHomeName: string;
}> = ({ isOpen, onClose, funeralHomeName }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://memorialcare.co.ke/catalogue/${funeralHomeName.toLowerCase().replace(/\s+/g, '-')}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Share2 size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Share Catalogue</h3>
              <p className="text-[11px] text-[#64748B]">Send to clients via link</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 space-y-4">
          {/* URL Input */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5 block">Catalogue Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[12px] text-[#94A3B8] truncate font-mono">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-150 shrink-0 ${
                  copied
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] border border-[#334155]'
                }`}
              >
                <Copy size={13} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          {/* Share Options */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-2 block">Share via</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'WhatsApp', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
                { label: 'Email', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
                { label: 'SMS', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' },
              ].map(opt => (
                <button
                  key={opt.label}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-medium border transition-colors ${opt.color}`}
                >
                  <ExternalLink size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Info */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1E293B]/50 border border-[#1E293B]">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
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

const DetailDrawer: React.FC<{
  item: CoffinItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (item: CoffinItem) => void;
  isPreview?: boolean;
}> = ({ item, isOpen, onClose, onAdd, isPreview }) => {
  if (!isOpen || !item) return null;

  const formatPrice = (p: number) => `KES ${p.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0F172A] border-l border-[#1E293B] shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#0F172A]/90 backdrop-blur-sm border-b border-[#1E293B]">
          <h3 className="text-sm font-semibold text-[#E2E8F0]">Item Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* Image */}
        <div className="h-56 bg-[#111827] flex items-center justify-center">
          <Box size={56} className="text-[#1E293B]" />
          <div className="absolute top-20 left-5">
            <StatusBadge status={item.status} count={item.stockCount} />
          </div>
        </div>
        {/* Content */}
        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{item.name}</h2>
              {item.isFeatured && <Star size={14} className="text-amber-400 fill-amber-400" />}
            </div>
            <p className="text-[13px] text-[#64748B] mt-1">{item.category} · {item.material}</p>
          </div>

          {/* Price */}
          <div className="p-4 rounded-xl bg-[#1E293B]/50 border border-[#1E293B]">
            <p className="text-[11px] text-[#64748B] uppercase tracking-wider mb-1">Price</p>
            <p className="text-2xl font-bold text-white">{formatPrice(item.price)}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">per unit, exclusive of VAT</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Material', value: item.material },
              { label: 'Category', value: item.category },
              { label: 'Stock', value: `${item.stockCount} units` },
              { label: 'Added', value: new Date(item.dateAdded).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].map(d => (
              <div key={d.label} className="p-3 rounded-lg bg-[#0C1222] border border-[#1E293B]">
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider">{d.label}</p>
                <p className="text-[13px] font-medium text-[#E2E8F0] mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Rating */}
          {item.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < (item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-[#1E293B]'} />
                ))}
              </div>
              <span className="text-[12px] text-[#64748B]">{item.rating}.0 rating</span>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-[11px] text-[#64748B] uppercase tracking-wider mb-1.5">Description</p>
            <p className="text-[13px] text-[#94A3B8] leading-relaxed">{item.description}</p>
          </div>

          {/* Actions */}
          {!isPreview && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onAdd?.(item)}
                disabled={item.status === 'out_of_stock'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold
                  bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-[#1E293B] disabled:text-[#475569]
                  transition-colors duration-150"
              >
                <ShoppingCart size={15} />
                Add to Booking
              </button>
              <button className="px-4 py-3 rounded-xl text-[13px] font-medium bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] border border-[#334155] transition-colors">
                <Heart size={15} />
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

export const FuneralCatalogue: React.FC<CatalogueProps> = ({
  funeralHomeName = 'Memorial Care Funeral Home',
  items = MOCK_COFFINS,
  isPreview = false,
  onAddToBooking,
  onViewDetails,
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'newest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<CoffinItem | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    <div className={`h-full flex flex-col bg-[#080E1A] ${isPreview ? '' : 'rounded-xl border border-[#1E293B]'}`}>
      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-4 border-b border-[#1E293B] bg-[#0C1222]">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Layers size={16} className="text-red-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-white truncate">Product Catalogue</h2>
                <p className="text-[11px] text-[#64748B] truncate">{funeralHomeName}</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          {!isPreview && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium
                  bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] border border-[#334155] transition-colors"
              >
                <Share2 size={13} /> Share
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold
                bg-red-500 text-white hover:bg-red-600 transition-colors">
                <Plus size={13} /> Add Item
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-3.5">
          {[
            { label: 'Total Items', value: totalItems, color: 'text-white' },
            { label: 'In Stock', value: inStock, color: 'text-emerald-400' },
            { label: 'Low Stock', value: lowStock, color: 'text-amber-400' },
            { label: 'Out of Stock', value: outOfStock, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`text-[14px] font-bold ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-[#64748B]">{s.label}</span>
            </div>
          ))}
          <div className="ml-auto text-right">
            <span className="text-[10px] text-[#64748B]">Inventory Value </span>
            <span className="text-[13px] font-bold text-white ml-1">KES {totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-3 border-b border-[#1E293B] bg-[#0A0F1C]">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-[12px] text-white placeholder-[#475569] focus:outline-none focus:border-[#475569] focus:ring-1 focus:ring-[#475569]/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B]/50 border border-transparent'
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
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-[11px] text-[#94A3B8] focus:outline-none focus:border-[#475569] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#1E293B] rounded-lg p-0.5 border border-[#334155]">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-[#475569] hover:text-[#94A3B8]'}`}
              title="Grid view"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-[#475569] hover:text-[#94A3B8]'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-white/10 text-white border-white/20' : 'text-[#64748B] hover:text-[#94A3B8] border-[#334155] hover:bg-[#1E293B]/50'}`}
            title="Filters"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[#1E293B] animate-fade-in">
            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#64748B]">Price:</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-24 px-2 py-1 rounded bg-[#1E293B] border border-[#334155] text-[11px] text-white focus:outline-none focus:border-[#475569]"
                placeholder="Min"
              />
              <span className="text-[#475569]">—</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-24 px-2 py-1 rounded bg-[#1E293B] border border-[#334155] text-[11px] text-white focus:outline-none focus:border-[#475569]"
                placeholder="Max"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#64748B]">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] text-[11px] text-[#94A3B8] focus:outline-none focus:border-[#475569] cursor-pointer"
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
              className="text-[11px] text-[#64748B] hover:text-white transition-colors ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ─── Content Area ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#1E293B] flex items-center justify-center mb-4">
              <Package size={28} className="text-[#475569]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#94A3B8]">No products found</h3>
            <p className="text-[12px] text-[#64748B] mt-1 max-w-xs">Try adjusting your search or filter criteria to find what you're looking for.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); setStatusFilter('all'); setPriceRange([0, 500000]); }}
              className="mt-4 px-4 py-2 rounded-lg text-[12px] font-medium bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] border border-[#334155] transition-colors"
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
          <div className="mt-4 pt-3 border-t border-[#1E293B]">
            <p className="text-[11px] text-[#475569]">
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

export const CatalogueDemo: React.FC = () => {
  const [chartSize, setChartSize] = useState({ w: 0, h: 0 });
  const [bookingSize, setBookingSize] = useState({ w: 0, h: 0 });

  return (
    <div className="min-h-screen bg-[#060A14] p-6 space-y-6">
      {/* Demo Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-white">Resizable Card + Catalogue Demo</h1>
        <p className="text-[13px] text-[#64748B] mt-1">
          Drag the bottom-right corner of each card to resize in real time.
        </p>
      </div>

      {/* Row 1: Small resizable cards for charts/bookings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Example: Chart Card */}
        <ResizableCard
          title="Revenue Overview"
          subtitle={chartSize.w > 0 ? `${Math.round(chartSize.w)} × ${Math.round(chartSize.h)}px` : 'Drag to resize'}
          accent="green"
          initialWidth={380}
          initialHeight={260}
          onResize={setChartSize}
          headerRight={
            <button className="p-1 rounded text-[#475569] hover:text-white transition-colors">
              <MoreVertical size={14} />
            </button>
          }
          footer={
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">Last 30 days</span>
              <span className="text-[11px] font-semibold text-emerald-400">+12.5%</span>
            </div>
          }
        >
          {/* Placeholder for a real chart */}
          <div className="h-full flex items-end gap-1.5 px-2 pb-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                style={{ height: `${h}%`, minHeight: 4 }}
              />
            ))}
          </div>
        </ResizableCard>

        {/* Example: Bookings Card */}
        <ResizableCard
          title="Recent Bookings"
          subtitle="Today"
          accent="blue"
          initialWidth={380}
          initialHeight={260}
          onResize={setBookingSize}
        >
          <div className="space-y-2">
            {[
              { name: 'John Doe', service: 'Cremation', time: '10:30 AM', status: 'Confirmed' },
              { name: 'Jane Smith', service: 'Burial', time: '2:00 PM', status: 'Pending' },
              { name: 'Alex Mwangi', service: 'Viewing', time: '4:00 PM', status: 'Confirmed' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#111827] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-[11px] font-semibold text-[#64748B]">
                  {b.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#E2E8F0] truncate">{b.name}</p>
                  <p className="text-[10px] text-[#64748B]">{b.service} · {b.time}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  b.status === 'Confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </ResizableCard>

        {/* Example: Quick Stats Card */}
        <ResizableCard
          title="Coffin Inventory"
          subtitle="Real-time stock levels"
          accent="red"
          initialWidth={380}
          initialHeight={260}
          headerRight={
            <span className="text-[11px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
              3 low stock
            </span>
          }
        >
          <div className="space-y-3">
            {[
              { name: 'Mahogany Crown', stock: 12, max: 20, status: 'ok' },
              { name: 'White Steel Vault', stock: 2, max: 10, status: 'low' },
              { name: 'Pine Simple', stock: 0, max: 15, status: 'out' },
              { name: 'Walnut Executive', stock: 1, max: 8, status: 'low' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#94A3B8] truncate">{item.name}</span>
                  <span className={`text-[10px] font-medium ${
                    item.status === 'ok' ? 'text-emerald-400' : item.status === 'low' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {item.stock}/{item.max}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'ok' ? 'bg-emerald-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(item.stock / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ResizableCard>
      </div>

      {/* Row 2: Full Catalogue */}
      <ResizableCard
        title="Product Catalogue"
        subtitle="Memorial Care Funeral Home"
        accent="default"
        initialWidth={0}
        initialHeight={0}
        noPadding
        resizable={false}
      >
        <div className="h-[600px]">
          <FuneralCatalogue
            funeralHomeName="Memorial Care Funeral Home"
            onAddToBooking={(item) => console.log('Add to booking:', item.name)}
            onViewDetails={(item) => console.log('View details:', item.name)}
          />
        </div>
      </ResizableCard>
    </div>
  );
};

export default FuneralCatalogue;
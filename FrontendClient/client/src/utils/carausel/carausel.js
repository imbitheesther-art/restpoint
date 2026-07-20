import React, { useState, useRef, useCallback, useEffect, Children, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from './Icons';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

type CarouselVariant = 'default' | 'peek' | 'full' | 'fade';
type CarouselAlign = 'start' | 'center' | 'end';
type DotStyle = 'line' | 'dot' | 'pill' | 'none';

interface CarouselProps {
  children: ReactNode;
  visibleCount?: number;
  gap?: number;
  variant?: CarouselVariant;
  align?: CarouselAlign;
  dots?: DotStyle;
  arrows?: boolean;
  autoPlay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  draggable?: boolean;
  className?: string;
  slideClassName?: string;
  onIndexChange?: (index: number) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

export const Carousel: React.FC<CarouselProps> = ({
  children,
  visibleCount = 0,
  gap = 12,
  variant = 'default',
  align = 'start',
  dots = 'dot',
  arrows = true,
  autoPlay = 0,
  pauseOnHover = true,
  loop = false,
  draggable = true,
  className = '',
  slideClassName = '',
  onIndexChange,
}) => {
  const items = Children.toArray(children);
  const total = items.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Visible count ─────────────────────────────────────────────────
  const getVisibleCount = useCallback((): number => {
    if (variant === 'full' || variant === 'fade') return 1;
    if (visibleCount > 0) return Math.min(visibleCount, total);
    if (containerWidth <= 0) return 1;
    return Math.max(1, Math.floor((containerWidth + gap) / (200 + gap)));
  }, [visibleCount, total, containerWidth, gap, variant]);

  const visCount = getVisibleCount();
  const maxIndex = Math.max(0, total - visCount);
  const safeIndex = Math.min(activeIndex, maxIndex);

  // ─── Measure container ────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── Slide width ──────────────────────────────────────────────────
  const slideWidth = useCallback((): number => {
    if (variant === 'full' || variant === 'fade') return containerWidth;
    if (variant === 'peek') {
      const peek = 40;
      const available = containerWidth - (visCount - 1) * gap - peek * 2;
      return Math.max(100, available / visCount);
    }
    const available = containerWidth - (visCount - 1) * gap;
    return Math.max(100, available / visCount);
  }, [containerWidth, visCount, gap, variant]);

  const sw = slideWidth();

  // ─── Track offset ─────────────────────────────────────────────────
  const getOffset = useCallback((): number => {
    if (variant === 'fade') return 0;
    const step = sw + gap;
    const offset = safeIndex * step;
    if (align === 'center') {
      const totalW = total * step - gap;
      return Math.max(0, Math.min(offset, totalW - containerWidth));
    }
    return offset;
  }, [safeIndex, sw, gap, align, total, containerWidth, variant]);

  // ─── Navigation ───────────────────────────────────────────────────
  const goTo = useCallback((index: number) => {
    let next = index;
    if (loop) {
      if (next > maxIndex) next = 0;
      if (next < 0) next = maxIndex;
    } else {
      next = Math.max(0, Math.min(next, maxIndex));
    }
    setActiveIndex(next);
    onIndexChange?.(next);
  }, [maxIndex, loop, onIndexChange]);

  const prev = useCallback(() => goTo(safeIndex - 1), [safeIndex, goTo]);
  const next = useCallback(() => goTo(safeIndex + 1), [safeIndex, goTo]);

  // ─── Auto-play ────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoPlay || isPaused || isDragging) {
      if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
      return;
    }
    autoPlayRef.current = setInterval(() => {
      goTo(safeIndex >= maxIndex && !loop ? 0 : safeIndex + 1);
    }, autoPlay);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [autoPlay, isPaused, isDragging, safeIndex, maxIndex, loop, goTo]);

  // ─── Keyboard ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [prev, next]);

  // ─── Drag: start ─────────────────────────────────────────────────
  const handleDragStart = useCallback((clientX: number) => {
    if (!draggable || variant === 'fade') return;
    setIsDragging(true);
    setDragStart({ x: clientX, offset: -getOffset() });
  }, [draggable, variant, getOffset]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  // ─── Drag: move ──────────────────────────────────────────────────
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const dx = clientX - dragStart.x;
    trackRef.current.style.transform = `translateX(${dragStart.offset + dx}px)`;
    trackRef.current.style.transition = 'none';
  }, [isDragging, dragStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    handleDragMove(e.clientX);
  }, [isDragging, handleDragMove]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  }, [isDragging, handleDragMove]);

  // ─── Drag: end ───────────────────────────────────────────────────
  const handleDragEnd = useCallback((clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = clientX - dragStart.x;
    const threshold = sw * 0.2;
    if (Math.abs(dx) > threshold) {
      if (dx < 0) next(); else prev();
    } else {
      // Snap back
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
        trackRef.current.style.transform = `translateX(${-getOffset()}px)`;
      }
    }
  }, [isDragging, dragStart, sw, next, prev, getOffset]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    handleDragEnd(e.clientX);
  }, [handleDragEnd]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      handleDragEnd(e.changedTouches[0].clientX);
    }
  }, [handleDragEnd]);

  // ─── Sync transform ──────────────────────────────────────────────
  useEffect(() => {
    if (isDragging || variant === 'fade') return;
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
    track.style.transform = `translateX(${-getOffset()}px)`;
  }, [safeIndex, getOffset, isDragging, variant]);

  // ─── Arrow visibility ────────────────────────────────────────────
  const showLeft = loop ? total > visCount : safeIndex > 0;
  const showRight = loop ? total > visCount : safeIndex < maxIndex;

  // ─── Fade opacity ────────────────────────────────────────────────
  const fadeOpacity = (idx: number): number => {
    if (variant !== 'fade') return 1;
    return idx === safeIndex ? 1 : 0;
  };

  // ─── Shared arrow styles ──────────────────────────────────────────
  const arrowBase = "absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full "
    + "bg-[#0F172A]/80 backdrop-blur-sm border border-[#1E293B] "
    + "flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] "
    + "shadow-lg shadow-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200";

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      tabIndex={0}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => { pauseOnHover && setIsPaused(false); }}
    >
      {/* ─── Viewport ──────────────────────────────────────────────── */}
      <div
        ref={viewportRef}
        className="overflow-hidden"
        style={{
          cursor: isDragging ? 'grabbing' : draggable && variant !== 'fade' ? 'grab' : 'default',
          touchAction: draggable && variant !== 'fade' ? 'none' : 'auto',
          userSelect: isDragging ? 'none' : 'auto',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={(e) => { if (isDragging) onMouseUp(e); }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: `${gap}px`,
            ...(variant === 'fade' ? { position: 'relative' } : {}),
          }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className={`shrink-0 ${slideClassName}`}
              style={{
                width: `${sw}px`,
                opacity: fadeOpacity(i),
                pointerEvents: fadeOpacity(i) > 0 ? 'auto' : 'none',
                transition: variant === 'fade' ? 'opacity 0.4s ease' : undefined,
                ...(variant === 'fade' ? {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                } : {}),
              }}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Spacer for fade variant so container has height */}
        {variant === 'fade' && (
          <div style={{ height: `${sw * 0.6}px` }} className="pointer-events-none" />
        )}
      </div>

      {/* ─── Left Arrow ───────────────────────────────────────────── */}
      {arrows && showLeft && (
        <button onClick={prev} className={`${arrowBase} -left-1`} aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
      )}

      {/* ─── Right Arrow ──────────────────────────────────────────── */}
      {arrows && showRight && (
        <button onClick={next} className={`${arrowBase} -right-1`} aria-label="Next">
          <ChevronRight size={16} />
        </button>
      )}

      {/* ─── Dots ─────────────────────────────────────────────────── */}
      {dots !== 'none' && total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => {
            const isActive = i === safeIndex;

            if (dots === 'line') {
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? '24px' : '12px',
                    backgroundColor: isActive ? '#FFFFFF' : '#334155',
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              );
            }

            if (dots === 'pill') {
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? '32px' : '16px',
                    backgroundColor: isActive ? '#DC2626' : '#334155',
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              );
            }

            // Default: dot
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? '10px' : '8px',
                  height: isActive ? '10px' : '8px',
                  backgroundColor: isActive ? '#FFFFFF' : '#334155',
                  transform: isActive ? 'scale(1.25)' : 'scale(1)',
                }}
                aria-label={`Slide ${i + 1}`}
              />
            );
          })}

          {/* Auto-play toggle */}
          {autoPlay > 0 && (
            <button
              onClick={() => setIsPaused(p => !p)}
              className="ml-2 p-1 rounded text-[#475569] hover:text-white transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play size={11} /> : <Pause size={11} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  STAT SLIDE
// ═══════════════════════════════════════════════════════════════════════════

export const StatSlide: React.FC<{
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  color?: string;
}> = ({ label, value, change, changeType = 'neutral', icon, color = '#3B82F6' }) => {
  const changeStyles: Record<string, { text: string; bg: string }> = {
    up: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    down: { text: 'text-red-400', bg: 'bg-red-500/10' },
    neutral: { text: 'text-[#64748B]', bg: 'bg-[#1E293B]' },
  };
  const cs = changeStyles[changeType];

  return (
    <div className="h-full p-4 rounded-xl bg-[#0C1222] border border-[#1E293B] hover:border-[#334155] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '15', color }}
        >
          {icon || <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />}
        </div>
        {change && (
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${cs.text} ${cs.bg}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-[#64748B] mt-1.5">{label}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  IMAGE SLIDE
// ═══════════════════════════════════════════════════════════════════════════

export const ImageSlide: React.FC<{
  src?: string;
  title: string;
  subtitle?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  overlay?: boolean;
}> = ({ src, title, subtitle, aspectRatio = 'video', rounded = 'lg', overlay = true }) => {
  const ratioMap: Record<string, string> = {
    square: '1 / 1',
    video: '4 / 3',
    wide: '16 / 9',
  };
  const radiusMap: Record<string, string> = {
    sm: '6px', md: '8px', lg: '12px', xl: '16px',
  };

  return (
    <div
      className="h-full overflow-hidden bg-[#111827] border border-[#1E293B] group"
      style={{ borderRadius: radiusMap[rounded] }}
    >
      <div
        className="relative overflow-hidden w-full"
        style={{ aspectRatio: ratioMap[aspectRatio] }}
      >
        {src ? (
          <img
            src={src}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#334155]/50" />
          </div>
        )}
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[13px] font-semibold text-white truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-white/60 truncate mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  CONTENT SLIDE
// ═══════════════════════════════════════════════════════════════════════════

export const ContentSlide: React.FC<{
  quote?: string;
  title: string;
  description?: string;
  tag?: string;
  tagColor?: string;
}> = ({ quote, title, description, tag, tagColor = '#3B82F6' }) => {
  return (
    <div className="h-full p-5 rounded-xl bg-[#0C1222] border border-[#1E293B] hover:border-[#334155] transition-colors flex flex-col">
      {tag && (
        <span
          className="self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-3"
          style={{ backgroundColor: tagColor + '15', color: tagColor }}
        >
          {tag}
        </span>
      )}
      {quote && (
        <p className="text-[13px] text-[#94A3B8] leading-relaxed italic flex-1">
          &ldquo;{quote}&rdquo;
        </p>
      )}
      <div className="mt-4 pt-3 border-t border-[#1E293B]">
        <p className="text-[13px] font-semibold text-white">{title}</p>
        {description && <p className="text-[11px] text-[#64748B] mt-0.5">{description}</p>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO
// ═══════════════════════════════════════════════════════════════════════════

export const CarouselDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060A14] p-6 space-y-12 max-w-6xl mx-auto">

      {/* 1. Analytics Stats */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Analytics Stats</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Default variant · 4 visible · auto-play</p>
        <Carousel visibleCount={4} autoPlay={3000} dots="line" gap={12}>
          <StatSlide label="Total Revenue" value="KES 2.4M" change="+12.5%" changeType="up" color="#10B981" />
          <StatSlide label="Active Bookings" value="148" change="+8" changeType="up" color="#3B82F6" />
          <StatSlide label="Coffins Sold" value="67" change="-3" changeType="down" color="#F59E0B" />
          <StatSlide label="Avg. Order Value" value="KES 18K" change="+2.1%" changeType="up" color="#8B5CF6" />
          <StatSlide label="Pending Payments" value="23" change="+5" changeType="down" color="#EF4444" />
          <StatSlide label="New Clients" value="34" change="+15%" changeType="up" color="#06B6D4" />
          <StatSlide label="Retention Rate" value="89%" change="+1.2%" changeType="up" color="#EC4899" />
        </Carousel>
      </section>

      {/* 2. Image Gallery */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Image Gallery</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Peek variant · 3 visible · draggable</p>
        <Carousel variant="peek" visibleCount={3} dots="pill" gap={16}>
          <ImageSlide title="Mahogany Crown" subtitle="KES 185,000" />
          <ImageSlide title="Oak Heritage" subtitle="KES 145,000" />
          <ImageSlide title="White Steel Vault" subtitle="KES 220,000" />
          <ImageSlide title="Willow Natural" subtitle="KES 65,000" />
          <ImageSlide title="Cherry Blossom" subtitle="KES 195,000" />
          <ImageSlide title="Walnut Executive" subtitle="KES 168,000" />
        </Carousel>
      </section>

      {/* 3. Full-Width Hero */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Full-Width Hero</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Full variant · 1 visible · auto-play</p>
        <Carousel variant="full" dots="dot" autoPlay={5000}>
          <ImageSlide title="Premium Mahogany Collection" subtitle="Handcrafted with precision" aspectRatio="wide" rounded="xl" />
          <ImageSlide title="Eco-Friendly Options" subtitle="Sustainable farewell choices" aspectRatio="wide" rounded="xl" />
          <ImageSlide title="Memorial Packages" subtitle="Complete care solutions" aspectRatio="wide" rounded="xl" />
        </Carousel>
      </section>

      {/* 4. Testimonials */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Testimonials</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Default variant · 3 visible</p>
        <Carousel visibleCount={3} dots="none" arrows>
          <ContentSlide quote="They handled everything with such dignity and care during our most difficult time." title="Sarah Wanjiku" description="Family Member" tag="Testimonial" tagColor="#10B981" />
          <ContentSlide quote="Professional service from start to finish. The catalogue made selection so easy." title="James Otieno" description="Funeral Director" tag="Review" tagColor="#3B82F6" />
          <ContentSlide quote="The real-time inventory tracking has transformed how we manage our stock." title="Grace Muthoni" description="Operations Manager" tag="Feedback" tagColor="#8B5CF6" />
          <ContentSlide quote="Beautiful caskets, fair prices, and the team went above and beyond." title="David Kamau" description="Client Family" tag="Testimonial" tagColor="#F59E0B" />
        </Carousel>
      </section>

      {/* 5. Fade */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Fade Transition</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Fade variant · crossfade</p>
        <div className="max-w-lg">
          <Carousel variant="fade" dots="line" autoPlay={4000}>
            <div className="p-8 rounded-xl bg-gradient-to-br from-red-500/10 to-[#0C1222] border border-red-500/20 text-center">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-[13px] text-[#94A3B8] mt-2">Round-the-clock support for families</p>
            </div>
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#0C1222] border border-blue-500/20 text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-[13px] text-[#94A3B8] mt-2">Families served across Kenya</p>
            </div>
            <div className="p-8 rounded-xl bg-gradient-to-br from-emerald-500/10 to-[#0C1222] border border-emerald-500/20 text-center">
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-[13px] text-[#94A3B8] mt-2">Client satisfaction rate</p>
            </div>
          </Carousel>
        </div>
      </section>

      {/* 6. Flower / Products */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Flower / Product Section</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Peek variant · 4 visible · loop</p>
        <Carousel variant="peek" visibleCount={4} dots="dot" loop gap={14}>
          {[
            { name: 'White Lily Arrangement', price: 'KES 8,500', color: '#F9FAFB' },
            { name: 'Red Rose Wreath', price: 'KES 12,000', color: '#FEE2E2' },
            { name: 'Mixed Floral Spray', price: 'KES 15,500', color: '#DBEAFE' },
            { name: 'Peace Lily Basket', price: 'KES 6,800', color: '#D1FAE5' },
            { name: 'Sunflower Tribute', price: 'KES 9,200', color: '#FEF3C7' },
            { name: 'Orchid Standing Spray', price: 'KES 18,000', color: '#EDE9FE' },
            { name: 'Carnation Cushion', price: 'KES 7,500', color: '#FCE7F3' },
            { name: 'Green Foliage Base', price: 'KES 4,200', color: '#ECFDF5' },
          ].map(item => (
            <div key={item.name} className="h-full rounded-xl bg-[#0C1222] border border-[#1E293B] overflow-hidden hover:border-[#334155] transition-colors group">
              <div className="h-28 flex items-center justify-center" style={{ backgroundColor: item.color + '08' }}>
                <div className="w-16 h-16 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: item.color }} />
              </div>
              <div className="p-3">
                <p className="text-[12px] font-semibold text-[#E2E8F0] truncate">{item.name}</p>
                <p className="text-[13px] font-bold text-white mt-1">{item.price}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* 7. Minimal */}
      <section>
        <h2 className="text-[15px] font-bold text-white mb-1">Minimal (No Arrows, No Dots)</h2>
        <p className="text-[12px] text-[#64748B] mb-4">Swipe only</p>
        <Carousel arrows={false} dots="none" visibleCount={5} gap={8} draggable>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].map((day, i) => (
            <div key={i} className="h-16 rounded-lg bg-[#111827] border border-[#1E293B] flex items-center justify-center">
              <span className="text-[12px] text-[#64748B]">{day} — Week {Math.floor(i / 7) + 1}</span>
            </div>
          ))}
        </Carousel>
      </section>
    </div>
  );
};

export default Carousel;
// ─── Responsive Design Utilities ─────────────────────────────────
// Shared across all pages for consistent mobile-first responsive design

// Fluid font/clamp calculator
export const fs = (min, max) => `clamp(${min}rem, ${max}vw, ${max * 1.2}rem)`;
export const sp = (min, max) => `clamp(${min}rem, ${max}vw, ${max * 1.5}rem)`;

// Responsive grid
export const grid2 = 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))';
export const grid3 = 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))';
export const grid4 = 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))';
export const gridCols = (min = 250) => `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`;

// Consistent breakpoint helpers for inline styles
export const mq = {
    mobile: '@media (max-width: 640px)',
    tablet: '@media (max-width: 1024px)',
    desktop: '@media (min-width: 1025px)',
};

// Consistent section padding
export const sectionPad = { pt: 'clamp(3rem, 6vw, 5rem)', pb: 'clamp(3rem, 6vw, 5rem)', px: 'clamp(1rem, 5vw, 2rem)' };

// Common hover effects
export const hoverLift = {
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    cursor: 'pointer',
};

export const hoverBorder = (color) => ({
    ...hoverLift,
    border: `1px solid transparent`,
    '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: color,
        boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
    },
});

// SEO Helmet component
export const injectSeo = (title, description, keywords, url, image) => {
    const meta = [
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image || 'https://restpoint.co.ke/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
    ];
    const existing = document.querySelectorAll('[data-rp-seo]');
    existing.forEach(el => el.remove());
    meta.forEach(m => {
        const el = document.createElement('meta');
        el.setAttribute('data-rp-seo', '');
        Object.entries(m).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
    });
    document.title = title;
};

// Inject global responsive base styles
export const injectBaseStyles = () => {
    const id = 'rp-base-styles';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; overflow-x: hidden; line-height: 1.6; }
    img, svg, video { max-width: 100%; height: auto; display: block; }
    button { font-family: inherit; }
    input, textarea, select { font-family: inherit; font-size: 16px; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
    @keyframes rp-fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes rp-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes rp-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes rp-spin { to { transform: rotate(360deg); } }
    .rp-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
    .rp-reveal.visible { opacity: 1; transform: translateY(0); }
    .rp-float { animation: rp-float 4s ease-in-out infinite; }
    .rp-pulse { animation: rp-pulse 3s ease-in-out infinite; }
  `;
    document.head.appendChild(s);
};

// Reveal component using Intersection Observer
export { default as RevealComponent } from './Reveal';

export default {
    fs, sp, grid2, grid3, grid4, gridCols,
    mq, sectionPad, hoverLift, hoverBorder,
    injectSeo, injectBaseStyles, useReveal
};
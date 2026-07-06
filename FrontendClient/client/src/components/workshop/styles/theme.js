// Workshop Production System - Industrial Theme
export const theme = {
  // Industrial Color Palette
  colors: {
    // Primary - Workshop/Industrial
    primary: '#1a1a2e',        // Dark navy
    secondary: '#16213e',      // Dark blue
    accent: '#0f3460',         // Medium blue

    // Production Colors
    workshop: {
      floor: '#2c3e50',        // Workshop floor gray
      metal: '#7f8c8d',        // Metal gray
      wood: '#8b4513',         // Wood brown
      fabric: '#d35400',       // Fabric orange
      paint: '#2980b9',        // Paint blue
      polish: '#f39c12',       // Polish gold
      quality: '#27ae60',      // Quality green
      urgent: '#c0392b',       // Urgent red
    },

    // Status Colors
    status: {
      pending: '#95a5a6',      // Gray
      inProgress: '#3498db',   // Blue
      completed: '#27ae60',    // Green
      onHold: '#f39c12',       // Orange
      cancelled: '#e74c3c',    // Red
      showroom: '#9b59b6',     // Purple for showroom
    },

    // UI Colors
    background: '#0f0f1e',     // Very dark blue
    surface: '#1a1a2e',        // Card background
    surfaceLight: '#252542',   // Lighter card
    border: '#2d2d4a',         // Border color
    text: '#ecf0f1',           // White text
    textSecondary: '#bdc3c7',  // Gray text
    textMuted: '#7f8c8d',      // Muted text

    // Stage Colors (Production Pipeline)
    stages: {
      design: '#9b59b6',       // Purple
      cutting: '#e74c3c',      // Red
      assembly: '#e67e22',     // Orange
      polishing: '#f1c40f',    // Yellow
      finishing: '#2ecc71',    // Green
      quality: '#3498db',      // Blue
      delivery: '#1abc9c',     // Teal
    },
  },

  // Typography
  fonts: {
    primary: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    mono: "'Courier New', monospace",
    industrial: "'Arial Black', sans-serif",
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  // Shadows
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.3)',
    md: '0 4px 8px rgba(0,0,0,0.4)',
    lg: '0 8px 16px rgba(0,0,0,0.5)',
    glow: '0 0 10px rgba(52, 152, 219, 0.5)',
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // Animations
  animations: {
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    slideIn: 'slideIn 0.3s ease-out',
    fadeIn: 'fadeIn 0.5s ease-in',
  },

  // Production Stages
  productionStages: [
    { id: 'design', name: 'Design', icon: '🎨', color: '#9b59b6' },
    { id: 'cutting', name: 'Cutting', icon: '✂️', color: '#e74c3c' },
    { id: 'assembly', name: 'Assembly', icon: '🔧', color: '#e67e22' },
    { id: 'polishing', name: 'Polishing', icon: '✨', color: '#f1c40f' },
    { id: 'finishing', name: 'Finishing', icon: '🎭', color: '#2ecc71' },
    { id: 'quality', name: 'Quality Check', icon: '✅', color: '#3498db' },
    { id: 'delivery', name: 'Delivery', icon: '🚚', color: '#1abc9c' },
  ],

  // Order Types
  orderTypes: {
    customer: { label: 'Customer Order', color: '#3498db', icon: '👤' },
    showroom: { label: 'Showroom Display', color: '#9b59b6', icon: '🏪' },
    sample: { label: 'Sample/Prototype', color: '#f39c12', icon: '📋' },
  },

  // Worker Roles
  workerRoles: {
    carpenter: { label: 'Carpenter', color: '#8b4513', icon: '🪚' },
    polisher: { label: 'Polisher', color: '#f1c40f', icon: '✨' },
    assembler: { label: 'Assembler', color: '#e67e22', icon: '🔧' },
    painter: { label: 'Painter', color: '#2980b9', icon: '🎨' },
    quality: { label: 'Quality Inspector', color: '#27ae60', icon: '✅' },
    manager: { label: 'Production Manager', color: '#9b59b6', icon: '👔' },
  },
};

export default theme;
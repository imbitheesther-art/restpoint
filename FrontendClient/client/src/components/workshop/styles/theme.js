// Workshop Production System - Industrial Theme
export const theme = {
  // Industrial Color Palette
  colors: {
    // Primary - Workshop/Industrial
    primary: '#2c3e50',        // Workshop floor gray
    secondary: '#34495e',      // Darker gray
    accent: '#3498db',         // Production blue

    // Production Colors
    workshop: {
      floor: '#ecf0f1',        // Light concrete floor
      metal: '#95a5a6',        // Metal gray
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

    // UI Colors - Clean industrial look
    background: '#ffffff',     // Clean white background
    surface: '#f8f9fa',        // Light card background
    surfaceLight: '#ffffff',   // White card
    border: '#dee2e6',         // Light border
    text: '#2c3e50',           // Dark text
    textSecondary: '#6c757d',  // Gray text
    textMuted: '#adb5bd',      // Muted text

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

// Styled Components
export const COLORS = theme.colors;

export const Section = ({ children, style }) => (
  <div style={{
    background: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    ...style
  }}>
    {children}
  </div>
);

export const SectionHeader = ({ children, style }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...style
  }}>
    {children}
  </div>
);

export const SectionTitle = ({ children, style }) => (
  <h3 style={{
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    margin: 0,
    ...style
  }}>
    {children}
  </h3>
);

export const Table = ({ children, style }) => (
  <table style={{
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
    ...style
  }}>
    {children}
  </table>
);

export const Th = ({ children, style }) => (
  <th style={{
    padding: theme.spacing.sm,
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `2px solid ${theme.colors.border}`,
    ...style
  }}>
    {children}
  </th>
);

export const Td = ({ children, style }) => (
  <td style={{
    padding: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    ...style
  }}>
    {children}
  </td>
);

export const Tr = ({ children, style, onClick }) => (
  <tr style={{
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background 0.2s',
    ...style
  }}
    onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = theme.colors.surfaceLight; }}
    onMouseLeave={(e) => { if (onClick) e.currentTarget.style.background = 'transparent'; }}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const Badge = ({ children, $status, style }) => {
  const statusColors = {
    pending: theme.colors.status.pending,
    in_progress: theme.colors.status.inProgress,
    inProgress: theme.colors.status.inProgress,
    completed: theme.colors.status.completed,
    on_hold: theme.colors.status.onHold,
    onHold: theme.colors.status.onHold,
    cancelled: theme.colors.status.cancelled,
    design: theme.colors.stages.design,
    cutting: theme.colors.stages.cutting,
    assembly: theme.colors.stages.assembly,
    polishing: theme.colors.stages.polishing,
    finishing: theme.colors.stages.finishing,
    quality_check: theme.colors.stages.quality,
    quality: theme.colors.stages.quality,
    delivery: theme.colors.stages.delivery,
  };

  const color = statusColors[$status] || theme.colors.status.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '100px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
      ...style
    }}>
      {children}
    </span>
  );
};

export const MiniProgress = ({ $percent, children, style }) => (
  <div style={{
    width: '100%',
    height: '6px',
    background: theme.colors.border,
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative',
    ...style
  }}>
    <div style={{
      width: `${$percent}%`,
      height: '100%',
      background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.status.completed})`,
      borderRadius: '3px',
      transition: 'width 0.3s ease'
    }} />
    {children}
  </div>
);

export const EmptyState = ({ children, style }) => (
  <div style={{
    textAlign: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textSecondary,
    ...style
  }}>
    {children}
  </div>
);

export const Button = ({ children, onClick, disabled, style, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      padding: '0.5rem 1rem',
      background: theme.colors.accent,
      color: 'white',
      border: 'none',
      borderRadius: theme.borderRadius.md,
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s',
      ...style
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.9'; }}
    onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    {...props}
  >
    {children}
  </button>
);

export default theme;

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  FolderOpen,
  ShoppingCart,
  Package,
  Truck,
  Phone,
  Bell,
  Activity,
  BarChart3,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  User,
  Home,
  ChevronDown,
  Star,
  Grid,
  Layers,
  Folder,
  Plus,
  Search,
  Sparkles
} from 'lucide-react';

// ============================================================
// DESIGN SYSTEM
// ============================================================

const COLORS = {
  // Primary
  primary: '#0A2463',
  primaryLight: '#1A3A7A',
  primaryDark: '#061A4A',

  // Secondary
  secondary: '#3B8EA5',
  secondaryLight: '#5BAEC5',

  // Accent
  accent: '#FF6B35',
  accentHover: '#E55A2A',

  // Status
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',

  // Neutral
  white: '#FFFFFF',
  bg: '#F5F7FA',
  border: '#E8ECF0',
  text: '#1A1D24',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  // Active States
  active: '#3D4F47',
  activeBg: 'rgba(61, 79, 71, 0.06)',
  hoverBg: 'rgba(0, 0, 0, 0.03)',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowHover: 'rgba(0, 0, 0, 0.12)',
};

const FONTS = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const TRANSITIONS = {
  default: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ============================================================
// STYLED COMPONENTS
// ============================================================

const SidebarWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: stretch;
  height: 100vh;
  
  @media (max-width: 767px) {
    display: none;
  }
`;

const SidebarContainer = styled.aside`
  width: ${(props) => (props.$isOpen ? '260px' : '68px')};
  background: ${COLORS.white};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width ${TRANSITIONS.default};
  border-right: 1px solid ${COLORS.border};
  box-shadow: 2px 0 12px ${COLORS.shadow};
  height: 100vh;
  position: relative;
`;

// ============================================================
// HEADER / BRAND
// ============================================================

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.$isOpen ? '16px 20px 12px' : '12px 10px')};
  border-bottom: 1px solid ${COLORS.border};
  min-height: 60px;
  flex-shrink: 0;
  gap: ${(props) => (props.$isOpen ? '12px' : '0')};
  justify-content: ${(props) => (props.$isOpen ? 'flex-start' : 'center')};
  background: ${COLORS.white};
`;

const BrandLogo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${FONTS.heading};
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary});
  color: ${COLORS.white};
  letter-spacing: -0.02em;
  box-shadow: 0 2px 8px rgba(10, 36, 99, 0.2);
`;

const BrandName = styled.span`
  font-family: ${FONTS.heading};
  font-weight: 600;
  color: ${COLORS.text};
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  flex: 1;
`;

const BrandSub = styled.span`
  font-family: ${FONTS.body};
  font-weight: 400;
  color: ${COLORS.textLight};
  font-size: 0.6rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  display: block;
  margin-top: -1px;
`;

// ============================================================
// TOGGLE BUTTON
// ============================================================

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isOpen ? 'flex-end' : 'center')};
  padding: ${(props) => (props.$isOpen ? '0 16px 12px 16px' : '0 0 12px 0')};
  flex-shrink: 0;
  border-bottom: 1px solid ${COLORS.border};
  min-height: 44px;
`;

const ToggleButton = styled.button`
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: ${(props) => (props.$isOpen ? '6px 14px' : '6px 8px')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${TRANSITIONS.default};
  color: ${COLORS.textSecondary};
  gap: ${(props) => (props.$isOpen ? '8px' : '0')};
  
  &:hover {
    background: ${COLORS.hoverBg};
    color: ${COLORS.text};
    border-color: ${COLORS.primary};
    box-shadow: 0 2px 8px ${COLORS.shadow};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ToggleLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${COLORS.textSecondary};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  white-space: nowrap;
`;

// ============================================================
// SEARCH
// ============================================================

const SearchWrapper = styled.div`
  padding: ${(props) => (props.$isOpen ? '8px 16px 12px' : '8px 8px 12px')};
  border-bottom: 1px solid ${COLORS.border};
  flex-shrink: 0;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${COLORS.bg};
  border-radius: 8px;
  padding: ${(props) => (props.$isOpen ? '6px 12px' : '6px 8px')};
  border: 1px solid transparent;
  transition: all ${TRANSITIONS.default};
  
  &:focus-within {
    border-color: ${COLORS.primary};
    background: ${COLORS.white};
    box-shadow: 0 0 0 3px rgba(10, 36, 99, 0.1);
  }
  
  svg {
    color: ${COLORS.textLight};
    flex-shrink: 0;
  }
  
  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.8rem;
    color: ${COLORS.text};
    width: 100%;
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
    transition: opacity ${TRANSITIONS.default};
    
    &::placeholder {
      color: ${COLORS.textLight};
    }
  }
`;

// ============================================================
// NAVIGATION
// ============================================================

const SidebarNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 8px;
  
  &::-webkit-scrollbar {
    width: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.border};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${COLORS.textLight};
  }
`;

const NavSection = styled.div`
  margin-bottom: 4px;
`;

const NavSectionTitle = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${COLORS.textLight};
  padding: ${(props) => (props.$isOpen ? '8px 12px 4px' : '8px 0 4px')};
  text-align: ${(props) => (props.$isOpen ? 'left' : 'center')};
  opacity: ${(props) => (props.$isOpen ? 1 : 0.5)};
  transition: opacity ${TRANSITIONS.default};
  white-space: nowrap;
  overflow: hidden;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${(props) => (props.$collapsed ? '8px' : '8px 12px')};
  margin: 1px 0;
  cursor: pointer;
  border-radius: 8px;
  background: ${(props) => (props.$active ? COLORS.activeBg : 'transparent')};
  color: ${(props) => (props.$active ? COLORS.active : COLORS.textSecondary)};
  transition: all ${TRANSITIONS.default};
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};
  position: relative;
  min-height: 36px;
  
  ${(props) => props.$active && `
    font-weight: 500;
    color: ${COLORS.primary};
    background: rgba(10, 36, 99, 0.06);
  `}
  
  &:hover {
    background: ${(props) => (props.$active ? 'rgba(10, 36, 99, 0.08)' : COLORS.hoverBg)};
    color: ${(props) => (props.$active ? COLORS.primary : COLORS.text)};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const MenuItemIcon = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: ${(props) => (props.$active ? COLORS.primary : COLORS.textLight)};
  transition: color ${TRANSITIONS.default};
  
  ${MenuItem}:hover & {
    color: ${(props) => (props.$active ? COLORS.primary : COLORS.text)};
  }
`;

const MenuItemLabel = styled.span`
  font-size: 0.8rem;
  font-weight: ${(props) => (props.$active ? '500' : '400')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  flex: 1;
`;

const MenuBadge = styled.span`
  background: ${COLORS.danger};
  color: ${COLORS.white};
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 10px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  flex-shrink: 0;
`;

const MenuIndicator = styled.span`
  width: 4px;
  height: 24px;
  border-radius: 2px;
  background: ${COLORS.primary};
  opacity: ${(props) => (props.$active && props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  flex-shrink: 0;
  margin-left: auto;
`;

// ============================================================
// COLLAPSED ITEM WITH TOOLTIP
// ============================================================

const CollapsedItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: 1px 0;
  cursor: pointer;
  border-radius: 8px;
  background: ${(props) => (props.$active ? COLORS.activeBg : 'transparent')};
  color: ${(props) => (props.$active ? COLORS.active : COLORS.textSecondary)};
  transition: all ${TRANSITIONS.default};
  min-height: 36px;
  
  &:hover {
    background: ${(props) => (props.$active ? 'rgba(10, 36, 99, 0.08)' : COLORS.hoverBg)};
    color: ${(props) => (props.$active ? COLORS.primary : COLORS.text)};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: ${COLORS.text};
  color: ${COLORS.white};
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px ${COLORS.shadowHover};
  opacity: 0;
  visibility: hidden;
  transition: all ${TRANSITIONS.default};
  z-index: 100;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: ${COLORS.text};
  }
  
  ${CollapsedItem}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

// ============================================================
// FOOTER
// ============================================================

const SidebarFooter = styled.div`
  padding: ${(props) => (props.$isOpen ? '12px 16px 16px' : '8px 8px 12px')};
  border-top: 1px solid ${COLORS.border};
  margin-top: auto;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: ${(props) => (props.$isOpen ? '8px 8px 8px 4px' : '4px')};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all ${TRANSITIONS.default};
  
  &:hover {
    background: ${COLORS.hoverBg};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${FONTS.heading};
  font-weight: 600;
  font-size: 0.7rem;
  flex-shrink: 0;
  background: linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary});
  color: ${COLORS.white};
`;

const UserName = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${COLORS.text};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: 0.6rem;
  color: ${COLORS.textLight};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const LogoutButton = styled.button`
  background: ${(props) => (props.$collapsed ? 'transparent' : 'rgba(231, 76, 60, 0.06)')};
  border: 1px solid ${(props) => (props.$collapsed ? 'transparent' : 'transparent')};
  border-radius: 8px;
  cursor: pointer;
  padding: ${(props) => (props.$collapsed ? '8px' : '8px 12px')};
  color: ${(props) => (props.$collapsed ? COLORS.textSecondary : COLORS.danger)};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'center')};
  gap: 8px;
  width: ${(props) => (props.$collapsed ? 'auto' : '100%')};
  font-weight: 500;
  font-size: 0.8rem;
  transition: all ${TRANSITIONS.default};
  
  &:hover {
    background: ${(props) => (props.$collapsed ? 'rgba(231, 76, 60, 0.08)' : 'rgba(231, 76, 60, 0.12)')};
    color: ${COLORS.danger};
    border-color: ${(props) => (props.$collapsed ? 'rgba(231, 76, 60, 0.2)' : 'transparent')};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const LogoutText = styled.span`
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  white-space: nowrap;
`;

// ============================================================
// VERSION BADGE
// ============================================================

const VersionBadge = styled.div`
  font-size: 0.55rem;
  color: ${COLORS.textLight};
  text-align: center;
  padding: 4px 0;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  pointer-events: none;
`;

// ============================================================
// MOBILE COMPONENTS
// ============================================================

const MobileMenuButton = styled.button`
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 60;
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 2px 12px ${COLORS.shadow};
  display: none;
  align-items: center;
  justify-content: center;
  transition: all ${TRANSITIONS.default};
  color: ${COLORS.text};
  
  &:hover {
    box-shadow: 0 4px 20px ${COLORS.shadowHover};
    border-color: ${COLORS.primary};
  }
  
  @media (max-width: 767px) {
    display: flex;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 65;
  animation: fadeIn 0.25s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileSidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: ${COLORS.white};
  padding: 16px;
  display: flex;
  flex-direction: column;
  z-index: 70;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${(props) => (props.$isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  border-right: 1px solid ${COLORS.border};
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const CloseButton = styled.button`
  background: ${COLORS.white};
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${TRANSITIONS.default};
  color: ${COLORS.textSecondary};
  flex-shrink: 0;
  
  &:hover {
    color: ${COLORS.text};
  }
`;

// ============================================================
// MAIN COMPONENT
// ============================================================

const ModernSidebar = ({
  tenantData = {},
  userData = {},
  onLogout = () => { },
  onToggle,
  menuItems: customMenuItems,
  activePath: customActivePath
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check mobile
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) {
      setIsOpen(false);
    } else {
      const savedState = localStorage.getItem('sidebarOpen');
      setIsOpen(savedState !== null ? savedState === 'true' : true);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [checkMobile]);

  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile, isOpen]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', isOpen.toString());
    }
  }, [isOpen, isMobile]);

  const tenantSlug = slug || localStorage.getItem('tenantSlug') || '';

  // Default menu items if not provided
  const defaultMenuItems = [
    {
      section: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/tenant/${tenantSlug}/dashboard`, badge: null },
        { icon: Users, label: 'Deceased', path: `/tenant/${tenantSlug}/deceased`, badge: null },
        { icon: FileText, label: 'Invoices', path: `/tenant/${tenantSlug}/invoices`, badge: '3' },
        { icon: Calendar, label: 'Calendar', path: `/tenant/${tenantSlug}/calendar`, badge: null },
      ]
    },
    {
      section: 'Inventory',
      items: [
        { icon: Package, label: 'Coffins', path: `/tenant/${tenantSlug}/coffins`, badge: '12' },
        { icon: ShoppingCart, label: 'Marketplace', path: `/tenant/${tenantSlug}/marketplace`, badge: null },
        { icon: Truck, label: 'Hearse', path: `/tenant/${tenantSlug}/hearse`, badge: null },
      ]
    },
    {
      section: 'Documents',
      items: [
        { icon: FolderOpen, label: 'Documents', path: `/tenant/${tenantSlug}/documents`, badge: null },
        { icon: FileBarChart, label: 'E-Documents', path: `/tenant/${tenantSlug}/edocuments`, badge: null },
      ]
    },
    {
      section: 'Analytics',
      items: [
        { icon: Activity, label: 'Analytics', path: `/tenant/${tenantSlug}/analytics`, badge: null },
        { icon: BarChart3, label: 'Reports', path: `/tenant/${tenantSlug}/reports`, badge: null },
      ]
    },
    {
      section: 'System',
      items: [
        { icon: Users, label: 'Users', path: `/tenant/${tenantSlug}/users`, badge: null },
        { icon: Bell, label: 'Notifications', path: `/tenant/${tenantSlug}/notifications`, badge: '8' },
        { icon: Settings, label: 'Settings', path: `/tenant/${tenantSlug}/settings`, badge: null },
      ]
    }
  ];

  const menuItems = customMenuItems || defaultMenuItems;

  // Filter items based on search
  const filteredMenuItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const isActive = (path) => {
    if (customActivePath) {
      return location.pathname === customActivePath || location.pathname.startsWith(customActivePath + '/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
  };

  const toggleSidebar = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  }, [isOpen, onToggle]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  const getInitials = () => {
    if (tenantData?.name) {
      return tenantData.name.slice(0, 2).toUpperCase();
    }
    if (userData?.name) {
      return userData.name.slice(0, 2).toUpperCase();
    }
    return 'RJ';
  };

  const getDisplayName = () => {
    if (tenantData?.name) return tenantData.name;
    if (userData?.name) return userData.name;
    return 'RestPoint';
  };

  const getUserRole = () => {
    if (userData?.role) return userData.role;
    return 'Admin';
  };

  // ─── RENDER MENU ITEMS ─────────────────────────────────────

  const renderMenuItems = (items, collapsed = false) => {
    return items.map((item, index) => (
      <MenuItem
        key={index}
        $active={isActive(item.path)}
        $collapsed={collapsed}
        onClick={() => handleNavClick(item.path)}
        role="button"
        tabIndex={0}
      >
        <MenuItemIcon $active={isActive(item.path)}>
          <item.icon size={18} />
        </MenuItemIcon>
        <MenuItemLabel $active={isActive(item.path)} $visible={isOpen}>
          {item.label}
        </MenuItemLabel>
        {item.badge && (
          <MenuBadge $visible={isOpen}>{item.badge}</MenuBadge>
        )}
        <MenuIndicator $active={isActive(item.path)} $visible={isOpen} />
      </MenuItem>
    ));
  };

  const renderCollapsedItems = (items) => {
    return items.map((item, index) => (
      <CollapsedItem
        key={index}
        $active={isActive(item.path)}
        onClick={() => handleNavClick(item.path)}
        role="button"
        tabIndex={0}
      >
        <Tooltip>{item.label}</Tooltip>
        <MenuItemIcon $active={isActive(item.path)}>
          <item.icon size={18} />
        </MenuItemIcon>
        {item.badge && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: COLORS.danger,
            color: COLORS.white,
            fontSize: '0.5rem',
            fontWeight: 600,
            padding: '1px 4px',
            borderRadius: '8px',
            minWidth: '12px',
            textAlign: 'center'
          }}>
            {item.badge}
          </span>
        )}
      </CollapsedItem>
    ));
  };

  // ─── MOBILE ─────────────────────────────────────────────────

  if (isMobile) {
    return (
      <>
        <MobileMenuButton onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </MobileMenuButton>

        {isOpen && <SidebarOverlay onClick={() => setIsOpen(false)} aria-hidden="true" />}

        <MobileSidebar $isOpen={isOpen}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrandLogo style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>
                {getInitials()}
              </BrandLogo>
              <div>
                <BrandName $visible={true} style={{ fontSize: '0.9rem' }}>
                  {getDisplayName()}
                </BrandName>
                <BrandSub $visible={true} style={{ fontSize: '0.55rem' }}>
                  {getUserRole()}
                </BrandSub>
              </div>
            </div>
            <CloseButton onClick={() => setIsOpen(false)} aria-label="Close sidebar">
              <X size={22} />
            </CloseButton>
          </div>

          {/* Mobile Search */}
          <SearchWrapper $isOpen={true}>
            <SearchInput $isOpen={true}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchInput>
          </SearchWrapper>

          <SidebarNav>
            {filteredMenuItems.map((section, idx) => (
              <NavSection key={idx}>
                {section.section && (
                  <NavSectionTitle $isOpen={true}>
                    {section.section}
                  </NavSectionTitle>
                )}
                {renderMenuItems(section.items, false)}
              </NavSection>
            ))}
          </SidebarNav>

          <SidebarFooter $isOpen={true}>
            <LogoutButton $collapsed={false} onClick={handleLogout}>
              <LogOut size={16} />
              <LogoutText $visible={true}>Sign Out</LogoutText>
            </LogoutButton>
          </SidebarFooter>
        </MobileSidebar>
      </>
    );
  }

  // ─── COLLAPSED ─────────────────────────────────────────────

  if (!isOpen) {
    return (
      <SidebarWrapper>
        <SidebarContainer $isOpen={false}>
          <SidebarHeader $isOpen={false}>
            <BrandLogo style={{ width: '28px', height: '28px', fontSize: '0.65rem' }}>
              {getInitials()}
            </BrandLogo>
          </SidebarHeader>

          <SidebarNav>
            {menuItems.map((section, idx) => (
              <NavSection key={idx}>
                {section.section && (
                  <NavSectionTitle $isOpen={false}>
                    {section.section.slice(0, 1)}
                  </NavSectionTitle>
                )}
                {renderCollapsedItems(section.items)}
              </NavSection>
            ))}
          </SidebarNav>

          <SidebarFooter $isOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <UserAvatar style={{ width: '28px', height: '28px', fontSize: '0.6rem' }}>
                {getInitials()}
              </UserAvatar>
              <LogoutButton $collapsed={true} onClick={handleLogout}>
                <LogOut size={16} />
              </LogoutButton>
            </div>
          </SidebarFooter>
        </SidebarContainer>

        {/* Toggle handle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '48px',
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            alignSelf: 'center',
            marginLeft: '-1px',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
          }}
          onClick={toggleSidebar}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.hoverBg;
            e.currentTarget.style.boxShadow = '2px 0 12px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.white;
            e.currentTarget.style.boxShadow = '2px 0 8px rgba(0,0,0,0.05)';
          }}
        >
          <ChevronRight size={14} color={COLORS.textSecondary} />
        </div>
      </SidebarWrapper>
    );
  }

  // ─── EXPANDED ──────────────────────────────────────────────

  return (
    <SidebarWrapper>
      <SidebarContainer $isOpen={true}>
        {/* Header */}
        <SidebarHeader $isOpen={true}>
          <BrandLogo>{getInitials()}</BrandLogo>
          <div>
            <BrandName $visible={true}>{getDisplayName()}</BrandName>
            <BrandSub $visible={true}>{getUserRole()}</BrandSub>
          </div>
        </SidebarHeader>

        {/* Search */}
        <SearchWrapper $isOpen={true}>
          <SearchInput $isOpen={true}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInput>
        </SearchWrapper>

        {/* Navigation */}
        <SidebarNav>
          {filteredMenuItems.map((section, idx) => (
            <NavSection key={idx}>
              {section.section && (
                <NavSectionTitle $isOpen={true}>
                  {section.section}
                </NavSectionTitle>
              )}
              {renderMenuItems(section.items, false)}
            </NavSection>
          ))}

          {filteredMenuItems.length === 0 && searchQuery && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: COLORS.textLight,
              fontSize: '0.8rem'
            }}>
              <Search size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              No results found for "{searchQuery}"
            </div>
          )}
        </SidebarNav>

        {/* Footer */}
        <SidebarFooter $isOpen={true}>
          <UserInfo $isOpen={true}>
            <UserAvatar>{getInitials()}</UserAvatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <UserName $visible={true}>{getDisplayName()}</UserName>
              <UserRole $visible={true}>{getUserRole()}</UserRole>
            </div>
          </UserInfo>

          <LogoutButton $collapsed={false} onClick={handleLogout}>
            <LogOut size={16} />
            <LogoutText $visible={true}>Sign Out</LogoutText>
          </LogoutButton>

          <VersionBadge $visible={true}>
            v2.0.0 • RestPoint
          </VersionBadge>
        </SidebarFooter>

        {/* Toggle button inside sidebar */}
        <ToggleWrapper $isOpen={true}>
          <ToggleButton $isOpen={true} onClick={toggleSidebar}>
            <ChevronLeft size={16} />
            <ToggleLabel $visible={true}>Collapse</ToggleLabel>
          </ToggleButton>
        </ToggleWrapper>
      </SidebarContainer>
    </SidebarWrapper>
  );
};

export default ModernSidebar;
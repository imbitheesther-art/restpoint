import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  FolderOpen,
  Hammer,
  ShoppingCart,
  Package,
  Truck,
  Beaker,
  Activity,
  BarChart3,
  FileBarChart,
  LifeBuoy,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ============================================================
// DESIGN SYSTEM
// ============================================================

const COLORS = {
  primary: '#0A2463',
  primaryLight: '#1A3A7A',
  white: '#FFFFFF',
  bg: '#F5F7FA',
  border: '#E8ECF0',
  text: '#1A1D24',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  activeBg: 'rgba(10, 36, 99, 0.05)',
  hoverBg: 'rgba(0, 0, 0, 0.02)',
  danger: '#E74C3C',
  shadow: 'rgba(0, 0, 0, 0.04)',
};

const TRANSITIONS = {
  default: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
  width: ${(props) => (props.$isOpen ? '240px' : '68px')};
  background: ${COLORS.white};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width ${TRANSITIONS.default};
  border-right: 1px solid ${COLORS.border};
  box-shadow: 2px 0 8px ${COLORS.shadow};
  height: 100vh;
  position: relative;
`;

const SidebarNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 8px 8px 8px;
  
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
`;

const NavSection = styled.div`
  margin-bottom: 16px;
`;

const NavSectionTitle = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.textLight};
  padding: ${(props) => (props.$isOpen ? '0 12px 6px' : '0 0 6px')};
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
  padding: 10px 12px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 8px;
  background: ${(props) => (props.$active ? COLORS.activeBg : 'transparent')};
  color: ${(props) => (props.$active ? COLORS.primary : COLORS.textSecondary)};
  transition: all ${TRANSITIONS.default};
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};
  position: relative;
  min-height: 40px;
  
  ${(props) => props.$active && `
    font-weight: 500;
  `}
  
  &:hover {
    background: ${COLORS.activeBg};
    color: ${COLORS.primary};
  }
`;

const MenuItemIcon = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: ${(props) => (props.$active ? COLORS.primary : COLORS.textSecondary)};
`;

const MenuItemLabel = styled.span`
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  flex: 1;
`;

const MenuBadge = styled.span`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${TRANSITIONS.default};
  flex-shrink: 0;
`;

const CollapsedItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 8px;
  background: ${(props) => (props.$active ? COLORS.activeBg : 'transparent')};
  color: ${(props) => (props.$active ? COLORS.primary : COLORS.textSecondary)};
  transition: all ${TRANSITIONS.default};
  min-height: 40px;
  
  &:hover {
    background: ${COLORS.activeBg};
    color: ${COLORS.primary};
  }
`;

const Tooltip = styled.div`
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: ${COLORS.text};
  color: ${COLORS.white};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
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

const SidebarFooter = styled.div`
  padding: 12px;
  border-top: 1px solid ${COLORS.border};
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 10px;
  color: ${COLORS.textSecondary};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};
  gap: 12px;
  width: 100%;
  font-size: 0.85rem;
  transition: all ${TRANSITIONS.default};
  
  &:hover {
    background: rgba(231, 76, 60, 0.08);
    color: ${COLORS.danger};
  }
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isOpen ? 'flex-start' : 'center')};
  transition: all ${TRANSITIONS.default};
  color: ${COLORS.textSecondary};
  gap: 12px;
  width: 100%;
  font-size: 0.85rem;
  
  &:hover {
    background: ${COLORS.hoverBg};
    color: ${COLORS.text};
  }
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
  color: ${COLORS.text};
  
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
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 65;
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileSidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: ${COLORS.white};
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  z-index: 70;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
  transition: transform 0.25s ease;
  transform: ${(props) => (props.$isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  border-right: 1px solid ${COLORS.border};
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  align-self: flex-end;
  color: ${COLORS.textSecondary};
  margin-bottom: 16px;
`;

// ============================================================
// MAIN COMPONENT
// ============================================================

const ModernSidebar = ({
  onLogout = () => { },
  onToggle,
  menuItems: customMenuItems,
  activePath: customActivePath,
  tenantData
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
  }, [location.pathname, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', isOpen.toString());
    }
  }, [isOpen, isMobile]);

  const tenantSlug = slug || localStorage.getItem('tenantSlug') || '';

  // Check if single tenant from tenantData prop or localStorage
  const isSingleTenant = tenantData?.deploymentType === 'single' || localStorage.getItem('deploymentType') === 'single';

  // Multi-tenant menu items (full menu)
  const multiTenantMenuItems = [
    {
      section: 'Main',
      items: [
        { icon: Truck, label: 'Hearse', path: `/tenant/${tenantSlug}/hearse` },
        { icon: Users, label: 'Deceased', path: `/tenant/${tenantSlug}/deceased` },
        { icon: Package, label: 'Coffins', path: `/tenant/${tenantSlug}/coffins` },
        { icon: Beaker, label: 'Chemicals', path: `/tenant/${tenantSlug}/chemicals` },
        { icon: Hammer, label: 'Workshop', path: `/tenant/${tenantSlug}/workshop` },
      ]
    },
    {
      section: 'Analytics',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/tenant/${tenantSlug}/dashboard` },
        { icon: Activity, label: 'Insurance', path: `/tenant/${tenantSlug}/insurance` },
      ]
    },
    {
      section: 'Extra',
      items: [
        { icon: Settings, label: 'Settings', path: `/tenant/${tenantSlug}/settings` },
        { icon: Calendar, label: 'Leaves Dashboard', path: `/tenant/${tenantSlug}/leaves` },
        { icon: FileText, label: 'Apply Leave', path: `/tenant/${tenantSlug}/leaves/apply` },
        { icon: LifeBuoy, label: 'Support', path: `/tenant/${tenantSlug}/support` },
      ]
    }
  ];

  // Single-tenant menu items (simplified menu)
  const singleTenantMenuItems = [
    {
      section: 'Menu',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/tenant/${tenantSlug}/all-deceased` },
        { icon: Users, label: 'Deceased', path: `/tenant/${tenantSlug}/deceased` },
        { icon: Package, label: 'Coffins', path: `/tenant/${tenantSlug}/coffins` },
        { icon: Settings, label: 'Settings', path: `/tenant/${tenantSlug}/settings` },
      ]
    }
  ];

  const defaultMenuItems = isSingleTenant ? singleTenantMenuItems : multiTenantMenuItems;

  const menuItems = customMenuItems || defaultMenuItems;

  const isActive = (path) => {
    if (customActivePath) {
      return location.pathname === customActivePath || location.pathname.startsWith(customActivePath + '/');
    }
    // Exact match
    if (location.pathname === path) return true;

    // Check if current path starts with this path
    if (location.pathname.startsWith(path + '/')) {
      // Special case: don't mark parent route as active when on a child route
      // For example, /leaves/apply should not mark /leaves as active
      const remainingPath = location.pathname.slice(path.length);
      // List of child routes that should not activate parent
      const excludedChildRoutes = ['/apply', '/my-leaves', '/all'];
      const isExcludedChild = excludedChildRoutes.some(child => remainingPath === child || remainingPath.startsWith(child + '/'));

      if (isExcludedChild) {
        // Check if this path is the exact parent of the current route
        // Only activate if there's no more specific menu item
        return false;
      }

      return true;
    }

    return false;
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

  const renderMenuItems = (items) => {
    return items.map((item, index) => (
      <MenuItem
        key={index}
        $active={isActive(item.path)}
        $collapsed={false}
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
        {item.badge && isOpen && (
          <MenuBadge $visible={isOpen}>{item.badge}</MenuBadge>
        )}
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
            top: '4px',
            right: '4px',
            background: COLORS.primary,
            color: COLORS.white,
            fontSize: '0.55rem',
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

  // ─── MOBILE VIEW ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <MobileMenuButton onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </MobileMenuButton>

        {isOpen && <SidebarOverlay onClick={() => setIsOpen(false)} aria-hidden="true" />}

        <MobileSidebar $isOpen={isOpen}>
          <CloseButton onClick={() => setIsOpen(false)} aria-label="Close sidebar">
            <X size={22} />
          </CloseButton>

          <SidebarNav>
            {menuItems.map((section, idx) => (
              <NavSection key={idx}>
                {section.section && (
                  <NavSectionTitle $isOpen={true}>
                    {section.section}
                  </NavSectionTitle>
                )}
                {renderMenuItems(section.items)}
              </NavSection>
            ))}
          </SidebarNav>

          <SidebarFooter>
            <LogoutButton $collapsed={false} onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </LogoutButton>
          </SidebarFooter>
        </MobileSidebar>
      </>
    );
  }

  // ─── DESKTOP VIEW ────────────────────────────────────────────
  return (
    <SidebarWrapper>
      <SidebarContainer $isOpen={isOpen}>
        <SidebarNav>
          {menuItems.map((section, idx) => (
            <NavSection key={idx}>
              {section.section && (
                <NavSectionTitle $isOpen={isOpen}>
                  {isOpen ? section.section : section.section.slice(0, 1)}
                </NavSectionTitle>
              )}
              {isOpen ? renderMenuItems(section.items) : renderCollapsedItems(section.items)}
            </NavSection>
          ))}
        </SidebarNav>

        <SidebarFooter>
          <LogoutButton $collapsed={!isOpen} onClick={handleLogout}>
            <LogOut size={18} />
            {isOpen && <span>Sign Out</span>}
          </LogoutButton>

          <ToggleButton $isOpen={isOpen} onClick={toggleSidebar}>
            {isOpen ? (
              <>
                <ChevronLeft size={18} />
                <span>Collapse</span>
              </>
            ) : (
              <ChevronRight size={18} />
            )}
          </ToggleButton>
        </SidebarFooter>
      </SidebarContainer>
    </SidebarWrapper>
  );
};

export default ModernSidebar;
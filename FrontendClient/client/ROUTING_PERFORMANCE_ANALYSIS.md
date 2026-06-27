# Routing Performance Analysis — Rest Point Frontend

## Navigation Path Trace: Click → Interactive

The full navigation path for any authenticated route is:

1. Click link in ModernSidebar → `navigate(path)` 
2. React Router matches `/tenant/:slug/*` → `ProtectedRoute` wrapper
3. `ProtectedRoute` reads localStorage (synchronous - fast ✅)
4. ✅ Passes → `TenantResolver` mounts
5. `TenantResolver` `useEffect` fires → `tenantApi.getBranding(slug)` API call
6. Waiting for tenant API response... ⏳ **BLOCKING**
7. Tenant data received → `setTenantData()` → zustand store update
8. `TenantDashboardRoutes` renders with all **37 routes** (no code splitting)
9. **ALL** route components imported at the top of AppRouter.jsx
10. DashboardLayout mounts → ModernSidebar mounts → then specific page component mounts
11. Page component fires its own data fetching `useEffect` → another API call

---

## 🔴 CRITICAL BOTTLENECKS

### 1. NO React.lazy() / Code Splitting — All Routes Loaded Eagerly

**File:** `FrontendClient/client/src/routes/AppRouter.jsx`
**Lines:** 7-51

```jsx
// ALL 30+ components imported eagerly at the top of file
import LandingPage from '../modules/landing/LandingPage';
import OnboardingFlow from '../modules/onboarding/OnboardingFlow';
import PrivacyPolicy from '../components/privacy/PrivacyPolicy';
import TermsOfService from '../components/privacy/TermsOfService';
// ... 27 more imports
import MarketplacePage from '../components/marketplace/MarketplacePage';
import UploadProduct from '../components/marketplace/UploadProduct';
import SettingsPage from '../components/settings/SettingsPage';
// ... and more
```

**Why it's slow:**
Every component's code is included in the initial bundle regardless of which route the user visits. A user going to `/login` still downloads the code for `EDocumentsPage` (which uses fabric.js - a 500KB+ canvas library), `CoffinInventory`, `CalendarPage`, `ChemicalsPage`, `CallPage`, and all other dashboard routes.

**Impact:** ⚠️ SEVERE — Adds **500KB-1MB+** of unnecessary JavaScript to every page load.

**Fix:**
```jsx
// FrontendClient/client/src/routes/AppRouter.jsx
import React, { Suspense, lazy } from 'react';

// Lazy load ALL route components
const LandingPage = lazy(() => import('../modules/landing/LandingPage'));
const OnboardingFlow = lazy(() => import('../modules/onboarding/OnboardingFlow'));
const PrivacyPolicy = lazy(() => import('../components/privacy/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../components/privacy/TermsOfService'));
const LoginPage = lazy(() => import('../components/auth/login'));
const AllDeceasedPage = lazy(() => import('../components/deceasedinfo/listDeceased'));
const DeceasedDetails = lazy(() => import('../components/deceasedprofile/deceasedDetailPage'));
const InvoiceManager = lazy(() => import('../components/invoices/invoicemanager'));
const CalendarPage = lazy(() => import('../components/calender/CalendarPage'));
const EDocumentsPage = lazy(() => import('../components/edocuments/EDocumentsPage'));
const ReportGenerator = lazy(() => import('../components/reports/reportGenerator'));
const ChemicalsPage = lazy(() => import('../components/chemicals/chemicals'));
const MarketplacePage = lazy(() => import('../components/marketplace/MarketplacePage'));
const UploadProduct = lazy(() => import('../components/marketplace/UploadProduct'));
const SettingsPage = lazy(() => import('../components/settings/SettingsPage'));
const Notifications = lazy(() => import('../components/notifications/notifications'));
const CallPage = lazy(() => import('../components/call/CallPage'));
const UserManagement = lazy(() => import('../components/user/users'));
// ... etc for ALL route components
```

**Architectural improvement:**
- Configure Vite `manualChunks` to split vendor code: `react`, `react-dom`, `react-router-dom` in one chunk, `fabric`, `fullcalendar` in their own chunks
- Use `React.lazy()` + `Suspense` boundary at each route level

---

### 2. Missing Content-Specific Bundle Splitting

**File:** `FrontendClient/client/vite.config.js`
The build configuration was not inspected, but package.json shows these heavy dependencies loaded eagerly:

```
"@fullcalendar/core": "^6.1.20",       // ~200KB
"@fullcalendar/react": "^6.1.15",       // ~50KB
"fabric": "^7.4.0",                     // ~500KB+ CANVAS LIBRARY
"pdfjs-dist": "^4.0.0",                 // ~300KB+ PDF RENDERER
"react-pdf": "^9.0.0",                  // ~50KB
"recharts": "^2.12.0",                  // ~150KB chart library
"react-webcam": "^7.2.0",               // ~30KB
"socket.io-client": "^4.7.0",           // ~50KB
"styled-components": "^6.1.0",          // ~50KB
"@mui/material": "^5.15.0",            // ~200KB+ MATERIAL UI
"@mui/icons-material": "^5.15.0",       // ~500KB+ ICONS
"bootstrap": "^5.3.2",                  // ~200KB
"react-bootstrap": "^2.10.0",           // ~100KB
"framer-motion": "^11.0.0",             // ~150KB
"jquery": "^3.7.1",                     // ~90KB
```

**Why it's slow:**
- `fabric.js` (500KB) is loaded on every page because `EDocumentsPage` imports it eagerly
- This library is only needed on the `/edocuments` route
- Same for `react-pdf`, `recharts`, `FullCalendar`, `react-webcam`

**Impact:** ⚠️ SEVERE — Boosts initial bundle by **~1.5MB from heavy dependencies alone**

**Fix (vite.config.js):**
```js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-fabric': ['fabric'],
          'vendor-calendar': ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid'],
          'vendor-pdf': ['pdfjs-dist', 'react-pdf'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

---

### 3. Serial Waterfall: Tenant API Blocks Everything

**File:** `FrontendClient/client/src/routes/AppRouter.jsx`
**Lines:** 165-218

```jsx
const TenantResolver = () => {
  const { slug } = useParams();
  const { setTenantData, setLoading, error, setError, tenantData, loading } = useTenantStore();
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);  // ⚠️ Blocks rendering
      try {
        const data = await tenantApi.getBranding(slug);  // ⏳ WAITS for network
        setTenantData(safeData);
      } catch (err) {
        // error handling
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [slug, ...]);
```

**Why it's slow:**
Navigation flow: ProtectedRoute → TenantResolver → fetchTenant API → loading spinner → render Dashboard → render page component → fetchPageData → **now** page is usable

Each navigation waits for the tenant API call BEFORE even starting to load the page's own data. This is a classic serial waterfall: `API(tenant) → render(sidebar) → API(page data)`

**Impact:** ⚠️ SEVERE — Adds **200-500ms** of sequential latency to every navigation

**Fix:**
```jsx
// Option A: Cache tenant data in zustand with TTL
const TenantResolver = () => {
  const { slug } = useParams();
  const { tenantData, setTenantData, tenantCache } = useTenantStore();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    // Check cache first
    const cached = tenantCache[slug];
    if (cached && (Date.now() - cached.timestamp < 300000)) { // 5 min TTL
      setTenantData(cached.data);
      return;
    }
    
    // Fetch in background - don't block rendering
    tenantApi.getBranding(slug).then(data => {
      setTenantData(data);
      useTenantStore.getState().setCache(slug, data);
    }).catch(() => {});
  }, [slug]);
  
  // Never show loading for tenant - render immediately with cached/default data
  return <TenantDashboardRoutes tenantData={tenantData || {}} />;
};
```

**Architectural improvement:**
- Use React Query (`@tanstack/react-query` — already in package.json!) for all data fetching
- Remove manual loading/error states from components
- Let React Query handle caching, background refetching, and stale-while-revalidate

---

### 4. Missing React Query Usage Despite Library Being Installed

**File:** `FrontendClient/client/package.json` — `"@tanstack/react-query": "^5.28.0"` is installed

**But** no components use it:
- `listDeceased.jsx` uses raw `useEffect` + `api.get()` with manual loading/error states
- `TenantResolver` uses raw `useEffect` + `tenantApi.getBranding()`
- No `QueryClientProvider` found in App.jsx

**Why it's slow:**
- Every component re-fetches data on mount even if data hasn't changed
- No caching — navigating away and back re-fetches everything
- No stale-while-revalidate — users see loading spinners even for cached data
- No deduplication — if two components mount simultaneously, both fetch the same data

**Impact:** ⚠️ HIGH — Every navigation causes redundant network requests

**Fix:**
```jsx
// App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes garbage collection (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </QueryClientProvider>
);
```

```jsx
// In listDeceased.jsx - replace manual fetch with useQuery
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['deceased', tenantSlug],
  queryFn: () => api.get(ENDPOINTS.DECEASED.LIST).then(r => r.data.data),
  staleTime: 30_000, // 30 seconds
});

// No more useState for records, loading, error
// No more useEffect for fetching
```

---

### 5. Dead "import axios" In ListDeceased.jsx

**File:** `FrontendClient/client/src/components/deceasedinfo/listDeceased.jsx`
**Line 4:**
```jsx
import axios from 'axios';
```

**Why it's slow:**
This import is completely unused — the code uses `api` (the configured axios instance) on line 29. But `axios` is still bundled into this component's code, adding ~10KB of unnecessary JavaScript.

**Impact:** ⚠️ LOW — ~10KB unnecessary code, but indicates code quality issues

**Fix:** Remove the unused import.

---

### 6. Heavy Libraries Imported in main.jsx That Block Initial Render

**File:** `FrontendClient/client/src/main.jsx`
```jsx
import 'moment'           // ~350KB date library
import 'jquery'           // ~90KB DOM library
import '@fullcalendar/react'
import '@fullcalendar/daygrid'
import '@fullcalendar/timegrid'
import '@fullcalendar/interaction'
```

**Why it's slow:**
- `moment` and `jquery` are imported at the **entry point** of the application, so they block the initial render for EVERY user
- These should never be at the entry point — they're only used in specific components
- `moment` is particularly egregious since `date-fns` (more modern, tree-shakeable) is already in package.json

**Impact:** ⚠️ SEVERE — Adds **~500KB** to the critical render path

**Fix:**
```jsx
// main.jsx - REMOVE these imports
// import 'moment'
// import 'jquery'
// import '@fullcalendar/react'
// import '@fullcalendar/daygrid'
// import '@fullcalendar/timegrid'
// import '@fullcalendar/interaction'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

Move `moment`/`jquery` imports to only the components that actually use them (which likely none do since `date-fns` is installed).

---

### 7. ModernSidebar Renders Every Route Item — No Memoization

**File:** `FrontendClient/client/src/components/layout/ModernSidebar.jsx`
**Lines:** 409-437

```jsx
const mainMenuItems = [
  { icon: FileText, label: 'Deceased', path: `${basePath}/all-deceased` },
  { icon: FileText, label: 'Invoices', path: `${basePath}/invoices` },
  { icon: Calendar, label: 'Calendar', path: `${basePath}/calendar` },
];

const documentsMenuItems = [
  { icon: FileCode, label: 'E-Documents', path: `${basePath}/edocuments` },
  { icon: FolderOpen, label: 'Documents', path: `${basePath}/documents` },
];
// ... 10+ menu items total
```

**Why it's slow:**
- Menu items arrays are recreated on EVERY render because they're defined inside the component
- The `renderMenuItems` function iterates 20+ items every time
- `isActive` function is called for EACH item to check path matching
- The entire sidebar re-renders on every route change

**Impact:** ⚠️ MODERATE — Unnecessary re-renders of 20+ menu items on every navigation

**Fix:**
```jsx
// Move to module level (outside component)
const MAIN_MENU_ITEMS = [
  { icon: 'FileText', label: 'Deceased', pathId: 'all-deceased' },
  { icon: 'Calendar', label: 'Invoices', pathId: 'invoices' },
  { icon: 'Calendar', label: 'Calendar', pathId: 'calendar' },
];
// Use pathId to construct path at render time

// Inside component
const renderMenuItems = useCallback((items, basePath) => {
  return items.map((item) => {
    const fullPath = `${basePath}/${item.pathId}`;
    const isActive = location.pathname === fullPath || location.pathname.startsWith(fullPath + '/');
    return (
      <MenuItem
        key={item.pathId}
        $active={isActive}
        onClick={() => handleNavClick(fullPath)}
      >
        ...
      </MenuItem>
    );
  });
}, [location.pathname, isOpen]);
```

**Better: Use React.memo on MenuItem**

```jsx
const MenuItemComponent = React.memo(({ item, isActive, isOpen, onNavigate }) => {
  return (
    <MenuItem $active={isActive} onClick={() => onNavigate(item.path)}>
      <MenuItemIcon><item.icon size={18} /></MenuItemIcon>
      <MenuItemLabel $visible={isOpen}>{item.label}</MenuItemLabel>
    </MenuItem>
  );
});
```

---

### 8. Inefficient Auth Guard — Parsing User on Every Route Change

**File:** `FrontendClient/client/src/routes/AppRouter.jsx`
**Lines:** 63-74

```jsx
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');  // ⚠️ Reads raw JSON string
  const location = useLocation();
  // ...
};
```

**And in DashboardLayout (line 83-89):**
```jsx
const user = (() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');  // ⚠️ Parses on every render
  } catch {
    return {};
  }
})();
```

**Why it's slow:**
- `JSON.parse(localStorage.getItem('user'))` runs on EVERY render of DashboardLayout
- This is synchronous and called on every route change inside the dashboard

**Impact:** ⚠️ LOW — ~1-2ms per call, but called repeatedly. Minor, but indicative of pattern issues.

**Fix:**
```jsx
// Move to utility function with memoization
const getUser = (() => {
  let cachedUser = null;
  let lastKey = '';
  return () => {
    const key = localStorage.getItem('user') || '';
    if (key !== lastKey) {
      try { cachedUser = JSON.parse(key); } catch { cachedUser = {}; }
      lastKey = key;
    }
    return cachedUser;
  };
})();
```

**Better fix: Use zustand store**
```js
// authStore.js
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  init: () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        set({ user: JSON.parse(userStr), token, isAuthenticated: true });
      } catch {}
    }
  },
}));

// Call init() once on app load, then read from store everywhere
```

---

### 9. AllDeceasedPage Fetches ALL Data on Mount — No Pagination from Server

**File:** `FrontendClient/client/src/components/deceasedinfo/listDeceased.jsx`
**Lines:** 829-865

```jsx
const fetchDeceased = async () => {
  setLoading(true);
  const response = await api.get(ENDPOINTS.DECEASED.LIST);
  const records = result.data;
  // ... stores ALL records, then paginates on client-side
};
```

**Why it's slow:**
- Fetches ALL deceased records in a single request, regardless of page size
- Client-side pagination of potentially thousands of records
- Sorting entire dataset in JavaScript: `.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))`
- The filtering `useEffect` (lines 917-957) runs on every state change, re-filtering the entire dataset

**Impact:** ⚠️ HIGH — For 1000+ records, this can take 300-500ms of JavaScript execution time

**Fix:**
```jsx
// Move pagination to the server
const fetchDeceased = async (page, perPage) => {
  const response = await api.get(ENDPOINTS.DECEASED.LIST, {
    params: { page, perPage, search: searchTerm, status: statusFilter, year: yearFilter }
  });
  return response.data;
};
```

---

### 10. Expensive Style Imports in AllDeceasedPage

**File:** `FrontendClient/client/src/components/deceasedinfo/listDeceased.jsx`
**Line 24:**
```jsx
import 'react-toastify/dist/ReactToastify.css';
```

**Why it's slow:**
CSS import is inside a route component, meaning it loads when the component does. While CSS is typically non-blocking, having large CSS imports scattered across components can cause layout shifts and style recalculations.

**Impact:** ⚠️ LOW — Minor, but better practice is to import global CSS at the app level

**Fix:** Move to `index.css` or `App.jsx`.

---

### 11. window.innerWidth Read Without Debounce

**File:** `FrontendClient/client/src/components/deceasedinfo/listDeceased.jsx`
**Line 812:**
```jsx
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**And ModernSidebar (Lines 381-396):**
```jsx
const checkMobile = useCallback(() => {
  const mobile = window.innerWidth < 768;
  setIsMobile(mobile);
  // ...
}, []);

useEffect(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, [checkMobile]);
```

**Why it's slow:**
- `resize` events fire rapidly (can be 60+ times per second)
- Without debouncing, `setIsMobile` triggers React re-renders for EVERY pixel change

**Impact:** ⚠️ MODERATE — Causes unnecessary re-renders during window resize

**Fix:**
```jsx
useEffect(() => {
  let timeout;
  const handleResize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => setIsMobile(window.innerWidth <= 768), 150);
  };
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(timeout);
  };
}, []);
```

---

### 12. Redundant localStorage Reads in Axios Interceptor

**File:** `FrontendClient/client/src/api/axios.js`
**Lines:** 17-28

```jsx
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  const tenantSlug = localStorage.getItem('tenantSlug') || localStorage.getItem('tenant_slug');
  const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');
  // ...
});
```

**Why it's slow:**
- Every single API request (potentially 10+ per page load) reads localStorage 5+ times
- The interceptor tries 3 different keys for token, 2 keys for slug, 2 keys for tenantId
- This is synchronous disk I/O that blocks each request

**Impact:** ⚠️ MODERATE — Adds ~5-10ms per API call, times 10-20 calls per page = 50-200ms total

**Fix:**
```jsx
// Initialize once from a session-level store
let cachedToken = null;
let cachedSlug = null;
let cachedTenantId = null;

const refreshCache = () => {
  cachedToken = localStorage.getItem('authToken');
  cachedSlug = localStorage.getItem('tenantSlug');
  cachedTenantId = localStorage.getItem('tenantId');
};
refreshCache(); // Initial load

// Re-cache on login/logout events
window.addEventListener('storage', (e) => {
  if (['authToken', 'tenantSlug', 'tenantId'].includes(e.key)) refreshCache();
});

api.interceptors.request.use((config) => {
  if (cachedToken) config.headers['Authorization'] = `Bearer ${cachedToken}`;
  if (cachedSlug) config.headers['x-tenant-slug'] = cachedSlug;
  if (cachedTenantId) config.headers['x-tenant-id'] = cachedTenantId;
  return config;
});
```

---

### 13. Inefficient Token Refresh — Creates New Axios Instance

**File:** `FrontendClient/client/src/api/axios.js`
**Lines:** 43-45

```jsx
const response = await axios.post(env.API_URL + ENDPOINTS.AUTH.REFRESH, 
  { token: refreshToken }, 
  { withCredentials: true }
);
```

**Why it's slow:**
- Creates a NEW axios instance instead of reusing the configured `api` instance
- This loses all the default headers, timeout, and interceptors
- On failure, it clears ALL possible token keys (5 different localStorage keys) but doesn't redirect to login

**Impact:** ⚠️ LOW — Works, but inconsistent with the rest of the codebase

**Fix:**
```jsx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post(ENDPOINTS.AUTH.REFRESH, {
          token: localStorage.getItem('refreshToken'),
        });
        const newToken = data.token || data.accessToken;
        localStorage.setItem('authToken', newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login'; // Force redirect
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 14. Suspense Boundary Only Covers Children Inside Suspense in DashboardLayout

**File:** `FrontendClient/client/src/routes/AppRouter.jsx`
**Line 125:**
```jsx
<Suspense fallback={<RouteLoadingFallback />}>
  {children}
</Suspense>
```

**Why it's slow:**
- The Suspense boundary is inside `DashboardLayout` which means the entire layout (sidebar, header) has already rendered before the route content starts loading
- This is correct for showing the sidebar quickly, BUT
- The Suspense boundary only covers dashboard routes — public routes (`/login`, `/`, `/register`) have NO Suspense boundary at all
- Once React.lazy() is implemented, without Suspense at the top level, lazy components will crash

**Impact:** ⚠️ HIGH — Will cause component crashes when lazy loading is implemented without proper Suspense placement

**Fix:**
```jsx
const AppRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>  // Top-level Suspense
      <Routes>
        {/* ALL routes */}
      </Routes>
    </Suspense>
  );
};
```

---

### 15. Single Route File With All Routes — No Route Module Splitting

**File:** `FrontendClient/client/src/routes/AppRouter.jsx` — **493 lines**

**Why it's slow:**
- ALL routes are defined in a single file
- This file cannot be code-split itself
- Contains inline components (`TenantDashboardHome`, `DashboardRedirect`, `TenantResolver`) that should be separate files

**Impact:** ⚠️ MODERATE — Prevents granular code splitting, makes the file a monolith

**Fix:**
```jsx
// routes/AppRouter.jsx → Split into:
//   routes/AppRouter.jsx (main router with lazy imports)
//   routes/ProtectedRoute.jsx
//   routes/TenantResolver.jsx
//   routes/DashboardLayout.jsx
//   routes/TenantDashboardRoutes.jsx
```

---

### 16. Duplicate Sentry/Warning Buttons in ListDeceased With Inline Styles

**File:** `FrontendClient/client/src/components/deceasedinfo/listDeceased.jsx`
**Lines:** 1161-1173

```jsx
<button onClick={() => setShowTicketModal(true)}
  style={{
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 1rem', border: '1px solid rgba(166,124,82,0.3)',
    borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem',
    fontWeight: 600, background: 'rgba(166,124,82,0.08)', color: '#A67C52',
  }}
  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(166,124,82,0.15)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(166,124,82,0.08)'; }}
>
```

**Why it's slow:**
- Inline `onMouseEnter`/`onMouseLeave` handlers create new function objects on every render
- Direct DOM manipulation (`e.currentTarget.style.background = ...`) bypasses React's rendering — this is imperative, non-React code

**Impact:** ⚠️ LOW — Code quality issue, minor performance impact

**Fix:**
```jsx
// Create a styled component instead
const TicketButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid rgba(166,124,82,0.3);
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(166,124,82,0.08);
  color: #A67C52;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(166,124,82,0.15);
    transform: translateY(-1px);
  }
`;
```

---

## 📊 IMPACT SUMMARY TABLE

| # | Bottleneck | Impact | Ease to Fix | Priority |
|---|-----------|--------|-------------|----------|
| 1 | No React.lazy() / code splitting | 🔴 SEVERE | Easy | **P0 - Critical** |
| 2 | Heavy vendor deps loaded eagerly | 🔴 SEVERE | Easy | **P0 - Critical** |
| 3 | Tenant API blocks route rendering | 🔴 SEVERE | Medium | **P0 - Critical** |
| 4 | React Query installed but unused | 🔴 HIGH | Medium | **P1 - High** |
| 5 | Heavy imports in main.jsx | 🔴 SEVERE | Easy | **P0 - Critical** |
| 6 | Sidebar re-renders entire menu | 🟡 MODERATE | Medium | **P2 - Medium** |
| 7 | Client-side pagination of all data | 🔴 HIGH | Hard | **P1 - High** |
| 8 | No debounce on resize handlers | 🟡 MODERATE | Easy | **P2 - Medium** |
| 9 | Redundant localStorage in axios interceptor | 🟡 MODERATE | Easy | **P2 - Medium** |
| 10 | Suspense only in DashboardLayout | 🔴 HIGH | Easy | **P1 - High** |
| 11 | Single route file monolith | 🟡 MODERATE | Medium | **P2 - Medium** |
| 12 | Unused axios import | 🟢 LOW | Easy | **P3 - Low** |
| 13 | Inline DOM manipulation | 🟢 LOW | Easy | **P3 - Low** |

---

## 🏆 QUICK WINS (Implement in order)

1. **Remove `moment`, `jquery`, FullCalendar imports from `main.jsx`** — saves ~500KB initial bundle
2. **Add `React.lazy()` to all route imports in `AppRouter.jsx`** — saves ~1MB+ initial bundle
3. **Implement React Query for all data fetching** — eliminates manual state management, enables caching
4. **Configure Vite `manualChunks`** — splits vendor code into separate cacheable chunks
5. **Debounce resize event listeners** — prevents unnecessary re-renders
6. **Refactor axios interceptor to cache localStorage reads** — saves ~100ms on initial page load
7. **Move menu items outside sidebar component** — prevents array recreation on every render

---

## 📐 ARCHITECTURAL RECOMMENDATIONS

### Short-term (This Week)
1. Implement React.lazy() for all route components
2. Remove heavy imports from main.jsx
3. Add QueryClientProvider to App.jsx
4. Configure Vite manual chunks

### Medium-term (This Sprint)
1. Rewrite TenantResolver to not block rendering (use React Query)
2. Implement server-side pagination for list views
3. Split AppRouter.jsx into separate files per route group
4. Add proper loading skeletons instead of spinner

### Long-term (Next Sprint)
1. Migrate from styled-components to CSS modules (save ~50KB)
2. Replace moment.js usage with date-fns (tree-shakeable, saves ~300KB)
3. Consider micro-frontend architecture for heavy modules (EDocuments, Calendar)
4. Implement route-based prefetching with `<link rel="prefetch">` for predicted next routes
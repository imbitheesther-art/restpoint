# RestPoint Platform - CRITICAL REMAINING TASKS

## Quick Completion Guide

This document lists the remaining critical tasks to complete the RestPoint platform. All Phase 1-2 fixes have been implemented. These are the high-priority tasks for Phase 3+.

---

## 🔴 CRITICAL TASKS (Do These First)

### 1. Fix Auth Service - Tenant Validation
**File:** `apps/auth-service/server.js`
**Priority:** CRITICAL

#### Current Issue:
- Auth service doesn't validate tenant
- JWT generation incomplete
- No tenant context in tokens

#### What to Do:
1. Add tenant middleware to auth-service
2. Implement `/api/v1/restpoint/auth/login` endpoint that:
   - Accepts email/password
   - Looks up user in tenant database
   - Validates tenant is active
   - Issues JWT with tenantId, tenantSlug, userId
3. Implement `/api/v1/restpoint/auth/refresh` endpoint

#### Example Code:
```javascript
app.post('/api/v1/restpoint/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Find tenant by email
  const tenant = await findTenantByUserEmail(email);
  
  // 2. Get connection to tenant's database
  const tenantConnection = await getTenantDB(tenant.db_name);
  
  // 3. Find user in tenant DB
  const user = await tenantConnection.query('SELECT * FROM users WHERE email = ?', [email]);
  
  // 4. Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  
  // 5. Generate JWT with tenant context
  const token = jwt.sign({
    userId: user.user_id,
    tenantId: tenant.tenant_id,
    tenantSlug: tenant.tenant_slug,
    email: user.email,
    role: user.role
  }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ success: true, accessToken: token, user });
});
```

---

### 2. Complete Onboarding Flow
**File:** `apps/tenant-service/controllers/onboardingController.ts`
**Priority:** CRITICAL

#### Current Issue:
- Slug uniqueness not validated
- No email verification
- No redirect after registration

#### What to Do:
1. Add try-catch for unique constraint on tenant_slug
2. Implement email verification flow:
   - Generate verification token
   - Send email with verification link
   - Add `/verify-email/:token` endpoint
3. Return success screen data with:
   - tenant_slug
   - tenant_id
   - verification_required: true
   - message: "Please check your email"

#### Example Code:
```typescript
static async registerTenant(data: RegisterTenantData): Promise<{ tenant: Tenant; token: string }> {
  try {
    const subdomain = generateSlug(tenant_name);
    
    // Check uniqueness
    const existing = await masterQueryOne(
      'SELECT tenant_id FROM tenants WHERE tenant_slug = ?',
      [subdomain]
    );
    
    if (existing) {
      throw new Error(`Slug '${subdomain}' already taken. Try "${subdomain}-2"`);
    }
    
    // Create tenant and admin user (rest of code...)
    
    // Send verification email
    await sendVerificationEmail(email, verification_token);
    
    return { 
      tenant, 
      token,
      requiresVerification: true 
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Slug already exists');
    }
    throw error;
  }
}
```

---

### 3. Frontend Portal Routes
**File:** `FrontendClient/client/src/routes/AppRouter.jsx`
**Priority:** CRITICAL

#### Current Issue:
- Portal pages exist but not integrated
- No public routes for family access
- No tenant validation

#### What to Do:
1. Add portal routes:
```jsx
// Public portal routes (no auth required)
<Route path="/portal/:tenantSlug/*" element={<PortalLayout />} />
  <Route path="/portal/:tenantSlug/login" element={<PortalLoginPage />} />
  <Route path="/portal/:tenantSlug/deceased/:publicId" element={<PublicDeceasedPage />} />
  <Route path="/portal/:tenantSlug/search" element={<SearchDeceasedPage />} />
  <Route path="/portal/:tenantSlug/services" element={<PublicServicesPage />} />
```

2. Create PortalLayout component that:
   - Validates tenant exists
   - Doesn't require authentication
   - Shows tenant branding
   - Has portal navigation

3. Validate tenant before rendering:
```jsx
const PortalLayout = ({ children }) => {
  const { tenantSlug } = useParams();
  const [tenant, setTenant] = useState(null);
  
  useEffect(() => {
    publicApi.checkTenantStatus(tenantSlug)
      .then(data => setTenant(data))
      .catch(() => <Navigate to="/" />);
  }, [tenantSlug]);
  
  return <div>{children}</div>;
};
```

---

### 4. Create Public API Endpoints
**Files:** 
- `apps/api-gateway/server.ts` (add routes)
- Create new service or add to tenant-service
**Priority:** HIGH

#### What to Do:
1. Add public route mappings in API Gateway:
```typescript
{ paths: ['/api/public/'], target: SERVICES.tenant },
```

2. Implement endpoints:
```
GET /api/public/tenants/:slug/branding
GET /api/public/tenants/:slug/deceased (with pagination)
GET /api/public/tenants/:slug/deceased/:publicId
POST /api/public/tenants/:slug/request-access
GET /api/public/deceased/:qrCode
POST /api/public/tenants/:slug/hearse/book
```

3. These endpoints should NOT require authentication
4. Return only published/public data
5. Implement rate limiting for security

---

## 🟠 HIGH PRIORITY TASKS

### 5. Tenant Middleware - Add to All Services
**Files:** All service servers (auth, users, deceased, etc.)
**Priority:** HIGH

#### What to Do:
1. Add tenant extraction middleware to each service:
```typescript
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.tenantId = decoded.tenantId;
      req.tenantSlug = decoded.tenantSlug;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
  next();
});
```

2. Protect routes:
```typescript
app.get('/api/v1/restpoint/resource', (req, res) => {
  if (!req.tenantId) {
    return res.status(401).json({ success: false });
  }
  // Use req.tenantId in all queries
});
```

---

### 6. Generate Secure Public IDs for Deceased
**File:** `apps/deceased-service/models/Deceased.ts` or migration
**Priority:** HIGH

#### What to Do:
1. Add `public_deceased_id` column (already in migration!)
2. Generate format: `dec_<random_string>` (e.g., `dec_x8j4k91n`)
3. Make it unique and indexed

#### Example:
```typescript
function generatePublicDeceasedId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'dec_';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// When creating deceased:
const publicId = generatePublicDeceasedId();
await db.query(
  'INSERT INTO deceased (first_name, last_name, ..., public_deceased_id) VALUES (...)',
  [firstName, lastName, ..., publicId]
);
```

---

### 7. Complete Service Implementations
**Files:** Various service controllers
**Priority:** MEDIUM-HIGH

#### Services needing completion:
1. **Embalming Service** - Add full CRUD
2. **Invoices Service** - Add full CRUD + M-Pesa integration
3. **Coldroom Service** - Add full CRUD
4. **Coffin Service** - Add full CRUD
5. **Hearse Service** - Add booking + tracking
6. **Analytics Service** - Add dashboard queries
7. **Documents Service** - Add upload/download
8. **Reports Service** - Add report generation

---

## 🟡 MEDIUM PRIORITY TASKS

### 8. Frontend - Extract Tenant from URL
**File:** `FrontendClient/client/src/routes/AppRouter.jsx`
**Priority:** MEDIUM

#### What to Do:
```jsx
const TenantResolver = () => {
  const { slug } = useParams();
  const { setTenantData } = useTenantStore();
  const authToken = localStorage.getItem('authToken');
  const storedSlug = localStorage.getItem('tenantSlug');
  
  // Validate URL slug matches stored slug
  if (storedSlug && storedSlug !== slug) {
    console.warn('Slug mismatch - user logged into different tenant');
    return <Navigate to="/login" />;
  }
  
  // Fetch tenant branding
  useEffect(() => {
    publicApi.getTenantBranding(slug)
      .then(data => setTenantData(data))
      .catch(() => navigate('/'));
  }, [slug]);
  
  return <TenantDashboardRoutes />;
};
```

---

### 9. Remove Dead Code
**Files:** Various
**Priority:** MEDIUM

#### What to Do:
1. Delete these backup files:
   - `apps/deceased-service/server.ts.backup`
   - `apps/global/billingScheduler.ts.fix`
   - `apps/global/server.ts.backup`

2. Clean up old services:
   - Remove old code from `apps/chargeSettings/`
   - Remove old code from `apps/extraCharges/`
   - Review `apps/utilities/` for relevance

---

## 🟢 QUICK WINS (Low Effort, High Value)

### 10. Add Missing Indexes
**File:** Create migration or run script
```sql
ALTER TABLE users ADD INDEX idx_tenant_email (tenant_id, email);
ALTER TABLE deceased ADD INDEX idx_tenant_published (tenant_id, is_published);
ALTER TABLE tenants ADD INDEX idx_status (status);
ALTER TABLE refresh_tokens ADD INDEX idx_user_token (user_id, token(100));
```

---

## ✅ VERIFICATION CHECKLIST

Run this after completing above tasks:

- [ ] API Gateway runs on port 8000
- [ ] All services register on correct ports
- [ ] User can register new tenant
- [ ] Tenant slug is generated and unique
- [ ] Admin user created in tenant DB
- [ ] Verification email sent (check console in dev)
- [ ] JWT contains tenantId, tenantSlug, userId
- [ ] Can login with tenant credentials
- [ ] Token refresh works
- [ ] Portal pages accessible without auth
- [ ] Deceased records visible in tenant dashboard
- [ ] Family can access public deceased record
- [ ] Cannot access other tenant's data
- [ ] All services return 200 on /health
- [ ] No broken console errors

---

## 🚀 DEPLOYMENT COMMAND

When ready to test:

```bash
# Terminal 1 - Database
docker-compose up mariadb

# Terminal 2 - API Gateway + all services
docker-compose up --build

# Terminal 3 - Frontend (in FrontendClient/client)
npm run dev

# Visit http://localhost:5173 or http://localhost:8080
```

---

## 📞 SUPPORT CHECKLIST

If something breaks:

1. **Database connection fails**
   - Check MASTER_DB_HOST, MASTER_DB_USER, MASTER_DB_PASSWORD in .env
   - Check MariaDB is running: `docker-compose logs mariadb`

2. **Services not starting**
   - Check ports aren't already in use: `netstat -tuln | grep 8000`
   - Check .env files exist in each service directory
   - Check npm dependencies: `cd apps/service && npm install`

3. **JWT errors**
   - Ensure JWT_SECRET is set consistently across services
   - Check token expiration: tokens expire in 7 days
   - Verify refresh token is being used

4. **Tenant isolation broken**
   - Verify tenantId is in JWT
   - Verify all queries use `WHERE tenant_id = ?`
   - Check x-tenant-slug header is being passed

---

**Last Updated:** June 1, 2026
**Next Step:** Start with Auth Service implementation (Task #1)

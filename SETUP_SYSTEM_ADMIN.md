# System Admin Setup Guide

## Database Credentials

**From .env.production:**
```
Database Host: restpoint_mariadb
Database Port: 3306
Database Name: restpoint_main
Database User: restpoint_user
Database Password: RestPointUser2024
Root Password: RestPoint2024!
```

**Default Admin Credentials:**
```
Email: infowelttallis@gmail.com
Password: 40045355@Peter
```

---

## Step 1: Connect to MariaDB

### Option A: Using Docker Exec
```bash
docker exec -it restpoint_mariadb mysql -u root -pRestPoint2024!
```

### Option B: Using MySQL Client
```bash
mysql -h restpoint_mariadb -P 3306 -u root -pRestPoint2024!
```

---

## Step 2: Create System Admin User

### SQL Script to Create System Admin

```sql
-- Use the main database
USE restpoint_main;

-- Create system admin user in tenant_tracking database
-- First, check if the users table exists in tenant_tracking
CREATE DATABASE IF NOT EXISTS tenant_tracking;

-- Create users table in tenant_tracking if it doesn't exist
CREATE TABLE IF NOT EXISTS tenant_tracking.users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin',
    tenant_id INT NOT NULL,
    branch_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a default tenant for the system admin (if needed)
INSERT INTO tenant_tracking.tenants (
    tenant_name, 
    tenant_slug, 
    db_name, 
    email, 
    phone, 
    location, 
    country, 
    status, 
    subscription_status,
    deployment_type
) VALUES (
    'Welt Tallis Technologies',
    'welt-tallis',
    'welt_tallis_main',
    'infowelttallis@gmail.com',
    '+254700000000',
    'Nairobi',
    'Kenya',
    'active',
    'active',
    'single'
) ON DUPLICATE KEY UPDATE tenant_name = tenant_name;

-- Get the tenant_id
SET @tenant_id = LAST_INSERT_ID();

-- If the tenant already exists, get its ID
SELECT @tenant_id := tenant_id FROM tenant_tracking.tenants 
WHERE email = 'infowelttallis@gmail.com' LIMIT 1;

-- Create the system admin user
-- Password: 40045355@Peter (hashed with bcrypt)
INSERT INTO tenant_tracking.users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    tenant_id, 
    is_verified, 
    is_active
) VALUES (
    'infowelttallis@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Password: 40045355@Peter
    'System Administrator',
    '+254700000000',
    'systemadmin',
    @tenant_id,
    1,
    1
) ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'systemadmin',
    is_active = 1,
    is_verified = 1;

-- Verify the user was created
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    u.is_verified,
    t.tenant_name,
    t.tenant_slug
FROM tenant_tracking.users u
JOIN tenant_tracking.tenants t ON u.tenant_id = t.tenant_id
WHERE u.email = 'infowelttallis@gmail.com';

-- Verify the role
SELECT 'User created successfully with systemadmin role!' AS message;
```

---

## Step 3: Alternative - Create User in Tenant Database

If you want to create the user in a specific tenant database instead:

```sql
-- Use a specific tenant database
USE welt_tallis_main;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin',
    branch_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create system admin user
-- Password: 40045355@Peter (hashed with bcrypt)
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    is_verified, 
    is_active
) VALUES (
    'infowelttallis@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Password: 40045355@Peter
    'System Administrator',
    '+254700000000',
    'systemadmin',
    1,
    1
) ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'systemadmin',
    is_active = 1,
    is_verified = 1;

-- Verify
SELECT * FROM users WHERE email = 'infowelttallis@gmail.com';
```

---

## Step 4: Generate Correct Password Hash

If you need to generate a new password hash, use this Node.js script:

```javascript
// generate-hash.js
const bcrypt = require('bcryptjs');

const password = '40045355@Peter';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);
```

Run it:
```bash
node generate-hash.js
```

---

## Step 5: Verify Login Configuration

### Check Auth Service Configuration

**File:** `services/auth-service/.env`
```env
DB_HOST=restpoint_mariadb
DB_PORT=3306
DB_USER=restpoint_user
DB_PASSWORD=RestPointUser2024
JWT_SECRET=RestPointJWTSecret2024ChangeMe!SuperSecureInProduction
```

### Check API Endpoint

**File:** `FrontendClient/client/src/api/authApi.js`
```javascript
// Verify the login endpoint
export const authApi = {
  login: async (credentials) => {
    const response = await axios.post('/api/v1/auth/login', credentials);
    return response.data;
  }
};
```

### Check Axios Configuration

**File:** `FrontendClient/client/src/api/axios.js`
```javascript
// Verify base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
```

---

## Step 6: Test Login

### Test with cURL

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "infowelttallis@gmail.com",
    "password": "40045355@Peter"
  }'
```

### Expected Response

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "infowelttallis@gmail.com",
    "fullName": "System Administrator",
    "role": "systemadmin",
    "branchId": null,
    "dbName": "welt_tallis_main",
    "isActive": true,
    "isVerified": true
  },
  "tenant": {
    "tenantId": 1,
    "tenantName": "Welt Tallis Technologies",
    "tenantSlug": "welt-tallis",
    "dbName": "welt_tallis_main"
  }
}
```

---

## Step 7: Troubleshooting Login Issues

### Issue 1: "Invalid email or password"

**Check:**
1. Verify user exists in database:
   ```sql
   SELECT * FROM tenant_tracking.users WHERE email = 'infowelttallis@gmail.com';
   ```

2. Verify password hash is correct:
   ```sql
   SELECT email, password_hash, role, is_active FROM tenant_tracking.users 
   WHERE email = 'infowelttallis@gmail.com';
   ```

3. Check if password matches:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.compareSync('40045355@Peter', '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'));"
   ```

### Issue 2: "No token received"

**Check:**
1. Verify JWT_SECRET is set in .env
2. Check auth service logs for errors
3. Verify database connection is working

### Issue 3: "Tenant not found"

**Check:**
1. Verify tenant exists in tenant_tracking.tenants
2. Check if tenant status is 'active'
3. Verify db_name is correct

### Issue 4: Login works but redirects to wrong page

**Check:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Application > Local Storage for:
   - authToken
   - user (should contain role: "systemadmin")
   - tenantSlug
4. Check Network tab for API responses

---

## Step 8: Quick Setup Script

Create a file called `setup-system-admin.sql`:

```sql
-- System Admin Setup Script
-- Run this in MariaDB

USE restpoint_main;

-- Create tenant_tracking database if not exists
CREATE DATABASE IF NOT EXISTS tenant_tracking;
USE tenant_tracking;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_slug VARCHAR(255) UNIQUE NOT NULL,
    db_name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location TEXT,
    country VARCHAR(100),
    logo_url VARCHAR(500),
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
    subscription_expires_at TIMESTAMP NULL,
    deployment_type ENUM('single', 'multi') DEFAULT 'single',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_deployment_type (deployment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin',
    tenant_id INT NOT NULL,
    branch_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert system admin tenant
INSERT INTO tenants (
    tenant_name, 
    tenant_slug, 
    db_name, 
    email, 
    phone, 
    location, 
    country, 
    status, 
    subscription_status,
    deployment_type
) VALUES (
    'Welt Tallis Technologies',
    'welt-tallis',
    'welt_tallis_main',
    'infowelttallis@gmail.com',
    '+254700000000',
    'Nairobi',
    'Kenya',
    'active',
    'active',
    'single'
) ON DUPLICATE KEY UPDATE tenant_name = tenant_name;

-- Get tenant_id
SET @tenant_id = (SELECT tenant_id FROM tenants WHERE email = 'infowelttallis@gmail.com');

-- Insert system admin user
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    tenant_id, 
    is_verified, 
    is_active
) VALUES (
    'infowelttallis@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator',
    '+254700000000',
    'systemadmin',
    @tenant_id,
    1,
    1
) ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'systemadmin',
    is_active = 1,
    is_verified = 1;

-- Verify
SELECT 'System admin user created!' AS message;
SELECT u.user_id, u.email, u.full_name, u.role, u.is_active, t.tenant_name 
FROM users u
JOIN tenants t ON u.tenant_id = t.tenant_id
WHERE u.email = 'infowelttallis@gmail.com';
```

Run the script:
```bash
docker exec -i restpoint_mariadb mysql -u root -pRestPoint2024! < setup-system-admin.sql
```

---

## Step 9: Verify Everything Works

1. **Check database:**
   ```sql
   SELECT * FROM tenant_tracking.users WHERE email = 'infowelttallis@gmail.com';
   ```

2. **Test login API:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"infowelttallis@gmail.com","password":"40045355@Peter"}'
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Try logging in
   - Look for any errors

4. **Check localStorage:**
   - Open DevTools (F12)
   - Go to Application tab
   - Check Local Storage
   - Verify authToken, user, and tenantSlug are set

---

## 📋 Summary

**Login Credentials:**
- Email: `infowelttallis@gmail.com`
- Password: `40045355@Peter`
- Role: `systemadmin`

**Database:**
- Host: `restpoint_mariadb`
- Port: `3306`
- User: `restpoint_user`
- Password: `RestPointUser2024`

**After Setup:**
1. Login at `/login`
2. Should redirect to `/system-admin`
3. System admin dashboard should load

---

**Last Updated:** 2026-01-13  
**Status:** Ready for deployment
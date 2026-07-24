# Database Migration & Integration Fixes Summary

## ✅ Completed Tasks

### 1. Frontend-Backend Field Mapping Analysis

**Analyzed:** `FrontendClient/client/src/components/deceased/register/deceasedIntake.jsx`

**Fields sent by frontend:**

- Admission: admission_number, date_admitted, time_received, received_from, receiving_officer
- Deceased: full_name, gender, age, date_of_birth, date_of_death, cause_of_death, body_status, place_of_death, physician, identifying_marks
- ID: national_id, id_type
- Contact: tel_number, alternative_phone, email
- Next of Kin: contact_person, relationship
- Signature: signature (base64 PNG)
- Verification: verified_by

### 2. Database Schema Updates (`init-db.sql/init.sql`)

**Updated `deceased` table with ALL fields:**

```sql
- deceased_id (VARCHAR 50, UNIQUE)
- tenant_slug (VARCHAR 255)
- admission_number (VARCHAR 100, UNIQUE)
- full_name (VARCHAR 255)
- gender (ENUM: Male, Female, Other)
- age (INT)
- date_of_birth (DATE)
- date_of_death (DATE)
- date_admitted (DATETIME)
- time_received (TIME)
- cause_of_death (TEXT)
- place_of_death (VARCHAR 255)
- physician (VARCHAR 255)
- identifying_marks (TEXT)
- body_status (VARCHAR 100)
- national_id (VARCHAR 100)
- id_type (ENUM)
- email (VARCHAR 255)
- phone_number (VARCHAR 20)
- alternative_phone (VARCHAR 20)
- received_from (VARCHAR 255)
- receiving_officer (VARCHAR 255)
- signature (TEXT)
- verified_by (VARCHAR 255)
- relationship (VARCHAR 100)
- + existing fields (county, location, portal_slug, admission_status, etc.)
```

**Updated `next_of_kin` table with ALL fields:**

```sql
- id (INT, AUTO_INCREMENT)
- deceased_id (VARCHAR 50)
- tenant_slug (VARCHAR 255)
- full_name (VARCHAR 255)
- relationship (VARCHAR 100)
- contact (VARCHAR 30)
- email (VARCHAR 255)
- alternative_phone (VARCHAR 20)
- id_number (VARCHAR 100)
- id_type (ENUM)
- address (TEXT)
- is_primary (BOOLEAN)
- is_notified (BOOLEAN)
- notified_at (TIMESTAMP)
- created_by (VARCHAR 255)
- created_at, updated_at
- is_deleted, deleted_at, deleted_by
```

### 3. Backend Controller Updates

**File:** `services/deceased-service/controllers/registerDeceased.ts`

**Changes:**

- ✅ Added all missing fields to validation schema
- ✅ Updated INSERT query to save ALL 24 fields
- ✅ **AUTO-REGISTERS NEXT OF KIN** when deceased is registered
- ✅ Maps frontend fields to correct database columns:
  - `tell_no` → `phone_number`
  - `contact_person` → next of kin `full_name`
  - `relationship` → next of kin `relationship`
  - `national_id` → next of kin `id_number`
  - `id_type` → next of kin `id_type`
  - `email` → both deceased and next of kin
  - `alternative_phone` → both deceased and next of kin

**Auto-Registration Logic:**

```typescript
if (data.contact_person || data.tell_no) {
  const nextOfKinData = {
    deceased_id,
    full_name: data.contact_person || 'Not Provided',
    relationship: data.relationship || 'Not Specified',
    contact: data.tell_no || '',
    email: data.email || null,
    alternative_phone: data.alternative_phone || null,
    id_number: data.national_id || null,
    id_type: data.id_type || null,
    address: null,
    is_primary: true,
    created_by: data.verified_by || null,
  };
  await NextOfKinModel.create(req, nextOfKinData);
}
```

### 4. Signature Upload Fix

**File:** `services/deceased-service/utils/uploadSignature.ts`

**Change:**

```typescript
format: 'png',  // Changed from 'webp' to 'png'
```

**Result:** Signatures are now saved as PNG files (not WebP) for better compatibility and quality.

### 5. Autopsy/Postmortem Form Updates

**File:** `FrontendClient/client/src/components/deceased/deceasedinfo/PostmortemFormPage.jsx`

**Added fields to form:**

- `cause_of_death` (general cause)
- `custom_findings` (additional notes)
- `staff_username` (examiner username)
- `mortuary_name` (facility name)

**File:** `services/deceased-service/controllers/autopsyControl.ts`

**Changes:**

- ✅ Added `custom_findings`, `staff_username`, `mortuary_name` to save/update queries
- ✅ These fields are now persisted to the `postmortem` table
- ✅ Form pre-populates all fields from existing records

### 6. Migration Script

**File:** `init-db.sql/run_migrations.bat`

**Created Windows batch script to run migrations:**

```batch
1. Creates tenant_tracking database
2. Creates restpoint_main database with all tables
3. Runs next-of-kin migration
```

**Usage:**

```bash
# Make sure Docker is running, then:
init-db.sql\run_migrations.bat
```

## 📊 Database Schema Changes Summary

### New Fields in `deceased` Table (18 new fields)

| Field             | Type         | Purpose                                  |
| ----------------- | ------------ | ---------------------------------------- |
| tenant_slug       | VARCHAR(255) | Multi-tenant support                     |
| age               | INT          | Age at death                             |
| date_admitted     | DATETIME     | Full timestamp of admission              |
| time_received     | TIME         | Time body was received                   |
| place_of_death    | VARCHAR(255) | Location where death occurred            |
| physician         | VARCHAR(255) | Attending physician name                 |
| identifying_marks | TEXT         | Tattoos, scars, etc.                     |
| body_status       | VARCHAR(100) | Current status (In Morgue, etc.)         |
| national_id       | VARCHAR(100) | Government ID number                     |
| id_type           | ENUM         | Type of ID (national-id, passport, etc.) |
| email             | VARCHAR(255) | Contact email                            |
| phone_number      | VARCHAR(20)  | Primary phone (tell_no)                  |
| alternative_phone | VARCHAR(20)  | Secondary phone                          |
| received_from     | VARCHAR(255) | Source of body                           |
| receiving_officer | VARCHAR(255) | Staff who received body                  |
| signature         | TEXT         | Base64 or path to signature PNG          |
| verified_by       | VARCHAR(255) | Email of verifying staff                 |
| relationship      | VARCHAR(100) | Relationship to next of kin              |

### New Fields in `next_of_kin` Table (8 new fields)

| Field             | Type         | Purpose              |
| ----------------- | ------------ | -------------------- |
| tenant_slug       | VARCHAR(255) | Multi-tenant support |
| email             | VARCHAR(255) | Next of kin email    |
| alternative_phone | VARCHAR(20)  | Secondary contact    |
| id_number         | VARCHAR(100) | Government ID        |
| id_type           | ENUM         | Type of ID           |
| address           | TEXT         | Physical address     |
| is_primary        | BOOLEAN      | Primary contact flag |
| is_notified       | BOOLEAN      | Notification status  |
| notified_at       | TIMESTAMP    | When notified        |
| created_by        | VARCHAR(255) | Who registered       |
| is_deleted        | BOOLEAN      | Soft delete flag     |
| deleted_at        | DATETIME     | Deletion timestamp   |
| deleted_by        | VARCHAR(255) | Who deleted          |

## 🔄 Data Flow

### Deceased Registration Flow

```
Frontend (deceasedIntake.jsx)
    ↓
POST /api/v1/restpoint/deceased/register-deceased
    ↓
registerNewDeceased() controller
    ↓
1. Validate all fields (zod schema)
2. Save signature as PNG file
3. Generate deceased_id and admission_number
4. INSERT INTO deceased (ALL 24 fields)
5. AUTO-REGISTER next of kin (if contact_person or tell_no provided)
    ↓
Response: { success, deceased_id, admission_number, next_of_kin_registered }
```

### Next of Kin Auto-Registration

```
When deceased is registered:
- contact_person → next_of_kin.full_name
- relationship → next_of_kin.relationship
- tell_no → next_of_kin.contact
- email → next_of_kin.email
- alternative_phone → next_of_kin.alternative_phone
- national_id → next_of_kin.id_number
- id_type → next_of_kin.id_type
```

## 🚀 How to Apply Changes

### Option 1: Using Docker (Recommended)

```bash
# 1. Start Docker Desktop
# 2. Run the migration script
init-db.sql\run_migrations.bat
```

### Option 2: Manual SQL Execution

```bash
# If Docker is running:
docker-compose exec mysql mysql -u root -proot_password restpoint_main < init-db.sql/init.sql
docker-compose exec mysql mysql -u root -proot_password restpoint_main < services/deceased-service/migartions/next-of-kin.sql
```

### Option 3: Direct MySQL Connection

```bash
mysql -u root -proot_password restpoint_main < init-db.sql/init.sql
mysql -u root -proot_password restpoint_main < services/deceased-service/migartions/next-of-kin.sql
```

## ✅ Verification Checklist

After running migrations, verify:

- [ ] `deceased` table has 30+ columns including all new fields
- [ ] `next_of_kin` table has 18+ columns including email, alternative_phone, id_number, id_type
- [ ] Foreign key constraint exists: `next_of_kin.deceased_id → deceased.deceased_id`
- [ ] Indexes exist on: deceased_id, tenant_slug, admission_number, relationship
- [ ] Test registration form submits all fields successfully
- [ ] Next of kin is auto-created when deceased is registered
- [ ] Signature is saved as PNG file (not WebP)
- [ ] Autopsy form saves all fields including custom_findings, staff_username, mortuary_name

## 🔧 Files Modified

1. `init-db.sql/init.sql` - Complete database schema rewrite
2. `services/deceased-service/controllers/registerDeceased.ts` - Added all fields + auto next of kin
3. `services/deceased-service/utils/uploadSignature.ts` - Changed to PNG format
4. `FrontendClient/client/src/components/deceased/deceasedinfo/PostmortemFormPage.jsx` - Added missing fields
5. `services/deceased-service/controllers/autopsyControl.ts` - Added custom_findings, staff_username, mortuary_name
6. `init-db.sql/run_migrations.bat` - Created migration runner script

## 📝 Notes

- **Backward Compatibility:** Old records will have NULL values for new fields (safe)
- **Soft Deletes:** Both tables support soft deletes via `is_deleted` flag
- **Multi-Tenant:** All tables include `tenant_slug` for multi-tenant support
- **Audit Trail:** All tables have `created_at`, `updated_at`, `created_by` fields
- **Signature Storage:** Signatures are saved as PNG files in `uploads/signatures/` directory
- **Next of Kin:** Auto-registered as primary contact when deceased is registered

## 🐛 Known Issues & Solutions

### Issue: Docker not running

**Solution:** Start Docker Desktop before running migrations

### Issue: MySQL connection refused

**Solution:** Check `docker-compose.yml` for correct MySQL port (default: 3306)

### Issue: Permission denied on uploads folder

**Solution:** Ensure `uploads/` folder has write permissions:

```bash
chmod -R 755 uploads/
```

## 📞 Support

For issues or questions, check:

- Application logs: `logs/` directory
- MySQL logs: `docker-compose logs mysql`
- Backend logs: `docker-compose logs deceased-service`

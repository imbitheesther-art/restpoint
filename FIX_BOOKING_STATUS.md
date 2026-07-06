# Fix Booking Status - Quick Guide

## Problem
Bookings in the database have status `'confirmed'` but the frontend expects `'booked'`, so they don't show up in the UI.

## Solution

### Option 1: Run the SQL Migration (Recommended)

Execute this SQL query on your database:

```sql
-- Update all bookings with status 'confirmed' to 'booked'
UPDATE hearse_bookings 
SET status = 'booked' 
WHERE status = 'confirmed';

-- Verify the update worked
SELECT 
    status,
    COUNT(*) as count
FROM hearse_bookings 
GROUP BY status 
ORDER BY status;
```

**How to run:**
1. Open your database client (phpMyAdmin, MySQL Workbench, etc.)
2. Select your tenant database (e.g., `tenant_mumo_feuneral_home`)
3. Run the SQL query above
4. You should see all bookings now have status 'booked'

### Option 2: Restart the Hearse Service

The backend has been updated to use 'booked' status for all NEW bookings. Just restart:

```bash
cd services/hearse-service
node server.js
```

**Note:** This only fixes NEW bookings. Existing bookings with 'confirmed' status still need the SQL migration (Option 1).

---

## After Fixing

1. **Refresh the browser** (Ctrl+Shift+R)
2. Go to Bookings page
3. Click the "BOOKED" tab
4. ✅ All bookings should now appear

---

## Verification

Check your bookings:
```sql
SELECT 
    booking_id,
    booking_code,
    client_name,
    destination,
    status,
    created_at
FROM hearse_bookings
ORDER BY created_at DESC;
```

Expected result:
```
+-----------+-------------+--------------+---------------------+--------+---------------------+
| booking_id| booking_code | client_name  | destination         | status | created_at          |
+-----------+--------------+--------------+---------------------+--------+---------------------+
| 15        | BK-015       | Peter Mumo   | Nairobi to Emali    | booked | 2026-07-05 15:28:18 |
| 14        | BK-014       | John Doe     | Nairobi to Mombasa  | booked | 2026-07-05 14:20:10 |
+-----------+--------------+--------------+---------------------+--------+---------------------+
```

**All statuses should show 'booked' (not 'confirmed').**
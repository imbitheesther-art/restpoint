# Hearse Service - Fully Independent

## Overview
The Hearse Service is a **fully independent** microservice that manages all hearse fleet operations, bookings, and analytics without relying on tenant databases or other services.

## Database Architecture

### Own Database
- **Name**: `restpoint_hearses` (configured via `HEARSE_DB_NAME` env var)
- **Location**: Dedicated MySQL/MariaDB database
- **Ownership**: Managed exclusively by hearse-service

### Tables
```
1. hearses
   - id, hearse_code, hearse_name, plate_number
   - status, branch_id, branch_name
   - make, model, year, capacity
   - service_due_date, insurance_expiry
   - min_charge_ksh, max_charge_ksh

2. hearse_bookings
   - id, booking_code, hearse_id
   - client_name, client_phone, client_email
   - destination, from_timestamp, to_timestamp
   - booking_date, status
   - total_charge, paid_amount, payment_status
   - tenant_db_name (reference only, not FK)

3. drivers
   - id, driver_code, full_name
   - phone, license_number, branch_id
   - status, current_booking_id
```

## Migration System

### Knex Migrations
- Location: `./migrations/`
- Table: `knex_migrations`
- Runner: Automatic on service startup

### Migration Files
```
20260716_001_create_hearses.js       - Initial schema
20260716_002_add_status_options.js    - Status enum updates
20260716_003_add_hearse_name.js       - Hearse naming
20260716_004_add_analytics_fields.js  - Revenue tracking (total_charge, paid_amount)
20260716_005_add_vehicle_details.js   - Vehicle info (make, model, year, insurance)
```

## Independence Features

### ✅ No Tenant Database Dependencies
- All hearse data stored in **hearse-service database**
- No direct queries to tenant databases
- Hearse bookings store `tenant_db_name` as reference only (not foreign key)

### ✅ Own Analytics
- Dedicated analytics controller: `controllers/hearseAnalytics.js`
- Queries run against hearse-service database
- No dependency on analytics-service

### ✅ Self-Contained Migrations
- Migrations run automatically on startup
- Database is created if missing
- All tables defined within hearse-service

## API Endpoints

### Analytics Routes (Independent)
```
GET  /analytics/hearse-fleet
     Returns: Fleet status, utilization, revenue, maintenance, trends

GET  /analytics/hearse-period?period=30
     Returns: Daily analytics for last N days
```

### Hearse Management Routes
```
POST   /hearses                       - Register new hearse
GET    /hearses                       - List all hearses
PUT    /hearses/:id                   - Update hearse
DELETE /hearses/:id                   - Delete hearse
GET    /hearses/available             - Get available hearses
```

### Booking Routes
```
POST   /hearse-bookings               - Create booking
GET    /hearse-bookings               - List bookings
PUT    /hearse-bookings/:id/status    - Update booking status
PATCH  /hearse-bookings/:id/postpone  - Postpone booking
```

### Driver Routes
```
GET    /all-drivers                   - List all drivers
GET    /drivers/:id/bookings          - Get driver bookings
GET    /drivers/:id/dashboard         - Driver dashboard
```

## Configuration

### Environment Variables
```bash
# Database
DB_HOST=mariadb
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
HEARSE_DB_NAME=restpoint_hearses

# Service
PORT=5002
NODE_ENV=production
```

### Docker Compose
```yaml
hearse-service:
  image: hearse-service:latest
  ports:
    - "5002:5002"
  environment:
    DB_HOST: mariadb
    DB_PORT: 3306
    HEARSE_DB_NAME: restpoint_hearses
  depends_on:
    - mariadb
```

## Data Flow

### Booking Request
1. Client sends POST to `/hearse-bookings`
2. Hearse service validates hearse availability (own DB)
3. Creates booking record in `hearse_bookings` table
4. Stores `tenant_db_name` for reference
5. Emits socket event to driver portal
6. Returns booking confirmation

### Analytics Query
1. Client requests `/analytics/hearse-fleet`
2. Hearse service queries own database:
   - Fleet status from `hearses` table
   - Booking stats from `hearse_bookings` table
   - Aggregations and calculations (no external joins)
3. Returns complete analytics payload

## Independence Verification

### ✅ No External Queries
```javascript
// ❌ OLD (Tenant Database)
const result = await safeTenantQuery(dbName, 'SELECT * FROM hearses');

// ✅ NEW (Own Database)
const result = await safeQuery('SELECT * FROM hearses');
```

### ✅ Analytics Isolation
```javascript
// Dedicated analytics controller
const { getHearseFleetAnalytics } = require('./controllers/hearseAnalytics');

// Routes registered in hearse-service
router.get('/analytics/hearse-fleet', getHearseFleetAnalytics);
```

### ✅ No Migration Dependency
```javascript
// Own migration runner
const { runMigrations } = require('./database');
runMigrations().catch(err => console.error('Migration failed:', err));
```

## Benefits

1. **Scalability**: Hearse service can be scaled independently
2. **Performance**: Dedicated database connection pool
3. **Reliability**: Failures in other services don't affect hearse operations
4. **Development**: Clear boundaries for feature development
5. **Testing**: Can test hearse operations in isolation

## Troubleshooting

### Migrations Not Running
```bash
# Check database connection
docker-compose logs hearse-service | grep -i migration

# Run migrations manually
cd services/hearse-service
npm run migrate
```

### Analytics Empty
```bash
# Verify hearse data exists
SELECT COUNT(*) FROM restpoint_hearses.hearses;
SELECT COUNT(*) FROM restpoint_hearses.hearse_bookings;

# Check analytics query directly
curl http://localhost:5002/analytics/hearse-fleet
```

### Connection Issues
```bash
# Verify database is reachable
docker-compose exec mariadb mysql -u root -e "USE restpoint_hearses; SHOW TABLES;"
```

## Future Enhancements

- [ ] Hearse-specific caching layer
- [ ] Real-time fleet tracking with GPS
- [ ] Advanced predictive analytics
- [ ] Autonomous alert system for maintenance
- [ ] Cross-tenant hearse rental marketplace

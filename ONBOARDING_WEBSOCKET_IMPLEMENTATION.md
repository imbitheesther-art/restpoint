# Onboarding WebSocket Progress Tracking Implementation

## Overview
This implementation adds real-time progress tracking to the tenant onboarding process, fixing the loading timeout issue by providing live updates via WebSocket instead of a single long-running HTTP request.

## Problem Solved
- **Before**: Onboarding took 30+ seconds with no feedback, causing timeouts and poor UX
- **After**: Real-time progress updates show exactly what's happening during database creation and migrations

## Changes Made

### 1. Backend - WebSocket Progress Emission

#### File: `services/tenant-service/models/Tenant.model.ts`
- Added `axios` import for HTTP calls to socket service
- Created `emitOnboardingProgress()` function to send progress events
- Added progress callbacks at key stages:
  - Database creation (15%)
  - Database permissions (20%)
  - Migration progress (20-65%)
  - Soft delete migrations (65-80%)
  - Settings configuration (85-88%)
  - Admin user creation (90%)
  - Branch creation (95%)
  - Completion (100%)

#### File: `shared/services/migration-service.ts`
- Added optional `onProgress` callback parameter to `runTenantMigrations()`
- Callback fires after each successful migration
- Enables real-time tracking of migration progress

### 2. Frontend - Real-Time Progress Display

#### File: `FrontendClient/client/src/modules/onboarding/OnboardingFlow.jsx`
- Added Socket.IO client connection
- Created progress state management (`{ step, percent, details }`)
- Added visual progress bar component:
  - Shows current step description
  - Displays percentage complete
  - Shows detailed status messages
  - Animated gradient progress bar
- Updated button to show "Setting up... X%" during submission
- Increased timeout from 30s to 300s (5 minutes)
- Auto-joins tenant room for progress updates

### 3. Dependencies Added

#### File: `services/tenant-service/package.json`
- Added `axios` for HTTP calls to socket service
- Added `@types/axios` for TypeScript support

## How It Works

### Backend Flow
```
1. User submits onboarding form
   ↓
2. Create tenant database → Emit "Database created" (15%)
   ↓
3. Grant permissions → Emit "Database configured" (20%)
   ↓
4. Run migrations (40 migrations) → Emit progress for each (20-65%)
   ↓
5. Run soft delete migrations (38 migrations) → Emit progress (65-80%)
   ↓
6. Insert default settings → Emit "Configuring settings" (88%)
   ↓
7. Create admin user → Emit "Creating admin user" (90%)
   ↓
8. Create branches → Emit "Finalizing setup" (95%)
   ↓
9. Register tenant → Emit "Setup complete" (100%)
   ↓
10. Return success response
```

### Frontend Flow
```
1. User clicks "Complete Setup"
   ↓
2. Connect to WebSocket server (localhost:8010)
   ↓
3. Join tenant room with slug
   ↓
4. Submit form via HTTP POST
   ↓
5. Listen for 'onboarding-progress' events
   ↓
6. Update progress bar in real-time
   ↓
7. Show success message at 100%
   ↓
8. Redirect to login page
```

## WebSocket Events

### Emitted Events (Backend → Frontend)

#### `onboarding-progress`
```javascript
{
  step: "Running migrations (15/40)",
  progress: 55,
  details: "010_create_deceased_table",
  timestamp: "2026-07-01T10:02:43.453Z"
}
```

### Received Events (Frontend → Backend)

#### `join-tenant`
```javascript
{
  tenantSlug: "lee-feuneral-home",
  userId: "temp",
  userRole: "admin"
}
```

## Socket Service Integration

The implementation uses the existing socketio-service at `http://localhost:8010`:

### REST Endpoint
```
POST /emit/onboarding-progress
{
  "tenantSlug": "lee-feuneral-home",
  "data": {
    "step": "Running migrations",
    "progress": 50,
    "details": "015_create_portal_tracking_table",
    "timestamp": "2026-07-01T10:02:43.453Z"
  }
}
```

### Socket.IO Event
```javascript
io.to(`tenant_${tenantSlug}`).emit('onboarding-progress', {
  step: "...",
  progress: 50,
  details: "...",
  timestamp: "..."
});
```

## Progress Stages

| Stage | Progress | Description |
|-------|----------|-------------|
| Database Creation | 0-15% | Creating tenant database |
| Permissions | 15-20% | Granting database privileges |
| Core Migrations | 20-65% | Running 40 main migrations |
| Soft Delete | 65-80% | Enabling soft delete on 38 tables |
| Settings | 80-88% | Inserting default configuration |
| Admin User | 88-90% | Creating admin account |
| Branches | 90-95% | Creating branch records |
| Finalization | 95-100% | Saving tenant record & cleanup |

## Testing

### Prerequisites
1. Ensure socketio-service is running on port 8010
2. Ensure MariaDB is running with restpoint_user privileges
3. Ensure tenant-service is running

### Test Steps
1. Navigate to onboarding page
2. Fill in organization details
3. Create password
4. Review and accept terms
5. Click "Complete Setup"
6. Watch progress bar update in real-time
7. Verify redirect to login page on completion

### Expected Console Output
```
📡 Connected to progress socket
📦 Creating tenant database: tenant_lee_feuneral_home
✅ Database permissions granted for tenant_lee_feuneral_home
[MigrationService] 🔄 Running migration: 001_create_organizations_table
📊 Progress update: { step: "Running migrations (1/40)", progress: 21, ... }
...
✅ Tenant registered: LEE FEUNERAL HOME (lee-feuneral-home)
📊 Progress update: { step: "Complete", progress: 100, ... }
```

## Benefits

1. **No More Timeouts**: 5-minute timeout vs 30-second timeout
2. **Better UX**: Users see exactly what's happening
3. **Debugging**: Easy to identify where onboarding fails
4. **Professional**: Modern real-time feedback like AWS/Vercel deployments
5. **Scalable**: Works for any number of migrations

## Environment Variables

### Frontend (.env)
```bash
REACT_APP_SOCKET_URL=http://localhost:8010
```

### Backend (.env)
```bash
SOCKET_SERVICE_URL=http://localhost:8010
```

## Notes

- Progress updates are fire-and-forget (failures are logged but don't break onboarding)
- Socket connection has 10 reconnection attempts with 1s delay
- Progress bar uses smooth CSS transitions for visual appeal
- Works with existing socketio-service infrastructure
- No changes needed to socketio-service code (uses existing `/emit/:event` endpoint)

## Future Enhancements

1. Add progress tracking for branch creation
2. Show estimated time remaining
3. Add ability to cancel onboarding
4. Store progress in database for recovery
5. Add sound notifications on completion
6. Show migration SQL errors in UI for debugging
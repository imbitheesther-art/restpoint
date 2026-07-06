# Production Workflow Guide - Complete Coffin Building Management

## Overview

A realistic, simulated production environment for managing coffin building operations from order to delivery with real-time tracking.

## 🎯 Core Features

### 1. **Order Management**
- Create orders with customer and deceased information
- Track order status through complete lifecycle
- Automatic order number generation (CFN-YYYYMMDD-XXX)
- Real-time status updates

### 2. **Production Stages**
5-stage production pipeline:
1. **Design** - Create design specifications
2. **Cutting** - Material preparation and cutting
3. **Assembly** - Frame assembly and joining
4. **Polishing** - Sanding and surface preparation
5. **Finishing** - Staining, painting, sealing

### 3. **Worker Assignment**
- Assign workers to specific orders
- Assign workers to specific production stages
- Track worker assignments per order
- Real-time worker availability

### 4. **Material Usage Tracking**
- Record material usage per order
- Auto-deduct from inventory
- Track remaining stock
- Record usage notes/reasons
- Monitor material costs

### 5. **Status Management**
- Update order status through workflow
- Track production progress
- Mark stages as complete
- Automatic status progression

### 6. **Real-Time Updates**
- Socket.IO integration
- Live order status changes
- Real-time inventory updates
- Multi-user synchronization

## 🚀 Getting Started

### Access the Production Workflow

**URL:** `/tenant/{your-tenant-slug}/workshop/production`

Or navigate from the workshop dashboard:
1. Go to Workshop section
2. Click "Production Workflow" link

### Prerequisites

1. **Create Materials** (if none exist):
   - Go to Workshop → Materials tab
   - Add materials: wood, fabric, hardware, finishing supplies
   - Set quantities and unit prices
   - Set minimum stock levels

2. **Create Workers** (if none exist):
   - Go to Workshop → Workers tab
   - Add workers with names, emails, roles
   - Workers can be assigned to production stages

3. **Create an Order**:
   - Click "New Order" button
   - Fill in customer and deceased details
   - Set coffin type and price
   - Create order

## 📋 Production Workflow

### Step 1: Assign Worker to Order

1. Go to **Production Workflow** page
2. Find the order in "Active" tab
3. Click the **Users icon** (Assign Worker)
4. Select worker from dropdown
5. Select production stage (design, cutting, assembly, polishing, finishing)
6. Add notes (optional)
7. Click "Assign Worker"

**Result:** Order status changes to "in_production" (if was pending)

### Step 2: Record Material Usage

1. While working on the order, click the **Package icon** (Use Material)
2. Select material from dropdown (shows current stock)
3. Enter quantity used
4. Add notes (optional)
5. Click "Record Usage"

**Result:** 
- Material quantity auto-deducted from inventory
- Usage recorded with timestamp
- Real-time inventory update

### Step 3: Update Order Status

1. Click the **Play icon** (Update Status)
2. Select new status from dropdown:
   - pending → confirmed → in_production → design → cutting → assembly → polishing → finishing → quality_check → completed → delivered
3. Add notes (optional)
4. Click "Update Status"

**Result:** Order status updated, real-time notification sent

### Step 4: Complete Production Stage

When a stage is finished:
1. The system automatically moves to next stage
2. Or manually update status to next stage
3. Continue until all stages complete
4. Final status: "completed"

### Step 5: Track Completed Orders

1. Go to "Today" tab to see orders completed today
2. View "Completed" tab for all finished orders
3. See workers assigned and materials used
4. Track completion times

## 🎨 Production Stages Explained

### Design Stage
- Create design specifications
- Upload design files/images
- Approve design before proceeding
- Document special requirements

### Cutting Stage
- Prepare materials for cutting
- Generate cut lists
- Cut wood and materials
- Quality check cuts

### Assembly Stage
- Frame assembly
- Join parts together
- Initial quality check
- Document assembly details

### Polishing Stage
- Sanding operations
- Surface preparation
- Smoothing and shaping
- Quality inspection

### Finishing Stage
- Staining/painting
- Sealing
- Final quality check
- Prepare for delivery

## 📊 Dashboard Features

### Statistics Cards
- **Active Orders** - Currently in production
- **Completed Today** - Orders finished today
- **Total Materials** - Materials in inventory
- **Available Workers** - Workers that can be assigned

### Order Tabs
- **Active** - Orders currently being worked on
- **Completed** - All finished orders
- **Today** - Orders completed today

### Actions Per Order
- **Assign Worker** - Assign worker to stage
- **Use Material** - Record material consumption
- **Update Status** - Change order status

## 🔄 Real-Time Features

### Socket.IO Events

**When you:**
- Assign a worker → All users see update instantly
- Use material → Inventory updates in real-time
- Update status → All dashboards refresh automatically
- Complete stage → Next stage activates automatically

### Benefits
- Multiple users can work simultaneously
- No need to refresh page
- See changes as they happen
- Prevent double-assignments

## 💡 Usage Examples

### Example 1: Complete Coffin Production

```
1. Create Order: CFN-20260705-001 for Peter Mumo
2. Assign Worker: John Doe to Design stage
3. Create Design Specification
4. Complete Design stage → Moves to Cutting
5. Assign Worker: Jane Smith to Cutting stage
6. Use Material: 5 pieces of wood
7. Complete Cutting → Moves to Assembly
8. Continue through all stages...
9. Final stage: Finishing
10. Mark as Completed
11. Order appears in "Today" tab
```

### Example 2: Material Management

```
1. Check inventory: 100 pieces of wood
2. Start working on Order #123
3. Use 5 pieces for cutting
4. Inventory auto-updates: 95 pieces remaining
5. Use 3 pieces for assembly
6. Inventory: 92 pieces remaining
7. Low stock alert when below threshold
```

### Example 3: Worker Management

```
1. View available workers: 5 workers
2. Assign John to Design stage
3. Assign Jane to Cutting stage
4. Both workers see their assignments
5. Track hours worked per assignment
6. Monitor worker productivity
```

## 📱 Interface Guide

### Production Workflow Page

**Header:**
- Title: "Production Workflow"
- Refresh button to reload data

**Stats Grid:**
- 4 cards showing key metrics
- Updates in real-time

**Orders Section:**
- 3 tabs: Active, Completed, Today
- Table showing orders
- Action buttons per order

**Modals:**
- Assign Worker Modal
- Use Material Modal
- Update Status Modal

### Workshop Dashboard

**Header:**
- Title: "Workshop Production Management"
- Buttons: Stock Intake, New Order

**Stats:**
- Total Orders
- In Production
- Completed
- Low Stock Items
- Total Revenue
- Materials

**Tabs:**
- Orders - View all orders
- Materials - Manage inventory
- Workers - Manage workforce

## 🔧 Technical Details

### API Endpoints Used

**Production Workflow:**
- `POST /workshop/orders/:id/assign-worker` - Assign worker
- `POST /workshop/orders/:id/use-material` - Record material usage
- `PATCH /workshop/orders/:id/status` - Update status
- `GET /workshop/orders/today/completed` - Get today's completions
- `GET /workshop/orders/:id/timeline` - Get order timeline
- `POST /workshop/orders/:id/complete-stage` - Complete stage

**Materials:**
- `GET /workshop/materials` - List materials
- `POST /workshop/materials/use` - Use material (legacy)

**Orders:**
- `GET /workshop/orders` - List orders
- `GET /workshop/orders/:id` - Get order details

### Socket Events

**Listening:**
- `order:updated` - Order status changed
- `material:used` - Material consumed
- `worker:assigned` - Worker assigned to order
- `stage:completed` - Production stage completed

**Emitting:**
- Automatic on all state changes

## 📈 Production Metrics

### Track Performance
- Orders completed per day
- Average production time per coffin
- Material usage per order
- Worker productivity
- Cost per coffin
- Profit margins

### Reports Available
- Daily production report
- Weekly trends
- Inventory status
- Worker performance
- Costing analysis

## 🎯 Best Practices

### 1. **Order Workflow**
- Always assign worker before starting
- Record materials as you use them
- Update status at each stage
- Complete stages in order

### 2. **Material Management**
- Check stock before starting
- Record usage immediately
- Monitor low stock alerts
- Reorder when below threshold

### 3. **Worker Management**
- Assign workers based on skills
- Track hours worked
- Balance workload
- Monitor performance

### 4. **Quality Control**
- Complete quality check stage
- Document issues
- Approve before delivery
- Track defects

## 🐛 Troubleshooting

### Issue: Can't assign worker
**Solution:** Make sure worker exists in system (Workers tab)

### Issue: Material not deducting
**Solution:** Check material has sufficient stock

### Issue: Status not updating
**Solution:** Ensure valid status selected

### Issue: Real-time not working
**Solution:** Check Socket.IO connection (yellow warning shows if disconnected)

## 📞 Support

For issues or questions:
1. Check this guide
2. Review API documentation
3. Check browser console for errors
4. Verify database connections
5. Ensure Socket.IO is running

## 🎉 Ready for Production

The system is now ready for real coffin production management:
- ✅ Create and manage orders
- ✅ Assign workers to stages
- ✅ Track material usage with auto-deduct
- ✅ Update order status through workflow
- ✅ Real-time updates across all users
- ✅ Track completed orders
- ✅ Monitor production metrics
- ✅ Professional, modern interface

Start managing your coffin production efficiently!
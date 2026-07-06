# Workshop Production Management System

A comprehensive coffin building production tracking system with real-time updates, material inventory management, PDF work order generation, and advanced analytics.

## Features

### 1. Order Management
- **Full Order Lifecycle**: pending → confirmed → in_production → quality_check → completed → delivered
- **Order Details**: Customer information, deceased details, coffin specifications
- **Order Numbering**: Automatic generation (CFN-YYYYMMDD-XXX format)
- **Status Tracking**: Real-time status updates across all production stages

### 2. Production Stages
Complete production pipeline with 5 stages:
- **Design**: Create and approve design specifications
- **Cutting**: Material preparation and cutting
- **Assembly**: Frame assembly and joining
- **Polishing**: Sanding and surface preparation
- **Finishing**: Staining, painting, and sealing

Each stage includes:
- Status tracking (pending, in_progress, completed)
- Start/completion timestamps
- Worker assignments
- Notes and documentation

### 3. Material Inventory Management
- **Stock Tracking**: Real-time inventory levels
- **Low Stock Alerts**: Automatic alerts when materials fall below threshold
- **Material Categories**: Wood, fabric, hardware, finishing materials
- **Search & Filter**: Find materials by name or category
- **Unit Tracking**: Track by pieces, meters, liters, etc.

### 4. Material Intake System
Record incoming stock with:
- Material selection
- Quantity received
- Unit cost
- Supplier information
- Invoice number
- Received by (user)
- Notes

Auto-updates inventory levels on intake.

### 5. Material Usage Tracking
When materials are used in production:
- Record which order consumed materials
- Track quantity used
- Capture cost at time of usage
- Auto-deduct from inventory
- Add notes/reason for usage
- Track total cost per order

### 6. Worker Management
- Register workers with contact details
- Assign workers to specific production stages
- Track hours worked per assignment
- Monitor worker performance
- Role-based access (worker, manager)

### 7. Design Specifications
- Create design specs for each order
- Upload design files/images
- Approval workflow (draft → pending_approval → approved/rejected)
- Detailed specifications and notes

### 8. PDF Work Order Generation
Automatically generate professional work orders including:
- Order information (customer, deceased, coffin details)
- Production stages with timelines
- Worker assignments
- Materials used with costs
- Costing summary (materials, labor, overhead, profit)
- Additional notes

### 9. Real-Time Tracking
Socket.IO integration for:
- Live order status updates
- Material inventory changes
- Production stage updates
- Worker assignment notifications
- Real-time dashboard refresh

### 10. Analytics & Reporting

#### Dashboard Statistics
- Total Orders (today/month)
- Orders In Production
- Completed Orders
- Low Stock Items
- Total Revenue
- Material Count

#### Charts & Visualizations
- **Order Status Distribution**: See breakdown of orders by status
- **Production Stages**: Track completion across all stages
- **Stage Progress**: Visual progress bars for each production stage

#### Reports
- **Daily Report**: Orders, revenue, materials used
- **Weekly Report**: Trends and breakdowns
- **Inventory Report**: Stock levels, low stock alerts, usage trends
- **Production Report**: Stage distribution, worker performance
- **Costing Report**: Profit margins, cost analysis by coffin type

### 11. Material Search & Filter
- Search by material name
- Filter by category
- Filter by low stock status
- Sort by name, category, or quantity

## Database Schema

### Core Tables

#### coffin_orders
- Order details (customer, deceased, coffin specs)
- Status tracking
- Pricing and delivery information
- Timestamps for order lifecycle

#### materials
- Material inventory
- Category and unit tracking
- Stock levels and thresholds
- Unit pricing

#### material_usage
- Records material consumption per order
- Links orders to materials
- Tracks quantities and costs
- Timestamps for usage

#### material_intake
- Records incoming stock
- Supplier and invoice tracking
- Cost tracking
- Receiving user documentation

#### production_stages
- 5-stage production pipeline
- Status and timestamps per stage
- Notes and documentation
- Unique constraint per order/stage

#### worker_assignments
- Worker-to-order assignments
- Stage-specific assignments
- Hours worked tracking
- Completion timestamps

#### costing
- Materials cost
- Labor cost
- Overhead cost
- Total cost and profit calculations
- Profit margin tracking

#### design_specifications
- Design documents per order
- Specifications (JSON)
- Design files (JSON array)
- Approval status

## API Endpoints

### Orders
- `GET /workshop/orders` - List all orders
- `GET /workshop/orders/:id` - Get order details
- `POST /workshop/orders` - Create new order
- `PATCH /workshop/orders/:id` - Update order
- `DELETE /workshop/orders/:id` - Delete order

### Production Stages
- `GET /workshop/orders/:orderId/stages` - Get stages for order
- `PATCH /workshop/orders/:orderId/stages/:stageId` - Update stage status

### Worker Assignments
- `GET /workshop/assignments` - List all assignments
- `POST /workshop/orders/:orderId/assign` - Assign worker to stage
- `PATCH /workshop/assignments/:id` - Update assignment

### Materials
- `GET /workshop/materials` - List materials (with filters)
- `GET /workshop/materials/:id` - Get material details
- `POST /workshop/materials` - Create material
- `PATCH /workshop/materials/:id` - Update material
- `DELETE /workshop/materials/:id` - Delete material
- `POST /workshop/materials/use` - Record material usage
- `POST /workshop/materials/intake` - Record material intake
- `GET /workshop/materials/intake` - Get intake history

### Workers
- `GET /workshop/workers` - List workers
- `POST /workshop/workers` - Create worker
- `PATCH /workshop/workers/:id` - Update worker
- `DELETE /workshop/workers/:id` - Delete worker

### Work Orders & Designs
- `GET /workshop/orders/:id/work-order/pdf` - Download work order PDF
- `POST /workshop/orders/:id/design` - Save design specification
- `GET /workshop/orders/:id/design` - Get design specification

### Reports
- `GET /workshop/reports/daily` - Daily production report
- `GET /workshop/reports/weekly` - Weekly production report
- `GET /workshop/reports/inventory` - Inventory status report
- `GET /workshop/reports/production` - Production performance report
- `GET /workshop/reports/costing` - Costing analysis report

## Frontend Components

### Enhanced Workshop Dashboard
Main dashboard with:
- Statistics cards with icons
- Real-time analytics charts
- Tabbed interface (Orders, Materials, Workers)
- Search and filter capabilities
- Modal dialogs for CRUD operations
- Material intake recording
- Design specification management
- PDF work order download

### Key Features
- **Real-time Updates**: Socket.IO integration for live data
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional interface
- **Status Badges**: Color-coded status indicators
- **Production Timeline**: Visual timeline of order progress
- **Material Search**: Quick material lookup
- **Low Stock Alerts**: Visual indicators for low inventory

## Installation

### Backend
```bash
cd services/workshop-service
npm install
npm run dev
```

### Frontend
```bash
cd FrontendClient/client
npm install
npm run dev
```

## Environment Variables

### Workshop Service (.env)
```
PORT=6969
DB_NAME=restpoint_main
CORS_ORIGIN=http://localhost:5173,http://localhost:8082
NODE_ENV=development
```

## Socket.IO Events

### Emitted Events
- `order:created` - New order created
- `order:updated` - Order updated
- `order:deleted` - Order deleted
- `material:created` - New material added
- `material:updated` - Material updated
- `material:used` - Material usage recorded

### Listening Events
Clients listen for these events to update UI in real-time.

## Usage

### Creating an Order
1. Click "New Order" button
2. Fill in customer and deceased information
3. Select coffin type and enter price
4. Set delivery date
5. Add any notes
6. Click "Create Order"

### Recording Material Intake
1. Click "Stock Intake" button
2. Select material from dropdown
3. Enter quantity received
4. Enter unit cost (optional)
5. Add supplier and invoice details
6. Click "Record Intake"

### Tracking Production
1. View order details by clicking eye icon
2. Monitor production timeline
3. Update stage statuses as work progresses
4. Assign workers to specific stages
5. Record material usage per stage

### Generating Work Order PDF
1. Open order details
2. Click "Download Work Order"
3. PDF generates automatically with all order information

### Managing Materials
1. Go to Materials tab
2. Use search to find materials
3. Filter by category
4. Monitor stock levels
5. Record usage when materials are consumed

## Production Workflow

```
1. Order Created
   ↓
2. Design Phase
   - Create design specification
   - Upload design files
   - Approve design
   ↓
3. Cutting Phase
   - Prepare materials
   - Generate cut list
   - Cut materials
   ↓
4. Assembly Phase
   - Frame assembly
   - Join parts
   - Quality check
   ↓
5. Polishing Phase
   - Sanding
   - Surface preparation
   ↓
6. Finishing Phase
   - Staining/painting
   - Sealing
   - Final quality check
   ↓
7. Order Completed
   - Generate work order PDF
   - Update inventory
   - Mark as delivered
```

## Costing Calculation

### Materials Cost
- Sum of all material usage costs for the order

### Labor Cost
- Sum of (hours_worked × hourly_rate) for all worker assignments
- Default hourly rate: $15/hour

### Overhead Cost
- 10% of materials cost

### Total Cost
- Materials + Labor + Overhead

### Profit
- Selling Price - Total Cost

### Profit Margin
- (Profit / Selling Price) × 100

## Multi-Tenant Support

The system supports multiple tenants with:
- Tenant-specific databases
- Tenant resolution middleware
- Data isolation per tenant
- Shared system resources

## Real-Time Features

All updates are broadcast via Socket.IO:
- New orders appear instantly
- Status changes update immediately
- Inventory levels stay current
- Production stages update in real-time
- Multiple users see same data simultaneously

## Security

- JWT-based authentication
- Tenant-based data isolation
- Role-based access control
- Secure API endpoints
- CORS protection

## Future Enhancements

- Advanced Gantt chart for production timeline
- Material barcode scanning
- Automated material reordering
- Worker performance analytics
- Mobile app for workers
- Integration with accounting software
- Email notifications for status changes
- Advanced reporting with export to Excel
- Quality control checklists
- Photo documentation per stage

## Support

For issues or questions:
1. Check the documentation
2. Review API endpoints
3. Check browser console for errors
4. Verify database connections
5. Ensure Socket.IO is running

## License

Proprietary - REST POINT Funeral Management System
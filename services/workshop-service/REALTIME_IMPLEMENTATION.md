# Workshop Service - Real-Time Processing Implementation

## Overview
The workshop service now has comprehensive real-time processing capabilities using Socket.IO. All CRUD operations emit events that frontend clients can listen to for live updates.

## Socket Events

### Server → Client Events

#### Order Events
- `order:created` - New order created
- `order:updated` - Order details updated
- `order:deleted` - Order deleted

#### Worker Events
- `worker:created` - New worker added
- `worker:updated` - Worker details updated
- `worker:deleted` - Worker removed
- `worker:assigned` - Worker assigned to order stage
- `worker:assignment:updated` - Worker assignment updated (hours, notes, etc.)

#### Material Events
- `material:created` - New material added to inventory
- `material:updated` - Material details updated
- `material:deleted` - Material removed
- `material:used` - Material consumed in production
- `material:low-stock` - Material stock below minimum level

#### Production Events
- `production:stage:updated` - Production stage status changed

### Client → Server Events

#### Room Management
- `join_tenant` - Join tenant-specific room (tenantSlug)
- `join_branch` - Join branch-specific room (branchId)
- `join_admin` - Join admin room for system-wide notifications

## Frontend Implementation

### 1. Socket Context (Already Implemented)
The socket context automatically joins tenant and branch rooms on connection.

**File:** `FrontendClient/client/src/context/socketContext.jsx`

```javascript
// Automatically joins rooms on connect
socketInstance.on('connect', () => {
    const tenantSlug = localStorage.getItem('tenantSlug') || 'default';
    socketInstance.emit('join_tenant', tenantSlug);
    
    const branchId = localStorage.getItem('branchId');
    if (branchId) {
        socketInstance.emit('join_branch', branchId);
    }
});
```

### 2. Using the useSocketEvents Hook

**File:** `FrontendClient/client/src/components/workshop/hooks/useSocketEvents.js`

```javascript
import { useSocketEvents } from './hooks/useSocketEvents';

function WorkshopDashboard() {
    const [orders, setOrders] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    useSocketEvents({
        // Order events
        onOrderCreated: (order) => {
            setOrders(prev => [order, ...prev]);
            showNotification(`New order ${order.order_number} created`);
        },
        onOrderUpdated: (order) => {
            setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        },
        onOrderDeleted: (data) => {
            setOrders(prev => prev.filter(o => o.id !== data.id));
        },
        
        // Worker events
        onWorkerAssigned: (assignment) => {
            // Update order with new worker assignment
            setOrders(prev => prev.map(order => {
                if (order.id === assignment.coffin_order_id) {
                    return {
                        ...order,
                        assignments: [...(order.assignments || []), assignment]
                    };
                }
                return order;
            }));
        },
        
        // Material events
        onMaterialUsed: (usage) => {
            // Update material inventory
            setMaterials(prev => prev.map(m => {
                if (m.id === usage.material_id) {
                    return { ...m, quantity: m.quantity - usage.quantity_used };
                }
                return m;
            }));
            
            // Update order cost
            setOrders(prev => prev.map(order => {
                if (order.id === usage.coffin_order_id) {
                    return {
                        ...order,
                        total_cost: (order.total_cost || 0) + (usage.quantity_used * usage.unit_cost)
                    };
                }
                return order;
            }));
        },
        onMaterialLowStock: (material) => {
            showNotification(`Low stock alert: ${material.name}`, 'warning');
            // Highlight material in red in the UI
        },
        
        // Production events
        onProductionStageStart: (stage) => {
            setOrders(prev => prev.map(order => {
                if (order.id === stage.coffin_order_id) {
                    return {
                        ...order,
                        stages: order.stages?.map(s => 
                            s.id === stage.id ? stage : s
                        )
                    };
                }
                return order;
            }));
        }
    });
    
    // ... rest of component
}
```

### 3. Example: Real-Time Active Orders Table

```javascript
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';

const ActiveOrdersTable = ({ orders, onViewOrder, onDownloadPDF }) => {
    const [localOrders, setLocalOrders] = useState(orders);
    const { connected } = useSocket();

    // Sync with parent orders
    useEffect(() => {
        setLocalOrders(orders);
    }, [orders]);

    // Listen to real-time events
    useSocketEvents({
        onOrderCreated: (order) => {
            setLocalOrders(prev => [order, ...prev]);
        },
        onOrderUpdated: (updatedOrder) => {
            setLocalOrders(prev => 
                prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
            );
        },
        onOrderDeleted: (data) => {
            setLocalOrders(prev => prev.filter(order => order.id !== data.id));
        },
        onWorkerAssigned: (assignment) => {
            setLocalOrders(prev => 
                prev.map(order => 
                    order.id === assignment.coffin_order_id
                        ? { ...order, assignments: [...(order.assignments || []), assignment] }
                        : order
                )
            );
        },
        onMaterialUsed: (usage) => {
            setLocalOrders(prev =>
                prev.map(order =>
                    order.id === usage.coffin_order_id
                        ? { ...order, total_cost: (order.total_cost || 0) + usage.quantity_used * usage.unit_cost }
                        : order
                )
            );
        },
        onProductionStageUpdated: (stage) => {
            setLocalOrders(prev =>
                prev.map(order =>
                    order.id === stage.coffin_order_id
                        ? {
                            ...order,
                            stages: order.stages?.map(s => s.id === stage.id ? stage : s)
                        }
                        : order
                )
            );
        }
    });

    if (!localOrders || localOrders.length === 0) {
        return (
            <Section>
                <SectionHeader>
                    <SectionTitle><ClipboardList size={18} /> Active Production Queue</SectionTitle>
                </SectionHeader>
                <EmptyState>
                    <ClipboardList size={48} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p>No orders yet. Create your first coffin order to start production.</p>
                </EmptyState>
            </Section>
        );
    }

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <ClipboardList size={18} /> 
                    Active Production Queue 
                    {connected && <span style={{ color: '#14DD3C', fontSize: '0.8rem' }}>● Live</span>}
                </SectionTitle>
                <Button onClick={onViewAll}>
                    View All <ChevronRight size={14} />
                </Button>
            </SectionHeader>
            <Table>
                <thead>
                    <tr>
                        <Th>Order #</Th>
                        <Th>Customer / Deceased</Th>
                        <Th>Type</Th>
                        <Th>Stage</Th>
                        <Th>Progress</Th>
                        <Th>Actions</Th>
                    </tr>
                </thead>
                <tbody>
                    {localOrders.slice(0, 6).map(order => (
                        <Tr key={order.id} onClick={() => onViewOrder(order.id)}>
                            <Td><strong>{order.order_number || `#${order.id}`}</strong></Td>
                            <Td>
                                <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                                <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                                    Deceased: {order.deceased_name}
                                </div>
                            </Td>
                            <Td style={{ textTransform: 'capitalize' }}>{order.coffin_type}</Td>
                            <Td>{getStatusBadge(order.status)}</Td>
                            <Td>
                                <MiniProgress $percent={getProgress(order)}>
                                    <div />
                                </MiniProgress>
                                {getProgress(order)}%
                            </Td>
                            <Td>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <Button style={{ padding: '0.35rem 0.6rem' }} 
                                        onClick={(e) => { e.stopPropagation(); onViewOrder(order.id); }}>
                                        <Eye size={14} />
                                    </Button>
                                    <Button style={{ padding: '0.35rem 0.6rem' }}
                                        onClick={(e) => { e.stopPropagation(); onDownloadPDF(order.id); }}>
                                        <Download size={14} />
                                    </Button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </Table>
        </Section>
    );
};

export default ActiveOrdersTable;
```

### 4. Example: Real-Time Materials Inventory

```javascript
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';

const MaterialsInventory = ({ materials }) => {
    const [localMaterials, setLocalMaterials] = useState(materials);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const { connected } = useSocket();

    useEffect(() => {
        setLocalMaterials(materials);
    }, [materials]);

    useSocketEvents({
        onMaterialCreated: (material) => {
            setLocalMaterials(prev => [...prev, material]);
            showNotification(`Material "${material.name}" added to inventory`);
        },
        onMaterialUpdated: (updated) => {
            setLocalMaterials(prev => 
                prev.map(m => m.id === updated.id ? updated : m)
            );
        },
        onMaterialDeleted: (data) => {
            setLocalMaterials(prev => prev.filter(m => m.id !== data.id));
        },
        onMaterialUsed: (usage) => {
            setLocalMaterials(prev =>
                prev.map(m => {
                    if (m.id === usage.material_id) {
                        const newQuantity = m.quantity - usage.quantity_used;
                        // Check if this triggers low stock
                        if (newQuantity <= m.min_stock_level && m.quantity > m.min_stock_level) {
                            setLowStockAlerts(prev => [...prev, m]);
                            showNotification(`Low stock: ${m.name}`, 'warning');
                        }
                        return { ...m, quantity: newQuantity };
                    }
                    return m;
                })
            );
        },
        onMaterialLowStock: (material) => {
            setLowStockAlerts(prev => {
                if (!prev.find(m => m.id === material.id)) {
                    return [...prev, material];
                }
                return prev;
            });
            showNotification(`⚠️ Low stock alert: ${material.name} (${material.quantity} ${material.unit} remaining)`, 'warning');
        }
    });

    return (
        <Section>
            <SectionHeader>
                <SectionTitle>
                    <Package size={18} /> 
                    Materials Inventory 
                    {connected && <span style={{ color: '#14DD3C', fontSize: '0.8rem' }}>● Live</span>}
                </SectionTitle>
            </SectionHeader>
            
            {lowStockAlerts.length > 0 && (
                <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{ color: '#F59E0B', margin: '0 0 0.5rem 0' }}>
                        ⚠️ Low Stock Alerts ({lowStockAlerts.length})
                    </h4>
                    {lowStockAlerts.map(material => (
                        <div key={material.id} style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            • {material.name}: {material.quantity} {material.unit} remaining
                            (min: {material.min_stock_level} {material.unit})
                        </div>
                    ))}
                </div>
            )}

            <Table>
                <thead>
                    <tr>
                        <Th>Material</Th>
                        <Th>Category</Th>
                        <Th>In Stock</Th>
                        <Th>Unit Price</Th>
                        <Th>Status</Th>
                    </tr>
                </thead>
                <tbody>
                    {localMaterials.map(material => {
                        const isLowStock = material.quantity <= material.min_stock_level;
                        return (
                            <Tr key={material.id}>
                                <Td><strong>{material.name}</strong></Td>
                                <Td>{material.category}</Td>
                                <Td>
                                    <span style={{ 
                                        color: isLowStock ? '#EF4444' : 'inherit',
                                        fontWeight: isLowStock ? 700 : 500
                                    }}>
                                        {material.quantity} {material.unit}
                                    </span>
                                </Td>
                                <Td>₹{material.unit_price}</Td>
                                <Td>
                                    {isLowStock ? (
                                        <Badge $status="warning">Low Stock</Badge>
                                    ) : (
                                        <Badge $status="success">In Stock</Badge>
                                    )}
                                </Td>
                            </Tr>
                        );
                    })}
                </tbody>
            </Table>
        </Section>
    );
};

export default MaterialsInventory;
```

### 5. Example: Real-Time Worker Assignments

```javascript
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';

const WorkerAssignments = ({ orderId, assignments }) => {
    const [localAssignments, setLocalAssignments] = useState(assignments);
    const { connected } = useSocket();

    useEffect(() => {
        setLocalAssignments(assignments);
    }, [assignments]);

    useSocketEvents({
        onWorkerAssigned: (assignment) => {
            if (assignment.coffin_order_id === orderId) {
                setLocalAssignments(prev => [...prev, assignment]);
                showNotification(`Worker assigned to stage: ${assignment.stage}`);
            }
        },
        onWorkerAssignmentUpdated: (updated) => {
            setLocalAssignments(prev =>
                prev.map(a => a.id === updated.id ? updated : a)
            );
        }
    });

    return (
        <div>
            <h4>
                Worker Assignments 
                {connected && <span style={{ color: '#14DD3C', fontSize: '0.8rem' }}>● Live</span>}
            </h4>
            {localAssignments.map(assignment => (
                <div key={assignment.id} style={{ 
                    padding: '0.75rem', 
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{ fontWeight: 600 }}>
                        {assignment.first_name} {assignment.last_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-dark)' }}>
                        Stage: {assignment.stage}
                    </div>
                    {assignment.hours_worked > 0 && (
                        <div style={{ fontSize: '0.85rem' }}>
                            Hours: {assignment.hours_worked}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WorkerAssignments;
```

## Testing Real-Time Features

### 1. Start the Workshop Service
```bash
cd services/workshop-service
npm run dev
```

You should see:
```
[WORKSHOP] Socket.io initialized with room support
[WORKSHOP] Workshop Service
   Port: 6969
```

### 2. Connect a Frontend Client
```javascript
import { useSocket } from './context/socketContext';

function TestComponent() {
    const { socket, connected } = useSocket();
    
    useEffect(() => {
        if (!socket) return;
        
        // Listen for order created event
        socket.on('order:created', (order) => {
            console.log('New order created:', order);
        });
        
        // Listen for material low stock
        socket.on('material:low-stock', (material) => {
            console.log('Low stock alert:', material);
        });
        
        return () => {
            socket.off('order:created');
            socket.off('material:low-stock');
        };
    }, [socket]);
    
    return (
        <div>
            <p>Socket Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        </div>
    );
}
```

### 3. Test Events from Backend
```bash
# Create a new order via API
curl -X POST http://localhost:6969/api/workshop/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "deceased_name": "Jane Doe",
    "coffin_type": "standard",
    "selling_price": 50000
  }'

# The frontend should receive order:created event in real-time
```

## Backend Socket Helper Functions

The socket.ts module exports helper functions for targeted broadcasting:

```typescript
import { emitToTenant, emitToBranch, emitToAll } from './socket';

// Emit to specific tenant
emitToTenant('my-tenant-slug', 'custom:event', { data: 'value' });

// Emit to specific branch
emitToBranch('branch-123', 'custom:event', { data: 'value' });

// Emit to all connected clients
emitToAll('global:event', { data: 'value' });
```

## Room-Based Broadcasting

### Tenant Rooms
- Room name: `tenant:{tenantSlug}`
- Used for: Multi-tenant data isolation
- Example: `tenant:abc-funeral-home`

### Branch Rooms
- Room name: `branch:{branchId}`
- Used for: Branch-specific updates
- Example: `branch:5`

### Admin Rooms
- Room name: `admin`
- Used for: System-wide admin notifications

## Event Flow Example

### Creating an Order (Real-Time Flow)

1. **Frontend** → POST `/api/workshop/orders`
2. **Backend** → Creates order in database
3. **Backend** → Emits `order:created` event
4. **Socket.IO** → Broadcasts to all connected clients in tenant room
5. **Frontend** → Receives event via `useSocketEvents`
6. **Frontend** → Updates UI in real-time

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Frontend│                    │ Backend │                    │ Database│
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                             │                             │
     │  POST /api/workshop/orders  │                             │
     │────────────────────────────>│                             │
     │                             │  INSERT INTO coffin_orders  │
     │                             │────────────────────────────>│
     │                             │<────────────────────────────│
     │                             │                             │
     │                             │  io.emit('order:created')   │
     │                             │                             │
     │<────────────────────────────│─────────────────────────────│
     │  { order:created }          │                             │
     │                             │                             │
     │  Update UI                  │                             │
     │<────────────────────────────│                             │
```

## Benefits

1. **Real-Time Updates**: All users see changes instantly
2. **Multi-Tenant Isolation**: Events only broadcast to relevant tenant
3. **Branch Filtering**: Branch-specific events only go to relevant branch
4. **Reduced API Calls**: No need for polling
5. **Better UX**: Live indicators show connection status
6. **Scalable**: Room-based broadcasting is efficient

## Troubleshooting

### Socket not connecting
- Check workshop service is running on port 6969
- Verify CORS settings in socket.ts
- Check browser console for connection errors

### Events not received
- Ensure socket is connected (check `connected` state)
- Verify tenant/branch rooms are joined (check console logs)
- Make sure event names match exactly (case-sensitive)

### Multiple tabs not syncing
- Each tab has its own socket connection
- Events broadcast to all connections in the room
- All tabs should receive events independently

## Next Steps

1. Add more specific events for production stages
2. Implement event acknowledgment for critical operations
3. Add presence detection (who's online)
4. Implement typing indicators for collaborative features
5. Add event logging for audit trail
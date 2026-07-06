import React, { useState, useEffect } from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon, Divider, Badge, Tooltip, LinearProgress, Avatar, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { theme } from '../styles/theme'
import { workshopService } from '../services/workshopService'
import { useSocketEvents } from '../hooks/useSocketEvents'

// Industrial Styled Components
const ProductionFloor = styled(Box)(({ status }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.primary} 100%)`,
  padding: theme.spacing.lg,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)',
    pointerEvents: 'none',
  },
}))

const IndustrialCard = styled(Card)(({ status, type }) => {
  const statusColor = type === 'showroom' ? theme.colors.status.showroom :
    status === 'completed' ? theme.colors.status.completed :
      status === 'in_progress' ? theme.colors.status.inProgress :
        theme.colors.status.pending

  return {
    background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceLight} 100%)`,
    border: `2px solid ${statusColor}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 24px ${statusColor}40`,
      border: `2px solid ${statusColor}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      background: `linear-gradient(90deg, ${statusColor} 0%, transparent 100%)`,
    },
  }
})

const StageIndicator = styled(Box)(({ active, color }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: active ? color : theme.colors.surface,
  border: `3px solid ${active ? color : theme.colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  transition: 'all 0.3s ease',
  boxShadow: active ? `0 0 15px ${color}80` : 'none',
}))

const WorkerAvatar = styled(Avatar)(({ role }) => {
  const roleColor = theme.colors.workerRoles[role]?.color || theme.colors.metal
  return {
    background: `linear-gradient(135deg, ${roleColor} 0%, ${theme.colors.primary} 100%)`,
    border: `2px solid ${roleColor}`,
    boxShadow: theme.shadows.md,
  }
})

const MaterialBadge = styled(Badge)(({ level }) => {
  const color = level < 20 ? theme.colors.workshop.urgent :
    level < 50 ? theme.colors.workshop.polish :
      theme.colors.quality
  return {
    '& .MuiBadge-badge': {
      background: color,
      color: theme.colors.text,
    },
  }
})

const ProductionFloorView = ({ orders, workers, materials, onOrderClick, onUpdateStatus, onAssignWorker, onUseMaterial }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [newOrderDialog, setNewOrderDialog] = useState(false)
  const [orderType, setOrderType] = useState('customer')
  const [realTimeUpdates, setRealTimeUpdates] = useState({})

  const { socket, connected } = useSocketEvents()

  // Real-time updates
  useEffect(() => {
    if (!socket) return

    socket.on('order:updated', (order) => {
      setRealTimeUpdates(prev => ({ ...prev, [order.id]: order }))
    })

    socket.on('worker:assigned', (assignment) => {
      console.log('Worker assigned:', assignment)
    })

    socket.on('material:used', (usage) => {
      console.log('Material used:', usage)
    })

    socket.on('production:stage:done', (stage) => {
      console.log('Stage completed:', stage)
    })

    return () => {
      socket.off('order:updated')
      socket.off('worker:assigned')
      socket.off('material:used')
      socket.off('production:stage:done')
    }
  }, [socket])

  const getOrderTypeInfo = (type) => {
    return theme.orderTypes[type] || theme.orderTypes.customer
  }

  const getStageProgress = (stages) => {
    if (!stages || stages.length === 0) return 0
    const completed = stages.filter(s => s.status === 'completed').length
    return (completed / stages.length) * 100
  }

  const renderOrderCard = (order) => {
    const orderTypeInfo = getOrderTypeInfo(order.order_type)
    const progress = getStageProgress(order.stages)
    const isRealtime = realTimeUpdates[order.id]

    return (
      <IndustrialCard
        key={order.id}
        status={order.status}
        type={order.order_type}
        onClick={() => onOrderClick(order)}
        sx={{ cursor: 'pointer' }}
      >
        <CardContent>
          {/* Order Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" sx={{ color: theme.colors.text, fontWeight: 'bold', fontFamily: theme.fonts.industrial }}>
                {order.order_number}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                {orderTypeInfo.label}
              </Typography>
            </Box>
            <Chip
              label={order.status.replace('_', ' ').toUpperCase()}
              sx={{
                background: orderTypeInfo.color,
                color: theme.colors.text,
                fontWeight: 'bold',
                fontSize: '0.7rem',
              }}
            />
          </Box>

          {/* Customer/Deceased Info */}
          <Box mb={2}>
            <Typography variant="body2" sx={{ color: theme.colors.text }}>
              <strong>Customer:</strong> {order.customer_name}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}>
              <strong>Deceased:</strong> {order.deceased_name}
            </Typography>
            {order.delivery_date && (
              <Typography variant="caption" sx={{ color: theme.colors.workshop.polish }}>
                📅 Delivery: {new Date(order.delivery_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          {/* Production Progress */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                Production Progress
              </Typography>
              <Typography variant="caption" sx={{ color: theme.colors.workshop.polish, fontWeight: 'bold' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: '8px',
                borderRadius: '4px',
                background: theme.colors.surfaceLight,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${theme.colors.stages.design} 0%, ${theme.colors.stages.delivery} 100%)`,
                  borderRadius: '4px',
                },
              }}
            />
          </Box>

          {/* Stage Indicators */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {theme.productionStages.map((stage, idx) => {
              const stageData = order.stages?.find(s => s.stage === stage.id)
              const isActive = stageData?.status === 'in_progress'
              const isCompleted = stageData?.status === 'completed'

              return (
                <Tooltip key={stage.id} title={stage.name} arrow>
                  <Box>
                    <StageIndicator
                      active={isActive || isCompleted}
                      color={stage.color}
                    >
                      {isCompleted ? '✓' : stage.icon}
                    </StageIndicator>
                  </Box>
                </Tooltip>
              )
            })}
          </Box>

          {/* Assigned Workers */}
          {order.assignments?.length > 0 && (
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              {order.assignments.slice(0, 3).map((assignment) => (
                <Tooltip key={assignment.id} title={`${assignment.first_name} ${assignment.last_name} - ${assignment.stage}`}>
                  <WorkerAvatar role={assignment.role || 'worker'} sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {assignment.first_name?.[0]}{assignment.last_name?.[0]}
                  </WorkerAvatar>
                </Tooltip>
              ))}
              {order.assignments.length > 3 && (
                <Avatar sx={{ width: 32, height: 32, background: theme.colors.surfaceLight, color: theme.colors.textSecondary, fontSize: '0.7rem' }}>
                  +{order.assignments.length - 3}
                </Avatar>
              )}
            </Box>
          )}

          {/* Materials Used */}
          {order.materials_used?.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary, mb: 1, display: 'block' }}>
                Materials Used:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {order.materials_used.slice(0, 4).map((material) => (
                  <Chip
                    key={material.id}
                    label={`${material.material_name} (${material.quantity_used})`}
                    size="small"
                    sx={{
                      background: theme.colors.surfaceLight,
                      color: theme.colors.textSecondary,
                      fontSize: '0.7rem',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Real-time indicator */}
          {isRealtime && (
            <Box position="absolute" top={8} right={8}>
              <Chip
                label="LIVE"
                size="small"
                sx={{
                  background: theme.colors.urgent,
                  color: theme.colors.text,
                  animation: 'pulse 1s infinite',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                }}
              />
            </Box>
          )}
        </CardContent>
      </IndustrialCard>
    )
  }

  return (
    <ProductionFloor>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ color: theme.colors.text, fontWeight: 'bold', fontFamily: theme.fonts.industrial, textShadow: theme.shadows.lg }}>
            🏭 WORKSHOP PRODUCTION FLOOR
          </Typography>
          <Typography variant="subtitle2" sx={{ color: theme.colors.textSecondary, mt: 1 }}>
            Real-time Production Management System
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Chip
            label={connected ? '🟢 LIVE' : '🔴 OFFLINE'}
            sx={{
              background: connected ? theme.colors.quality : theme.colors.urgent,
              color: theme.colors.text,
              fontWeight: 'bold',
            }}
          />
          <Button
            variant="contained"
            onClick={() => setNewOrderDialog(true)}
            sx={{
              background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.workshop.paint} 100%)`,
              color: theme.colors.text,
              fontWeight: 'bold',
              boxShadow: theme.shadows.glow,
            }}
          >
            + New Order
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <IndustrialCard status="inProgress">
            <CardContent>
              <Typography variant="h4" sx={{ color: theme.colors.workshop.polish, fontWeight: 'bold' }}>
                {orders?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                Total Orders
              </Typography>
            </CardContent>
          </IndustrialCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <IndustrialCard status="inProgress">
            <CardContent>
              <Typography variant="h4" sx={{ color: theme.colors.status.inProgress, fontWeight: 'bold' }}>
                {orders?.filter(o => o.status === 'in_progress').length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                In Production
              </Typography>
            </CardContent>
          </IndustrialCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <IndustrialCard status="completed">
            <CardContent>
              <Typography variant="h4" sx={{ color: theme.colors.status.completed, fontWeight: 'bold' }}>
                {orders?.filter(o => o.status === 'completed').length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                Completed Today
              </Typography>
            </CardContent>
          </IndustrialCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <IndustrialCard status="showroom">
            <CardContent>
              <Typography variant="h4" sx={{ color: theme.colors.status.showroom, fontWeight: 'bold' }}>
                {orders?.filter(o => o.order_type === 'showroom').length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                Showroom Items
              </Typography>
            </CardContent>
          </IndustrialCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: theme.colors.border, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          sx={{
            '& .MuiTab-root': {
              color: theme.colors.textSecondary,
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: theme.colors.workshop.polish,
              },
            },
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${theme.colors.stages.design} 0%, ${theme.colors.stages.delivery} 100%)`,
              height: '3px',
            },
          }}
        >
          <Tab label="🏭 Production Floor" />
          <Tab label="👷 Workers" />
          <Tab label="📦 Materials" />
          <Tab label="🏪 Showroom" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {orders?.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              {renderOrderCard(order)}
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={2}>
          {workers?.map((worker) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={worker.id}>
              <IndustrialCard status="inProgress">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <WorkerAvatar role={worker.role} sx={{ width: 56, height: 56, fontSize: '1.5rem' }}>
                      {worker.first_name?.[0]}{worker.last_name?.[0]}
                    </WorkerAvatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: theme.colors.text, fontWeight: 'bold' }}>
                        {worker.first_name} {worker.last_name}
                      </Typography>
                      <Chip
                        label={worker.role}
                        size="small"
                        sx={{
                          background: theme.colors.workerRoles[worker.role]?.color || theme.colors.metal,
                          color: theme.colors.text,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                    📧 {worker.email}
                  </Typography>
                  {worker.phone && (
                    <Typography variant="caption" sx={{ color: theme.colors.textSecondary, display: 'block', mt: 0.5 }}>
                      📱 {worker.phone}
                    </Typography>
                  )}
                </CardContent>
              </IndustrialCard>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          {materials?.map((material) => {
            const stockLevel = material.quantity / material.min_stock_level
            const stockColor = stockLevel < 1 ? theme.colors.urgent :
              stockLevel < 2 ? theme.colors.polish :
                theme.colors.quality

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={material.id}>
                <IndustrialCard status={stockLevel < 1 ? 'cancelled' : 'completed'}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: theme.colors.text, fontWeight: 'bold', mb: 1 }}>
                      {material.name}
                    </Typography>
                    <Chip
                      label={material.category}
                      size="small"
                      sx={{
                        background: theme.colors.surfaceLight,
                        color: theme.colors.textSecondary,
                        fontSize: '0.7rem',
                        mb: 2,
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h4" sx={{ color: stockColor, fontWeight: 'bold' }}>
                        {material.quantity}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                        {material.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((material.quantity / (material.min_stock_level * 3)) * 100, 100)}
                      sx={{
                        height: '6px',
                        borderRadius: '3px',
                        background: theme.colors.surfaceLight,
                        '& .MuiLinearProgress-bar': {
                          background: stockColor,
                          borderRadius: '3px',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: theme.colors.textMuted, mt: 1, display: 'block' }}>
                      Min: {material.min_stock_level} {material.unit}
                    </Typography>
                  </CardContent>
                </IndustrialCard>
              </Grid>
            )
          })}
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {(Array.isArray(orders) ? orders.filter(o => o.order_type === 'showroom') : []).map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              {renderOrderCard(order)}
            </Grid>
          ))}
          {(Array.isArray(orders) ? orders.filter(o => o.order_type === 'showroom') : []).length === 0 && (
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" sx={{ color: theme.colors.textSecondary }}>
                  🏪 No showroom items yet
                </Typography>
                <Typography variant="body2" sx={{ color: theme.colors.textMuted, mt: 1 }}>
                  Create orders with type "Showroom Display" to see them here
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* New Order Dialog */}
      <Dialog open={newOrderDialog} onClose={() => setNewOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: theme.colors.surface, color: theme.colors.text }}>
          Create New Order
        </DialogTitle>
        <DialogContent sx={{ background: theme.colors.background, mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel sx={{ color: theme.colors.textSecondary }}>Order Type</InputLabel>
            <Select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              label="Order Type"
              sx={{ color: theme.colors.text }}
            >
              <MenuItem value="customer">Customer Order</MenuItem>
              <MenuItem value="showroom">Showroom Display</MenuItem>
              <MenuItem value="sample">Sample/Prototype</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Customer Name"
            sx={{ mb: 2, input: { color: theme.colors.text } }}
          />
          <TextField
            fullWidth
            label="Customer Phone"
            sx={{ mb: 2, input: { color: theme.colors.text } }}
          />
          <TextField
            fullWidth
            label="Deceased Name"
            sx={{ mb: 2, input: { color: theme.colors.text } }}
          />
          <TextField
            fullWidth
            label="Coffin Type"
            select
            SelectProps={{ native: true }}
            sx={{ mb: 2, input: { color: theme.colors.text } }}
          >
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="deluxe">Deluxe</option>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ background: theme.colors.surface, padding: 2 }}>
          <Button onClick={() => setNewOrderDialog(false)} sx={{ color: theme.colors.textSecondary }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.workshop.paint} 100%)`,
              color: theme.colors.text,
            }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </ProductionFloor>
  )
}

export default ProductionFloorView
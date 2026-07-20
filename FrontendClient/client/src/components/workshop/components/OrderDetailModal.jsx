import React, { useState, useEffect } from 'react'







import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Card, CardContent, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon, Chip, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, LinearProgress, Avatar, Divider, Badge, Tooltip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, FormControlLabel } from '@mui/material'


import { Package, AlertTriangle, TrendingDown, TrendingUp, Filter, Search, Plus, DollarSign, History } from '../../utils/icons/icons';









import { styled } from '@mui/material/styles'
import { theme } from '../styles/theme.jsx'
import { workshopService } from '../services/workshopService'

// Styled Components
const DetailDialog = styled(Dialog)(({ open }) => ({
    '& .MuiDialog-paper': {
        background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceLight} 100%)`,
        border: `2px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.xl,
        minWidth: '80vw',
        maxHeight: '90vh',
    },
}))

const StageCard = styled(Card)(({ active, completed }) => ({
    background: completed ? `linear-gradient(145deg, ${theme.colors.quality}20 0%, ${theme.colors.quality}10 100%)` :
        active ? `linear-gradient(145deg, ${theme.colors.stages.assembly}20 0%, ${theme.colors.stages.assembly}10 100%)` :
            theme.colors.surface,
    border: `2px solid ${completed ? theme.colors.quality : active ? theme.colors.stages.assembly : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: theme.shadows.md,
    },
}))

const MaterialRow = styled(TableRow)(({ level }) => ({
    background: level < 20 ? `${theme.colors.urgent}15` : 'transparent',
    '&:hover': {
        background: level < 20 ? `${theme.colors.urgent}25` : theme.colors.surfaceLight,
    },
}))

const OrderDetailModal = ({ open, order, workers, materials, onClose, onUpdate, onAssignWorker, onUseMaterial }) => {
    const [activeTab, setActiveTab] = useState(0)
    const [orderType, setOrderType] = useState('customer')
    const [notes, setNotes] = useState('')
    const [selectedWorkers, setSelectedWorkers] = useState([])
    const [selectedMaterial, setSelectedMaterial] = useState('')
    const [materialQuantity, setMaterialQuantity] = useState(1)

    useEffect(() => {
        if (order) {
            setOrderType(order.order_type || 'customer')
            setNotes(order.notes || '')
        }
    }, [order])

    if (!order) return null

    const getStageStatus = (stageId) => {
        const stage = order.stages?.find(s => s.stage === stageId)
        return stage?.status || 'pending'
    }

    const getStageProgress = () => {
        if (!order.stages || order.stages.length === 0) return 0
        const completed = order.stages.filter(s => s.status === 'completed').length
        return (completed / order.stages.length) * 100
    }

    const handleStatusChange = async (newStatus) => {
        try {
            await onUpdate(order.id, { status: newStatus })
        } catch (err) {
            console.error('Error updating status:', err)
        }
    }

    const handleStageUpdate = async (stageId, updates) => {
        try {
            await onUpdate(order.id, {
                stages: order.stages?.map(s => s.id === stageId ? { ...s, ...updates } : s)
            })
        } catch (err) {
            console.error('Error updating stage:', err)
        }
    }

    const handleAssignWorker = async () => {
        if (selectedWorkers.length === 0) return
        try {
            await onAssignWorker(order.id, { user_id: selectedWorkers[0], stage: 'assembly', notes: '' })
            setSelectedWorkers([])
        } catch (err) {
            console.error('Error assigning worker:', err)
        }
    }

    const handleUseMaterial = async () => {
        if (!selectedMaterial || materialQuantity <= 0) return
        try {
            await onUseMaterial(order.id, {
                material_id: selectedMaterial,
                quantity_used: materialQuantity,
                notes: ''
            })
            setSelectedMaterial('')
            setMaterialQuantity(1)
        } catch (err) {
            console.error('Error using material:', err)
        }
    }

    const handlePrintJobCard = () => {
        // Generate job card PDF
        const jobCard = {
            order_number: order.order_number,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            deceased_name: order.deceased_name,
            coffin_type: order.coffin_type,
            status: order.status,
            delivery_date: order.delivery_date,
            stages: order.stages,
            materials: order.materials_used,
            workers: order.assignments,
            created_at: order.created_at,
        }

        // Create printable HTML
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
      <html>
        <head>
          <title>Job Card - ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            .label { font-weight: bold; color: #7f8c8d; }
            .value { color: #2c3e50; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #3498db; color: white; }
            .status { padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
            .status-pending { background: #95a5a6; }
            .status-in_progress { background: #3498db; }
            .status-completed { background: #27ae60; }
          </style>
        </head>
        <body>
          <h1>🏭 JOB CARD</h1>
          
          <div class="section">
            <div class="label">Order Number:</div>
            <div class="value">${order.order_number}</div>
            <div class="label">Status:</div>
            <div class="value"><span class="status status-${order.status}">${order.status.toUpperCase()}</span></div>
          </div>

          <div class="section">
            <h3>Customer Information</h3>
            <table>
              <tr><td class="label">Customer Name:</td><td class="value">${order.customer_name}</td></tr>
              <tr><td class="label">Phone:</td><td class="value">${order.customer_phone || 'N/A'}</td></tr>
              <tr><td class="label">Deceased Name:</td><td class="value">${order.deceased_name}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Coffin Specifications</h3>
            <table>
              <tr><td class="label">Type:</td><td class="value">${order.coffin_type}</td></tr>
              <tr><td class="label">Dimensions:</td><td class="value">${order.dimensions || 'Standard'}</td></tr>
              <tr><td class="label">Color:</td><td class="value">${order.color || 'Natural'}</td></tr>
              <tr><td class="label">Interior Fabric:</td><td class="value">${order.interior_fabric || 'Standard'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Production Stages</h3>
            <table>
              <tr><th>Stage</th><th>Status</th><th>Started</th><th>Completed</th></tr>
              ${order.stages?.map(stage => `
                <tr>
                  <td>${stage.stage.toUpperCase()}</td>
                  <td><span class="status status-${stage.status}">${stage.status}</span></td>
                  <td>${stage.started_at ? new Date(stage.started_at).toLocaleString() : '-'}</td>
                  <td>${stage.completed_at ? new Date(stage.completed_at).toLocaleString() : '-'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No stages</td></tr>'}
            </table>
          </div>

          <div class="section">
            <h3>Materials Used</h3>
            <table>
              <tr><th>Material</th><th>Quantity</th><th>Unit Cost</th><th>Total</th></tr>
              ${order.materials_used?.map(mat => `
                <tr>
                  <td>${mat.material_name}</td>
                  <td>${mat.quantity_used}</td>
                  <td>KSh ${mat.unit_cost}</td>
                  <td>KSh ${(mat.quantity_used * mat.unit_cost).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No materials used</td></tr>'}
            </table>
          </div>

          <div class="section">
            <h3>Assigned Workers</h3>
            <table>
              <tr><th>Worker</th><th>Stage</th><th>Hours Worked</th></tr>
              ${order.assignments?.map(assign => `
                <tr>
                  <td>${assign.first_name} ${assign.last_name}</td>
                  <td>${assign.stage}</td>
                  <td>${assign.hours_worked || 0}</td>
                </tr>
              `).join('') || '<tr><td colspan="3">No workers assigned</td></tr>'}
            </table>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #7f8c8d;">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>RestPoint Funeral Management System</p>
          </div>
        </body>
      </html>
    `)
        printWindow.document.close()
        printWindow.print()
    }

    const handlePrintCutList = () => {
        // Generate cut list PDF
        const cutList = {
            order_number: order.order_number,
            coffin_type: order.coffin_type,
            dimensions: order.dimensions,
            materials: order.materials_used,
        }

        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
      <html>
        <head>
          <title>Cut List - ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #e74c3c; border-bottom: 3px solid #e74c3c; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #e74c3c; color: white; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; }
          </style>
        </head>
        <body>
          <h1>✂️ CUT LIST</h1>
          
          <div class="section">
            <p><strong>Order:</strong> ${order.order_number}</p>
            <p><strong>Coffin Type:</strong> ${order.coffin_type}</p>
            <p><strong>Dimensions:</strong> ${order.dimensions || 'Standard'}</p>
          </div>

          <div class="section">
            <h3>Materials to Cut</h3>
            <table>
              <tr><th>Material</th><th>Quantity</th><th>Unit</th><th>Cut</th></tr>
              ${order.materials_used?.map(mat => `
                <tr>
                  <td>${mat.material_name}</td>
                  <td>${mat.quantity_used}</td>
                  <td>${mat.unit || 'pcs'}</td>
                  <td><span class="checkbox"></span></td>
                </tr>
              `).join('') || '<tr><td colspan="4">No materials</td></tr>'}
            </table>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #7f8c8d;">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>RestPoint Funeral Management System</p>
          </div>
        </body>
      </html>
    `)
        printWindow.document.close()
        printWindow.print()
    }

    return (
        <DetailDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ background: theme.colors.surface, color: theme.colors.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.fonts.industrial }}>
                        📋 ORDER DETAILS
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.colors.textSecondary }}>
                        {order.order_number} - {order.order_type?.toUpperCase() || 'CUSTOMER ORDER'}
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handlePrintJobCard}
                        sx={{ color: theme.colors.workshop.polish, borderColor: theme.colors.workshop.polish }}
                    >
                        🖨️ Job Card
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handlePrintCutList}
                        sx={{ color: theme.colors.workshop.cutting, borderColor: theme.colors.workshop.cutting }}
                    >
                        ✂️ Cut List
                    </Button>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ background: theme.colors.background, mt: 2 }}>
                {/* Order Info Header */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>👤 Customer Information</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.text }}><strong>Name:</strong> {order.customer_name}</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}><strong>Phone:</strong> {order.customer_phone || 'N/A'}</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}><strong>Email:</strong> {order.customer_email || 'N/A'}</Typography>
                                <Divider sx={{ my: 1, borderColor: theme.colors.border }} />
                                <Typography variant="body2" sx={{ color: theme.colors.text }}><strong>Deceased:</strong> {order.deceased_name}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>⚰️ Coffin Specifications</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.text }}><strong>Type:</strong> {order.coffin_type}</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}><strong>Dimensions:</strong> {order.dimensions || 'Standard'}</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}><strong>Color:</strong> {order.color || 'Natural'}</Typography>
                                <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}><strong>Fabric:</strong> {order.interior_fabric || 'Standard'}</Typography>
                                <Divider sx={{ my: 1, borderColor: theme.colors.border }} />
                                <Typography variant="body2" sx={{ color: theme.colors.workshop.polish }}><strong>Delivery:</strong> {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: theme.colors.border, mb: 2 }}>
                    <Tabs value={activeTab} onChange={(e, newVal) => setActiveTab(newVal)} sx={{
                        '& .MuiTab-root': { color: theme.colors.textSecondary, fontWeight: 'bold' },
                        '& .Mui-selected': { color: theme.colors.workshop.polish },
                        '& .MuiTabs-indicator': { background: theme.colors.workshop.polish },
                    }}>
                        <Tab label="📊 Production Stages" />
                        <Tab label="👷 Workers" />
                        <Tab label="📦 Materials" />
                        <Tab label="📝 Notes" />
                    </Tabs>
                </Box>

                {/* Production Stages Tab */}
                {activeTab === 0 && (
                    <Box>
                        <Grid container spacing={2} mb={3}>
                            {theme.productionStages.map((stage) => {
                                const status = getStageStatus(stage.id)
                                const stageData = order.stages?.find(s => s.stage === stage.id)

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={stage.id}>
                                        <StageCard active={status === 'in_progress'} completed={status === 'completed'}>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="h6" sx={{ color: theme.colors.text }}>
                                                        {stage.icon} {stage.name}
                                                    </Typography>
                                                    <Chip
                                                        label={status.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            background: status === 'completed' ? theme.colors.quality :
                                                                status === 'in_progress' ? stage.color :
                                                                    theme.colors.surface,
                                                            color: theme.colors.text,
                                                            fontSize: '0.65rem',
                                                        }}
                                                    />
                                                </Box>
                                                <Box display="flex" gap={1} mt={2}>
                                                    {status === 'pending' && (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => handleStageUpdate(stageData?.id, { status: 'in_progress', started_at: new Date() })}
                                                            sx={{ background: stage.color, color: theme.colors.text, fontSize: '0.7rem' }}
                                                        >
                                                            Start
                                                        </Button>
                                                    )}
                                                    {status === 'in_progress' && (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => handleStageUpdate(stageData?.id, { status: 'completed', completed_at: new Date() })}
                                                            sx={{ background: theme.colors.quality, color: theme.colors.text, fontSize: '0.7rem' }}
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}
                                                    {status === 'completed' && (
                                                        <Typography variant="caption" sx={{ color: theme.colors.quality }}>
                                                            ✓ Completed
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </StageCard>
                                    </Grid>
                                )
                            })}
                        </Grid>

                        {/* Overall Progress */}
                        <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}>
                                        Overall Progress
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.colors.workshop.polish, fontWeight: 'bold' }}>
                                        {Math.round(getStageProgress())}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={getStageProgress()}
                                    sx={{
                                        height: '10px',
                                        borderRadius: '5px',
                                        background: theme.colors.surface,
                                        '& .MuiLinearProgress-bar': {
                                            background: `linear-gradient(90deg, ${theme.colors.stages.design} 0%, ${theme.colors.stages.delivery} 100%)`,
                                            borderRadius: '5px',
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Workers Tab */}
                {activeTab === 1 && (
                    <Box>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>Assign Worker</Typography>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel sx={{ color: theme.colors.textSecondary }}>Select Worker</InputLabel>
                                            <Select
                                                multiple
                                                value={selectedWorkers}
                                                onChange={(e) => setSelectedWorkers(e.target.value)}
                                                label="Select Worker"
                                                sx={{ color: theme.colors.text }}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((workerId) => {
                                                            const worker = workers.find(w => w.id === workerId)
                                                            return worker ? (
                                                                <Chip
                                                                    key={workerId}
                                                                    label={`${worker.first_name} ${worker.last_name}`}
                                                                    size="small"
                                                                    sx={{ background: theme.colors.surface, color: theme.colors.text }}
                                                                />
                                                            ) : null
                                                        })}
                                                    </Box>
                                                )}
                                            >
                                                {workers?.map((worker) => (
                                                    <MenuItem key={worker.id} value={worker.id} sx={{ color: theme.colors.text }}>
                                                        {worker.first_name} {worker.last_name} - {worker.role}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Button
                                            variant="contained"
                                            onClick={handleAssignWorker}
                                            disabled={selectedWorkers.length === 0}
                                            sx={{ background: theme.colors.accent, color: theme.colors.text }}
                                        >
                                            Assign Selected Workers
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Assigned Workers List */}
                        <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>Assigned Workers</Typography>
                                {order.assignments?.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Worker</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Role</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Stage</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Hours</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {order.assignments.map((assignment) => (
                                                    <TableRow key={assignment.id}>
                                                        <TableCell sx={{ color: theme.colors.text }}>
                                                            {assignment.first_name} {assignment.last_name}
                                                        </TableCell>
                                                        <TableCell sx={{ color: theme.colors.textSecondary }}>{assignment.role || 'Worker'}</TableCell>
                                                        <TableCell sx={{ color: theme.colors.textSecondary }}>{assignment.stage}</TableCell>
                                                        <TableCell sx={{ color: theme.colors.textSecondary }}>{assignment.hours_worked || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body2" sx={{ color: theme.colors.textMuted, textAlign: 'center', py: 3 }}>
                                        No workers assigned yet
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Materials Tab */}
                {activeTab === 2 && (
                    <Box>
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>Use Material</Typography>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel sx={{ color: theme.colors.textSecondary }}>Select Material</InputLabel>
                                            <Select
                                                value={selectedMaterial}
                                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                                label="Select Material"
                                                sx={{ color: theme.colors.text }}
                                            >
                                                {materials?.map((material) => (
                                                    <MenuItem key={material.id} value={material.id} sx={{ color: theme.colors.text }}>
                                                        {material.name} (Stock: {material.quantity} {material.unit})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            label="Quantity"
                                            type="number"
                                            value={materialQuantity}
                                            onChange={(e) => setMaterialQuantity(Number(e.target.value))}
                                            sx={{ mb: 2, input: { color: theme.colors.text } }}
                                            inputProps={{ min: 1 }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleUseMaterial}
                                            disabled={!selectedMaterial || materialQuantity <= 0}
                                            sx={{ background: theme.colors.workshop.metal, color: theme.colors.text }}
                                        >
                                            Record Usage
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Materials Used */}
                        <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>Materials Used in This Order</Typography>
                                {order.materials_used?.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Material</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Quantity</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Unit Cost</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Total</TableCell>
                                                    <TableCell sx={{ color: theme.colors.textSecondary }}>Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {order.materials_used.map((material) => (
                                                    <MaterialRow key={material.id} level={material.quantity || 0}>
                                                        <TableCell sx={{ color: theme.colors.text }}>{material.material_name}</TableCell>
                                                        <TableCell sx={{ color: theme.colors.textSecondary }}>{material.quantity_used}</TableCell>
                                                        <TableCell sx={{ color: theme.colors.textSecondary }}>KSh {material.unit_cost}</TableCell>
                                                        <TableCell sx={{ color: theme.colors.workshop.polish, fontWeight: 'bold' }}>
                                                            KSh {(material.quantity_used * material.unit_cost).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell sx={{ color: theme.colors.textMuted }}>
                                                            {new Date(material.used_at).toLocaleDateString()}
                                                        </TableCell>
                                                    </MaterialRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body2" sx={{ color: theme.colors.textMuted, textAlign: 'center', py: 3 }}>
                                        No materials used yet
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Notes Tab */}
                {activeTab === 3 && (
                    <Card sx={{ background: theme.colors.surfaceLight, border: `1px solid ${theme.colors.border}` }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: theme.colors.text, mb: 2 }}>Order Notes</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes, special instructions, or comments..."
                                sx={{ input: { color: theme.colors.text } }}
                            />
                            <Button
                                variant="contained"
                                onClick={() => onUpdate(order.id, { notes })}
                                sx={{ mt: 2, background: theme.colors.accent, color: theme.colors.text }}
                            >
                                Save Notes
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>

            <DialogActions sx={{ background: theme.colors.surface, padding: 2, borderTop: `1px solid ${theme.colors.border}` }}>
                <Button onClick={onClose} sx={{ color: theme.colors.textSecondary }}>
                    Close
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onUpdate(order.id, { order_type: orderType })}
                    sx={{
                        background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.workshop.paint} 100%)`,
                        color: theme.colors.text,
                    }}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </DetailDialog>
    )
}

export default OrderDetailModal
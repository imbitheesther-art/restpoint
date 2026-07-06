import React, { useState, useEffect } from 'react'
import { Box, Container, CssBaseline, ThemeProvider, createTheme, Typography, Button } from '@mui/material'
import { theme } from '../styles/theme'
import ProductionFloorView from '../components/ProductionFloorView'
import OrderDetailModal from '../components/OrderDetailModal'
import { workshopService } from '../services/workshopService'
import { useSocketEvents } from '../hooks/useSocketEvents'

// Create MUI theme
const muiTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: theme.colors.accent },
        secondary: { main: theme.colors.workshop.polish },
        background: { default: theme.colors.background, paper: theme.colors.surface },
        text: { primary: theme.colors.text, secondary: theme.colors.textSecondary },
    },
    typography: {
        fontFamily: theme.fonts.primary,
        h3: { fontWeight: 700 },
        h6: { fontWeight: 600 },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceLight} 100%)`,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
})

const WorkshopProductionFloor = () => {
    const [orders, setOrders] = useState([])
    const [workers, setWorkers] = useState([])
    const [materials, setMaterials] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { socket, connected } = useSocketEvents()

    // Load all data
    const loadData = async () => {
        try {
            setLoading(true)
            const [ordersResult, workersResult, materialsResult] = await Promise.all([
                workshopService.getOrders(),
                workshopService.getWorkers(),
                workshopService.getMaterials(),
            ])
            setOrders(Array.isArray(ordersResult?.data) ? ordersResult.data : [])
            setWorkers(Array.isArray(workersResult?.data) ? workersResult.data : [])
            setMaterials(Array.isArray(materialsResult?.data) ? materialsResult.data : [])
            setError(null)
        } catch (err) {
            setError('Failed to load data: ' + err.message)
            console.error('Error loading data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Real-time updates
    useEffect(() => {
        if (!socket) return

        socket.on('order:created', (order) => {
            setOrders(prev => [order, ...prev])
        })

        socket.on('order:updated', (updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
            if (selectedOrder?.id === updatedOrder.id) {
                setSelectedOrder(updatedOrder)
            }
        })

        socket.on('order:deleted', ({ id }) => {
            setOrders(prev => prev.filter(o => o.id !== id))
        })

        socket.on('worker:assigned', (assignment) => {
            setOrders(prev => prev.map(order => {
                if (order.id === assignment.coffin_order_id) {
                    return {
                        ...order,
                        assignments: [...(order.assignments || []), assignment]
                    }
                }
                return order
            }))
        })

        socket.on('material:used', (usage) => {
            setOrders(prev => prev.map(order => {
                if (order.id === usage.coffin_order_id) {
                    return {
                        ...order,
                        materials_used: [...(order.materials_used || []), usage]
                    }
                }
                return order
            }))
            // Reload materials to update stock
            loadMaterials()
        })

        socket.on('production:stage:done', (stage) => {
            setOrders(prev => prev.map(order => {
                if (order.id === stage.coffin_order_id) {
                    return {
                        ...order,
                        stages: order.stages?.map(s => s.id === stage.id ? stage : s)
                    }
                }
                return order
            }))
        })

        return () => {
            socket.off('order:created')
            socket.off('order:updated')
            socket.off('order:deleted')
            socket.off('worker:assigned')
            socket.off('material:used')
            socket.off('production:stage:done')
        }
    }, [socket, selectedOrder])

    const loadMaterials = async () => {
        try {
            const data = await workshopService.getMaterials()
            setMaterials(data || [])
        } catch (err) {
            console.error('Error loading materials:', err)
        }
    }

    const handleOrderClick = (order) => {
        setSelectedOrder(order)
    }

    const handleCloseOrderDetail = () => {
        setSelectedOrder(null)
        loadData() // Reload to get latest data
    }

    const handleUpdateOrder = async (orderId, updates) => {
        try {
            const updated = await workshopService.updateOrder(orderId, updates)
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updated)
            }
            return updated
        } catch (err) {
            console.error('Error updating order:', err)
            throw err
        }
    }

    const handleCreateOrder = async (orderData) => {
        try {
            const newOrder = await workshopService.createOrder(orderData)
            setOrders(prev => [newOrder, ...prev])
            return newOrder
        } catch (err) {
            console.error('Error creating order:', err)
            throw err
        }
    }

    const handleAssignWorker = async (orderId, workerData) => {
        try {
            const assignment = await workshopService.assignWorker(orderId, workerData)
            return assignment
        } catch (err) {
            console.error('Error assigning worker:', err)
            throw err
        }
    }

    const handleUseMaterial = async (orderId, materialData) => {
        try {
            const usage = await workshopService.useMaterial(orderId, materialData)
            return usage
        } catch (err) {
            console.error('Error using material:', err)
            throw err
        }
    }

    if (loading) {
        return (
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                    sx={{ background: theme.colors.background }}
                >
                    <Box textAlign="center">
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                border: `4px solid ${theme.colors.surfaceLight}`,
                                borderTop: `4px solid ${theme.colors.workshop.polish}`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 16px',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                },
                            }}
                        />
                        <Typography sx={{ color: theme.colors.textSecondary }}>
                            Loading Production Floor...
                        </Typography>
                    </Box>
                </Box>
            </ThemeProvider>
        )
    }

    if (error) {
        return (
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                    sx={{ background: theme.colors.background }}
                >
                    <Box textAlign="center">
                        <Typography variant="h6" sx={{ color: theme.colors.urgent, mb: 2 }}>
                            ⚠️ Error Loading Data
                        </Typography>
                        <Typography sx={{ color: theme.colors.textSecondary, mb: 3 }}>
                            {error}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={loadData}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.workshop.paint} 100%)`,
                                color: theme.colors.text,
                            }}
                        >
                            Retry
                        </Button>
                    </Box>
                </Box>
            </ThemeProvider>
        )
    }

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Box sx={{ background: theme.colors.background, minHeight: '100vh' }}>
                {/* Connection Status Bar */}
                <Box
                    sx={{
                        background: connected ? theme.colors.quality : theme.colors.urgent,
                        color: theme.colors.text,
                        py: 0.5,
                        px: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                    }}
                >
                    <Box>
                        {connected ? '🟢 Real-time Connected' : '🔴 Offline Mode'}
                    </Box>
                    <Box>
                        Last updated: {new Date().toLocaleTimeString()}
                    </Box>
                </Box>

                {/* Main Production Floor View */}
                <ProductionFloorView
                    orders={orders}
                    workers={workers}
                    materials={materials}
                    onOrderClick={handleOrderClick}
                    onUpdateStatus={handleUpdateOrder}
                    onAssignWorker={handleAssignWorker}
                    onUseMaterial={handleUseMaterial}
                />

                {/* Order Detail Modal */}
                <OrderDetailModal
                    open={!!selectedOrder}
                    order={selectedOrder}
                    workers={workers}
                    materials={materials}
                    onClose={handleCloseOrderDetail}
                    onUpdate={handleUpdateOrder}
                    onAssignWorker={handleAssignWorker}
                    onUseMaterial={handleUseMaterial}
                />
            </Box>
        </ThemeProvider>
    )
}

export default WorkshopProductionFloor
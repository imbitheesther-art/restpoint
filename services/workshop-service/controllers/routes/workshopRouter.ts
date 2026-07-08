import express from 'express'
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder
} from '../coffinOrderController'
import {
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    useMaterial
} from '../materialController'
import {
    getStages,
    updateStage,
    assignWorker,
    updateAssignment,
    getAssignments
} from '../productionController'
import {
    getDailyReport,
    getWeeklyReport,
    getInventoryReport,
    getProductionReport,
    getCostingReport,
    getMonthlyAnalytics
} from '../reportController'
import {
    getWorkers,
    createWorker,
    updateWorker,
    deleteWorker
} from '../workerController'
import {
    generateWorkOrderPDF,
    saveDesignSpec,
    getDesignSpec,
    recordMaterialIntake,
    getMaterialIntakeHistory
} from '../workOrderController'
import {
    assignWorkerToOrder,
    recordMaterialUsage,
    updateOrderStatus,
    getTodayCompletedOrders,
    getOrderTimeline,
    completeProductionStage
} from '../productionWorkflowController'

const workshopRouter = express.Router()

// ============ COFFIN ORDERS ============
workshopRouter.get('/orders', getOrders)
workshopRouter.post('/orders', createOrder)
workshopRouter.get('/orders/:id', getOrder)
workshopRouter.patch('/orders/:id', updateOrder)
workshopRouter.delete('/orders/:id', deleteOrder)

// ============ PRODUCTION STAGES ============
workshopRouter.get('/orders/:orderId/stages', getStages)
workshopRouter.patch('/orders/:orderId/stages/:stageId', updateStage)

// ============ WORKER ASSIGNMENTS ============
workshopRouter.get('/assignments', getAssignments)
workshopRouter.post('/orders/:orderId/assign', assignWorker)
workshopRouter.patch('/assignments/:id', updateAssignment)

// ============ MATERIALS ============
workshopRouter.get('/materials', getMaterials)
workshopRouter.post('/materials', createMaterial)
workshopRouter.get('/materials/:id', getMaterial)
workshopRouter.patch('/materials/:id', updateMaterial)
workshopRouter.delete('/materials/:id', deleteMaterial)
workshopRouter.post('/materials/use', useMaterial)

// ============ WORKERS ============
workshopRouter.get('/workers', getWorkers)
workshopRouter.post('/workers', createWorker)
workshopRouter.patch('/workers/:id', updateWorker)
workshopRouter.delete('/workers/:id', deleteWorker)

// ============ REPORTS & ANALYTICS ============
workshopRouter.get('/reports/daily', getDailyReport)
workshopRouter.get('/reports/weekly', getWeeklyReport)
workshopRouter.get('/reports/inventory', getInventoryReport)
workshopRouter.get('/reports/production', getProductionReport)
workshopRouter.get('/reports/costing', getCostingReport)
workshopRouter.get('/analytics/monthly', getMonthlyAnalytics)

// ============ WORK ORDERS & DESIGNS ============
workshopRouter.get('/orders/:id/work-order/pdf', generateWorkOrderPDF)
workshopRouter.post('/orders/:id/design', saveDesignSpec)
workshopRouter.get('/orders/:id/design', getDesignSpec)

// ============ MATERIAL INTAKE ============
workshopRouter.post('/materials/intake', recordMaterialIntake)
workshopRouter.get('/materials/intake', getMaterialIntakeHistory)

// ============ PRODUCTION WORKFLOW ============
workshopRouter.post('/orders/:orderId/assign-worker', assignWorkerToOrder)
workshopRouter.post('/orders/:orderId/use-material', recordMaterialUsage)
workshopRouter.patch('/orders/:orderId/status', updateOrderStatus)
workshopRouter.get('/orders/today/completed', getTodayCompletedOrders)
workshopRouter.get('/orders/:orderId/timeline', getOrderTimeline)
workshopRouter.post('/orders/:orderId/complete-stage', completeProductionStage)

export { workshopRouter }

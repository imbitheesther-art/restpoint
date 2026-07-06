import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../../context/socketContext';

// ============================================================
// CUSTOM HOOK: useSocketEvents - Real-time socket event management
// Connects all socket events to state update callbacks
// ============================================================

export const useSocketEvents = ({
    onOrderCreated,
    onOrderUpdated,
    onOrderStatusChanged,
    onOrderStageChanged,
    onOrderCompleted,
    onMaterialUsed,
    onMaterialLowStock,
    onWorkerAssigned,
    onWorkerStatusChanged,
    onProductionStageStart,
    onProductionStageDone,
    onProductionBottleneck,
    onNotification,
    onDashboardUpdate,
} = {}) => {
    const { socket, connected } = useSocket();
    const handlersRef = useRef({
        onOrderCreated,
        onOrderUpdated,
        onOrderStatusChanged,
        onOrderStageChanged,
        onOrderCompleted,
        onMaterialUsed,
        onMaterialLowStock,
        onWorkerAssigned,
        onWorkerStatusChanged,
        onProductionStageStart,
        onProductionStageDone,
        onProductionBottleneck,
        onNotification,
        onDashboardUpdate,
    });

    // Keep refs current
    useEffect(() => {
        handlersRef.current = {
            onOrderCreated,
            onOrderUpdated,
            onOrderStatusChanged,
            onOrderStageChanged,
            onOrderCompleted,
            onMaterialUsed,
            onMaterialLowStock,
            onWorkerAssigned,
            onWorkerStatusChanged,
            onProductionStageStart,
            onProductionStageDone,
            onProductionBottleneck,
            onNotification,
            onDashboardUpdate,
        };
    });

    useEffect(() => {
        if (!socket) return;

        const h = handlersRef.current;

        const handlers = {
            'order:created': (data) => h.onOrderCreated?.(data),
            'order:updated': (data) => h.onOrderUpdated?.(data),
            'order:status:changed': (data) => h.onOrderStatusChanged?.(data),
            'order:stage:changed': (data) => h.onOrderStageChanged?.(data),
            'order:completed': (data) => h.onOrderCompleted?.(data),
            'material:used': (data) => h.onMaterialUsed?.(data),
            'material:low-stock': (data) => h.onMaterialLowStock?.(data),
            'worker:assigned': (data) => h.onWorkerAssigned?.(data),
            'worker:status:changed': (data) => h.onWorkerStatusChanged?.(data),
            'production:stage:start': (data) => h.onProductionStageStart?.(data),
            'production:stage:done': (data) => h.onProductionStageDone?.(data),
            'production:bottleneck': (data) => h.onProductionBottleneck?.(data),
            'notification:new': (data) => h.onNotification?.(data),
            'dashboard:update': (data) => h.onDashboardUpdate?.(data),
        };

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, [socket]);

    // Emit helper functions
    const emit = useCallback((event, data) => {
        if (socket?.connected) {
            socket.emit(event, data);
        }
    }, [socket]);

    return {
        connected,
        emit,
        emitCreateOrder: (data) => emit('order:create', data),
        emitUpdateOrder: (data) => emit('order:update', data),
        emitDeleteOrder: (id) => emit('order:delete', id),
        emitUseMaterial: (data) => emit('material:use', data),
        emitAddStock: (data) => emit('material:add-stock', data),
        emitAssignWorker: (data) => emit('worker:assign', data),
        emitStartProduction: (data) => emit('production:start', data),
        emitCompleteProduction: (data) => emit('production:complete', data),
        emitPrintJobCard: (id) => emit('print:job-card', id),
    };
};

export default useSocketEvents;
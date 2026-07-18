import { useState, useEffect, useCallback } from 'react';
import { workshopService } from '../services/workshopService';
import { useSocket } from '../../../utils/context/socketContext';

// ============================================================
// WORKSHOP DATA HOOK - All data fetching and state management
// ============================================================
export const useWorkshopData = (slug) => {
    const { socket, connected } = useSocket();
    const [orders, setOrders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [oRes, mRes, wRes] = await Promise.all([
                workshopService.getOrders(),
                workshopService.getMaterials(),
                workshopService.getWorkers(),
            ]);

            if (oRes.success) setOrders(Array.isArray(oRes.data) ? oRes.data : []);
            if (mRes.success) setMaterials(Array.isArray(mRes.data) ? mRes.data : []);
            if (wRes.success) setWorkers(Array.isArray(wRes.data) ? wRes.data : []);
            if (!oRes.success && !mRes.success && !wRes.success) {
                setError('Failed to load workshop data');
            }
        } catch (e) {
            console.error('[WorkshopData] Fetch error:', e);
            setError(e.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData, slug]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        const handleOrderCreated = (order) => {
            if (order) setOrders(prev => [order, ...(prev || [])]);
        };
        const handleOrderUpdated = (order) => {
            if (order) setOrders(prev => (prev || []).map(x => x && x.id === order.id ? order : x));
        };
        const handleOrderDeleted = ({ id }) => {
            if (id) setOrders(prev => (prev || []).filter(x => x && x.id !== id));
        };
        const handleMaterialUpdated = (mat) => {
            if (mat) setMaterials(prev => (prev || []).map(m => m && m.id === mat.id ? mat : m));
        };

        socket.on('order:created', handleOrderCreated);
        socket.on('order:updated', handleOrderUpdated);
        socket.on('order:deleted', handleOrderDeleted);
        socket.on('material:updated', handleMaterialUpdated);

        return () => {
            socket.off('order:created', handleOrderCreated);
            socket.off('order:updated', handleOrderUpdated);
            socket.off('order:deleted', handleOrderDeleted);
            socket.off('material:updated', handleMaterialUpdated);
        };
    }, [socket]);

    const refreshOrders = useCallback(async () => {
        const res = await workshopService.getOrders();
        if (res.success) setOrders(Array.isArray(res.data) ? res.data : []);
    }, []);

    const refreshMaterials = useCallback(async () => {
        const res = await workshopService.getMaterials();
        if (res.success) setMaterials(Array.isArray(res.data) ? res.data : []);
    }, []);

    const refreshWorkers = useCallback(async () => {
        const res = await workshopService.getWorkers();
        if (res.success) setWorkers(Array.isArray(res.data) ? res.data : []);
    }, []);

    return {
        orders,
        materials,
        workers,
        loading,
        error,
        connected,
        setOrders,
        setMaterials,
        setWorkers,
        refreshOrders,
        refreshMaterials,
        refreshWorkers,
        refetchAll: fetchData,
    };
};

export default useWorkshopData;
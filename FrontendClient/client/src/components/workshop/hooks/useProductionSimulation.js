import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================
// CUSTOM HOOK: useProductionSimulation
// Local simulation for production floor visualization
// Uses real data but simulates progress visually
// ============================================================

const STATION_DEFAULTS = [
    { id: 1, name: 'Design', icon: '🎨', color: '#6366F1' },
    { id: 2, name: 'Cutting', icon: '⚡', color: '#F59E0B' },
    { id: 3, name: 'Assembly', icon: '🔨', color: '#10B981' },
    { id: 4, name: 'Finishing', icon: '🎨', color: '#3B82F6' },
    { id: 5, name: 'Quality', icon: '✅', color: '#EC4899' },
    { id: 6, name: 'Delivery', icon: '🚚', color: '#14B8A6' },
];

export const useProductionSimulation = (orders = []) => {
    const [simRunning, setSimRunning] = useState(false);
    const [simSpeed, setSimSpeed] = useState(1);
    const [stations, setStations] = useState(
        STATION_DEFAULTS.map(s => ({ ...s, worker: null, progress: 0, status: 'idle', orders: [] }))
    );
    const [simAnalytics, setSimAnalytics] = useState({
        ordersProcessed: 0,
        avgProductionTime: 0,
        efficiency: 0,
        bottleneck: 'None',
        activeWorkers: 0,
        queueLength: 0,
    });
    const intervalRef = useRef(null);

    // Sync real orders into simulation stations
    useEffect(() => {
        const activeOrders = orders.filter(o =>
            o && !['completed', 'delivered', 'cancelled'].includes(o.status)
        );

        setStations(prev => prev.map(station => {
            const stationOrders = activeOrders.filter(o => o.status === station.name.toLowerCase());
            const hasOrders = stationOrders.length > 0;

            return {
                ...station,
                orders: stationOrders,
                status: hasOrders ? 'active' : 'idle',
                worker: stationOrders[0]?.assigned_worker || station.worker,
            };
        }));
    }, [orders]);

    // Simulation loop
    useEffect(() => {
        if (!simRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        let processed = 0;
        let totalTime = 0;

        intervalRef.current = setInterval(() => {
            setStations(prev => prev.map(s => {
                if (s.status === 'active' && s.progress < 100) {
                    const increment = 1 * simSpeed;
                    const newProgress = Math.min(100, s.progress + increment);
                    return { ...s, progress: newProgress };
                }
                if (s.progress >= 100) {
                    processed++;
                    return { ...s, progress: 0, status: 'idle', worker: null };
                }
                if (s.status === 'idle' && s.orders.length > 0) {
                    totalTime += 30;
                    return { ...s, status: 'active', progress: 1 };
                }
                return s;
            }));

            setSimAnalytics(prev => {
                const activeCount = stations.filter(s => s.status === 'active').length;
                const queueCount = orders.filter(o =>
                    o && ['pending', 'design'].includes(o.status)
                ).length;
                return {
                    ordersProcessed: processed,
                    avgProductionTime: processed > 0 ? (totalTime / processed / 60).toFixed(1) : 0,
                    efficiency: Math.min(95, 60 + activeCount * 8),
                    bottleneck: activeCount > 0 ? STATION_DEFAULTS.find(s => s.id === activeCount)?.name || 'None' : 'None',
                    activeWorkers: activeCount,
                    queueLength: queueCount,
                };
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [simRunning, simSpeed, stations, orders]);

    const startSimulation = useCallback(() => setSimRunning(true), []);
    const stopSimulation = useCallback(() => setSimRunning(false), []);
    const toggleSimulation = useCallback(() => setSimRunning(prev => !prev), []);
    const resetSimulation = useCallback(() => {
        setSimRunning(false);
        setStations(STATION_DEFAULTS.map(s => ({ ...s, worker: null, progress: 0, status: 'idle', orders: [] })));
        setSimAnalytics({
            ordersProcessed: 0,
            avgProductionTime: 0,
            efficiency: 0,
            bottleneck: 'None',
            activeWorkers: 0,
            queueLength: 0,
        });
    }, []);

    return {
        stations,
        simRunning,
        simSpeed,
        simAnalytics,
        setSimSpeed,
        startSimulation,
        stopSimulation,
        toggleSimulation,
        resetSimulation,
    };
};

export default useProductionSimulation;
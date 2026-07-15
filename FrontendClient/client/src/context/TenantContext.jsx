import { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get tenant from header or default to system_shared
        const tenantSlug = 'system_shared';
        setTenant({ slug: tenantSlug, name: 'System Shared' });
        setLoading(false);
    }, []);

    const setTenantContext = (tenantData) => {
        setTenant(tenantData);
    };

    return (
        <TenantContext.Provider value={{ tenant, loading, setTenantContext }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
};

export default TenantContext;
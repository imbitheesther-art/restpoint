import React from 'react';

/**
 * Deceased Financial Details Component
 * Placeholder - displays financial information for a deceased record
 */
const DeceasedFinancialDetails = ({ deceasedId, deceased }) => {
    return (
        <div style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#1a1d24', fontWeight: 600 }}>Financial Details</h4>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                <p>Financial details component for deceased record.</p>
                {deceasedId && <p style={{ marginTop: '0.5rem' }}>Deceased ID: {deceasedId}</p>}
                {deceased?.full_name && <p>Name: {deceased.full_name}</p>}
            </div>
        </div>
    );
};

export default DeceasedFinancialDetails;
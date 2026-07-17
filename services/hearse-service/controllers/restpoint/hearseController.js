const { getKenyaTimeISO } = require('../../../../packages/shared-utils/dist/timestamps');
const asyncHandler = require('express-async-handler');
const { getHearsePool, safeQuery } = require('../../database');
const { registerHearse, updateHearse, deleteHearse, getAllHearses, getAvailableHearses, upload } = require('../registerHearse');

/**
 * Get available hearses across all branches for cross-branch booking
 * Uses the dedicated shared hearse database - simplified!
 */
const getAvailableHearsesCrossBranch = asyncHandler(async (req, res) => {
    try {
        const pool = await getHearsePool();

        const availableHearses = await pool.query(
            `SELECT 
                h.id,
                h.hearse_code,
                h.hearse_name,
                h.plate_number,
                h.model,
                h.capacity,
                h.status,
                h.branch_id,
                h.branch_name,
                h.branch_code,
                h.image,
                h.created_at,
                h.updated_at,
                h.min_charge_ksh,
                h.max_charge_ksh,
                h.is_own_branch,
                (SELECT COUNT(*) FROM hearse_bookings hb 
                 WHERE hb.hearse_id = h.id 
                 AND hb.status NOT IN ('completed', 'cancelled')) as active_bookings
            FROM hearses h
            WHERE h.status = 'available'
            AND h.id NOT IN (
                SELECT hearse_id FROM hearse_bookings 
                WHERE hearse_id IS NOT NULL 
                AND status NOT IN ('completed', 'cancelled')
            )
            ORDER BY h.branch_id ASC, h.created_at DESC`
        );

        const [rows] = availableHearses;

        const groupedByBranch = rows.reduce((acc, hearse) => {
            const branchKey = hearse.branch_id;
            if (!acc[branchKey]) {
                acc[branchKey] = {
                    branch_id: hearse.branch_id,
                    branch_name: hearse.branch_name,
                    branch_location: 'N/A',
                    branch_phone: 'N/A',
                    hearses: []
                };
            }
            acc[branchKey].hearses.push(hearse);
            return acc;
        }, {});

        const branches = Object.values(groupedByBranch);

        return res.json({
            success: true,
            total_available: rows.length,
            total_branches: branches.length,
            branches,
            hearses: rows
        });
    } catch (error) {
        console.error('❌ [CrossBranchAvailability Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cross-branch availability.',
            error: error.message
        });
    }
});

/**
 * Get availability summary across all branches
 * Simplified - no branch table joins
 */
const getAvailabilitySummary = asyncHandler(async (req, res) => {
    try {
        console.log('\n📊 [AvailabilitySummary] Fetching availability summary...');

        const query = `
            SELECT 
                h.branch_id,
                COUNT(h.id) as total_hearses,
                SUM(CASE WHEN h.status = 'available' THEN 1 ELSE 0 END) as available_hearses,
                SUM(CASE WHEN h.status = 'booked' THEN 1 ELSE 0 END) as booked_hearses,
                SUM(CASE WHEN h.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_hearses
            FROM hearses h
            GROUP BY h.branch_id
            ORDER BY h.branch_id ASC
        `;

        const summary = await safeQuery(query);

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        console.error('❌ [AvailabilitySummary Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching availability summary.',
            error: error.message
        });
    }
});

module.exports = {
    registerHearse,
    updateHearse,
    deleteHearse,
    getAllHearses,
    getAvailableHearses,
    getAvailableHearsesCrossBranch,
    getAvailabilitySummary,
    upload
};
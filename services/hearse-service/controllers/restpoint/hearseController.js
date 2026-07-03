const { safeQuery } = require('../../../../configurations/sqlConfig/db');
const { query, execute } = require('../../../../shared/dbConfig');
const { getKenyaTimeISO } = require('../../../../packages/shared-utils/dist/timestamps');
const asyncHandler = require('express-async-handler');
const { registerHearse, updateHearse, deleteHearse, getAllHearses, getAvailableHearses, upload } = require('../registerHearse');

/**
 * Get available hearses across all branches for cross-branch booking
 * This enables branches to see and book hearses from other branches
 */
const getAvailableHearsesCrossBranch = asyncHandler(async (req, res) => {
    try {
        console.log('\n🌐 [CrossBranchAvailability] Fetching available hearses across all branches...');

        const { branch_id } = req.query; // Current user's branch (to exclude from available list if needed)

        // Get all available hearses with branch information
        let query = `
            SELECT 
                h.id,
                h.number_plate,
                h.model,
                h.min_charge_ksh,
                h.max_charge_ksh,
                h.status,
                h.branch_id,
                h.image,
                h.created_at,
                h.updated_at,
                b.branch_name,
                b.location as branch_location,
                b.phone as branch_phone,
                -- Calculate if this hearse is from the requesting branch
                CASE WHEN h.branch_id = ? THEN 1 ELSE 0 END as is_own_branch,
                -- Count active bookings for this hearse
                (SELECT COUNT(*) FROM hearse_bookings hb 
                 WHERE hb.hearse_id = h.id 
                 AND hb.status NOT IN ('completed', 'cancelled')) as active_bookings
            FROM hearses h
            LEFT JOIN branches b ON h.branch_id = b.id
            WHERE h.status = 'available'
            AND h.branch_id != ?  -- Exclude own branch hearses (optional, remove if you want to show all)
            ORDER BY 
                is_own_branch DESC,  -- Own branch first
                h.branch_id ASC,
                h.created_at DESC
        `;

        const params = [branch_id || 0, branch_id || 0];

        // If no branch_id provided, show all available hearses
        if (!branch_id) {
            query = `
                SELECT 
                    h.id,
                    h.number_plate,
                    h.model,
                    h.min_charge_ksh,
                    h.max_charge_ksh,
                    h.status,
                    h.branch_id,
                    h.image,
                    h.created_at,
                    h.updated_at,
                    b.branch_name,
                    b.location as branch_location,
                    b.phone as branch_phone,
                    0 as is_own_branch,
                    (SELECT COUNT(*) FROM hearse_bookings hb 
                     WHERE hb.hearse_id = h.id 
                     AND hb.status NOT IN ('completed', 'cancelled')) as active_bookings
                FROM hearses h
                LEFT JOIN branches b ON h.branch_id = b.id
                WHERE h.status = 'available'
                ORDER BY h.branch_id ASC, h.created_at DESC
            `;
        }

        const availableHearses = await safeQuery(query, params);

        // Group by branch for better organization
        const groupedByBranch = availableHearses.reduce((acc, hearse) => {
            const branchKey = hearse.branch_id;
            if (!acc[branchKey]) {
                acc[branchKey] = {
                    branch_id: hearse.branch_id,
                    branch_name: hearse.branch_name || `Branch ${hearse.branch_id}`,
                    branch_location: hearse.branch_location || 'Unknown',
                    branch_phone: hearse.branch_phone || 'N/A',
                    hearses: []
                };
            }
            acc[branchKey].hearses.push(hearse);
            return acc;
        }, {});

        const branches = Object.values(groupedByBranch);
        const totalAvailable = availableHearses.length;

        console.log(`✅ Found ${totalAvailable} available hearses across ${branches.length} branches`);

        res.json({
            success: true,
            total_available: totalAvailable,
            total_branches: branches.length,
            branches,
            hearses: availableHearses
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
 * Returns count of available/booked hearses per branch
 */
const getAvailabilitySummary = asyncHandler(async (req, res) => {
    try {
        console.log('\n📊 [AvailabilitySummary] Fetching availability summary...');

        const query = `
            SELECT 
                b.id as branch_id,
                b.branch_name,
                b.location,
                b.phone,
                COUNT(h.id) as total_hearses,
                SUM(CASE WHEN h.status = 'available' THEN 1 ELSE 0 END) as available_hearses,
                SUM(CASE WHEN h.status = 'booked' THEN 1 ELSE 0 END) as booked_hearses,
                SUM(CASE WHEN h.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_hearses
            FROM branches b
            LEFT JOIN hearses h ON h.branch_id = b.id
            GROUP BY b.id, b.branch_name, b.location, b.phone
            ORDER BY b.id ASC
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
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { safeTenantQuery, safeTenantExecute } = require('../../../shared/dbConfig');
const { getKenyaTimeISO } = require('../../../packages/shared-utils/dist/timestamps');
const asyncHandler = require('express-async-handler');

// === Ensure uploads/hearses folder exists ===
const hearsesDir = path.join(__dirname, '../../uploads/hearses');
if (!fs.existsSync(hearsesDir)) {
    fs.mkdirSync(hearsesDir, { recursive: true });
    console.log(' Created uploads/hearses directory');
}

// === Multer Storage Config ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, hearsesDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `hearse-${uniqueSuffix}${ext}`);
    },
});
const upload = multer({ storage });

/**
 * === Register Hearse ===
 */
const registerHearse = asyncHandler(async (req, res) => {
    try {
        console.log('\n [RegisterHearse] Starting process...');
        console.log(' Uploaded file:', req.file);
        console.log(' Request body:', req.body);

        // Get tenant database name from request
        const dbName = req.tenant?.db_name;
        if (!dbName) {
            console.log(' No tenant database found');
            return res.status(400).json({
                success: false,
                message: 'Tenant database not found'
            });
        }

        const {
            plate_number,
            hearse_name,
            model,
            capacity,
            status,
            branch_id,
            branch_code,
            driver_id,
            insurance_expiry,
            service_due_date
        } = req.body;

        const image = req.file ? `uploads/hearses/${req.file.filename}` : null;

        // Validate required fields
        if (!plate_number) {
            console.log(' Missing plate_number');
            return res.status(400).json({
                success: false,
                message: 'Missing required field: plate_number.',
            });
        }

        const now = getKenyaTimeISO();

        // Auto-assign branch_id (default to 1 if not provided)
        let assigned_branch_id = branch_id || 1;

        // If branch_code is provided, look up the branch_id
        if (branch_code && !branch_id) {
            try {
                const [branch] = await safeTenantQuery(
                    dbName,
                    'SELECT branch_id FROM branches WHERE branch_code = ? LIMIT 1',
                    [branch_code]
                );
                if (branch) {
                    assigned_branch_id = branch.branch_id;
                    console.log(`[RegisterHearse] Resolved branch_code "${branch_code}" to branch_id: ${assigned_branch_id}`);
                } else {
                    console.log(`[RegisterHearse] Branch code "${branch_code}" not found, using default branch_id: 1`);
                }
            } catch (e) {
                console.log('[RegisterHearse] Error looking up branch by code, using default:', e.message);
            }
        } else if (!branch_id) {
            // Try to get the first available branch
            try {
                const [branch] = await safeTenantQuery(
                    dbName,
                    'SELECT branch_id FROM branches LIMIT 1',
                    []
                );
                if (branch) {
                    assigned_branch_id = branch.branch_id;
                }
            } catch (e) {
                console.log('⚠️ No branches table, using default branch_id: 1');
            }
        }

        // Generate hearse code
        const [countResult] = await safeTenantQuery(
            dbName,
            'SELECT COUNT(*) as count FROM hearses',
            []
        );
        const hearseNumber = String((countResult?.count || 0) + 1).padStart(3, '0');
        const hearse_code = `HRS-${hearseNumber}`;

        // Insert hearse with essential fields only
        const query = `
            INSERT INTO hearses (
                hearse_code,
                hearse_name,
                image,
                plate_number,
                model,
                capacity,
                status,
                branch_id,
                driver_id,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            hearse_code,
            hearse_name || null,
            image,
            plate_number.trim(),
            model || null,
            capacity || null,
            status || 'available',
            assigned_branch_id,
            driver_id || null,
            now,
            now
        ];

        console.log('🧠 Executing SQL:', query);
        console.log('🧩 Parameters:', params);

        const result = await safeTenantExecute(dbName, query, params);

        console.log('✅ Hearse Insert Result:', result);

        return res.status(201).json({
            success: true,
            message: 'Hearse registered successfully.',
            data: {
                id: result.insertId,
                hearse_code: hearse_code,
                hearse_name: hearse_name || null,
                plate_number: plate_number,
                image_path: image,
                branch_id: branch_id,
                status: status || 'available'
            }
        });
    } catch (error) {
        console.error('❌ [RegisterHearse Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while registering hearse.',
            error: error.message || error,
        });
    }
});

/**
 * === Update Hearse ===
 */
const updateHearse = asyncHandler(async (req, res) => {
    try {
        console.log('\n🔧 [UpdateHearse] Updating hearse ID:', req.params.id);
        const { id } = req.params;
        const dbName = req.tenant?.db_name;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'Tenant database not found'
            });
        }

        const {
            plate_number,
            hearse_name,
            model,
            capacity,
            min_charge_ksh,
            max_charge_ksh,
            status,
            branch_id,
            driver_id,
            make,
            year,
            description,
            features,
            chassis_number,
            engine_number,
            insurance_expiry,
            service_due_date
        } = req.body;

        const image = req.file ? `uploads/hearses/${req.file.filename}` : null;
        const now = getKenyaTimeISO();

        // Build dynamic update query
        const fields = [];
        const values = [];

        if (image) {
            fields.push('image = ?');
            values.push(image);
        }
        if (plate_number) {
            fields.push('plate_number = ?');
            values.push(plate_number);
        }
        if (hearse_name) {
            fields.push('hearse_name = ?');
            values.push(hearse_name);
        }
        if (model) {
            fields.push('model = ?');
            values.push(model);
        }
        if (capacity !== undefined && capacity !== null) {
            fields.push('capacity = ?');
            values.push(capacity);
        }
        if (min_charge_ksh !== undefined && min_charge_ksh !== null) {
            fields.push('min_charge_ksh = ?');
            values.push(min_charge_ksh);
        }
        if (max_charge_ksh !== undefined && max_charge_ksh !== null) {
            fields.push('max_charge_ksh = ?');
            values.push(max_charge_ksh);
        }
        if (status) {
            fields.push('status = ?');
            values.push(status);
        }
        if (branch_id) {
            fields.push('branch_id = ?');
            values.push(branch_id);
        }
        if (driver_id !== undefined && driver_id !== null) {
            fields.push('driver_id = ?');
            values.push(driver_id);
        }
        if (make) {
            fields.push('make = ?');
            values.push(make);
        }
        if (year) {
            fields.push('year = ?');
            values.push(year);
        }
        if (description) {
            fields.push('description = ?');
            values.push(description);
        }
        if (features) {
            fields.push('features = ?');
            values.push(features);
        }
        if (chassis_number) {
            fields.push('chassis_number = ?');
            values.push(chassis_number);
        }
        if (engine_number) {
            fields.push('engine_number = ?');
            values.push(engine_number);
        }
        if (insurance_expiry) {
            fields.push('insurance_expiry = ?');
            values.push(insurance_expiry);
        }
        if (service_due_date) {
            fields.push('service_due_date = ?');
            values.push(service_due_date);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        const query = `UPDATE hearses SET ${fields.join(', ')} WHERE id = ?`;

        console.log('🧠 Update SQL:', query);
        console.log('🧩 Params:', values);

        await safeTenantExecute(dbName, query, values);

        return res.json({
            success: true,
            message: 'Hearse updated successfully.',
        });
    } catch (error) {
        console.error('❌ [UpdateHearse Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating hearse.',
            error: error.message,
        });
    }
});

/**
 * === Delete Hearse ===
 */
const deleteHearse = asyncHandler(async (req, res) => {
    try {
        console.log('\n🗑️ [DeleteHearse] Deleting hearse ID:', req.params.id);
        const { id } = req.params;
        const dbName = req.tenant?.db_name;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'Tenant database not found'
            });
        }

        // Get image path before deleting
        const [hearse] = await safeTenantQuery(
            dbName,
            'SELECT image FROM hearses WHERE id = ?',
            [id]
        );

        console.log('🖼️ Hearse found for deletion:', hearse);

        // Delete image file if exists
        if (hearse && hearse.image) {
            const imagePath = path.join(__dirname, '../../', hearse.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('🧹 Image file deleted:', hearse.image);
            }
        }

        await safeTenantExecute(dbName, 'DELETE FROM hearses WHERE id = ?', [id]);
        console.log('✅ Hearse deleted successfully.');

        return res.json({
            success: true,
            message: 'Hearse deleted successfully.',
        });
    } catch (error) {
        console.error('❌ [DeleteHearse Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting hearse.',
            error: error.message,
        });
    }
});

/**
 * === Get All Hearses ===
 */
const getAllHearses = asyncHandler(async (req, res) => {
    try {
        console.log('\n🚚 [GetAllHearses] Fetching all hearses...');
        const dbName = req.tenant?.db_name;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'Tenant database not found'
            });
        }

        const hearses = await safeTenantQuery(
            dbName,
            `SELECT 
                h.*,
                b.branch_name,
                b.branch_location as location,
                b.branch_code
            FROM hearses h
            LEFT JOIN branches b ON h.branch_id = b.branch_id
            ORDER BY h.created_at DESC`,
            []
        );

        // Generate ETag for caching
        const etag = crypto.createHash('md5').update(JSON.stringify(hearses)).digest('hex');
        res.set('Cache-Control', 'public, max-age=300');
        res.set('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
            console.log('⚡ Cache hit: Returning 304');
            return res.status(304).end();
        }

        console.log(`✅ ${hearses.length} hearses fetched.`);
        res.json({
            success: true,
            count: hearses.length,
            hearses,
        });
    } catch (error) {
        console.error('❌ [GetAllHearses Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching hearses.',
            error: error.message,
        });
    }
});

/**
 * === Get Available Hearses ===
 */
const getAvailableHearses = asyncHandler(async (req, res) => {
    try {
        console.log('\n🚛 [GetAvailableHearses] Fetching only available hearses...');
        const dbName = req.tenant?.db_name;

        if (!dbName) {
            return res.status(400).json({
                success: false,
                message: 'Tenant database not found'
            });
        }

        const hearses = await safeTenantQuery(
            dbName,
            `SELECT 
                h.*,
                b.branch_name,
                b.branch_location as location,
                b.branch_code
            FROM hearses h
            LEFT JOIN branches b ON h.branch_id = b.branch_id
            WHERE h.status = 'available' 
            ORDER BY h.created_at DESC`,
            []
        );

        const etag = crypto.createHash('md5').update(JSON.stringify(hearses)).digest('hex');
        res.set('Cache-Control', 'public, max-age=300');
        res.set('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
            console.log('⚡ Cache hit: Returning 304');
            return res.status(304).end();
        }

        console.log(`✅ ${hearses.length} available hearses fetched.`);
        res.json({
            success: true,
            count: hearses.length,
            hearses,
        });
    } catch (error) {
        console.error('❌ [GetAvailableHearses Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching available hearses.',
            error: error.message,
        });
    }
});

module.exports = {
    registerHearse,
    updateHearse,
    deleteHearse,
    getAllHearses,
    getAvailableHearses,
    upload,
};
/**
 * Coffin Controller - JavaScript wrapper for the TypeScript controller
 * This bridge allows the CommonJS routes file to use the TypeScript controller
 * when loaded via ts-node (which handles .ts requires from .ts files)
 */

const { safeQuery, getConnection, releaseConnection } = require('../../shared/database');
const { validateTenantActive } = require('../../shared/tenancy');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');

// ============================================
// COFFIN CONTROLLER (JavaScript version)
// ============================================

// Generate a unique coffin ID
const generateCoffinId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `COF-${timestamp}-${random}`;
};

// Exchange rates
const EXCHANGE_RATES = { USD: 150, KES: 1 };

// In-memory cache (replace with Redis in production)
const coffinCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

const getCached = (key) => {
    const cached = coffinCache.get(key);
    if (cached && cached.expiry > Date.now()) return cached.data;
    coffinCache.delete(key);
    return null;
};

const setCached = (key, data) => {
    coffinCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
};

const clearCache = (pattern) => {
    if (pattern) {
        for (const key of coffinCache.keys()) {
            if (key.includes(pattern)) coffinCache.delete(key);
        }
    } else {
        coffinCache.clear();
    }
};

/**
 * CREATE COFFIN - POST /api/v1/restpoint/coffins/register
 */
const createCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    let connection = null;

    try {
        const {
            custom_id, type, material, exact_price, currency, quantity,
            supplier, origin, color, size, category, created_by
        } = req.body;

        // Validation
        if (!type || !material || !exact_price) {
            return res.status(400).json({ success: false, message: 'Missing required fields: type, material, exact_price' });
        }

        const price = parseFloat(exact_price);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ success: false, message: 'Invalid price' });
        }

        const finalCoffinId = custom_id || generateCoffinId();
        const finalCurrency = currency || 'KES';

        // Calculate prices
        let priceKES, priceUSD;
        if (finalCurrency === 'USD') {
            priceUSD = price;
            priceKES = price * EXCHANGE_RATES.USD;
        } else {
            priceKES = price;
            priceUSD = price / EXCHANGE_RATES.USD;
        }

        // Find user ID if created_by is provided
        let userId = null;
        if (created_by) {
            const users = await safeQuery(
                'SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?) LIMIT 1',
                [created_by.trim(), created_by.trim()]
            );
            userId = users[0]?.id || null;
        } else if (req.user?.userId) {
            userId = parseInt(req.user.userId);
        }

        connection = await getConnection();
        await connection.beginTransaction();

        // Check for duplicate custom ID
        if (custom_id) {
            const [existing] = await connection.query(
                'SELECT coffin_id FROM coffins WHERE custom_id = ? AND tenant_id = ?',
                [custom_id, tenantSlug]
            );
            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Custom ID already exists' });
            }
        }

        // Insert coffin
        const insertSql = `
      INSERT INTO coffins (
        custom_id, tenant_id, type, material, exact_price, currency, 
        price_usd, exchange_rate, quantity, supplier, origin, color, 
        size, category, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

        const [result] = await connection.query(insertSql, [
            finalCoffinId, tenantSlug, type.trim(), material.trim(), priceKES, finalCurrency,
            priceUSD, EXCHANGE_RATES.USD, parseInt(quantity) || 1,
            supplier?.trim() || null, origin?.trim() || null, color?.trim() || null,
            size?.trim() || null, category || 'locally_made', userId
        ]);

        const coffinDbId = result.insertId;

        // Process images if any
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // Handle images with multer memory storage - files are in req.files
            for (let i = 0; i < Math.min(req.files.length, 10); i++) {
                const file = req.files[i];
                const imageName = `coffin-${coffinDbId}-${Date.now()}-${i}.jpg`;
                const imageUrl = `/uploads/coffins/${tenantSlug}/${imageName}`;
                imageUrls.push(imageUrl);
            }

            if (imageUrls.length > 0) {
                const imageSql = `INSERT INTO coffin_images (coffin_id, tenant_id, image_url, created_at) VALUES ?`;
                const imageValues = imageUrls.map(url => [coffinDbId, tenantSlug, url, new Date().toISOString()]);
                await connection.query(imageSql, [imageValues]);
            }
        }

        await connection.commit();

        // Clear cache
        clearCache('allCoffins');

        return res.status(201).json({
            success: true,
            message: 'Coffin created successfully',
            coffin_id: finalCoffinId,
            database_id: coffinDbId,
            images: { count: imageUrls.length, urls: imageUrls },
            pricing: { price_kes: priceKES, price_usd: priceUSD, currency: finalCurrency },
            data: { coffin_id: finalCoffinId, type, material, quantity: parseInt(quantity) || 1 }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Create coffin error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Custom ID already exists' });
        }
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * GET ALL COFFINS
 */
const getAllCoffins = async (req, res) => {
    const tenantSlug = req.tenantSlug;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const cacheKey = `allCoffins_${tenantSlug}`;
        let coffins = getCached(cacheKey);

        if (!coffins) {
            const sql = `
        SELECT 
          c.*, 
          u.name as created_by_name,
          GROUP_CONCAT(DISTINCT ci.image_url) as image_urls
        FROM coffins c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN coffin_images ci ON c.coffin_id = ci.coffin_id AND c.tenant_id = ci.tenant_id
        WHERE c.tenant_id = ? AND c.is_deleted = FALSE
        GROUP BY c.coffin_id
        ORDER BY c.created_at DESC
      `;

            coffins = await safeQuery(sql, [tenantSlug]);

            coffins = coffins.map(coffin => ({
                ...coffin,
                exact_price: parseFloat(coffin.exact_price),
                price_usd: parseFloat(coffin.price_usd),
                images: coffin.image_urls ? coffin.image_urls.split(',').slice(0, 10) : [],
                primary_image: coffin.image_urls ? coffin.image_urls.split(',')[0] : null,
                display_price: coffin.currency === 'USD'
                    ? `$${parseFloat(coffin.price_usd).toFixed(2)} (Ksh ${parseFloat(coffin.exact_price).toFixed(2)})`
                    : `Ksh ${parseFloat(coffin.exact_price).toFixed(2)} ($${parseFloat(coffin.price_usd).toFixed(2)})`
            }));

            setCached(cacheKey, coffins);
        }

        return res.status(200).json({
            success: true,
            data: coffins,
            count: coffins.length,
            tenant: tenantSlug
        });

    } catch (error) {
        console.error('Get all coffins error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET COFFIN BY ID
 */
const getCoffinById = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const cacheKey = `coffin_${tenantSlug}_${id}`;
        let coffin = getCached(cacheKey);

        if (!coffin) {
            const sql = `
        SELECT 
          c.*, 
          u.name as created_by_name,
          GROUP_CONCAT(DISTINCT ci.image_url) as image_urls
        FROM coffins c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN coffin_images ci ON c.coffin_id = ci.coffin_id AND c.tenant_id = ci.tenant_id
        WHERE (c.coffin_id = ? OR c.custom_id = ?) AND c.tenant_id = ? AND c.is_deleted = FALSE
        GROUP BY c.coffin_id
      `;

            const coffins = await safeQuery(sql, [id, id, tenantSlug]);

            if (coffins.length === 0) {
                return res.status(404).json({ success: false, message: 'Coffin not found' });
            }

            coffin = coffins[0];
            coffin.images = coffin.image_urls ? coffin.image_urls.split(',').slice(0, 10) : [];
            coffin.exact_price = parseFloat(coffin.exact_price);
            coffin.price_usd = parseFloat(coffin.price_usd);

            setCached(cacheKey, coffin);
        }

        return res.status(200).json({ success: true, data: coffin });

    } catch (error) {
        console.error('Get coffin by ID error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * UPDATE COFFIN
 */
const updateCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    let connection = null;

    try {
        const { type, material, exact_price, currency, quantity, supplier, origin, color, size, category } = req.body;

        // Check if coffin exists
        const existingCoffin = await safeQuery(
            'SELECT * FROM coffins WHERE (coffin_id = ? OR custom_id = ?) AND tenant_id = ?',
            [id, id, tenantSlug]
        );

        if (existingCoffin.length === 0) {
            return res.status(404).json({ success: false, message: 'Coffin not found' });
        }

        connection = await getConnection();
        await connection.beginTransaction();

        const updateFields = [];
        const updateValues = [];

        if (type) { updateFields.push('type = ?'); updateValues.push(type.trim()); }
        if (material) { updateFields.push('material = ?'); updateValues.push(material.trim()); }
        if (exact_price !== undefined) {
            const price = parseFloat(exact_price);
            const cur = currency || existingCoffin[0].currency || 'KES';
            if (cur === 'USD') {
                updateFields.push('exact_price = ?, price_usd = ?');
                updateValues.push(price * EXCHANGE_RATES.USD, price);
            } else {
                updateFields.push('exact_price = ?, price_usd = ?');
                updateValues.push(price, price / EXCHANGE_RATES.USD);
            }
        }
        if (currency) { updateFields.push('currency = ?'); updateValues.push(currency); }
        if (quantity !== undefined) { updateFields.push('quantity = ?'); updateValues.push(parseInt(quantity)); }
        if (supplier !== undefined) { updateFields.push('supplier = ?'); updateValues.push(supplier?.trim() || null); }
        if (origin !== undefined) { updateFields.push('origin = ?'); updateValues.push(origin?.trim() || null); }
        if (color !== undefined) { updateFields.push('color = ?'); updateValues.push(color?.trim() || null); }
        if (size !== undefined) { updateFields.push('size = ?'); updateValues.push(size?.trim() || null); }
        if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }

        updateFields.push('updated_at = NOW()');
        updateValues.push(id, id, tenantSlug);

        if (updateFields.length > 1) {
            const updateSql = `
        UPDATE coffins 
        SET ${updateFields.join(', ')} 
        WHERE (coffin_id = ? OR custom_id = ?) AND tenant_id = ? AND is_deleted = FALSE
      `;
            await connection.query(updateSql, updateValues);
        }

        await connection.commit();

        // Clear caches
        clearCache('allCoffins');
        clearCache(`coffin_${tenantSlug}`);

        return res.status(200).json({ success: true, message: 'Coffin updated successfully' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Update coffin error:', error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * DELETE COFFIN (Soft Delete)
 */
const deleteCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    let connection = null;

    try {
        connection = await getConnection();
        await connection.beginTransaction();

        // Check if coffin has assignments
        const [assignments] = await connection.query(
            `SELECT id FROM deceased_coffin 
       WHERE coffin_id = (SELECT coffin_id FROM coffins WHERE (coffin_id = ? OR custom_id = ?) AND tenant_id = ?)`,
            [id, id, tenantSlug]
        );

        if (assignments.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot delete coffin with existing assignments to deceased persons'
            });
        }

        // Soft delete
        await connection.query(
            'UPDATE coffins SET is_deleted = TRUE WHERE (coffin_id = ? OR custom_id = ?) AND tenant_id = ?',
            [id, id, tenantSlug]
        );

        await connection.commit();

        // Clear caches
        clearCache('allCoffins');
        clearCache(`coffin_${tenantSlug}`);

        return res.status(200).json({ success: true, message: 'Coffin deleted successfully' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Delete coffin error:', error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * ASSIGN COFFIN TO DECEASED
 */
const assignCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { deceased_id, coffin_id, assigned_by, assigned_date, deceased_name } = req.body;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    if (!deceased_id || !coffin_id || !deceased_name) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: deceased_id, coffin_id, deceased_name'
        });
    }

    let connection = null;

    try {
        connection = await getConnection();
        await connection.beginTransaction();

        // Check coffin availability
        const [coffins] = await connection.query(
            `SELECT coffin_id, quantity, type, material FROM coffins 
       WHERE (coffin_id = ? OR custom_id = ?) AND tenant_id = ? AND is_deleted = FALSE FOR UPDATE`,
            [coffin_id, coffin_id, tenantSlug]
        );

        if (coffins.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Coffin not found' });
        }

        if (coffins[0].quantity <= 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Coffin out of stock' });
        }

        const rfid = `RFID-${crypto.createHash('md5').update(`${deceased_name}-${Date.now()}`).digest('hex').substring(0, 8).toUpperCase()}`;
        const finalAssignedDate = assigned_date || new Date().toISOString().split('T')[0];
        const assignedBy = assigned_by || req.user?.name || 'system';

        // Insert assignment
        const [insertResult] = await connection.query(
            `INSERT INTO deceased_coffin (deceased_id, coffin_id, tenant_id, assigned_by_username, assigned_date, rfid, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [deceased_id, coffins[0].coffin_id, tenantSlug, assignedBy, finalAssignedDate, rfid]
        );

        // Update coffin stock
        await connection.query(
            'UPDATE coffins SET quantity = quantity - 1, updated_at = NOW() WHERE coffin_id = ? AND tenant_id = ?',
            [coffins[0].coffin_id, tenantSlug]
        );

        await connection.commit();

        // Clear cache
        clearCache('allCoffins');

        return res.status(201).json({
            success: true,
            message: 'Coffin assigned successfully',
            assignment_id: insertResult.insertId,
            rfid,
            coffin_details: { type: coffins[0].type, material: coffins[0].material }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Assign coffin error:', error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * GET COFFIN ANALYTICS
 */
const getCoffinAnalytics = async (req, res) => {
    const tenantSlug = req.tenantSlug;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const cacheKey = `coffinAnalytics_${tenantSlug}`;
        let analytics = getCached(cacheKey);

        if (!analytics) {
            const [overview] = await safeQuery(`
        SELECT 
          COUNT(*) AS total_coffins,
          SUM(quantity) AS total_in_stock,
          SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock_count,
          SUM(CASE WHEN quantity > 0 THEN 1 ELSE 0 END) AS available_types,
          COUNT(DISTINCT type) as unique_types,
          COUNT(DISTINCT material) as unique_materials,
          SUM(exact_price * quantity) AS total_inventory_value
        FROM coffins
        WHERE tenant_id = ? AND is_deleted = FALSE
      `, [tenantSlug]);

            analytics = {
                overview: {
                    total_coffins: overview[0]?.total_coffins || 0,
                    total_in_stock: overview[0]?.total_in_stock || 0,
                    out_of_stock_count: overview[0]?.out_of_stock_count || 0,
                    available_types: overview[0]?.available_types || 0,
                    unique_types: overview[0]?.unique_types || 0,
                    unique_materials: overview[0]?.unique_materials || 0,
                    total_inventory_value: parseFloat(overview[0]?.total_inventory_value || 0).toFixed(2),
                },
                last_updated: new Date().toISOString()
            };

            setCached(cacheKey, analytics);
        }

        return res.status(200).json({
            success: true,
            data: analytics,
            tenant: tenantSlug
        });

    } catch (error) {
        console.error('Get coffin analytics error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * HEALTH CHECK
 */
const healthCheck = async (req, res) => {
    return res.status(200).json({
        status: 'UP',
        service: 'coffin-service',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    createCoffin,
    getAllCoffins,
    getCoffinById,
    updateCoffin,
    deleteCoffin,
    assignCoffin,
    getCoffinAnalytics,
    healthCheck
};
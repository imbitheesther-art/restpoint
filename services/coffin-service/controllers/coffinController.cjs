/**
 * Coffin Controller - Complete inventory management with cross-branch requests
 */

const { query, execute } = require('../../../shared/dbConfig');
const { validateTenantActive } = require('../../../shared/tenancy');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const slugify = require('slugify');

// ============================================
// CONFIGURATION
// ============================================

const EXCHANGE_RATES = { USD: 150, KES: 1 };
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// In-memory cache
const coffinCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

const generateCoffinId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `COF-${timestamp}-${random}`;
};

const sharp = require('sharp');

const ensureUploadDir = async (tenantSlug) => {
    const dir = path.join(__dirname, '../../uploads/coffins', tenantSlug);
    await fs.mkdir(dir, { recursive: true });
    return dir;
};

const compressAndSaveImage = async (buffer, filename, tenantSlug) => {
    const dir = await ensureUploadDir(tenantSlug);
    // WebP output for ~50% smaller files than JPEG at same quality
    const filepath = path.join(dir, filename.replace(/\.\w+$/, '.webp'));

    await sharp(buffer)
        .resize(1200, null, {
            withoutEnlargement: true,
            fit: 'inside'
        })
        .webp({ quality: 80, effort: 6 })
        .toFile(filepath);

    return `/uploads/coffins/${tenantSlug}/${path.basename(filepath)}`;
};

const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', class: 'out', icon: 'fa-circle-xmark' };
    if (stock <= 2) return { label: 'Low Stock', class: 'lo', icon: 'fa-triangle-exclamation' };
    return { label: 'Available', class: 'av', icon: 'fa-circle-check' };
};

const getBookingStatus = (status) => {
    const statusMap = {
        pending: { label: 'Pending', class: 'pn', icon: 'fa-clock' },
        booked: { label: 'Booked', class: 'bk', icon: 'fa-calendar-check' },
        completed: { label: 'Completed', class: 'cp', icon: 'fa-check-circle' },
        cancelled: { label: 'Cancelled', class: 'ca', icon: 'fa-times-circle' },
        approved: { label: 'Approved', class: 'ap', icon: 'fa-check-circle' },
        rejected: { label: 'Rejected', class: 'rj', icon: 'fa-times-circle' },
        transferring: { label: 'Transferring', class: 'tf', icon: 'fa-truck' },
        delivered: { label: 'Delivered', class: 'dl', icon: 'fa-check-double' }
    };
    return statusMap[status] || statusMap.pending;
};

// ============================================
// COFFIN CRUD
// ============================================

const createCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;

    if (!tenantSlug || tenantSlug === 'system_shared') {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const {
            name, sku, type, material, price, stock, notes, size, color
        } = req.body;

        // Validation
        if (!name || !type || !material || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, type, material, price'
            });
        }

        const coffinId = generateCoffinId();
        const finalStock = parseInt(stock) || 0;
        const finalPrice = parseFloat(price);
        const finalSize = size || null;
        const finalColor = color || null;

        // Generate SKU from name using slugify if not provided
        const finalSku = sku || slugify(name, { lower: true, strict: true }).substring(0, 20);

        // Check for duplicate SKU
        const existing = await query(req,
            'SELECT coffin_id FROM coffins WHERE sku = ? AND tenant_slug = ?',
            [finalSku, tenantSlug]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'SKU already exists' });
        }

        // Insert coffin
        const insertSql = `
            INSERT INTO coffins (
                coffin_id, tenant_slug, name, sku, type, material,
                price, stock, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const result = await query(req, insertSql, [
            coffinId, tenantSlug, name.trim(), finalSku,
            type.trim(), material.trim(), finalPrice, finalStock,
            notes?.trim() || null
        ]);

        const coffinDbId = result.insertId;

        // Process images if any
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < Math.min(req.files.length, 10); i++) {
                const file = req.files[i];
                const imageName = `coffin-${coffinDbId}-${Date.now()}-${i}.jpg`;
                const imageUrl = await compressAndSaveImage(file.buffer, imageName, tenantSlug);
                imageUrls.push(imageUrl);
            }

            if (imageUrls.length > 0) {
                const imageSql = `INSERT INTO coffin_images (coffin_id, tenant_slug, image_url, created_at) VALUES ?`;
                const imageValues = imageUrls.map(url => [coffinDbId, tenantSlug, url, new Date().toISOString()]);
                await query(req, imageSql, [imageValues]);
            }
        }

        clearCache('allCoffins');

        return res.status(201).json({
            success: true,
            message: 'Coffin created successfully',
            data: {
                coffin_id: coffinId,
                database_id: coffinDbId,
                name,
                sku: finalSku,
                type,
                material,
                price: finalPrice,
                stock: finalStock,
                size: finalSize,
                color: finalColor,
                images: imageUrls
            }
        });

    } catch (error) {
        console.error('Create coffin error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCoffins = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const branchId = req.headers['x-branch-id'] || req.tenant?.branch_id;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const cacheKey = `allCoffins_${tenantSlug}_${branchId || 'all'}`;
        let coffins = getCached(cacheKey);

        if (!coffins) {
            let sql = `
                SELECT 
                    c.*,
                    b.name as branch_name,
                    b.color as branch_color,
                    GROUP_CONCAT(DISTINCT ci.image_url) as image_urls
                FROM coffins c
                LEFT JOIN branches b ON c.branch_id = b.id AND c.tenant_slug = b.tenant_slug
                LEFT JOIN coffin_images ci ON c.coffin_id = ci.coffin_id AND c.tenant_slug = ci.tenant_slug
                WHERE c.tenant_slug = ? AND c.is_deleted = FALSE
            `;

            const params = [tenantSlug];

            // Filter by branch if specified
            if (branchId) {
                sql += ' AND c.branch_id = ?';
                params.push(branchId);
            }

            sql += ' GROUP BY c.coffin_id ORDER BY c.created_at DESC';

            coffins = await query(req, sql, params);

            coffins = coffins.map(coffin => ({
                ...coffin,
                price: parseFloat(coffin.price),
                images: coffin.image_urls ? coffin.image_urls.split(',').slice(0, 10) : [],
                primary_image: coffin.image_urls ? coffin.image_urls.split(',')[0] : null,
                stock_status: getStockStatus(coffin.stock)
            }));

            setCached(cacheKey, coffins);
        }

        return res.status(200).json({
            success: true,
            data: coffins,
            count: coffins.length,
            tenant: tenantSlug,
            branch: branchId
        });

    } catch (error) {
        console.error('Get all coffins error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

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
                    b.name as branch_name,
                    b.color as branch_color,
                    GROUP_CONCAT(DISTINCT ci.image_url) as image_urls
                FROM coffins c
                LEFT JOIN branches b ON c.branch_id = b.id AND c.tenant_slug = b.tenant_slug
                LEFT JOIN coffin_images ci ON c.coffin_id = ci.coffin_id AND c.tenant_slug = ci.tenant_slug
                WHERE (c.coffin_id = ? OR c.sku = ?) AND c.tenant_slug = ? AND c.is_deleted = FALSE
                GROUP BY c.coffin_id
            `;

            const coffins = await query(req, sql, [id, id, tenantSlug]);

            if (coffins.length === 0) {
                return res.status(404).json({ success: false, message: 'Coffin not found' });
            }

            coffin = coffins[0];
            coffin.images = coffin.image_urls ? coffin.image_urls.split(',').slice(0, 10) : [];
            coffin.price = parseFloat(coffin.price);
            coffin.stock_status = getStockStatus(coffin.stock);

            setCached(cacheKey, coffin);
        }

        return res.status(200).json({ success: true, data: coffin });

    } catch (error) {
        console.error('Get coffin by ID error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const { name, sku, type, material, price, stock, notes, branch_id } = req.body;

        // Check if coffin exists
        const existingCoffin = await query(req,
            'SELECT * FROM coffins WHERE coffin_id = ? AND tenant_slug = ? AND is_deleted = FALSE',
            [id, tenantSlug]
        );

        if (existingCoffin.length === 0) {
            return res.status(404).json({ success: false, message: 'Coffin not found' });
        }

        const updateFields = [];
        const updateValues = [];

        if (name) { updateFields.push('name = ?'); updateValues.push(name.trim()); }
        if (sku) { updateFields.push('sku = ?'); updateValues.push(sku.trim()); }
        if (type) { updateFields.push('type = ?'); updateValues.push(type.trim()); }
        if (material) { updateFields.push('material = ?'); updateValues.push(material.trim()); }
        if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(parseFloat(price)); }
        if (stock !== undefined) { updateFields.push('stock = ?'); updateValues.push(parseInt(stock)); }
        if (notes !== undefined) { updateFields.push('notes = ?'); updateValues.push(notes?.trim() || null); }
        if (branch_id) { updateFields.push('branch_id = ?'); updateValues.push(branch_id); }

        updateFields.push('updated_at = NOW()');
        updateValues.push(id, tenantSlug);

        if (updateFields.length > 2) {
            const updateSql = `
                UPDATE coffins 
                SET ${updateFields.join(', ')} 
                WHERE coffin_id = ? AND tenant_slug = ? AND is_deleted = FALSE
            `;
            await query(req, updateSql, updateValues);
        }

        // Handle new images
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < Math.min(req.files.length, 10); i++) {
                const file = req.files[i];
                const imageName = `coffin-${id}-${Date.now()}-${i}.jpg`;
                const imageUrl = await compressAndSaveImage(file.buffer, imageName, tenantSlug);

                await query(req,
                    'INSERT INTO coffin_images (coffin_id, tenant_slug, image_url, created_at) VALUES (?, ?, ?, NOW())',
                    [id, tenantSlug, imageUrl]
                );
            }
        }

        clearCache('allCoffins');
        clearCache(`coffin_${tenantSlug}_${id}`);

        return res.status(200).json({ success: true, message: 'Coffin updated successfully' });

    } catch (error) {
        console.error('Update coffin error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCoffin = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        // Check if coffin has bookings
        const bookings = await query(req,
            'SELECT id FROM bookings WHERE coffin_id = ? AND tenant_slug = ? AND status != "cancelled"',
            [id, tenantSlug]
        );

        if (bookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete coffin with active bookings'
            });
        }

        // Soft delete
        await query(req,
            'UPDATE coffins SET is_deleted = TRUE, updated_at = NOW() WHERE coffin_id = ? AND tenant_slug = ?',
            [id, tenantSlug]
        );

        clearCache('allCoffins');
        clearCache(`coffin_${tenantSlug}_${id}`);

        return res.status(200).json({ success: true, message: 'Coffin deleted successfully' });

    } catch (error) {
        console.error('Delete coffin error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// BOOKINGS
// ============================================

const createBooking = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const branchId = req.tenant?.branch_id || req.headers['x-branch-id'];

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const {
            client_name, client_phone, deceased_name, coffin_id,
            service_date, notes, paid, specifications
        } = req.body;

        if (!client_name || !deceased_name || !coffin_id || !service_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: client_name, deceased_name, coffin_id, service_date'
            });
        }

        // Check if coffin exists and has stock
        const coffins = await query(req,
            'SELECT * FROM coffins WHERE coffin_id = ? AND tenant_slug = ? AND is_deleted = FALSE',
            [coffin_id, tenantSlug]
        );

        if (coffins.length === 0) {
            return res.status(404).json({ success: false, message: 'Coffin not found' });
        }

        const coffin = coffins[0];
        if (coffin.stock <= 0) {
            return res.status(400).json({ success: false, message: 'Coffin out of stock' });
        }

        // Create booking
        const bookingSql = `
            INSERT INTO bookings (
                tenant_slug, branch_id, client_name, client_phone, deceased_name,
                coffin_id, service_date, notes, paid, specifications, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const result = await query(req, bookingSql, [
            tenantSlug, branchId, client_name.trim(), client_phone?.trim() || null,
            deceased_name.trim(), coffin_id, service_date,
            notes?.trim() || null, paid ? 1 : 0,
            specifications ? JSON.stringify(specifications) : null
        ]);

        const bookingId = result.insertId;

        // Deduct stock
        await query(req,
            'UPDATE coffins SET stock = stock - 1, updated_at = NOW() WHERE coffin_id = ? AND tenant_slug = ?',
            [coffin_id, tenantSlug]
        );

        clearCache('allCoffins');

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking_id: bookingId,
            coffin: {
                name: coffin.name,
                sku: coffin.sku,
                price: coffin.price
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBookings = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const branchId = req.headers['x-branch-id'] || req.tenant?.branch_id;
    const { status, search } = req.query;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        let sql = `
            SELECT 
                b.*,
                c.name as coffin_name,
                c.sku as coffin_sku,
                c.price as coffin_price,
                c.type as coffin_type,
                GROUP_CONCAT(DISTINCT ci.image_url) as coffin_images
            FROM bookings b
            LEFT JOIN coffins c ON b.coffin_id = c.coffin_id AND b.tenant_slug = c.tenant_slug
            LEFT JOIN coffin_images ci ON b.coffin_id = ci.coffin_id AND b.tenant_slug = ci.tenant_slug
            WHERE b.tenant_slug = ?
        `;
        const params = [tenantSlug];

        if (branchId) {
            sql += ' AND b.branch_id = ?';
            params.push(branchId);
        }

        if (status && status !== 'all') {
            sql += ' AND b.status = ?';
            params.push(status);
        }

        if (search) {
            sql += ' AND (b.client_name LIKE ? OR b.deceased_name LIKE ? OR b.coffin_id LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' GROUP BY b.id ORDER BY b.created_at DESC';

        const bookings = await query(req, sql, params);

        const formatted = bookings.map(booking => ({
            ...booking,
            coffin_price: parseFloat(booking.coffin_price),
            paid: Boolean(booking.paid),
            specifications: booking.specifications ? JSON.parse(booking.specifications) : [],
            coffin_images: booking.coffin_images ? booking.coffin_images.split(',').slice(0, 5) : [],
            status_display: getBookingStatus(booking.status)
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            count: formatted.length
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;
    const { status } = req.body;

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    try {
        const result = await query(req,
            'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_slug = ?',
            [status, id, tenantSlug]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        return res.status(200).json({
            success: true,
            message: `Booking updated to ${status}`
        });

    } catch (error) {
        console.error('Update booking error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// CROSS-BRANCH STOCK REQUESTS
// ============================================

const createStockRequest = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const fromBranchId = req.tenant?.branch_id || req.headers['x-branch-id'];

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const {
            to_branch_id, coffin_id, quantity, client_name, client_phone,
            deceased_name, service_date, notes, specifications
        } = req.body;

        if (!to_branch_id || !coffin_id || !quantity || !deceased_name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to_branch_id, coffin_id, quantity, deceased_name'
            });
        }

        // Verify coffin exists at the target branch
        const targetCoffins = await query(req,
            'SELECT * FROM coffins WHERE coffin_id = ? AND branch_id = ? AND tenant_slug = ? AND is_deleted = FALSE AND stock >= ?',
            [coffin_id, to_branch_id, tenantSlug, quantity]
        );

        if (targetCoffins.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock at target branch'
            });
        }

        const coffin = targetCoffins[0];

        // Create stock request
        const requestSql = `
            INSERT INTO stock_requests (
                tenant_slug, from_branch_id, to_branch_id, coffin_id, quantity,
                client_name, client_phone, deceased_name, service_date,
                notes, specifications, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const result = await query(req, requestSql, [
            tenantSlug, fromBranchId, to_branch_id, coffin_id, quantity,
            client_name?.trim() || null, client_phone?.trim() || null,
            deceased_name.trim(), service_date || null,
            notes?.trim() || null,
            specifications ? JSON.stringify(specifications) : null
        ]);

        const requestId = result.insertId;

        // Create tracking
        const trackingSql = `
            INSERT INTO stock_request_tracking (request_id, tenant_slug, status, notes, created_at)
            VALUES (?, ?, 'pending', 'Request sent', NOW())
        `;
        await query(req, trackingSql, [requestId, tenantSlug]);

        return res.status(201).json({
            success: true,
            message: 'Stock request created successfully',
            request_id: requestId,
            coffin: {
                name: coffin.name,
                sku: coffin.sku,
                available_stock: coffin.stock
            }
        });

    } catch (error) {
        console.error('Create stock request error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStockRequests = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const branchId = req.tenant?.branch_id || req.headers['x-branch-id'];

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        // Incoming requests (to this branch)
        const incomingSql = `
            SELECT 
                sr.*,
                c.name as coffin_name,
                c.sku as coffin_sku,
                c.type as coffin_type,
                c.material as coffin_material,
                b_from.name as from_branch_name,
                b_from.color as from_branch_color,
                GROUP_CONCAT(DISTINCT ci.image_url) as coffin_images
            FROM stock_requests sr
            LEFT JOIN coffins c ON sr.coffin_id = c.coffin_id AND sr.tenant_slug = c.tenant_slug
            LEFT JOIN branches b_from ON sr.from_branch_id = b_from.id AND sr.tenant_slug = b_from.tenant_slug
            LEFT JOIN coffin_images ci ON sr.coffin_id = ci.coffin_id AND sr.tenant_slug = ci.tenant_slug
            WHERE sr.tenant_slug = ? AND sr.to_branch_id = ?
            GROUP BY sr.id
            ORDER BY sr.created_at DESC
        `;

        const incoming = await query(req, incomingSql, [tenantSlug, branchId]);

        // Outgoing requests (from this branch)
        const outgoingSql = `
            SELECT 
                sr.*,
                c.name as coffin_name,
                c.sku as coffin_sku,
                b_to.name as to_branch_name,
                b_to.color as to_branch_color
            FROM stock_requests sr
            LEFT JOIN coffins c ON sr.coffin_id = c.coffin_id AND sr.tenant_slug = c.tenant_slug
            LEFT JOIN branches b_to ON sr.to_branch_id = b_to.id AND sr.tenant_slug = b_to.tenant_slug
            WHERE sr.tenant_slug = ? AND sr.from_branch_id = ?
            ORDER BY sr.created_at DESC
        `;

        const outgoing = await query(req, outgoingSql, [tenantSlug, branchId]);

        const formatRequest = (req) => ({
            ...req,
            coffin_images: req.coffin_images ? req.coffin_images.split(',').slice(0, 3) : [],
            status_display: getBookingStatus(req.status),
            specifications: req.specifications ? JSON.parse(req.specifications) : []
        });

        return res.status(200).json({
            success: true,
            data: {
                incoming: incoming.map(formatRequest),
                outgoing: outgoing.map(formatRequest)
            }
        });

    } catch (error) {
        console.error('Get stock requests error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const approveStockRequest = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;
    const branchId = req.tenant?.branch_id || req.headers['x-branch-id'];

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        // Get the request
        const requests = await query(req,
            'SELECT * FROM stock_requests WHERE id = ? AND tenant_slug = ? AND to_branch_id = ? AND status = "pending"',
            [id, tenantSlug, branchId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: 'Stock request not found' });
        }

        const stockRequest = requests[0];

        // Check stock availability
        const coffins = await query(req,
            'SELECT * FROM coffins WHERE coffin_id = ? AND branch_id = ? AND tenant_slug = ? AND stock >= ?',
            [stockRequest.coffin_id, branchId, tenantSlug, stockRequest.quantity]
        );

        if (coffins.length === 0) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        // Deduct stock
        await query(req,
            'UPDATE coffins SET stock = stock - ?, updated_at = NOW() WHERE coffin_id = ? AND branch_id = ? AND tenant_slug = ?',
            [stockRequest.quantity, stockRequest.coffin_id, branchId, tenantSlug]
        );

        // Update request status
        await query(req,
            'UPDATE stock_requests SET status = "approved", updated_at = NOW() WHERE id = ?',
            [id]
        );

        // Add tracking
        await query(req,
            'INSERT INTO stock_request_tracking (request_id, tenant_slug, status, notes, created_at) VALUES (?, ?, "approved", "Request approved", NOW())',
            [id, tenantSlug]
        );

        clearCache('allCoffins');

        return res.status(200).json({
            success: true,
            message: 'Stock request approved',
            request_id: id
        });

    } catch (error) {
        console.error('Approve stock request error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const rejectStockRequest = async (req, res) => {
    const tenantSlug = req.tenantSlug;
    const { id } = req.params;
    const branchId = req.tenant?.branch_id || req.headers['x-branch-id'];

    if (!tenantSlug) {
        return res.status(403).json({ success: false, message: 'Valid tenant required' });
    }

    try {
        const result = await query(req,
            'UPDATE stock_requests SET status = "rejected", updated_at = NOW() WHERE id = ? AND tenant_slug = ? AND to_branch_id = ? AND status = "pending"',
            [id, tenantSlug, branchId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Stock request not found' });
        }

        await query(req,
            'INSERT INTO stock_request_tracking (request_id, tenant_slug, status, notes, created_at) VALUES (?, ?, "rejected", "Request rejected", NOW())',
            [id, tenantSlug]
        );

        return res.status(200).json({
            success: true,
            message: 'Stock request rejected'
        });

    } catch (error) {
        console.error('Reject stock request error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    createCoffin,
    getAllCoffins,
    getCoffinById,
    updateCoffin,
    deleteCoffin,
    createBooking,
    getBookings,
    updateBookingStatus,
    createStockRequest,
    getStockRequests,
    approveStockRequest,
    rejectStockRequest,
    getStockStatus,
    getBookingStatus
};
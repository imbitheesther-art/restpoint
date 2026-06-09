const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');
const asyncHandler = require('express-async-handler');

// === Ensure uploads/hearses folder exists ===
const hearsesDir = path.join(__dirname, '../../uploads/hearses');
if (!fs.existsSync(hearsesDir)) {
  fs.mkdirSync(hearsesDir, { recursive: true });
  console.log('📁 Created uploads/hearses directory');
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
    console.log('\n🚗 [RegisterHearse] Starting process...');
    console.log('📸 Uploaded file:', req.file);
    console.log('📦 Request body:', req.body);

    const { number_plate, model, min_charge_ksh, max_charge_ksh } = req.body;
    const image = req.file ? `uploads/hearses/${req.file.filename}` : null;

    if (!number_plate || !min_charge_ksh || !max_charge_ksh) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: number_plate, min_charge_ksh, max_charge_ksh.',
      });
    }

    const now = getKenyaTimeISO();

    const query = `
      INSERT INTO hearses 
      (image, number_plate, model, min_charge_ksh, max_charge_ksh, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'available', ?, ?)
    `;
    const params = [image, number_plate.trim(), model || null, min_charge_ksh, max_charge_ksh, now, now];

    console.log('🧠 Executing SQL:', query);
    console.log('🧩 Parameters:', params);

    const result = await safeQuery(query, params);

    console.log('✅ Hearse Insert Result:', result);

    return res.status(201).json({
      success: true,
      message: 'Hearse registered successfully.',
      hearse_id: result.insertId,
      image_path: image,
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
    const { number_plate, model, min_charge_ksh, max_charge_ksh, status } = req.body;
    const image = req.file ? `uploads/hearses/${req.file.filename}` : null;

    const now = getKenyaTimeISO();

    const query = `
      UPDATE hearses
      SET image = COALESCE(?, image),
          number_plate = COALESCE(?, number_plate),
          model = COALESCE(?, model),
          min_charge_ksh = COALESCE(?, min_charge_ksh),
          max_charge_ksh = COALESCE(?, max_charge_ksh),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `;
    const params = [image, number_plate, model, min_charge_ksh, max_charge_ksh, status, now, id];

    console.log('🧠 Update SQL:', query);
    console.log('🧩 Params:', params);

    await safeQuery(query, params);

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

    const [hearse] = await safeQuery('SELECT image FROM hearses WHERE id = ?', [id]);
    console.log('🖼️ Hearse found for deletion:', hearse);

    if (hearse && hearse.image && fs.existsSync(path.join(__dirname, '../../', hearse.image))) {
      fs.unlinkSync(path.join(__dirname, '../../', hearse.image));
      console.log('🧹 Image file deleted:', hearse.image);
    }

    await safeQuery('DELETE FROM hearses WHERE id = ?', [id]);
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
    const hearses = await safeQuery('SELECT * FROM hearses ORDER BY created_at DESC');

    // Generate ETag for caching
    const etag = crypto.createHash('md5').update(JSON.stringify(hearses)).digest('hex');
    res.set('Cache-Control', 'public, max-age=300'); // cache 5 mins
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
    const hearses = await safeQuery(
      "SELECT * FROM hearses WHERE status = 'available' ORDER BY created_at DESC"
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

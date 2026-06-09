const express = require('express');
const {
  registerDeceased,
  getAllRegisteredDeceased,
  exportDeceasedToExcel,
  updateDeceasedDispatchDate,
  getDeceasedById,
  updateDeceasedStatus,
  updateDeceasedRecord,
} = require('../controllers/deceasedControl');
const {
  nextOfKinRegister,
} = require('../controllers/nextOfKInControl');
const {
  registerAutopsy,
} = require('../controllers/autopsyControl');
const {
  deathCauseClassifications,
} = require('../controllers/analysis');
const router = Router = express.Router();

// Register Deceased Endpoint
router.post('/register-deceased', registerDeceased);
router.get('/deceased-all', getAllRegisteredDeceased);
router.get('/deceased-id', getDeceasedById);
router.get('/deceased/export-excel', exportDeceasedToExcel);

router.put('/update-deceased/:id', updateDeceasedRecord);

router.put('/deceased/dispatch-date', updateDeceasedDispatchDate);

// next of kin
router.post('/register/kin', nextOfKinRegister);

// autopsy records
router.post('/deceased/autopsy', registerAutopsy);

// classifications
router.get('/deceased/analytics', deathCauseClassifications);

router.put('/update-status', (req, res) => {
  const { id } = req.query; // now represents the `cid`
  const { status } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ error: 'Missing record ID (query param: id)' });
  }

  updateDeceasedStatus(id, status || 'Dispatched', (result) => {
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  });
});

module.exports = router;

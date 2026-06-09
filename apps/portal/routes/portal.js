const express = require('express');
const router = express.Router();

// Import controller correctly
const { loginToPortal, logoutFromPortal } = require('../controllers/portal/aceesPortal');
const  { getPortalDeceasedById,getDeceasedFinancialDetails,
  getDeceasedDocuments  ,  getDeceasedServicesAndCosts  }  =  require('../controllers/portal/portal');

// ----------------- ROUTES -----------------

// Portal login
router.post('/portal/login', loginToPortal);
router.get('/portal/info/:deceased_id', getDeceasedFinancialDetails);
router.get('/portal/documents/:deceased_id'   ,  getDeceasedDocuments);
router.get('/portal/services/:deceased_id'   ,  getDeceasedServicesAndCosts );







// Portal logout
router.post('/portal/logout', logoutFromPortal);

module.exports = router;

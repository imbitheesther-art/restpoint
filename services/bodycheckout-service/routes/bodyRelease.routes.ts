import { Router } from 'express';
import { releaseBodyController } from '../controllers/bodyRelease.controller';
import { getReleaseController, listReleasesController, getReleaseByAdmissionController } from '../controllers/release.controller';

const router = Router();

// POST /body-release/checkout - Create new release with ID generation
router.post('/checkout', releaseBodyController);

// GET /body-release/checkout/:id - Get specific release by ID
router.get('/checkout/:id', getReleaseController);

// GET /body-release/checkout - List all releases
router.get('/checkout', listReleasesController);

// GET /body-release/by-admission/:admissionNumber - Get release by admission number
router.get('/by-admission/:admissionNumber', getReleaseByAdmissionController);

export default router;

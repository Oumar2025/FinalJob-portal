import { Router } from 'express';
import {
    getAllApplications,
    updateApplicationStatus,
    deleteApplication,
    getApplicationStats
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// Application management
router.get('/applications', getAllApplications);
router.put('/applications/:id/status', updateApplicationStatus);
router.delete('/applications/:id', deleteApplication);

// Statistics
router.get('/stats', getApplicationStats);

export default router;
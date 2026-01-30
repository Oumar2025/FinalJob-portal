
import { Router } from 'express'
import {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyForJob
} from '../controllers/job.controller'
import { authenticate } from '../middleware/auth.middleware'
import { isAdmin, isMember } from '../middleware/role.middleware'

const router = Router()

// Public routes
router.get('/', getAllJobs)
router.get('/:id', getJob)

// Admin only routes
router.post('/', authenticate, isAdmin, createJob)
router.put('/:id', authenticate, isAdmin, updateJob)
router.delete('/:id', authenticate, isAdmin, deleteJob)

// Member only route
router.post('/:id/apply', authenticate, isMember, applyForJob)

export default router

import { Router, Request, Response } from 'express'
import { getAllUsers, getMyApplications } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'
import { isAdmin, isMember } from '../middleware/role.middleware'



const router = Router()
import prisma from '../utils/db';



// Add this route before the existing routes
router.get('/debug', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                _count: {
                    select: {
                        applications: true,
                        jobs: true
                    }
                }
            }
        });

        // Get all applications
        const allApplications = await prisma.application.findMany({
            where: { applicantId: req.user.id },
            select: {
                id: true,
                status: true,
                coverLetter: true,
                createdAt: true,
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        res.json({
            success: true,
            user,
            applications: allApplications,
            message: 'Debug info'
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Admin: Get all users
router.get('/', authenticate, isAdmin, getAllUsers)

// Member: Get my applications
router.get('/applications', authenticate, isMember, getMyApplications)


export default router
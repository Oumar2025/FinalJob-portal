import { Request, Response } from 'express'
import prisma from '../utils/db'

// Admin: Get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        applications: true,
                        jobs: true
                    }
                }
            }
        })

        res.json(users)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
}


// Member: Get my applications
export const getMyApplications = async (req: Request, res: Response) => {
    console.log('=== GET MY APPLICATIONS ===');
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);

    try {
        // First, verify the user exists
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, role: true }
        });

        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        console.log('User found:', user.email);

        // Get applications
        const applications = await prisma.application.findMany({
            where: { applicantId: req.user.id },
            include: {
                job: {
                    include: {
                        employer: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${applications.length} applications for user`);

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error: any) {
        console.error('❌ Get applications error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch applications'
        });
    }
};
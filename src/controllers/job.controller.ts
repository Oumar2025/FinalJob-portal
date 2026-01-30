import { Request, Response } from 'express';
import prisma from '../utils/db';

// Public: Get all jobs
export const getAllJobs = async (req: Request, res: Response) => {
    console.log('GET /api/jobs - Fetching all jobs');

    try {
        const jobs = await prisma.job.findMany({
            where: { isActive: true },
            include: {
                employer: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${jobs.length} jobs`);

        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs || []
        });

    } catch (error: any) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch jobs',
            message: error.message
        });
    }
};

// Public: Get single job
export const getJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                employer: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            job
        });
    } catch (error: any) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch job'
        });
    }
};

// Protected: Create job (Admin only)
export const createJob = async (req: Request, res: Response) => {
    console.log('POST /api/jobs - Creating job');
    console.log('User:', req.user);
    console.log('Body:', req.body);

    try {
        const { title, description, company, location, salary } = req.body;

        // Validate required fields
        if (!title || !description || !company || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, description, company, location'
            });
        }

        const job = await prisma.job.create({
            data: {
                title,
                description,
                company,
                location,
                salary,
                employerId: req.user.id
            }
        });

        console.log('Job created:', job);

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job
        });
    } catch (error: any) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create job',
            message: error.message
        });
    }
};

// Protected: Update job
export const updateJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const job = await prisma.job.update({
            where: { id },
            data: req.body
        });

        res.json({
            success: true,
            message: 'Job updated successfully',
            job
        });
    } catch (error: any) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update job'
        });
    }
};

// Protected: Delete job
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.job.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete job'
        });
    }
};

// Protected: Apply for job
export const applyForJob = async (req: Request, res: Response) => {
    try {
        const { id: jobId } = req.params;
        const { coverLetter } = req.body;

        // Check if job exists
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId,
                applicantId: req.user.id
            }
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                error: 'Already applied for this job'
            });
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                jobId,
                applicantId: req.user.id,
                coverLetter: coverLetter || ''
            }
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted',
            application
        });
    } catch (error: any) {
        console.error('Apply error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to apply'
        });
    }
};
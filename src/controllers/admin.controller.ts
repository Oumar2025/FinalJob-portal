import { Request, Response } from 'express';
import prisma from '../utils/db';
import { sendApplicationNotification } from '../utils/email';

// Admin: Get all applications (with filters)
export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const { status, jobId, applicantId } = req.query;

        const where: any = {};

        if (status) where.status = status;
        if (jobId) where.jobId = jobId;
        if (applicantId) where.applicantId = applicantId;

        const applications = await prisma.application.findMany({
            where,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true
                    }
                },
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error: any) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
        });
    }
};

// Admin: Update application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;



        // Validate status
        const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be PENDING, ACCEPTED, or REJECTED'
            });
        }



        // Check if application exists
        const existingApplication = await prisma.application.findUnique({
            where: { id },
            include: {
                applicant: {
                    select: {
                        email: true,
                        name: true
                    }
                },
                job: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if (!existingApplication) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        // Update application
        const application = await prisma.application.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            },
            include: {
                job: {
                    select: {
                        title: true,
                        company: true
                    }
                },
                applicant: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        // In updateApplicationStatus function, after updating:
        await sendApplicationNotification(
            existingApplication.applicant.email,
            existingApplication.applicant.name,
            existingApplication.job.title,
            'JobPortal Company', // You can get this from the job
            status
        );

        // TODO: Send email notification here
        console.log(`Application ${id} updated to ${status}`);
        console.log(`Notifying ${application.applicant.email} about their application for ${application.job.title}`);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
            application
        });

    } catch (error: any) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application'
        });
    }
};

// Admin: Delete application
export const deleteApplication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.application.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete application'
        });
    }
};

// Admin: Get application statistics
export const getApplicationStats = async (req: Request, res: Response) => {
    try {
        const totalApplications = await prisma.application.count();
        const pendingApplications = await prisma.application.count({
            where: { status: 'PENDING' }
        });
        const acceptedApplications = await prisma.application.count({
            where: { status: 'ACCEPTED' }
        });
        const rejectedApplications = await prisma.application.count({
            where: { status: 'REJECTED' }
        });

        const applicationsByJob = await prisma.job.findMany({
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: {
                applications: {
                    _count: 'desc'
                }
            },
            take: 10
        });

        res.json({
            success: true,
            stats: {
                total: totalApplications,
                pending: pendingApplications,
                accepted: acceptedApplications,
                rejected: rejectedApplications
            },
            topJobs: applicationsByJob
        });

    } catch (error: any) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics'
        });
    }
};
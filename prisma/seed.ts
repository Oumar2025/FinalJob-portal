const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@test.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN'
        }
    });

    // Create member user
    const memberPassword = await bcrypt.hash('member123', 10);
    const member = await prisma.user.create({
        data: {
            email: 'member@test.com',
            password: memberPassword,
            name: 'Member User',
            role: 'MEMBER'
        }
    });

    // Create test jobs
    const jobs = [
        {
            title: 'Full Stack Developer',
            description: 'We are looking for a skilled developer with React and Node.js experience.',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            salary: '$80,000 - $100,000',
            employerId: admin.id,
            isActive: true
        },
        {
            title: 'Frontend Developer',
            description: 'Join our team to build beautiful user interfaces with React.',
            company: 'Design Co.',
            location: 'New York, NY',
            salary: '$70,000 - $90,000',
            employerId: admin.id,
            isActive: true
        },
        {
            title: 'Backend Engineer',
            description: 'Build scalable APIs and services with Node.js and PostgreSQL.',
            company: 'API Masters',
            location: 'San Francisco, CA',
            salary: '$90,000 - $120,000',
            employerId: admin.id,
            isActive: true
        }
    ];

    for (const jobData of jobs) {
        await prisma.job.create({
            data: jobData
        });
    }

    console.log('✅ Database seeded successfully!');
    console.log('Admin: admin@test.com / admin123');
    console.log('Member: member@test.com / member123');
}

main()
    .catch(e => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    try {
        console.log('Testing Job Portal API...\n');

        // 1. Test home route
        console.log('1. Testing home route...');
        const homeRes = await axios.get(BASE_URL);
        console.log('✅ Home route works:', homeRes.data.message);

        // 2. Register admin
        console.log('\n2. Registering admin...');
        const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, {
            email: "admin@company.com",
            password: "admin123",
            name: "Admin User",
            role: "ADMIN"
        });
        console.log('✅ Admin registered:', registerRes.data.message);

        const adminToken = registerRes.data.token;

        // 3. Login admin
        console.log('\n3. Logging in admin...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: "admin@company.com",
            password: "admin123"
        });
        console.log('✅ Admin logged in:', loginRes.data.message);

        // 4. Create a job
        console.log('\n4. Creating a job...');
        const jobRes = await axios.post(`${BASE_URL}/api/jobs`, {
            title: "Full Stack Developer",
            description: "Looking for experienced developer",
            company: "Tech Corp",
            location: "Remote",
            salary: "$80,000 - $100,000"
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Job created:', jobRes.data.message);

        // 5. Get all jobs (public)
        console.log('\n5. Getting all jobs...');
        const jobsRes = await axios.get(`${BASE_URL}/api/jobs`);
        console.log(`✅ Found ${jobsRes.data.count} jobs`);

        console.log('\n🎉 All tests passed!');
        console.log('\nNow you can:');
        console.log('1. Open browser: http://localhost:3000');
        console.log('2. Use Thunder Client/Postman to test API');
        console.log('3. Open Prisma Studio: http://localhost:5555');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testAPI();
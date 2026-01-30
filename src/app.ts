import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import userRoutes from './routes/user.routes';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Job Portal API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            jobs: {
                getAll: 'GET /api/jobs',
                create: 'POST /api/jobs'
            }
        }
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    console.log(`404: API route not found: ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'API route not found',
        path: req.originalUrl
    });
});

// For all non-API routes, serve the HTML files
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Check if the file exists in public folder
    const filePath = path.join(__dirname, '../public', req.path === '/' ? 'index.html' : req.path);

    // If it's an HTML file request, serve it
    if (req.path.endsWith('.html')) {
        return res.sendFile(filePath);
    }

    // Otherwise, serve index.html for SPA routing
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Database: SQLite`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🌐 Web Interface: http://localhost:${PORT}`);
    console.log(`\nReady to use!`);
});
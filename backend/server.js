require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');
const notebookRoutes = require('./routes/notebook');
const scheduleRoutes = require('./routes/schedule');
const aiRoutes = require('./routes/ai');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:19006',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notebook', notebookRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lumina Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      content: '/api/content',
      progress: '/api/progress',
      leaderboard: '/api/leaderboard',
      notebook: '/api/notebook',
      schedule: '/api/schedule',
      ai: '/api/ai'
    }
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    title: 'Lumina Backend API Documentation',
    version: '1.0.0',
    baseUrl: req.protocol + '://' + req.get('host'),
    endpoints: {
      'POST /api/auth/register': 'Register new user',
      'POST /api/auth/login': 'Login user',
      'GET /api/users/profile': 'Get user profile',
      'POST /api/content/generate': 'Generate AI content',
      'GET /api/progress': 'Get user progress',
      'GET /api/leaderboard': 'Get leaderboard',
      'POST /api/notebook/notes': 'Create note',
      'GET /api/schedule': 'Get study schedule',
      'POST /api/ai/chat': 'AI tutor chat',
      'POST /api/ai/quiz': 'Generate quiz'
    },
    examples: {
      register: {
        url: '/api/auth/register',
        method: 'POST',
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        }
      },
      chat: {
        url: '/api/ai/chat',
        method: 'POST',
        headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
        body: {
          message: 'Explain photosynthesis',
          subject: 'Biology'
        }
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
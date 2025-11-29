require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');
const notebookRoutes = require('./routes/notebook');
const scheduleRoutes = require('./routes/schedule');
const aiRoutes = require('./routes/ai');
const jambTutorRoutes = require('./routes/jamb-tutor');
const waecTutorRoutes = require('./routes/waec-tutor');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:19006',  // Expo mobile
    'http://localhost:19000',  // Expo web
    'http://localhost:8081',   // Metro bundler
    'http://localhost:8082',   // Alternative port
    'http://localhost:8083',   // Alternative port
    'http://localhost:8084',   // Alternative port
    'http://localhost:3000',   // Local development
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Users
 *     description: User profile management
 *   - name: Content
 *     description: Educational content generation
 *   - name: Progress
 *     description: Learning progress tracking
 *   - name: Leaderboard
 *     description: User rankings and achievements
 *   - name: Notebook
 *     description: Digital note-taking system
 *   - name: Schedule
 *     description: Study schedule management
 *   - name: AI
 *     description: AI-powered tutoring and content generation
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Get basic API information and available endpoints
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/content/generate:
 *   post:
 *     summary: Generate educational content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Mathematics
 *               topic:
 *                 type: string
 *                 example: Algebra
 *               difficulty:
 *                 type: string
 *                 example: intermediate
 *     responses:
 *       200:
 *         description: Content generated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get user progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User progress data
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Update user progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               topic:
 *                 type: string
 *               progress_percentage:
 *                 type: integer
 *               time_spent:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Progress updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notebook/notes:
 *   get:
 *     summary: Get user notes
 *     tags: [Notebook]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User notes
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new note
 *     tags: [Notebook]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Physics Notes
 *               content:
 *                 type: string
 *                 example: Newton's laws of motion...
 *               subject:
 *                 type: string
 *                 example: Physics
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Note created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/schedule:
 *   get:
 *     summary: Get study schedule
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Study schedule
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create schedule item
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Math Study Session
 *               subject:
 *                 type: string
 *                 example: Mathematics
 *               scheduled_time:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       201:
 *         description: Schedule created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI Tutor Chat
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - subject
 *             properties:
 *               message:
 *                 type: string
 *                 example: Explain photosynthesis
 *               subject:
 *                 type: string
 *                 example: Biology
 *               context:
 *                 type: string
 *                 example: WAEC preparation
 *     responses:
 *       200:
 *         description: AI response generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/ai/quiz:
 *   post:
 *     summary: Generate AI Quiz
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Chemistry
 *               topic:
 *                 type: string
 *                 example: Organic Chemistry
 *               difficulty:
 *                 type: string
 *                 example: intermediate
 *               questionCount:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Quiz generated
 *       401:
 *         description: Unauthorized
 */

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notebook', notebookRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/jamb-tutor', jambTutorRoutes);
app.use('/waec-tutor', waecTutorRoutes);

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

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lumina Backend API',
      version: '1.0.0',
      description: 'AI-powered adaptive learning platform API'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://edushelf-re0u.onrender.com' : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./server.js', './routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve swagger.json
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/swagger.json');
});

// Serve openapi.json (same as swagger.json)
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
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
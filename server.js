const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
// const mongoose = require('mongoose'); // Disabled for now
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mental-ai' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database disabled for development - using in-memory storage only
logger.info('Running with in-memory storage only (MongoDB disabled)');

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, 'https://mental-ai.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Chat-specific rate limiting
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    error: 'Please slow down. You can send up to 10 messages per minute.',
    retryAfter: '1 minute'
  }
});

// JSON parsing with error handling
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        error: 'Invalid JSON format',
        code: 'INVALID_JSON',
        timestamp: new Date().toISOString()
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('JSON parsing error', { 
      error: err.message, 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(400).json({
      error: 'Invalid JSON format in request body',
      code: 'INVALID_JSON',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
});
app.use(express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// Import routes
const chatRoutes = require('./routes/chat');
const resourcesRoutes = require('./routes/resources');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');

// Routes
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Mental AI server running on port ${PORT}`);
  logger.info(`📱 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };
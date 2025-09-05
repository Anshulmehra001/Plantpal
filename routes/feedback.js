const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { UserFeedback } = require('../models/Analytics');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// POST /api/feedback - Submit user feedback
router.post('/', [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 500 }).withMessage('Feedback must be less than 500 characters'),
  body('category').optional().isIn(['helpful', 'not-helpful', 'technical-issue', 'suggestion', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, rating, feedback, category } = req.body;

    const userFeedback = new UserFeedback({
      sessionId,
      rating,
      feedback: feedback?.trim(),
      category: category || 'other'
    });

    if (UserFeedback) {
      await userFeedback.save();
    }

    logger.info('User feedback received', { 
      sessionId, 
      rating, 
      category,
      hasTextFeedback: !!feedback 
    });

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback!' 
    });

  } catch (error) {
    logger.error('Feedback submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: 'Please try again later'
    });
  }
});

// GET /api/feedback/stats - Get feedback statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    if (!UserFeedback) {
      return res.json({ message: 'Database not connected' });
    }

    const stats = await UserFeedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          },
          categoryDistribution: {
            $push: '$category'
          }
        }
      }
    ]);

    const recentFeedback = await UserFeedback.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('rating feedback category createdAt')
      .lean();

    res.json({
      stats: stats[0] || { totalFeedback: 0, averageRating: 0 },
      recentFeedback
    });

  } catch (error) {
    logger.error('Feedback stats error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
});

module.exports = router;
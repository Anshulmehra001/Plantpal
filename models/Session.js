const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'crisis'],
    default: 'neutral'
  },
  topics: [{
    type: String,
    enum: ['academic-stress', 'family-issues', 'anxiety', 'depression', 'relationships', 'career', 'self-esteem', 'general']
  }],
  copingStrategy: String,
  resourcesProvided: Boolean
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  messages: [messageSchema],
  metadata: {
    userAgent: String,
    ipAddress: String,
    country: String,
    language: String,
    platform: String
  },
  analytics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    sessionDuration: Number,
    crisisDetected: {
      type: Boolean,
      default: false
    },
    resourcesAccessed: {
      type: Boolean,
      default: false
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days TTL
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
sessionSchema.index({ createdAt: 1 });
sessionSchema.index({ lastActivity: 1 });
sessionSchema.index({ 'analytics.crisisDetected': 1 });

// Update lastActivity on save
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
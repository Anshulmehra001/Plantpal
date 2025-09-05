const mongoose = require('mongoose');

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    unique: true
  },
  metrics: {
    totalSessions: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    crisisInterventions: { type: Number, default: 0 },
    resourcesAccessed: { type: Number, default: 0 }
  },
  topics: {
    type: Map,
    of: Number,
    default: {}
  },
  sentiment: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },
    crisis: { type: Number, default: 0 }
  },
  hourlyDistribution: {
    type: [Number],
    default: () => new Array(24).fill(0)
  }
}, {
  timestamps: true
});

const userFeedbackSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['helpful', 'not-helpful', 'technical-issue', 'suggestion', 'other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);
const UserFeedback = mongoose.model('UserFeedback', userFeedbackSchema);

module.exports = { DailyStats, UserFeedback };
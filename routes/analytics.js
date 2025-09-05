const express = require('express');
const router = express.Router();

// In-memory analytics storage (use proper database in production)
const analytics = {
  sessions: new Map(),
  dailyStats: new Map(),
  topicTrends: new Map()
};

// Track session analytics
function trackSession(sessionId, data) {
  const today = new Date().toISOString().split('T')[0];
  
  // Update session data
  if (!analytics.sessions.has(sessionId)) {
    analytics.sessions.set(sessionId, {
      id: sessionId,
      startTime: new Date(),
      messageCount: 0,
      topics: [],
      sentiment: [],
      lastActivity: new Date()
    });
  }
  
  const session = analytics.sessions.get(sessionId);
  session.messageCount += 1;
  session.lastActivity = new Date();
  
  if (data.topic) {
    session.topics.push(data.topic);
  }
  
  if (data.sentiment) {
    session.sentiment.push(data.sentiment);
  }
  
  // Update daily stats
  if (!analytics.dailyStats.has(today)) {
    analytics.dailyStats.set(today, {
      date: today,
      totalSessions: 0,
      totalMessages: 0,
      uniqueUsers: new Set(),
      topTopics: {},
      avgSessionDuration: 0
    });
  }
  
  const dailyStats = analytics.dailyStats.get(today);
  dailyStats.totalMessages += 1;
  dailyStats.uniqueUsers.add(sessionId);
  
  if (data.topic) {
    dailyStats.topTopics[data.topic] = (dailyStats.topTopics[data.topic] || 0) + 1;
  }
}

// Analyze message for topics and sentiment
function analyzeMessage(message) {
  const topics = [];
  const sentiment = 'neutral'; // Simplified - would use actual sentiment analysis
  
  const topicKeywords = {
    'academic-stress': ['exam', 'study', 'grade', 'marks', 'test', 'college', 'school', 'pressure'],
    'family-issues': ['family', 'parents', 'mother', 'father', 'home', 'siblings'],
    'anxiety': ['anxious', 'worry', 'nervous', 'panic', 'fear', 'scared'],
    'depression': ['sad', 'depressed', 'hopeless', 'empty', 'lonely', 'worthless'],
    'relationships': ['friend', 'boyfriend', 'girlfriend', 'relationship', 'breakup'],
    'career': ['job', 'career', 'future', 'work', 'profession', 'employment'],
    'self-esteem': ['confidence', 'self-worth', 'ugly', 'stupid', 'failure', 'useless']
  };
  
  const lowerMessage = message.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return {
    topics: topics.length > 0 ? topics : ['general'],
    sentiment
  };
}

// POST /api/analytics/track
router.post('/track', (req, res) => {
  try {
    const { sessionId, message, action } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    let analysisData = {};
    
    if (message) {
      const analysis = analyzeMessage(message);
      analysisData = {
        topic: analysis.topics[0], // Primary topic
        sentiment: analysis.sentiment
      };
    }
    
    trackSession(sessionId, analysisData);
    
    res.json({ 
      success: true,
      analysis: analysisData
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// GET /api/analytics/dashboard
router.get('/dashboard', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const last7Days = [];
    
    // Generate last 7 days data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
    }
    
    const weeklyStats = last7Days.map(date => {
      const dayStats = analytics.dailyStats.get(date) || {
        date,
        totalSessions: 0,
        totalMessages: 0,
        uniqueUsers: new Set(),
        topTopics: {},
        avgSessionDuration: 0
      };
      
      return {
        date,
        sessions: dayStats.totalSessions,
        messages: dayStats.totalMessages,
        users: dayStats.uniqueUsers.size,
        topTopics: dayStats.topTopics
      };
    });
    
    // Calculate totals
    const totalSessions = analytics.sessions.size;
    const totalMessages = Array.from(analytics.sessions.values())
      .reduce((sum, session) => sum + session.messageCount, 0);
    
    // Top topics across all time
    const allTopics = {};
    analytics.sessions.forEach(session => {
      session.topics.forEach(topic => {
        allTopics[topic] = (allTopics[topic] || 0) + 1;
      });
    });
    
    const topTopics = Object.entries(allTopics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
    
    // Average session duration
    const avgDuration = Array.from(analytics.sessions.values())
      .reduce((sum, session) => {
        const duration = session.lastActivity - session.startTime;
        return sum + duration;
      }, 0) / analytics.sessions.size || 0;
    
    res.json({
      overview: {
        totalSessions,
        totalMessages,
        avgSessionDuration: Math.round(avgDuration / 1000 / 60), // minutes
        topTopics
      },
      weeklyStats,
      insights: {
        mostActiveDay: weeklyStats.reduce((max, day) => 
          day.messages > max.messages ? day : max, weeklyStats[0]
        ),
        growthTrend: weeklyStats.length > 1 ? 
          weeklyStats[weeklyStats.length - 1].messages - weeklyStats[weeklyStats.length - 2].messages : 0
      }
    });
    
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/topics
router.get('/topics', (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    // Aggregate topics for the period
    const topicCounts = {};
    const topicTrends = {};
    
    analytics.sessions.forEach(session => {
      if (session.startTime >= startDate && session.startTime <= endDate) {
        session.topics.forEach(topic => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          
          const day = session.startTime.toISOString().split('T')[0];
          if (!topicTrends[topic]) {
            topicTrends[topic] = {};
          }
          topicTrends[topic][day] = (topicTrends[topic][day] || 0) + 1;
        });
      }
    });
    
    const topics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Math.round((count / Object.values(topicCounts).reduce((a, b) => a + b, 0)) * 100),
        trend: topicTrends[topic] || {}
      }));
    
    res.json({
      period,
      topics,
      totalDiscussions: Object.values(topicCounts).reduce((a, b) => a + b, 0)
    });
    
  } catch (error) {
    console.error('Topics analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch topic analytics' });
  }
});

// GET /api/analytics/usage
router.get('/usage', (req, res) => {
  try {
    const hourlyUsage = Array(24).fill(0);
    const dailyUsage = {};
    
    analytics.sessions.forEach(session => {
      // Hourly distribution
      const hour = session.startTime.getHours();
      hourlyUsage[hour] += session.messageCount;
      
      // Daily distribution
      const day = session.startTime.toISOString().split('T')[0];
      dailyUsage[day] = (dailyUsage[day] || 0) + session.messageCount;
    });
    
    const peakHour = hourlyUsage.indexOf(Math.max(...hourlyUsage));
    const avgSessionLength = Array.from(analytics.sessions.values())
      .reduce((sum, session) => {
        const duration = session.lastActivity - session.startTime;
        return sum + duration;
      }, 0) / analytics.sessions.size || 0;
    
    res.json({
      hourlyDistribution: hourlyUsage.map((count, hour) => ({
        hour,
        messages: count,
        label: `${hour}:00`
      })),
      dailyUsage: Object.entries(dailyUsage)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, messages]) => ({ date, messages })),
      insights: {
        peakHour: `${peakHour}:00`,
        avgSessionLength: Math.round(avgSessionLength / 1000 / 60), // minutes
        totalActiveDays: Object.keys(dailyUsage).length
      }
    });
    
  } catch (error) {
    console.error('Usage analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch usage analytics' });
  }
});

module.exports = router;
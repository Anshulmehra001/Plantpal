/**
 * Advanced Sentiment Analysis System
 * Provides comprehensive sentiment detection, mood classification, and emotional pattern recognition
 */

const winston = require('winston');

// Logger for sentiment analysis
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Enhanced sentiment keywords with weighted scoring
 */
const SENTIMENT_KEYWORDS = {
  crisis: {
    keywords: [
      'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm', 'want to die',
      'no point living', 'better off dead', 'giving up on everything', 'nothing matters anymore',
      'want to disappear', 'end my life', 'can\'t go on', 'no reason to live',
      'worthless', 'hopeless', 'can\'t take it anymore', 'nobody cares', 'alone forever'
    ],
    weight: 10,
    mood: 'crisis'
  },
  
  negative: {
    keywords: [
      'sad', 'depressed', 'anxious', 'worried', 'stressed', 'overwhelmed', 'frustrated',
      'angry', 'upset', 'disappointed', 'lonely', 'tired', 'exhausted', 'confused',
      'scared', 'afraid', 'nervous', 'insecure', 'doubt', 'failure', 'rejected',
      'heartbroken', 'devastated', 'miserable', 'terrible', 'awful', 'horrible',
      'struggling', 'difficult', 'hard', 'challenging', 'painful', 'hurt', 'broken'
    ],
    weight: -2,
    mood: 'sad'
  },
  
  positive: {
    keywords: [
      'happy', 'excited', 'joyful', 'grateful', 'thankful', 'blessed', 'amazing',
      'wonderful', 'fantastic', 'great', 'excellent', 'perfect', 'love', 'loved',
      'confident', 'proud', 'accomplished', 'successful', 'motivated', 'inspired',
      'hopeful', 'optimistic', 'peaceful', 'calm', 'relaxed', 'content', 'satisfied',
      'thrilled', 'delighted', 'cheerful', 'bright', 'brilliant', 'awesome'
    ],
    weight: 2,
    mood: 'happy'
  },
  
  neutral: {
    keywords: [
      'okay', 'fine', 'alright', 'normal', 'usual', 'regular', 'average', 'typical',
      'standard', 'ordinary', 'common', 'general', 'basic', 'simple', 'plain'
    ],
    weight: 0,
    mood: 'curious'
  },
  
  excited: {
    keywords: [
      'excited', 'thrilled', 'pumped', 'energized', 'enthusiastic', 'eager',
      'can\'t wait', 'looking forward', 'anticipating', 'ready', 'prepared',
      'motivated', 'driven', 'passionate', 'fired up', 'hyped'
    ],
    weight: 3,
    mood: 'excited'
  },
  
  stressed: {
    keywords: [
      'stressed', 'pressure', 'deadline', 'overwhelmed', 'busy', 'hectic',
      'rushed', 'frantic', 'panicked', 'urgent', 'emergency', 'crisis',
      'too much', 'can\'t handle', 'breaking point', 'burnout', 'exhausted'
    ],
    weight: -1,
    mood: 'stressed'
  }
};

/**
 * Topic classification keywords for better context understanding
 */
const TOPIC_KEYWORDS = {
  'academic-stress': [
    'exam', 'test', 'study', 'homework', 'assignment', 'grade', 'school', 'college',
    'university', 'professor', 'teacher', 'class', 'course', 'degree', 'graduation',
    'thesis', 'research', 'project', 'presentation', 'deadline', 'semester'
  ],
  'family-issues': [
    'family', 'parents', 'mother', 'father', 'mom', 'dad', 'sibling', 'brother',
    'sister', 'relatives', 'home', 'household', 'family problems', 'family conflict',
    'family pressure', 'family expectations', 'family support'
  ],
  'relationships': [
    'relationship', 'boyfriend', 'girlfriend', 'partner', 'dating', 'love',
    'breakup', 'marriage', 'wedding', 'romantic', 'crush', 'attraction',
    'friendship', 'friends', 'social', 'lonely', 'isolation'
  ],
  'career': [
    'job', 'work', 'career', 'employment', 'interview', 'resume', 'salary',
    'promotion', 'boss', 'colleague', 'workplace', 'professional', 'business',
    'internship', 'application', 'hiring', 'fired', 'quit', 'resignation'
  ],
  'self-esteem': [
    'confidence', 'self-worth', 'self-esteem', 'insecurity', 'doubt', 'appearance',
    'body image', 'weight', 'looks', 'ugly', 'beautiful', 'attractive',
    'comparison', 'jealous', 'envy', 'inadequate', 'not good enough'
  ],
  'anxiety': [
    'anxiety', 'panic', 'worry', 'fear', 'phobia', 'nervous', 'anxious',
    'panic attack', 'social anxiety', 'performance anxiety', 'stress',
    'tension', 'restless', 'uneasy', 'apprehensive'
  ],
  'depression': [
    'depression', 'depressed', 'sad', 'hopeless', 'empty', 'numb',
    'worthless', 'guilty', 'shame', 'regret', 'grief', 'loss',
    'mourning', 'crying', 'tears', 'dark', 'heavy'
  ]
};

/**
 * Mood progression patterns for plant growth
 */
const MOOD_PROGRESSION = {
  'crisis': { growth: -5, color: '#8B0000', animation: 'wilt' },
  'sad': { growth: -2, color: '#4682B4', animation: 'droop' },
  'stressed': { growth: -1, color: '#FF6347', animation: 'shake' },
  'curious': { growth: 1, color: '#32CD32', animation: 'sway' },
  'happy': { growth: 3, color: '#FFD700', animation: 'bloom' },
  'excited': { growth: 5, color: '#FF69B4', animation: 'sparkle' }
};

/**
 * Sentiment history for pattern recognition
 */
class SentimentHistory {
  constructor() {
    this.history = [];
    this.maxHistory = 50; // Keep last 50 sentiment analyses
  }
  
  add(sentiment) {
    this.history.push({
      ...sentiment,
      timestamp: new Date()
    });
    
    // Keep only recent history
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }
  
  getPattern() {
    if (this.history.length < 3) return null;
    
    const recent = this.history.slice(-5);
    const scores = recent.map(h => h.score);
    const moods = recent.map(h => h.mood);
    
    // Detect patterns
    const isImproving = scores.every((score, i) => i === 0 || score >= scores[i-1]);
    const isDeclining = scores.every((score, i) => i === 0 || score <= scores[i-1]);
    const isStable = Math.max(...scores) - Math.min(...scores) < 1;
    
    return {
      trend: isImproving ? 'improving' : isDeclining ? 'declining' : isStable ? 'stable' : 'fluctuating',
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      dominantMood: this.getMostFrequentMood(moods),
      consistency: isStable ? 'high' : 'variable'
    };
  }
  
  getMostFrequentMood(moods) {
    const frequency = {};
    moods.forEach(mood => {
      frequency[mood] = (frequency[mood] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }
  
  getCrisisCount(timeframe = 24) {
    const cutoff = new Date(Date.now() - timeframe * 60 * 60 * 1000);
    return this.history.filter(h => 
      h.mood === 'crisis' && h.timestamp > cutoff
    ).length;
  }
}

/**
 * Advanced Sentiment Analyzer Class
 */
class AdvancedSentimentAnalyzer {
  constructor() {
    this.history = new SentimentHistory();
    this.sessionAnalytics = {
      totalMessages: 0,
      sentimentDistribution: {},
      topicDistribution: {},
      crisisDetected: false,
      improvementDetected: false
    };
  }
  
  /**
   * Analyze sentiment of a message with comprehensive scoring
   */
  analyzeSentiment(message) {
    if (!message || typeof message !== 'string') {
      return this.getDefaultSentiment();
    }
    
    const normalizedMessage = message.toLowerCase().trim();
    let totalScore = 0;
    let detectedMoods = [];
    let crisisDetected = false;
    
    // Check for crisis keywords first
    for (const keyword of SENTIMENT_KEYWORDS.crisis.keywords) {
      if (normalizedMessage.includes(keyword)) {
        crisisDetected = true;
        totalScore += SENTIMENT_KEYWORDS.crisis.weight;
        detectedMoods.push('crisis');
        break; // Crisis takes priority
      }
    }
    
    // If not crisis, analyze other sentiments
    if (!crisisDetected) {
      Object.entries(SENTIMENT_KEYWORDS).forEach(([category, data]) => {
        if (category === 'crisis') return;
        
        const matches = data.keywords.filter(keyword => 
          normalizedMessage.includes(keyword)
        ).length;
        
        if (matches > 0) {
          totalScore += data.weight * matches;
          detectedMoods.push(data.mood);
        }
      });
    }
    
    // Determine primary mood
    const primaryMood = this.determinePrimaryMood(totalScore, detectedMoods, crisisDetected);
    
    // Analyze topics
    const topics = this.analyzeTopics(normalizedMessage);
    
    // Create sentiment result
    const sentiment = {
      score: Math.max(-10, Math.min(10, totalScore)), // Clamp between -10 and 10
      mood: primaryMood,
      confidence: this.calculateConfidence(detectedMoods.length, message.length),
      topics: topics,
      crisisDetected: crisisDetected,
      plantEffect: MOOD_PROGRESSION[primaryMood] || MOOD_PROGRESSION['curious'],
      timestamp: new Date(),
      messageLength: message.length,
      keywordsDetected: detectedMoods.length
    };
    
    // Add to history and update analytics
    this.history.add(sentiment);
    this.updateSessionAnalytics(sentiment);
    
    // Log for monitoring
    logger.info('Sentiment analyzed', {
      mood: sentiment.mood,
      score: sentiment.score,
      topics: sentiment.topics,
      crisis: sentiment.crisisDetected
    });
    
    return sentiment;
  }
  
  /**
   * Determine the primary mood from detected sentiments
   */
  determinePrimaryMood(score, detectedMoods, crisisDetected) {
    if (crisisDetected) return 'crisis';
    
    if (detectedMoods.length === 0) {
      return 'curious'; // Default neutral mood
    }
    
    // If multiple moods detected, use score to determine primary
    if (score >= 3) return 'excited';
    if (score >= 1) return 'happy';
    if (score <= -3) return 'sad';
    if (score <= -1) return 'stressed';
    
    return 'curious';
  }
  
  /**
   * Calculate confidence score based on various factors
   */
  calculateConfidence(keywordCount, messageLength) {
    let confidence = 0.5; // Base confidence
    
    // More keywords = higher confidence
    confidence += Math.min(keywordCount * 0.1, 0.3);
    
    // Longer messages = higher confidence
    if (messageLength > 50) confidence += 0.1;
    if (messageLength > 100) confidence += 0.1;
    
    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Analyze topics mentioned in the message
   */
  analyzeTopics(message) {
    const detectedTopics = [];
    
    Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => 
        message.includes(keyword)
      ).length;
      
      if (matches > 0) {
        detectedTopics.push({
          topic: topic,
          relevance: Math.min(matches / keywords.length, 1.0),
          matches: matches
        });
      }
    });
    
    // Sort by relevance and return top 3
    return detectedTopics
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map(t => t.topic);
  }
  
  /**
   * Update session analytics
   */
  updateSessionAnalytics(sentiment) {
    this.sessionAnalytics.totalMessages++;
    
    // Update sentiment distribution
    const mood = sentiment.mood;
    this.sessionAnalytics.sentimentDistribution[mood] = 
      (this.sessionAnalytics.sentimentDistribution[mood] || 0) + 1;
    
    // Update topic distribution
    sentiment.topics.forEach(topic => {
      this.sessionAnalytics.topicDistribution[topic] = 
        (this.sessionAnalytics.topicDistribution[topic] || 0) + 1;
    });
    
    // Update flags
    if (sentiment.crisisDetected) {
      this.sessionAnalytics.crisisDetected = true;
    }
    
    // Check for improvement
    const pattern = this.history.getPattern();
    if (pattern && pattern.trend === 'improving') {
      this.sessionAnalytics.improvementDetected = true;
    }
  }
  
  /**
   * Get sentiment patterns and insights
   */
  getPatternAnalysis() {
    const pattern = this.history.getPattern();
    const recentCrisis = this.history.getCrisisCount();
    
    return {
      pattern: pattern,
      recentCrisisCount: recentCrisis,
      sessionAnalytics: this.sessionAnalytics,
      recommendations: this.generateRecommendations(pattern, recentCrisis)
    };
  }
  
  /**
   * Generate recommendations based on patterns
   */
  generateRecommendations(pattern, crisisCount) {
    const recommendations = [];
    
    if (crisisCount > 0) {
      recommendations.push({
        type: 'crisis',
        priority: 'high',
        message: 'Crisis language detected. Immediate support resources provided.',
        action: 'show_resources'
      });
    }
    
    if (pattern) {
      if (pattern.trend === 'declining') {
        recommendations.push({
          type: 'support',
          priority: 'medium',
          message: 'Your mood seems to be declining. Would you like some coping strategies?',
          action: 'offer_coping_strategies'
        });
      }
      
      if (pattern.trend === 'improving') {
        recommendations.push({
          type: 'encouragement',
          priority: 'low',
          message: 'Great progress! Your mood has been improving.',
          action: 'celebrate_progress'
        });
      }
      
      if (pattern.consistency === 'variable') {
        recommendations.push({
          type: 'stability',
          priority: 'medium',
          message: 'Your emotions seem quite variable. Let\'s work on finding balance.',
          action: 'suggest_mindfulness'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get plant mood update based on sentiment
   */
  getPlantMoodUpdate(sentiment) {
    const effect = sentiment.plantEffect;
    const pattern = this.history.getPattern();
    
    return {
      mood: sentiment.mood,
      growthChange: effect.growth,
      color: effect.color,
      animation: effect.animation,
      message: this.generatePlantMessage(sentiment, pattern),
      shouldGrow: effect.growth > 0,
      shouldWilt: effect.growth < 0
    };
  }
  
  /**
   * Generate encouraging plant messages
   */
  generatePlantMessage(sentiment, pattern) {
    const messages = {
      'crisis': [
        "I'm here with you. You're not alone.",
        "Every storm passes. I believe in your strength.",
        "Your feelings are valid. Let's get through this together."
      ],
      'sad': [
        "It's okay to feel sad sometimes. I'm growing alongside you.",
        "Even in difficult times, you're helping me grow.",
        "Your honesty helps both of us flourish."
      ],
      'stressed': [
        "Take a deep breath with me. We'll get through this.",
        "Stress can be tough, but you're tougher.",
        "Let's find some calm together."
      ],
      'curious': [
        "I'm curious about your thoughts too!",
        "Every conversation helps me understand you better.",
        "Thanks for sharing with me."
      ],
      'happy': [
        "Your happiness makes me bloom!",
        "I love seeing you in good spirits!",
        "Your joy is contagious - I'm growing!"
      ],
      'excited': [
        "Your excitement is making me sparkle!",
        "I can feel your energy - it's amazing!",
        "Your enthusiasm is helping me flourish!"
      ]
    };
    
    const moodMessages = messages[sentiment.mood] || messages['curious'];
    const randomMessage = moodMessages[Math.floor(Math.random() * moodMessages.length)];
    
    // Add pattern-based encouragement
    if (pattern && pattern.trend === 'improving') {
      return randomMessage + " I've noticed you're doing better lately!";
    }
    
    return randomMessage;
  }
  
  /**
   * Get default sentiment for error cases
   */
  getDefaultSentiment() {
    return {
      score: 0,
      mood: 'curious',
      confidence: 0.1,
      topics: [],
      crisisDetected: false,
      plantEffect: MOOD_PROGRESSION['curious'],
      timestamp: new Date(),
      messageLength: 0,
      keywordsDetected: 0
    };
  }
  
  /**
   * Reset session analytics
   */
  resetSession() {
    this.sessionAnalytics = {
      totalMessages: 0,
      sentimentDistribution: {},
      topicDistribution: {},
      crisisDetected: false,
      improvementDetected: false
    };
  }
  
  /**
   * Export sentiment history for analytics
   */
  exportHistory() {
    return {
      history: this.history.history,
      analytics: this.sessionAnalytics,
      patterns: this.history.getPattern()
    };
  }
}

// Export the analyzer class and utilities
module.exports = {
  AdvancedSentimentAnalyzer,
  SentimentHistory,
  SENTIMENT_KEYWORDS,
  TOPIC_KEYWORDS,
  MOOD_PROGRESSION
}; 
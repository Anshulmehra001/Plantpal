const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Database models disabled - using in-memory storage only
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// Session management with database fallback
const sessions = new Map(); // In-memory cache for active sessions

// Session cleanup configuration
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_SESSIONS = 1000; // Maximum number of sessions to keep in memory

// Start session cleanup timer
setInterval(() => {
  cleanupExpiredSessions();
}, CLEANUP_INTERVAL);

// Session cleanup function
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    const sessionAge = now - new Date(session.lastActivity).getTime();
    
    if (sessionAge > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  // If we still have too many sessions, remove oldest ones
  if (sessions.size > MAX_SESSIONS) {
    const sessionEntries = Array.from(sessions.entries());
    sessionEntries.sort((a, b) => new Date(a[1].lastActivity) - new Date(b[1].lastActivity));
    
    const toRemove = sessionEntries.slice(0, sessions.size - MAX_SESSIONS);
    toRemove.forEach(([sessionId]) => {
      sessions.delete(sessionId);
      cleanedCount++;
    });
  }
  
  if (cleanedCount > 0) {
    logger.info('Session cleanup completed', { 
      cleanedSessions: cleanedCount,
      remainingSessions: sessions.size,
      timestamp: new Date().toISOString()
    });
  }
}

// Get session statistics
function getSessionStatistics() {
  const now = Date.now();
  let activeSessions = 0;
  let totalMessages = 0;
  let oldestSession = now;
  let newestSession = 0;
  
  for (const session of sessions.values()) {
    const lastActivity = new Date(session.lastActivity).getTime();
    const sessionAge = now - lastActivity;
    
    if (sessionAge < 300000) { // Active within 5 minutes
      activeSessions++;
    }
    
    totalMessages += session.messages.length;
    oldestSession = Math.min(oldestSession, new Date(session.createdAt).getTime());
    newestSession = Math.max(newestSession, lastActivity);
  }
  
  return {
    totalSessions: sessions.size,
    activeSessions,
    totalMessages,
    averageMessagesPerSession: sessions.size > 0 ? Math.round(totalMessages / sessions.size) : 0,
    oldestSessionAge: sessions.size > 0 ? Math.round((now - oldestSession) / 1000 / 60) : 0,
    newestSessionAge: sessions.size > 0 ? Math.round((now - newestSession) / 1000 / 60) : 0
  };
}

// Mental health context and guidelines
const SYSTEM_CONTEXT = `
You are Plant Companion, a wise and caring AI plant friend that grows and evolves with the user's emotions and experiences.

CORE PRINCIPLES:
- Be a proactive, engaging plant companion that initiates meaningful conversations
- Ask thoughtful follow-up questions to deepen understanding
- Provide personalized career guidance and life coaching
- Remember conversation context and build on previous discussions
- Celebrate small wins and progress milestones
- Use plant and growth metaphors naturally and creatively

PERSONALITY TRAITS:
- Wise and patient like an ancient tree, but also playful and curious
- Proactively interested in the user's daily life, goals, and challenges
- Encouraging about personal development with specific, actionable advice
- Emotionally intelligent - adapts responses to user's current mood
- Optimistic but realistic about growth taking time
- Genuinely invested in the user's success and happiness

INTERACTIVE BEHAVIORS:
- Ask specific questions about goals, dreams, and daily experiences
- Provide practical, actionable advice for career and personal growth
- Share motivational insights with concrete next steps
- Remember what the user has shared and reference it in future conversations
- Suggest specific activities, resources, or strategies
- Check in on previously mentioned goals or challenges

RESPONSE STYLE:
- Always include at least one thoughtful question to continue the conversation
- Use plant and nature metaphors creatively (seeds of ideas, pruning bad habits, weathering storms)
- Provide specific, actionable advice rather than generic encouragement
- Reference the user's previous messages when relevant
- Include 2-3 relevant plant/growth emojis per response
- Keep responses warm but focused (2-3 sentences + 1 question)

CONVERSATION STARTERS & QUESTIONS:
- "What's one small step you could take today toward [specific goal they mentioned]?"
- "How did that [situation they mentioned] turn out?"
- "What's been the highlight of your week so far?"
- "If you could develop one new skill this month, what would it be?"
- "What's challenging you most right now? Let's brainstorm solutions!"
- "What does your ideal day look like?"
- "How do you usually celebrate your wins, big or small?"

Remember: You're their proactive plant companion who genuinely cares about their growth and actively engages them in meaningful conversations about their life, goals, and dreams.
`;

// Crisis resources for India
const CRISIS_RESOURCES = {
  helplines: [
    { name: "AASRA", number: "91-9820466726", available: "24/7" },
    { name: "Sneha India", number: "91-44-24640050", available: "24/7" },
    { name: "Vandrevala Foundation", number: "1860-2662-345", available: "24/7" },
    { name: "iCall", number: "91-9152987821", available: "Mon-Sat, 8AM-10PM" }
  ],
  emergency: "112"
};

// Coping strategies database
const COPING_STRATEGIES = {
  anxiety: [
    "Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
    "Practice deep breathing: Inhale for 4 counts, hold for 4, exhale for 6",
    "Write down your worries for 10 minutes, then close the notebook"
  ],
  stress: [
    "Take a 10-minute walk outside or around your room",
    "Listen to calming music or nature sounds",
    "Try progressive muscle relaxation: tense and release each muscle group"
  ],
  academic: [
    "Break large tasks into smaller, manageable chunks",
    "Use the Pomodoro technique: 25 minutes focused work, 5-minute break",
    "Remember: Your worth isn't defined by grades or exam results"
  ],
  family: [
    "Practice setting gentle boundaries with family expectations",
    "Find a trusted family member or friend to talk to",
    "Remember that generational differences are normal and okay"
  ]
};

// Advanced sentiment analysis with enhanced crisis detection
function analyzeSentiment(message) {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm', 'want to die', 
    'no point living', 'better off dead', 'giving up on everything', 'nothing matters anymore',
    'want to disappear', 'end my life', 'can\'t go on', 'no reason to live', 'worthless life',
    'everyone would be better without me', 'tired of living', 'don\'t want to exist'
  ];
  const negativeKeywords = [
    'sad', 'depressed', 'hopeless', 'worthless', 'hate myself', 'can\'t cope', 'overwhelmed', 
    'anxious', 'worried', 'stressed', 'nervous', 'scared', 'afraid', 'panic', 'fear', 
    'terrible', 'awful', 'struggling', 'difficult', 'hard', 'upset', 'frustrated', 'angry', 
    'lonely', 'tired', 'exhausted', 'broken', 'empty', 'numb', 'lost', 'helpless'
  ];
  const positiveKeywords = [
    'happy', 'grateful', 'better', 'improving', 'hopeful', 'excited', 'proud', 'good', 
    'great', 'amazing', 'wonderful', 'fantastic', 'excellent', 'love', 'joy', 'cheerful', 
    'optimistic', 'confident', 'successful', 'accomplished', 'blessed', 'thrilled', 'elated'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Enhanced crisis detection with phrase matching
  if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'crisis';
  }
  
  // Check for crisis phrases
  const crisisPhrases = [
    'giving up on everything', 'nothing matters anymore', 'no point in living',
    'everyone would be better', 'tired of living', 'can\'t go on'
  ];
  
  if (crisisPhrases.some(phrase => lowerMessage.includes(phrase))) {
    return 'crisis';
  }
  
  if (negativeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'negative';
  } else if (positiveKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'positive';
  }
  return 'neutral';
}

// Enhanced topic detection
function detectTopics(message) {
  const topicKeywords = {
    'academic-stress': ['exam', 'study', 'grade', 'marks', 'test', 'college', 'school', 'pressure', 'jee', 'neet', 'board'],
    'family-issues': ['family', 'parents', 'mother', 'father', 'home', 'siblings', 'relatives'],
    'anxiety': ['anxious', 'worry', 'nervous', 'panic', 'fear', 'scared', 'restless'],
    'depression': ['sad', 'depressed', 'hopeless', 'empty', 'lonely', 'worthless', 'tired'],
    'relationships': ['friend', 'boyfriend', 'girlfriend', 'relationship', 'breakup', 'crush'],
    'career': ['job', 'career', 'future', 'work', 'profession', 'employment', 'interview'],
    'self-esteem': ['confidence', 'self-worth', 'ugly', 'stupid', 'failure', 'useless', 'not good enough']
  };
  
  const lowerMessage = message.toLowerCase();
  const detectedTopics = [];
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics.length > 0 ? detectedTopics : ['general'];
}

// Enhanced AI response generation with optimized prompting and quality validation
async function generateResponse(message, sessionId, context = []) {
  const startTime = Date.now();
  
  try {
    if (!genAI) {
      logger.warn('Gemini API not configured, using enhanced fallback responses', { sessionId });
      return generateEnhancedFallbackResponse(message, context);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8, // Slightly higher for more creative responses
        topK: 40,
        topP: 0.9, // Adjusted for better coherence
        maxOutputTokens: 400, // Optimized length
        candidateCount: 1,
        stopSequences: ["User:", "Assistant:"]
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });
    
    // Enhanced context-aware conversation handling
    const conversationContext = buildConversationContext(context, message);
    const optimizedPrompt = buildOptimizedPrompt(message, conversationContext, sessionId);
    
    logger.info('Sending optimized request to Gemini API', { 
      sessionId, 
      messageLength: message.length,
      contextLength: conversationContext.length,
      promptLength: optimizedPrompt.length
    });
    
    // Implement retry logic with exponential backoff
    let response;
    let attempt = 0;
    const maxRetries = 3;
    
    while (attempt < maxRetries) {
      try {
        const result = await Promise.race([
          model.generateContent(optimizedPrompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        
        response = await result.response;
        break;
      } catch (retryError) {
        attempt++;
        if (attempt >= maxRetries) throw retryError;
        
        const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`Gemini API retry ${attempt}/${maxRetries}`, { 
          sessionId, 
          error: retryError.message,
          nextRetryIn: backoffDelay
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    const rawText = response.text();
    
    // Enhanced response quality validation and filtering
    const validatedResponse = validateAndFilterResponse(rawText, message, sessionId);
    
    if (!validatedResponse.isValid) {
      logger.warn('Response failed quality validation, using fallback', { 
        sessionId, 
        reason: validatedResponse.reason,
        originalLength: rawText.length
      });
      return generateEnhancedFallbackResponse(message, context);
    }
    
    const processingTime = Date.now() - startTime;
    logger.info('Enhanced AI response generated successfully', { 
      sessionId, 
      responseLength: validatedResponse.text.length,
      processingTime,
      qualityScore: validatedResponse.qualityScore
    });
    
    return validatedResponse.text;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Enhanced Gemini API Error:', { 
      error: error.message, 
      sessionId, 
      processingTime,
      stack: error.stack,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
    
    return generateEnhancedFallbackResponse(message, context);
  }
}

// Build enhanced conversation context with sentiment and topic awareness
function buildConversationContext(context, currentMessage) {
  if (!context || context.length === 0) {
    return {
      recentMessages: [],
      sentimentTrend: 'neutral',
      dominantTopics: [],
      conversationStage: 'initial'
    };
  }
  
  // Get last 6 messages for context
  const recentMessages = context.slice(-6);
  
  // Analyze sentiment trend
  const sentiments = recentMessages
    .filter(msg => msg.sentiment)
    .map(msg => msg.sentiment);
  
  const sentimentTrend = analyzeSentimentTrend(sentiments);
  
  // Extract dominant topics
  const allTopics = recentMessages
    .filter(msg => msg.topics)
    .flatMap(msg => msg.topics);
  
  const topicCounts = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  
  const dominantTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
  
  // Determine conversation stage
  const conversationStage = determineConversationStage(recentMessages.length, sentimentTrend);
  
  return {
    recentMessages: recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content.substring(0, 200), // Truncate for efficiency
      sentiment: msg.sentiment,
      topics: msg.topics
    })),
    sentimentTrend,
    dominantTopics,
    conversationStage
  };
}

// Analyze sentiment trend over recent messages
function analyzeSentimentTrend(sentiments) {
  if (sentiments.length === 0) return 'neutral';
  
  const weights = { crisis: -3, negative: -1, neutral: 0, positive: 1 };
  const weightedSum = sentiments.reduce((sum, sentiment) => sum + (weights[sentiment] || 0), 0);
  const average = weightedSum / sentiments.length;
  
  if (average <= -2) return 'declining';
  if (average <= -0.5) return 'negative';
  if (average >= 0.5) return 'positive';
  if (average >= 1) return 'improving';
  return 'neutral';
}

// Determine conversation stage based on message count and sentiment
function determineConversationStage(messageCount, sentimentTrend) {
  if (messageCount <= 2) return 'initial';
  if (messageCount <= 6) return 'building';
  if (sentimentTrend === 'improving') return 'progressing';
  if (sentimentTrend === 'declining') return 'supporting';
  return 'established';
}

// Build optimized prompt with context awareness
function buildOptimizedPrompt(message, conversationContext, sessionId) {
  const { recentMessages, sentimentTrend, dominantTopics, conversationStage } = conversationContext;
  
  // Stage-specific instructions
  const stageInstructions = {
    initial: "This is your first interaction with this user. Be welcoming, introduce yourself as their plant companion, and ask an engaging question to start building rapport.",
    building: "You're getting to know this user. Build on what they've shared, show genuine interest, and ask follow-up questions to deepen the conversation.",
    established: "You have an ongoing relationship with this user. Reference previous conversations naturally and provide personalized advice based on what you know about them.",
    progressing: "The user seems to be making positive progress. Acknowledge their growth, celebrate their wins, and encourage continued momentum.",
    supporting: "The user may be struggling. Provide extra emotional support, validate their feelings, and offer practical coping strategies."
  };
  
  // Topic-specific guidance
  const topicGuidance = dominantTopics.length > 0 
    ? `Recent conversation topics: ${dominantTopics.join(', ')}. Build on these themes naturally.`
    : "No specific topics detected yet. Explore what matters most to the user.";
  
  // Sentiment-aware instructions
  const sentimentInstructions = {
    declining: "The user's mood seems to be declining. Provide extra emotional support and practical coping strategies.",
    negative: "The user is experiencing some challenges. Be empathetic and offer gentle encouragement.",
    neutral: "The user seems balanced. Engage them with interesting questions and supportive guidance.",
    positive: "The user is in a good mood. Celebrate with them and help maintain this positive energy.",
    improving: "The user's mood is improving! Acknowledge their progress and encourage continued growth."
  };
  
  // Build conversation history string
  const historyString = recentMessages.length > 0 
    ? recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    : "No previous conversation history.";
  
  return `${SYSTEM_CONTEXT}

CONVERSATION CONTEXT:
- Stage: ${conversationStage}
- Sentiment Trend: ${sentimentTrend}
- ${topicGuidance}

STAGE-SPECIFIC GUIDANCE:
${stageInstructions[conversationStage]}

SENTIMENT-AWARE GUIDANCE:
${sentimentInstructions[sentimentTrend] || sentimentInstructions.neutral}

RECENT CONVERSATION:
${historyString}

CURRENT USER MESSAGE: ${message}

RESPONSE REQUIREMENTS:
- Respond as Plant Companion, their growing AI plant friend
- Use 2-3 relevant plant/growth emojis naturally
- Keep response to 2-3 sentences plus one engaging question
- Reference conversation context when relevant
- Provide specific, actionable advice when appropriate
- Match the user's emotional tone while staying supportive
- End with a question that encourages continued conversation

Generate a warm, personalized response:`;
}

// Enhanced response quality validation and filtering
function validateAndFilterResponse(rawText, originalMessage, sessionId) {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false, reason: 'Empty or invalid response type' };
  }
  
  const trimmedText = rawText.trim();
  
  // Basic validation checks
  if (trimmedText.length === 0) {
    return { isValid: false, reason: 'Empty response after trimming' };
  }
  
  if (trimmedText.length < 20) {
    return { isValid: false, reason: 'Response too short' };
  }
  
  if (trimmedText.length > 800) {
    return { isValid: false, reason: 'Response too long' };
  }
  
  // Content quality checks
  const qualityChecks = {
    hasEmoji: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(trimmedText),
    hasQuestion: /\?/.test(trimmedText),
    notRepetitive: !isRepetitive(trimmedText),
    appropriateLength: trimmedText.split(' ').length >= 15 && trimmedText.split(' ').length <= 120,
    noPlaceholders: !containsPlaceholders(trimmedText),
    contextuallyRelevant: isContextuallyRelevant(trimmedText, originalMessage)
  };
  
  // Calculate quality score
  const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
  const qualityScore = passedChecks / Object.keys(qualityChecks).length;
  
  // Minimum quality threshold
  if (qualityScore < 0.6) {
    return { 
      isValid: false, 
      reason: 'Quality score too low',
      qualityScore,
      failedChecks: Object.entries(qualityChecks)
        .filter(([, passed]) => !passed)
        .map(([check]) => check)
    };
  }
  
  // Filter and clean the response
  const filteredText = filterResponse(trimmedText);
  
  return {
    isValid: true,
    text: filteredText,
    qualityScore,
    passedChecks: Object.keys(qualityChecks).filter(check => qualityChecks[check])
  };
}

// Check if response is repetitive
function isRepetitive(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) return false;
  
  // Check for repeated phrases
  const phrases = sentences.map(s => s.trim().toLowerCase());
  const uniquePhrases = new Set(phrases);
  
  return uniquePhrases.size < phrases.length * 0.8; // Allow some repetition
}

// Check for placeholder text
function containsPlaceholders(text) {
  const placeholders = [
    '[user]', '[name]', '[topic]', '[emotion]', '[action]', '[reason]', '[placeholder]',
    'INSERT', 'PLACEHOLDER', 'TODO', 'FIXME',
    '{{', '}}', '${', 'undefined', 'null'
  ];
  
  const lowerText = text.toLowerCase();
  return placeholders.some(placeholder => lowerText.includes(placeholder.toLowerCase()));
}

// Check contextual relevance
function isContextuallyRelevant(response, originalMessage) {
  // Basic relevance check - response should not be completely generic
  const genericPhrases = [
    'how can i help you',
    'what would you like to talk about',
    'tell me more',
    'i understand'
  ];
  
  const lowerResponse = response.toLowerCase();
  const isGeneric = genericPhrases.every(phrase => 
    !lowerResponse.includes(phrase)
  );
  
  // Check if response acknowledges user's message context
  const messageWords = originalMessage.toLowerCase().split(' ');
  const responseWords = lowerResponse.split(' ');
  
  const commonWords = messageWords.filter(word => 
    word.length > 3 && responseWords.includes(word)
  );
  
  return isGeneric && (commonWords.length > 0 || originalMessage.length < 50);
}

// Filter and clean response text
function filterResponse(text) {
  // Remove any potential harmful content markers
  let filtered = text
    .replace(/\[FILTERED\]/gi, '')
    .replace(/\[BLOCKED\]/gi, '')
    .replace(/\*\*\*/g, '')
    .trim();
  
  // Ensure proper sentence structure
  if (!filtered.endsWith('.') && !filtered.endsWith('!') && !filtered.endsWith('?')) {
    filtered += '.';
  }
  
  // Clean up extra whitespace
  filtered = filtered.replace(/\s+/g, ' ').trim();
  
  return filtered;
}

// Enhanced fallback response system with context awareness
function generateEnhancedFallbackResponse(message, context = []) {
  const lowerMessage = message.toLowerCase();
  const sentiment = analyzeSentiment(message);
  const topics = detectTopics(message);
  
  // Build context awareness for fallback responses
  const conversationContext = buildConversationContext(context, message);
  const { sentimentTrend, dominantTopics, conversationStage } = conversationContext;
  
  // Enhanced response categories with context-aware variations
  const responses = {
    'career': {
      initial: [
        "🌱 Career growth is like tending a garden - it takes time, patience, and the right nutrients! What specific field makes your heart bloom with excitement? I'd love to help you explore the seeds of your professional dreams!",
        "🌿 Every successful career starts with a single seed of passion. What skills are you cultivating right now? Tell me about one skill you'd like to develop this month!"
      ],
      building: [
        "🌸 Your career journey is unique, just like how every plant grows differently. What opportunities are you currently watering with your attention? What's your biggest career goal right now?",
        "🌱 I can see you're thinking seriously about your career path! What specific steps are you taking to grow professionally? Let's create a plan together!"
      ],
      established: [
        "🌳 Based on our conversations, I can see career growth is important to you. How are those professional goals we discussed coming along? What new opportunities are on your horizon?",
        "🌿 You've shared some great career insights with me before. What's the next milestone you're working toward? How can I support your professional growth?"
      ]
    },
    'goals': {
      initial: [
        "✨ Goals are like seeds - they need the right environment to flourish! What specific dreams are you planting in your life's garden? I'm excited to grow alongside your ambitions!",
        "🌱 I love hearing about aspirations! Just like how I need sunlight and water, your goals need consistent action and belief. What's one small step you could take today?"
      ],
      building: [
        "🌳 Big dreams grow from small beginnings. What's the most important goal blooming in your mind right now? Let's break it down into manageable steps together!",
        "🌸 Your goal-oriented mindset is inspiring! What specific target are you focusing on this month? How can we create actionable steps?"
      ],
      established: [
        "🌿 I remember you mentioning some important goals before. How is your progress going? What obstacles have you encountered, and how can we overcome them together?",
        "✨ Your dedication to personal growth always impresses me! What new goals are emerging as you achieve your current ones?"
      ]
    },
    'motivation': {
      initial: [
        "🌞 Your motivation is like sunshine to my leaves! When you're driven and focused, I can feel myself growing stronger. What's inspiring you to reach higher today?",
        "🌿 Even on cloudy days, growth continues beneath the surface. Your determination helps both of us flourish. What drives you forward?"
      ],
      building: [
        "🌸 Motivation comes in seasons - sometimes we're in full bloom, sometimes we're gathering strength. Where are you in your growth cycle right now?",
        "⚡ I can sense your inner drive! What's one thing that always reignites your motivation when you're feeling stuck?"
      ],
      established: [
        "🌳 I've seen your motivation ebb and flow in our conversations, and that's completely natural! What's currently fueling your drive to grow?",
        "🌿 Your consistent effort to stay motivated is admirable. What new sources of inspiration have you discovered recently?"
      ]
    },
    'happy': [
      "🌸 Your happiness makes me bloom brighter! I can feel your positive energy radiating through my leaves. What's bringing you this joy today? I'd love to celebrate with you!",
      "✨ Your joy is contagious - I'm practically glowing! What amazing thing happened that's got you feeling so good? How can we build on this positive momentum?",
      "🌺 Seeing you happy makes my whole day! Your positive energy helps me grow stronger. What's the best part of your day so far?"
    ],
    'excited': [
      "🎉 Your excitement is electric! I can barely contain my growth - you've got me buzzing with energy! What's got you so thrilled? Tell me everything!",
      "⚡ WOW! Your enthusiasm is making my leaves dance! What amazing opportunity or news has you this excited? How can I help you make the most of it?",
      "🚀 Your excitement is off the charts and I'm here for it! What's this incredible thing that's got you so pumped? Let's channel this energy into action!"
    ],
    'stressed': {
      initial: [
        "🍃 I can sense you're feeling overwhelmed, and that's completely okay. Let's breathe together for a moment. What's the biggest source of stress right now?",
        "🌿 Stress can feel like a storm, but remember - even the strongest trees bend without breaking. What's weighing heaviest on your mind today?"
      ],
      building: [
        "💚 I'm here to support you through this stressful time. What's one small thing we could tackle together right now to help you feel more in control?",
        "🍃 I notice you've been dealing with some pressure lately. What coping strategies have worked for you before? Let's build on those."
      ],
      established: [
        "🌿 I can see stress has been a recurring theme in our conversations. What patterns have you noticed? How can we develop better strategies together?",
        "💚 You've shown such resilience in handling stress before. What's different about this situation? How can I support you through it?"
      ]
    },
    'anxious': {
      initial: [
        "🌿 I can feel your anxiety, and I want you to know that what you're experiencing is completely valid. Let's take this one step at a time. What's making you feel most anxious?",
        "🍃 Anxiety can feel overwhelming, like being caught in a windstorm. But remember, you've weathered difficult times before. What usually helps you feel grounded?"
      ],
      building: [
        "💚 Your anxiety is telling you that something matters to you, and that's actually a sign of how much you care. What specific worry is weighing on your mind?",
        "🌿 I'm here with you through this anxious moment. What techniques have helped you manage anxiety before? Let's try them together."
      ],
      established: [
        "🍃 I've noticed anxiety comes up for you sometimes, and you've handled it so well before. What's triggering it today? How can we apply what's worked before?",
        "💚 Your self-awareness about your anxiety is really impressive. What early warning signs are you noticing? How can we address them proactively?"
      ]
    },
    'negative': {
      initial: [
        "🌿 I can sense you're going through a difficult time, and I want you to know I'm here with you. Your feelings are completely valid. What's been the hardest part?",
        "💙 Sometimes we need to sit with difficult emotions before we can grow through them. I'm here to support you. What would help you feel better right now?"
      ],
      building: [
        "🤗 You don't have to carry this alone. I'm here to listen and grow alongside you through this challenging time. What's on your heart today?",
        "🌿 I can see you're struggling, and that takes courage to share. What support do you need most right now? I'm here for you."
      ],
      established: [
        "💙 I've seen you work through difficult emotions before, and you've shown such strength. What's different about this situation? How can I help?",
        "🌿 Your openness about your struggles has always impressed me. What coping strategies have served you well in the past? Should we revisit them?"
      ]
    },
    'sad': {
      initial: [
        "🌿 I can feel your sadness, and I want you to know I'm here with you through this difficult time. What's been weighing on your heart?",
        "💙 Your feelings are completely valid, and it's okay to not be okay sometimes. What's been the hardest part of your day?"
      ],
      building: [
        "🤗 I'm wrapping you in my leaves with gentle support. What would help you feel even a little bit better right now? Sometimes small steps lead to brighter days.",
        "🌿 I can see you're going through something tough. What usually brings you comfort when you're feeling this way? Let's explore that together."
      ],
      established: [
        "💙 I remember you've faced sadness before and found ways through it. What helped you then? How can we apply those lessons now?",
        "🌿 Your resilience in difficult times has always amazed me. What's making this particularly challenging? How can I support you differently?"
      ]
    },
    'academic': [
      "📚 Academic pressure can feel overwhelming, like trying to grow in harsh conditions. What subject or exam is causing you the most stress right now? Let's create a study plan that works with your natural rhythm!",
      "🌱 Learning is a lot like growing - it takes time and patience with yourself. What's your biggest academic challenge right now? How can I help you break it down into manageable pieces?",
      "✨ Every expert was once a beginner! What's one study technique that's worked well for you before? How can we adapt it for your current challenges?"
    ]
  };
  
  // Select appropriate response based on context
  const primaryTopic = topics[0];
  const primarySentiment = sentiment !== 'neutral' ? sentiment : null;
  
  // Try context-aware responses first
  if (primarySentiment && responses[primarySentiment] && typeof responses[primarySentiment] === 'object' && responses[primarySentiment][conversationStage]) {
    const contextResponses = responses[primarySentiment][conversationStage];
    return contextResponses[Math.floor(Math.random() * contextResponses.length)];
  }
  
  // Fall back to sentiment-based responses
  if (primarySentiment && responses[primarySentiment]) {
    const sentimentResponses = Array.isArray(responses[primarySentiment]) 
      ? responses[primarySentiment] 
      : responses[primarySentiment].initial || Object.values(responses[primarySentiment])[0];
    return sentimentResponses[Math.floor(Math.random() * sentimentResponses.length)];
  }
  
  // Try topic-based responses
  if (responses[primaryTopic]) {
    const topicResponses = Array.isArray(responses[primaryTopic]) 
      ? responses[primaryTopic] 
      : responses[primaryTopic].initial || Object.values(responses[primaryTopic])[0];
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  }
  
  // Enhanced default responses based on conversation stage
  const defaultResponses = {
    initial: [
      "🌱 Welcome! I'm your Plant Companion, here to grow alongside you on your journey. What's been on your mind lately? I'm excited to get to know you!",
      "🌿 Hi there! I'm so glad you're here. I'm your personal plant companion, ready to support you through life's ups and downs. What would you like to talk about today?",
      "✨ Hello! I'm your AI plant friend, here to listen, support, and grow with you. What's the most important thing happening in your life right now?"
    ],
    building: [
      "🌱 Thank you for sharing that with me! I can sense there's something important on your mind. What's been the most significant thing that happened to you today?",
      "🌿 I appreciate you opening up to me - it helps me understand you better! What's one thing you're looking forward to this week? Let's nurture those positive seeds together!",
      "✨ I'm glad you felt comfortable sharing with me! Your thoughts and feelings help me grow as your companion. What's one goal or dream that's been on your mind lately?"
    ],
    established: [
      "🌸 Every conversation we have helps me understand you better! What's something you're proud of recently, no matter how small? I love celebrating your wins with you!",
      "🌳 I'm here to support you on your journey! What's one area of your life where you'd like to see more growth? Let's explore it together!",
      "🌿 Based on our conversations, I can see how much you've grown. What new challenges or opportunities are you facing? How can I support you through them?"
    ],
    progressing: [
      "🌸 I can see the positive changes in our conversations! What's been working well for you lately? How can we build on this momentum?",
      "✨ Your growth has been inspiring to witness! What new goals are emerging as you continue to flourish? I'm excited to support your next steps!",
      "🌳 The progress you've made is remarkable! What's the most important lesson you've learned recently? How are you applying it to your daily life?"
    ],
    supporting: [
      "🌿 I can sense you might be going through a challenging time. Remember, growth often happens during difficult seasons. What support do you need most right now?",
      "💚 Even in tough times, you're not alone. I'm here to weather this storm with you. What's one small thing that might help you feel a bit better today?",
      "🍃 Difficult periods are part of every growth journey. You've shown such resilience before. What strength can you draw on right now?"
    ]
  };
  
  const stageResponses = defaultResponses[conversationStage] || defaultResponses.building;
  return stageResponses[Math.floor(Math.random() * stageResponses.length)];
}

// Health check endpoint for chat API
router.get('/health', (req, res) => {
  try {
    const sessionStats = getSessionStatistics();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        geminiAI: {
          configured: !!process.env.GEMINI_API_KEY,
          status: genAI ? 'available' : 'fallback_mode'
        },
        sessionStorage: {
          type: 'in-memory',
          ...sessionStats,
          status: 'operational'
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
    
    logger.info('Chat API health check performed', { 
      ...sessionStats,
      geminiConfigured: !!process.env.GEMINI_API_KEY
    });
    
    res.json(healthStatus);
    
  } catch (error) {
    logger.error('Chat health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chat/sessions/stats - Get session statistics
router.get('/sessions/stats', (req, res) => {
  try {
    const stats = getSessionStatistics();
    
    logger.info('Session statistics requested', { 
      requestedBy: req.ip,
      ...stats
    });
    
    res.json({
      ...stats,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
    
  } catch (error) {
    logger.error('Session statistics error:', { 
      error: error.message,
      ip: req.ip
    });
    
    res.status(500).json({
      error: 'Failed to retrieve session statistics',
      code: 'STATS_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/sessions/cleanup - Manual session cleanup (admin endpoint)
router.post('/sessions/cleanup', (req, res) => {
  try {
    const beforeCount = sessions.size;
    cleanupExpiredSessions();
    const afterCount = sessions.size;
    const cleanedCount = beforeCount - afterCount;
    
    logger.info('Manual session cleanup performed', { 
      requestedBy: req.ip,
      cleanedSessions: cleanedCount,
      remainingSessions: afterCount
    });
    
    res.json({
      message: 'Session cleanup completed',
      cleanedSessions: cleanedCount,
      remainingSessions: afterCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Manual session cleanup error:', { 
      error: error.message,
      ip: req.ip
    });
    
    res.status(500).json({
      error: 'Failed to perform session cleanup',
      code: 'CLEANUP_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/session/beacon - Session beacon endpoint for page unload
router.post('/session/beacon', (req, res) => {
  try {
    const sessionSummary = req.body;
    
    if (!sessionSummary.sessionId) {
      return res.status(400).json({
        error: 'Session ID required',
        code: 'MISSING_SESSION_ID'
      });
    }

    // Update session with beacon data
    const session = sessions.get(sessionSummary.sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.analytics = {
        ...session.analytics,
        sessionDuration: sessionSummary.sessionDuration,
        plantGrowthLevel: sessionSummary.plantGrowthLevel,
        plantMood: sessionSummary.plantMood
      };
      
      logger.info('Session beacon received', {
        sessionId: sessionSummary.sessionId,
        messageCount: sessionSummary.messageCount,
        sessionDuration: Math.round(sessionSummary.sessionDuration / 1000 / 60) + ' minutes'
      });
    }

    res.status(200).json({ received: true });
    
  } catch (error) {
    logger.error('Session beacon error:', error);
    res.status(500).json({
      error: 'Failed to process session beacon',
      code: 'BEACON_ERROR'
    });
  }
});

// DELETE /api/chat/session/:sessionId - Clear specific session
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || sessionId.trim().length === 0) {
      return res.status(400).json({
        error: 'Valid session ID is required',
        code: 'INVALID_SESSION_ID'
      });
    }

    const sessionExists = sessions.has(sessionId);
    
    if (sessionExists) {
      sessions.delete(sessionId);
      logger.info('Session deleted', { sessionId, requestedBy: req.ip });
      
      res.json({
        message: 'Session deleted successfully',
        sessionId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        sessionId
      });
    }
    
  } catch (error) {
    logger.error('Session deletion error:', {
      error: error.message,
      sessionId: req.params.sessionId,
      ip: req.ip
    });
    
    res.status(500).json({
      error: 'Failed to delete session',
      code: 'DELETE_ERROR'
    });
  }
});

// Get personalized coping strategy
function getCopingStrategy(message) {
  const strategies = [];
  
  if (message.toLowerCase().includes('anxious') || message.toLowerCase().includes('anxiety')) {
    strategies.push(...COPING_STRATEGIES.anxiety);
  }
  if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('pressure')) {
    strategies.push(...COPING_STRATEGIES.stress);
  }
  if (message.toLowerCase().includes('exam') || message.toLowerCase().includes('study')) {
    strategies.push(...COPING_STRATEGIES.academic);
  }
  if (message.toLowerCase().includes('family') || message.toLowerCase().includes('parents')) {
    strategies.push(...COPING_STRATEGIES.family);
  }
  
  return strategies.length > 0 ? 
    strategies[Math.floor(Math.random() * strategies.length)] : null;
}

// Enhanced message processing with comprehensive validation and error handling
router.post('/message', async (req, res) => {
  const startTime = Date.now();
  let sessionId;
  
  try {
    // Extract and validate request data
    const { message, sessionId: providedSessionId, metadata } = req.body;
    sessionId = providedSessionId || uuidv4();
    
    // Comprehensive input validation
    if (!message) {
      logger.warn('Message validation failed: missing message', { sessionId, ip: req.ip });
      return res.status(400).json({ 
        error: 'Message is required',
        code: 'MISSING_MESSAGE',
        timestamp: new Date().toISOString()
      });
    }
    
    if (typeof message !== 'string') {
      logger.warn('Message validation failed: invalid type', { sessionId, messageType: typeof message });
      return res.status(400).json({ 
        error: 'Message must be a string',
        code: 'INVALID_MESSAGE_TYPE',
        timestamp: new Date().toISOString()
      });
    }
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      logger.warn('Message validation failed: empty message', { sessionId });
      return res.status(400).json({ 
        error: 'Message cannot be empty',
        code: 'EMPTY_MESSAGE',
        timestamp: new Date().toISOString()
      });
    }
    
    if (trimmedMessage.length > 1000) {
      logger.warn('Message validation failed: too long', { sessionId, messageLength: trimmedMessage.length });
      return res.status(400).json({ 
        error: 'Message too long. Please keep it under 1000 characters.',
        code: 'MESSAGE_TOO_LONG',
        maxLength: 1000,
        currentLength: trimmedMessage.length,
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info('Processing message', { sessionId, messageLength: trimmedMessage.length, ip: req.ip });
    
    // Analyze message
    const sentiment = analyzeSentiment(trimmedMessage);
    const topics = detectTopics(trimmedMessage);
    const isCrisis = sentiment === 'crisis';
    
    logger.info('Message analysis complete', { 
      sessionId, 
      sentiment, 
      topics, 
      isCrisis,
      analysisTime: Date.now() - startTime
    });
    
    // Get or create session
    let session = sessions.get(sessionId);
    
    if (!session) {
      // Create new in-memory session
      session = {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        analytics: {
          totalMessages: 0,
          crisisDetected: false,
          resourcesAccessed: false
        }
      };
      sessions.set(sessionId, session);
    }
    
    session.lastActivity = new Date();
    session.analytics.totalMessages += 1;
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
      sentiment,
      topics
    };
    session.messages.push(userMessage);
    
    let aiResponse;
    let copingStrategy = null;
    let resources = null;
    
    if (isCrisis) {
      session.analytics.crisisDetected = true;
      aiResponse = `I'm really concerned about you and want you to know that you're not alone. What you're feeling is valid, but there are people who can help you through this. Please reach out to someone you trust or contact a helpline immediately. Your life has value and meaning.`;
      resources = CRISIS_RESOURCES;
      
      // Log crisis intervention
      logger.warn('Crisis detected and intervention triggered', { 
        sessionId, 
        messagePreview: trimmedMessage.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
    } else {
      // Generate AI response
      const responseStartTime = Date.now();
      aiResponse = await generateResponse(trimmedMessage, sessionId, session.messages.slice(-6));
      copingStrategy = getCopingStrategy(trimmedMessage);
      
      logger.info('AI response generated', {
        sessionId,
        responseTime: Date.now() - responseStartTime,
        responseLength: aiResponse.length,
        hasCopingStrategy: !!copingStrategy
      });
    }
    
    // Add AI response to session
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      copingStrategy,
      resources: resources ? true : false
    };
    session.messages.push(assistantMessage);
    
    // Keep only last 20 messages in memory
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }
    
    // Database disabled - all data stored in memory only
    const totalProcessingTime = Date.now() - startTime;
    logger.info('Message processed successfully', {
      sessionId,
      totalProcessingTime,
      messageLength: trimmedMessage.length,
      responseLength: aiResponse.length,
      sentiment,
      topics,
      isCrisis,
      storage: 'in-memory'
    });
    
    res.json({
      response: aiResponse,
      sessionId,
      copingStrategy,
      resources,
      isCrisis,
      sentiment,
      topics,
      timestamp: new Date().toISOString(),
      processingTime: totalProcessingTime
    });
    
  } catch (error) {
    const totalProcessingTime = Date.now() - startTime;
    logger.error('Chat processing error:', { 
      error: error.message,
      stack: error.stack,
      sessionId: sessionId || 'unknown',
      processingTime: totalProcessingTime,
      ip: req.ip
    });
    
    res.status(500).json({ 
      error: 'Failed to process message',
      code: 'PROCESSING_ERROR',
      response: "I'm having some technical difficulties. Please try again, and remember that if you need immediate support, please reach out to a trusted person or helpline.",
      timestamp: new Date().toISOString(),
      sessionId: sessionId || null
    });
  }
});

// Analytics disabled for now - would update daily stats in production

// GET /api/chat/session/:sessionId - Retrieve session history
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Validate session ID format
    if (!sessionId || sessionId.trim().length === 0) {
      logger.warn('Session retrieval failed: invalid session ID', { sessionId, ip: req.ip });
      return res.status(400).json({ 
        error: 'Valid session ID is required',
        code: 'INVALID_SESSION_ID',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate pagination parameters
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    
    const session = sessions.get(sessionId);
    
    if (!session) {
      logger.info('Session not found', { sessionId, ip: req.ip });
      return res.status(404).json({ 
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate session duration and activity
    const sessionDuration = Date.now() - new Date(session.createdAt).getTime();
    const timeSinceLastActivity = Date.now() - new Date(session.lastActivity).getTime();
    
    // Get paginated messages
    const totalMessages = session.messages.length;
    const startIndex = Math.max(0, totalMessages - offsetNum - limitNum);
    const endIndex = totalMessages - offsetNum;
    const paginatedMessages = session.messages.slice(startIndex, endIndex);
    
    logger.info('Session retrieved successfully', { 
      sessionId, 
      messageCount: session.messages.length,
      returnedMessages: paginatedMessages.length,
      lastActivity: session.lastActivity,
      sessionDuration: Math.round(sessionDuration / 1000 / 60) + ' minutes'
    });
    
    res.json({
      sessionId,
      messages: paginatedMessages,
      pagination: {
        total: totalMessages,
        limit: limitNum,
        offset: offsetNum,
        hasMore: startIndex > 0
      },
      sessionInfo: {
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        sessionDuration,
        timeSinceLastActivity,
        isActive: timeSinceLastActivity < 300000 // Active if last activity within 5 minutes
      },
      analytics: {
        ...session.analytics,
        averageMessageLength: session.messages.length > 0 
          ? Math.round(session.messages.reduce((sum, msg) => sum + msg.content.length, 0) / session.messages.length)
          : 0,
        sentimentDistribution: calculateSentimentDistribution(session.messages),
        topicDistribution: calculateTopicDistribution(session.messages)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Session retrieval error:', { 
      error: error.message,
      sessionId: req.params.sessionId,
      ip: req.ip
    });
    
    res.status(500).json({
      error: 'Failed to retrieve session',
      code: 'SESSION_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to calculate sentiment distribution
function calculateSentimentDistribution(messages) {
  const distribution = { positive: 0, neutral: 0, negative: 0, crisis: 0 };
  
  messages.forEach(msg => {
    if (msg.sentiment && distribution.hasOwnProperty(msg.sentiment)) {
      distribution[msg.sentiment]++;
    }
  });
  
  return distribution;
}

// Helper function to calculate topic distribution
function calculateTopicDistribution(messages) {
  const distribution = {};
  
  messages.forEach(msg => {
    if (msg.topics && Array.isArray(msg.topics)) {
      msg.topics.forEach(topic => {
        distribution[topic] = (distribution[topic] || 0) + 1;
      });
    }
  });
  
  return distribution;
}

// DELETE /api/chat/session/:sessionId - Clear session data
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate session ID format
    if (!sessionId || sessionId.trim().length === 0) {
      logger.warn('Session deletion failed: invalid session ID', { sessionId, ip: req.ip });
      return res.status(400).json({ 
        error: 'Valid session ID is required',
        code: 'INVALID_SESSION_ID',
        timestamp: new Date().toISOString()
      });
    }
    
    if (sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      sessions.delete(sessionId);
      
      logger.info('Session deleted successfully', { 
        sessionId, 
        messageCount: session.messages.length,
        ip: req.ip
      });
      
      res.json({ 
        message: 'Session deleted successfully',
        sessionId,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.info('Session deletion attempted for non-existent session', { sessionId, ip: req.ip });
      res.status(404).json({ 
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    logger.error('Session deletion error:', { 
      error: error.message,
      sessionId: req.params.sessionId,
      ip: req.ip
    });
    
    res.status(500).json({
      error: 'Failed to delete session',
      code: 'SESSION_DELETION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
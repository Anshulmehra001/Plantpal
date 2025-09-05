const express = require('express');
const router = express.Router();

// Mental health resources database
const RESOURCES = {
  helplines: [
    {
      id: 1,
      name: "AASRA",
      number: "91-9820466726",
      email: "aasrahelpline@yahoo.com",
      website: "http://www.aasra.info",
      available: "24/7",
      languages: ["English", "Hindi"],
      description: "Suicide prevention helpline"
    },
    {
      id: 2,
      name: "Sneha India",
      number: "91-44-24640050",
      email: "help@snehaindia.org",
      website: "http://www.snehaindia.org",
      available: "24/7",
      languages: ["English", "Tamil", "Hindi"],
      description: "Emotional support and suicide prevention"
    },
    {
      id: 3,
      name: "Vandrevala Foundation",
      number: "1860-2662-345",
      email: "help@vandrevalafoundation.com",
      website: "https://www.vandrevalafoundation.com",
      available: "24/7",
      languages: ["English", "Hindi", "Marathi", "Gujarati"],
      description: "Mental health support and counseling"
    },
    {
      id: 4,
      name: "iCall",
      number: "91-9152987821",
      email: "icall@tiss.edu",
      website: "http://www.icallhelpline.org",
      available: "Monday-Saturday, 8AM-10PM",
      languages: ["English", "Hindi"],
      description: "Psychosocial helpline by TISS"
    }
  ],
  
  professionals: [
    {
      id: 1,
      name: "Amaha (formerly InnerHour)",
      type: "Online Platform",
      website: "https://www.amaha.in",
      services: ["Therapy", "Psychiatry", "Self-help tools"],
      cost: "Paid consultations available",
      description: "Professional mental health platform with licensed therapists"
    },
    {
      id: 2,
      name: "YourDOST",
      type: "Online Counseling",
      website: "https://yourdost.com",
      services: ["Chat therapy", "Call therapy", "Group sessions"],
      cost: "Free and paid options",
      description: "Online emotional wellness platform"
    },
    {
      id: 3,
      name: "BetterHelp India",
      type: "Online Therapy",
      website: "https://www.betterhelp.com",
      services: ["Individual therapy", "Couples therapy"],
      cost: "Subscription-based",
      description: "Professional online therapy platform"
    }
  ],
  
  selfHelp: [
    {
      id: 1,
      title: "Breathing Exercises",
      category: "Anxiety Management",
      description: "Simple breathing techniques to calm anxiety",
      steps: [
        "Sit comfortably with your back straight",
        "Breathe in slowly through your nose for 4 counts",
        "Hold your breath for 4 counts",
        "Exhale slowly through your mouth for 6 counts",
        "Repeat 5-10 times"
      ]
    },
    {
      id: 2,
      title: "5-4-3-2-1 Grounding Technique",
      category: "Anxiety Management",
      description: "Grounding technique to manage panic and anxiety",
      steps: [
        "Name 5 things you can see around you",
        "Name 4 things you can touch",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste"
      ]
    },
    {
      id: 3,
      title: "Study Break Routine",
      category: "Academic Stress",
      description: "Healthy study break routine to prevent burnout",
      steps: [
        "Study for 25-30 minutes focused",
        "Take a 5-minute break",
        "Stand up and stretch",
        "Drink water or have a healthy snack",
        "Take 3 deep breaths before resuming"
      ]
    },
    {
      id: 4,
      title: "Family Communication Tips",
      category: "Family Issues",
      description: "Tips for better communication with family",
      steps: [
        "Choose the right time to talk",
        "Use 'I' statements instead of 'You' statements",
        "Listen actively to their perspective",
        "Stay calm and respectful",
        "Find common ground and compromise"
      ]
    }
  ],
  
  articles: [
    {
      id: 1,
      title: "Understanding Mental Health in Indian Context",
      category: "Education",
      readTime: "5 min",
      summary: "Breaking down mental health stigma in Indian society",
      content: "Mental health awareness is growing in India, but stigma remains a significant barrier..."
    },
    {
      id: 2,
      title: "Managing Academic Pressure",
      category: "Academic Stress",
      readTime: "7 min",
      summary: "Healthy ways to cope with exam stress and parental expectations",
      content: "Academic pressure is a reality for most Indian students. Here are evidence-based strategies..."
    },
    {
      id: 3,
      title: "Building Emotional Resilience",
      category: "Personal Growth",
      readTime: "6 min",
      summary: "Developing skills to bounce back from challenges",
      content: "Emotional resilience is the ability to adapt and recover from difficult situations..."
    }
  ]
};

// GET /api/resources/helplines
router.get('/helplines', (req, res) => {
  res.json({
    helplines: RESOURCES.helplines,
    emergency: "112"
  });
});

// GET /api/resources/professionals
router.get('/professionals', (req, res) => {
  res.json({
    professionals: RESOURCES.professionals
  });
});

// GET /api/resources/self-help
router.get('/self-help', (req, res) => {
  const { category } = req.query;
  
  let selfHelp = RESOURCES.selfHelp;
  
  if (category) {
    selfHelp = selfHelp.filter(resource => 
      resource.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  res.json({
    selfHelp,
    categories: [...new Set(RESOURCES.selfHelp.map(r => r.category))]
  });
});

// GET /api/resources/articles
router.get('/articles', (req, res) => {
  const { category } = req.query;
  
  let articles = RESOURCES.articles;
  
  if (category) {
    articles = articles.filter(article => 
      article.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  res.json({
    articles,
    categories: [...new Set(RESOURCES.articles.map(a => a.category))]
  });
});

// GET /api/resources/search
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const query = q.toLowerCase();
  const results = {
    helplines: [],
    professionals: [],
    selfHelp: [],
    articles: []
  };
  
  // Search helplines
  results.helplines = RESOURCES.helplines.filter(helpline =>
    helpline.name.toLowerCase().includes(query) ||
    helpline.description.toLowerCase().includes(query) ||
    helpline.languages.some(lang => lang.toLowerCase().includes(query))
  );
  
  // Search professionals
  results.professionals = RESOURCES.professionals.filter(prof =>
    prof.name.toLowerCase().includes(query) ||
    prof.description.toLowerCase().includes(query) ||
    prof.services.some(service => service.toLowerCase().includes(query))
  );
  
  // Search self-help
  results.selfHelp = RESOURCES.selfHelp.filter(resource =>
    resource.title.toLowerCase().includes(query) ||
    resource.description.toLowerCase().includes(query) ||
    resource.category.toLowerCase().includes(query)
  );
  
  // Search articles
  results.articles = RESOURCES.articles.filter(article =>
    article.title.toLowerCase().includes(query) ||
    article.summary.toLowerCase().includes(query) ||
    article.category.toLowerCase().includes(query)
  );
  
  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  
  res.json({
    query: q,
    totalResults,
    results
  });
});

// GET /api/resources/emergency
router.get('/emergency', (req, res) => {
  res.json({
    emergency: {
      number: "112",
      description: "National Emergency Number (Police, Fire, Medical)"
    },
    crisis: RESOURCES.helplines.filter(h => h.available === "24/7"),
    message: "If you're in immediate danger or having thoughts of self-harm, please call emergency services or a crisis helpline immediately."
  });
});

module.exports = router;
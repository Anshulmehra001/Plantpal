# 🌱 Plant Companion - AI Mental Health Support

A revolutionary AI-powered plant companion that grows with your emotions and provides personalized mental health support through interactive conversations. Built for the modern world where mental wellness is paramount.

![Plant Companion Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### 🤖 AI-Powered Conversations
- **Google Gemini Integration**: Advanced AI responses with context awareness
- **Sentiment Analysis**: Real-time mood detection and emotional pattern recognition
- **Crisis Detection**: Automatic identification of mental health emergencies with resource provision
- **Personalized Support**: Tailored advice based on conversation history and emotional patterns

### 🌿 Interactive Plant Companion
- **Dynamic Growth System**: Plant grows and evolves based on your emotional state
- **Visual Mood Indicators**: Plant appearance changes with your mood (happy, sad, excited, stressed)
- **Interactive Elements**: Click on leaves, flowers, and the plant itself for encouraging responses
- **Achievement System**: Unlock milestones as you progress in your mental health journey

### 📊 Comprehensive Tracking
- **Growth Analytics**: Track your emotional progress over time
- **Achievement Garden**: Visual representation of your mental health milestones
- **Conversation Insights**: Analyze patterns in your emotional journey
- **Progress Visualization**: Beautiful charts and graphs showing your development

### 🎨 Modern User Experience
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Smooth Animations**: Engaging visual effects and transitions
- **Accessibility First**: Screen reader support, keyboard navigation, and high contrast options
- **Multi-Page Navigation**: Seamless transitions between Chat, Garden, and Insights pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/plant-companion.git
   cd plant-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required
PORT=3000
NODE_ENV=development

# AI Configuration (Recommended)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional Database (for production)
MONGODB_URI=mongodb://localhost:27017/plant-companion
REDIS_URL=redis://localhost:6379

# Security (Production)
SESSION_SECRET=your_secure_session_secret
CORS_ORIGIN=https://yourdomain.com
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## 📱 Usage Guide

### 🗣️ Chat Interface
- **Start Conversations**: Simply type your thoughts, feelings, or questions
- **Emotional Honesty**: Share both positive and challenging emotions for better growth
- **Goal Setting**: Discuss your aspirations and get personalized advice
- **Daily Check-ins**: Regular conversations help your plant grow faster

### 🌱 Plant Interactions
- **Click the Plant**: Get encouraging messages and visual effects
- **Leaf Interactions**: Click individual leaves for specific responses
- **Flower Power**: When your plant blooms, click the flower for special effects
- **Mood Observation**: Watch how your plant's appearance reflects your emotional state

### 🏆 Achievement System
- **Growth Milestones**: Unlock achievements as your plant grows (25%, 50%, 75%, 100%)
- **Conversation Goals**: Earn badges for regular engagement (10, 50, 100+ chats)
- **Special Achievements**: Discover hidden achievements through unique interactions
- **Progress Tracking**: View all achievements in the Garden page

### 📈 Insights & Analytics
- **Growth Timeline**: Visual representation of your plant's development stages
- **Mood Patterns**: Track emotional trends over time
- **Conversation Statistics**: See your engagement metrics
- **Personalized Tips**: Get advice tailored to your growth stage

## 🏗️ Architecture

### Frontend
- **Vanilla JavaScript**: Lightweight, fast, and compatible
- **Modern CSS3**: Animations, gradients, and responsive design
- **HTML5**: Semantic structure with accessibility features
- **Progressive Enhancement**: Works even with JavaScript disabled

### Backend
- **Node.js + Express**: Robust server framework
- **Google Gemini AI**: Advanced natural language processing
- **Winston Logging**: Comprehensive error tracking and monitoring
- **Rate Limiting**: Protection against abuse and spam

### Data Management
- **In-Memory Storage**: Fast session management for development
- **MongoDB Support**: Optional persistent storage for production
- **Redis Integration**: Distributed session management for scaling
- **Local Storage**: Client-side state persistence

## 🚀 Deployment

### Quick Deploy Options

#### Vercel (Recommended)
```bash
npm run deploy:vercel
```

#### Railway
```bash
npm run deploy:railway
```

#### Heroku
```bash
npm run deploy:heroku
```

### Manual Deployment

#### Docker
```bash
# Build the image
docker build -t plant-companion .

# Run the container
docker run -p 3000:3000 --env-file .env plant-companion
```

#### Docker Compose
```bash
docker-compose up -d
```

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **Database**: Configure MongoDB for persistent storage
3. **Monitoring**: Set up logging and error tracking
4. **Security**: Enable HTTPS and configure CORS properly
5. **Scaling**: Use Redis for session management in multi-instance deployments

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Manual Testing
```bash
# Test AI functionality
node test-ai-comprehensive.js

# Test chat system
node test-chat-comprehensive.js

# Test plant interactions
open test-plant-interaction.html
```

## 🔒 Security Features

- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: Prevents spam and abuse
- **CORS Protection**: Configurable cross-origin request policies
- **Helmet.js**: Security headers for production
- **Crisis Detection**: Automatic identification of harmful content
- **Data Privacy**: No persistent storage of sensitive information

## 🌍 Accessibility

- **Screen Reader Support**: Full ARIA labels and descriptions
- **Keyboard Navigation**: All features accessible via keyboard
- **High Contrast Mode**: Support for users with visual impairments
- **Reduced Motion**: Respects user preferences for animations
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: Comprehensive descriptions for visual elements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork the repository
git clone https://github.com/yourusername/plant-companion.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and test
npm test

# Commit your changes
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Create a Pull Request
```

## 📚 API Documentation

### Chat Endpoints
- `POST /api/chat/message` - Send a message to the AI
- `GET /api/chat/session/:id` - Retrieve session history
- `DELETE /api/chat/session/:id` - Clear session data

### Analytics Endpoints
- `POST /api/analytics/track` - Track user interactions
- `GET /api/analytics/dashboard` - Usage overview
- `GET /api/analytics/topics` - Topic analysis

### Resources Endpoints
- `GET /api/resources/helplines` - Crisis helplines
- `GET /api/resources/professionals` - Professional services
- `GET /api/resources/self-help` - Coping strategies

## 🐛 Troubleshooting

### Common Issues

**Plant not growing?**
- Ensure you're having regular conversations
- Check that sentiment analysis is working
- Verify your API key is configured correctly

**AI not responding?**
- Check your Gemini API key
- Verify internet connection
- Look for rate limiting messages

**Visual issues?**
- Clear browser cache
- Disable browser extensions
- Check console for JavaScript errors

**Performance problems?**
- Close other browser tabs
- Check available memory
- Restart the application

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced natural language processing
- **Mental Health Organizations** for guidance on crisis intervention
- **Open Source Community** for inspiration and support
- **Beta Testers** for valuable feedback and suggestions

## 📞 Support

- **Documentation**: [Full Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/plant-companion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/plant-companion/discussions)
- **Email**: support@plantcompanion.app

## 🗺️ Roadmap

### Version 2.0 (Coming Soon)
- [ ] Voice interaction support
- [ ] Multiple plant species
- [ ] Social features and plant sharing
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Version 2.1
- [ ] Therapist integration
- [ ] Group therapy sessions
- [ ] Advanced crisis intervention
- [ ] Multilingual support
- [ ] Offline mode

---

**Made with 💚 for mental health awareness and support**

*Remember: This application is designed to supplement, not replace, professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.*
# 🚀 Mental AI - Complete Deployment Guide

## 🎯 One-Click Deployment Options

### 1. Vercel (Recommended - Free)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mental-ai-wellness)

**Steps:**
1. Click the deploy button above
2. Connect your GitHub account
3. Add environment variable: `GEMINI_API_KEY=AIzaSyAf1-hSmVtRxIh2Ans0005hw0brhRYcNtI`
4. Deploy! ✨

**Or via CLI:**
```bash
npm install -g vercel
vercel --prod
```

### 2. Railway (Free Tier)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/mental-ai-wellness)

**Steps:**
1. Click deploy button
2. Connect GitHub
3. Set environment variables
4. Deploy automatically

### 3. Render (Free)
1. Connect GitHub repo to Render
2. Use `render.yaml` configuration (already included)
3. Set environment variables
4. Deploy

### 4. Heroku (Free Tier Available)
```bash
# Install Heroku CLI first
heroku create mental-ai-app
heroku config:set GEMINI_API_KEY=AIzaSyAf1-hSmVtRxIh2Ans0005hw0brhRYcNtI
git push heroku main
```

### 5. Google Cloud Run
```bash
gcloud run deploy mental-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=AIzaSyAf1-hSmVtRxIh2Ans0005hw0brhRYcNtI
```

## 🐳 Docker Deployment

### Local Docker
```bash
# Build and run
docker build -t mental-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY=AIzaSyAf1-hSmVtRxIh2Ans0005hw0brhRYcNtI mental-ai
```

### Docker Compose
```bash
# Already configured - just run
docker-compose up -d
```

### Docker Hub
```bash
# Build and push to Docker Hub
docker build -t yourusername/mental-ai .
docker push yourusername/mental-ai
```

## ☁️ Cloud Platform Specific

### AWS (Elastic Beanstalk)
1. Install EB CLI
2. `eb init` and `eb create`
3. Set environment variables in EB console
4. `eb deploy`

### Azure (Container Instances)
```bash
az container create \
  --resource-group myResourceGroup \
  --name mental-ai \
  --image yourusername/mental-ai \
  --environment-variables GEMINI_API_KEY=AIzaSyAf1-hSmVtRxIh2Ans0005hw0brhRYcNtI \
  --ports 3000
```

### DigitalOcean (App Platform)
1. Connect GitHub repo
2. Use `app.yaml` (create if needed)
3. Set environment variables
4. Deploy

## 🔧 Environment Variables

**Required:**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `NODE_ENV` - Set to "production" for production deployments

**Optional:**
- `PORT` - Port number (default: 3000)
- `MONGODB_URI` - MongoDB connection string for persistence
- `REDIS_URL` - Redis URL for session management

## 🏥 Health Checks

All platforms can use the built-in health check:
- **Endpoint**: `/health`
- **Method**: GET
- **Expected Response**: `{"status": "OK", "timestamp": "..."}`

## 📊 Monitoring & Analytics

### Built-in Analytics
- Visit `/api/analytics/dashboard` for usage statistics
- Real-time session tracking
- Topic and sentiment analysis

### External Monitoring
Add these environment variables for enhanced monitoring:
- `SENTRY_DSN` - Error tracking
- `GOOGLE_ANALYTICS_ID` - Web analytics

## 🔒 Security Considerations

### Production Checklist
- ✅ HTTPS enabled (automatic on most platforms)
- ✅ Rate limiting configured
- ✅ CORS properly set
- ✅ Security headers via Helmet.js
- ✅ Input validation and sanitization
- ✅ No sensitive data logging

### API Key Security
- Never commit API keys to version control
- Use environment variables on all platforms
- Rotate keys regularly
- Monitor API usage in Google Cloud Console

## 🚀 Performance Optimization

### Already Implemented
- Compression middleware
- Static file caching
- Efficient session management
- Optimized database queries

### For High Traffic
1. **Database**: Add MongoDB for persistence
2. **Caching**: Add Redis for session management
3. **CDN**: Use Cloudflare or similar
4. **Load Balancing**: Multiple instances

## 🧪 Testing Deployment

### Quick Test Scenarios
1. **Basic Chat**: "Hello, how are you?"
2. **Academic Stress**: "I'm worried about my exams"
3. **Crisis Test**: "I'm having thoughts of self-harm"
4. **Resources**: Navigate to Resources page

### API Testing
```bash
# Health check
curl https://your-app.vercel.app/health

# Chat API
curl -X POST https://your-app.vercel.app/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test123"}'
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

**1. "API Key not working"**
- Verify key is correct in environment variables
- Check Google Cloud Console for API limits
- Ensure Gemini API is enabled

**2. "App not starting"**
- Check logs: `heroku logs --tail` or platform equivalent
- Verify all environment variables are set
- Check port configuration

**3. "CORS errors"**
- Update `CLIENT_URL` environment variable
- Check CORS configuration in server.js

**4. "Database connection failed"**
- App works without database (uses in-memory storage)
- For persistence, add `MONGODB_URI` environment variable

### Getting Help
1. Check platform-specific documentation
2. Review application logs
3. Test health endpoint: `/health`
4. Verify environment variables

## 🎉 Success!

Once deployed, your Mental AI app will be:
- ✅ Accessible 24/7 worldwide
- ✅ Handling real conversations with Gemini AI
- ✅ Providing crisis intervention
- ✅ Serving mental health resources
- ✅ Ready for hackathon judging!

**Your app is now helping Indian youth with their mental wellness journey!** 🇮🇳💚

---

## 📞 Support Resources

If you need help with deployment:
1. Check the troubleshooting section above
2. Review platform documentation
3. Test locally first with `npm run setup`

**Remember**: This app provides real mental health support - handle with care and responsibility.
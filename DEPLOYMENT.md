# 🚀 Mental AI - Production Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended for MVP)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# - GEMINI_API_KEY
# - MONGODB_URI (use MongoDB Atlas)
# - NODE_ENV=production
```

### 2. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Set environment variables in Railway dashboard
```

### 3. Render
```bash
# Connect your GitHub repo to Render
# Use the render.yaml configuration
# Set environment variables in Render dashboard
```

### 4. Google Cloud Run
```bash
# Build and deploy
gcloud run deploy mental-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 5. Docker (Self-hosted)
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t saathi-ai .
docker run -p 3000:3000 saathi-ai
```

## Environment Variables Setup

### Required Variables
```bash
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/saathi-ai
NODE_ENV=production
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### Optional Variables
```bash
REDIS_URL=redis://localhost:6379
CLIENT_URL=https://your-domain.com
SENTRY_DSN=your_sentry_dsn
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Database Setup

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string
6. Set as MONGODB_URI environment variable

### Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/saathi-ai
```

## Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Set as GEMINI_API_KEY environment variable
4. Enable billing for production usage

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (Recommended)
1. Add your domain to Cloudflare
2. Enable SSL/TLS encryption
3. Set SSL mode to "Full (strict)"
4. Enable "Always Use HTTPS"

## Performance Optimization

### PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name saathi-ai

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Nginx Reverse Proxy
```bash
# Install nginx
sudo apt-get install nginx

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/saathi-ai
sudo ln -s /etc/nginx/sites-available/saathi-ai /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Redis Caching
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server

# Set REDIS_URL environment variable
REDIS_URL=redis://localhost:6379
```

## Monitoring & Logging

### Application Monitoring
```bash
# View logs
npm run logs

# PM2 monitoring
pm2 monit

# System monitoring
htop
```

### Error Tracking with Sentry
1. Create account at [Sentry.io](https://sentry.io)
2. Create new project
3. Get DSN
4. Set SENTRY_DSN environment variable

### Health Checks
```bash
# Application health
curl http://your-domain.com/health

# Database health
curl http://your-domain.com/api/analytics/dashboard
```

## Security Checklist

- ✅ HTTPS enabled
- ✅ Rate limiting configured
- ✅ Security headers set
- ✅ Input validation
- ✅ Environment variables secured
- ⚠️ Firewall configured
- ⚠️ Regular security updates
- ⚠️ Database access restricted
- ⚠️ API key rotation schedule

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, Cloudflare)
- Multiple application instances
- Shared Redis for sessions
- CDN for static assets

### Database Scaling
- MongoDB replica sets
- Read replicas for analytics
- Database indexing
- Connection pooling

### Caching Strategy
- Redis for sessions
- Application-level caching
- CDN for static content
- Browser caching headers

## Backup Strategy

### Database Backups
```bash
# MongoDB backup
mongodump --uri="$MONGODB_URI" --out=backup/$(date +%Y%m%d)

# Automated backups
# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

### Application Backups
- Code repository (Git)
- Environment configurations
- SSL certificates
- Log files

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connection
   - Check port availability

2. **Database connection failed**
   - Verify MONGODB_URI
   - Check network connectivity
   - Verify database credentials

3. **Gemini API errors**
   - Verify API key
   - Check API quotas
   - Monitor rate limits

4. **High memory usage**
   - Check for memory leaks
   - Optimize database queries
   - Implement caching

### Log Analysis
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# System logs
sudo journalctl -u saathi-ai -f
```

## Cost Optimization

### Free Tier Options
- **Vercel**: Free for personal projects
- **Railway**: $5/month for hobby plan
- **MongoDB Atlas**: 512MB free tier
- **Gemini API**: Free tier available

### Production Costs (Estimated)
- **Hosting**: $10-50/month
- **Database**: $10-30/month
- **CDN**: $5-20/month
- **Monitoring**: $0-20/month
- **Total**: $25-120/month

## Support & Maintenance

### Regular Tasks
- Monitor application health
- Update dependencies
- Rotate API keys
- Review security logs
- Backup verification
- Performance optimization

### Emergency Procedures
1. Application down: Check logs, restart service
2. Database issues: Check connection, verify backups
3. Security incident: Rotate keys, review logs
4. High traffic: Scale horizontally, enable caching

## Success Metrics

### Technical KPIs
- Uptime: >99.9%
- Response time: <2 seconds
- Error rate: <1%
- Database performance: <100ms queries

### Business KPIs
- Daily active users
- Session duration
- Crisis interventions
- User satisfaction ratings

---

## Quick Start Commands

```bash
# 1. Clone and setup
git clone <your-repo>
cd saathi-ai
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env with your values

# 3. Run production setup
npm run setup:prod

# 4. Deploy to Vercel
npm run deploy:vercel

# 5. Monitor
curl https://your-app.vercel.app/health
```

🎉 **Your Saathi AI application is now production-ready!**
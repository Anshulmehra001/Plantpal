# 🔧 Plant Companion - Troubleshooting Guide

## 🚀 Quick Start (If Nothing is Working)

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm start

# 3. Open browser to:
http://localhost:3000
```

## 🐛 Common Issues & Solutions

### 1. **Chat Not Working / No Responses**

**Symptoms:**
- Messages send but no bot responses
- "Failed to send message" errors
- Loading indicator stuck

**Solutions:**
```bash
# Check if server is running
curl http://localhost:3000/health

# Test API directly
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}'

# Check server logs
npm run logs
```

**Common Causes:**
- ❌ Server not running → Run `npm start`
- ❌ Wrong port → Check console output for correct port
- ❌ API endpoint blocked → Check CORS settings
- ❌ Invalid Gemini API key → Check `.env` file

### 2. **Plant Not Visible / CSS Issues**

**Symptoms:**
- Plant doesn't appear
- Layout broken
- Styles not loading

**Solutions:**
```bash
# Check if CSS file exists
ls -la public/styles.css

# Verify file is being served
curl http://localhost:3000/styles.css
```

**Quick Fix:**
- Clear browser cache (Ctrl+F5)
- Check browser console for CSS errors
- Verify all CSS files are in `public/` folder

### 3. **JavaScript Errors**

**Symptoms:**
- Console errors
- Buttons not working
- Plant not interactive

**Solutions:**
1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Common fixes:
   ```javascript
   // If DOM elements not found, check IDs match:
   document.getElementById('message-input')  // Must exist in HTML
   document.getElementById('send-button')    // Must exist in HTML
   document.getElementById('plant-visual')   // Must exist in HTML
   ```

### 4. **Server Won't Start**

**Symptoms:**
- "Port already in use" error
- "Module not found" errors
- Server crashes immediately

**Solutions:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Install missing dependencies
npm install

# Check Node.js version (requires Node 14+)
node --version

# Start with detailed logging
DEBUG=* npm start
```

### 5. **API Key Issues**

**Symptoms:**
- Only fallback responses
- "API request failed" errors
- No AI-generated responses

**Solutions:**
1. Check `.env` file exists and has:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
2. Verify API key is valid:
   ```bash
   # Test API key directly
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

## 🧪 Testing Steps

### 1. **Basic Functionality Test**
```bash
# 1. Start server
npm start

# 2. Open test page
http://localhost:3000/test.html

# 3. Send test message
Type: "Hello, how are you?"

# Expected: Bot responds with plant-themed message
```

### 2. **Full Application Test**
```bash
# 1. Open main application
http://localhost:3000

# 2. Test chat functionality
- Type a message and press Enter
- Click the plant
- Navigate between pages

# 3. Test plant interactions
- Watch plant grow as you chat
- Check mood changes
- Verify animations work
```

### 3. **API Endpoint Test**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"I am feeling happy today!","sessionId":"test123"}'
```

## 📋 Checklist for Working Application

### ✅ **Files Present**
- [ ] `server.js` - Main server file
- [ ] `public/index.html` - Main HTML page
- [ ] `public/script.js` - JavaScript functionality
- [ ] `public/styles.css` - Styling
- [ ] `routes/chat.js` - Chat API endpoint
- [ ] `.env` - Environment configuration
- [ ] `package.json` - Dependencies

### ✅ **Dependencies Installed**
```bash
npm list express @google/generative-ai cors helmet
```

### ✅ **Environment Configured**
- [ ] `.env` file exists
- [ ] `GEMINI_API_KEY` is set (optional, has fallbacks)
- [ ] `PORT` is set (defaults to 3000)

### ✅ **Server Running**
- [ ] No error messages on startup
- [ ] Health check responds: `http://localhost:3000/health`
- [ ] Static files served: `http://localhost:3000/styles.css`

### ✅ **Frontend Working**
- [ ] Page loads without errors
- [ ] Chat input accepts text
- [ ] Send button is clickable
- [ ] Plant is visible
- [ ] Navigation works

## 🔍 Debug Mode

Enable detailed logging:
```bash
# Set debug environment
DEBUG=* npm start

# Or check specific components
DEBUG=express:* npm start
DEBUG=chat:* npm start
```

## 🆘 Still Not Working?

### Quick Reset:
```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Reset environment
cp .env.example .env
# Edit .env with your API key

# 3. Start fresh
npm start
```

### Manual Verification:
1. **Check server logs** - Look for startup messages
2. **Test API directly** - Use curl or Postman
3. **Verify file permissions** - Ensure files are readable
4. **Check firewall** - Port 3000 should be accessible
5. **Browser cache** - Clear cache and cookies

### Get Help:
- Check browser console (F12) for JavaScript errors
- Check server terminal for error messages
- Verify all file paths are correct
- Test with the simple `test.html` page first

## 🎯 Expected Behavior

When everything is working correctly:

1. **Server starts** with success messages
2. **Browser loads** the Plant Companion interface
3. **Chat works** - messages send and receive responses
4. **Plant responds** - visual changes based on conversation
5. **Navigation works** - can switch between pages
6. **Interactions work** - clicking plant gives responses

If any of these don't work, follow the troubleshooting steps above! 🌱✨
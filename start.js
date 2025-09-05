#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌱 Starting Plant Companion...\n');

// Check if required files exist
const requiredFiles = [
    'server.js',
    'public/index.html',
    'public/script.js',
    'public/styles.css',
    'routes/chat.js',
    '.env'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING!`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please check the project structure.');
    process.exit(1);
}

// Check environment variables
console.log('\n🔧 Checking environment configuration...');
require('dotenv').config();

const requiredEnvVars = ['GEMINI_API_KEY'];
let envConfigured = true;

requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
        console.log(`✅ ${envVar} is configured`);
    } else {
        console.log(`⚠️  ${envVar} is not configured (will use fallback responses)`);
    }
});

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
    require('express');
    console.log('✅ Express.js');
    
    require('@google/generative-ai');
    console.log('✅ Google Generative AI');
    
    require('cors');
    console.log('✅ CORS');
    
    require('helmet');
    console.log('✅ Helmet');
    
    console.log('✅ All dependencies are installed');
} catch (error) {
    console.log('❌ Missing dependencies. Run: npm install');
    process.exit(1);
}

// Start the server
console.log('\n🚀 Starting server...');
require('./server.js');

console.log(`
🌱 Plant Companion is ready!

📱 Open your browser and go to:
   http://localhost:${process.env.PORT || 3000}

🧪 Test the API directly:
   http://localhost:${process.env.PORT || 3000}/test.html

💬 Try these test messages:
   - "Hello, I'm feeling stressed about my career"
   - "I'm excited about my new goals!"
   - "I need help with motivation"

🌟 Features available:
   ✅ Interactive chat with AI responses
   ✅ Plant visual that grows with emotions
   ✅ Click plant for encouragement
   ✅ Multiple pages (My Plant, Garden, Growth, About)
   ✅ Crisis detection and resources
   ✅ Responsive design

🔧 If something isn't working:
   1. Check the browser console for errors
   2. Verify the server is running on the correct port
   3. Make sure your Gemini API key is valid
   4. Try the test page: /test.html

Happy chatting with your Plant Companion! 🌸
`);
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Mental AI...\n');

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 2: Setup environment file
console.log('⚙️  Setting up environment...');
try {
  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Environment file created');
  } else {
    console.log('✅ Environment file already exists');
  }
} catch (error) {
  console.error('❌ Failed to setup environment file');
  process.exit(1);
}

// Step 3: Check if API key is configured
const envContent = fs.readFileSync('.env', 'utf8');
if (envContent.includes('your_gemini_api_key_here')) {
  console.log('⚠️  Please add your Gemini API key to .env file');
  console.log('   Current key: AIzaSyAf1-hSmVtRxIh2Ans0005hw0brhRYcNtI');
} else {
  console.log('✅ API key configured');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('   1. Run: npm start');
console.log('   2. Open: http://localhost:3000');
console.log('   3. Start chatting with Mental AI!');

// Step 4: Ask if user wants to start the server
console.log('\n🚀 Starting development server...');
try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.log('\n💡 To start manually, run: npm start');
}
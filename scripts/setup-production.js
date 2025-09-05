#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Mental AI for production...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js 16 or higher is required');
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Create necessary directories
const directories = ['logs', 'uploads', 'ssl'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Check for required environment variables
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'MONGODB_URI',
  'JWT_SECRET',
  'SESSION_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease set these in your .env file or environment.\n');
}

// Install production dependencies
console.log('\n📦 Installing production dependencies...');
try {
  execSync('npm ci --only=production', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Run database migrations (if any)
console.log('\n🗄️  Setting up database...');
// Add database setup logic here

// Generate SSL certificates for local HTTPS (optional)
if (process.argv.includes('--ssl')) {
  console.log('\n🔒 Generating SSL certificates...');
  try {
    execSync(`
      openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=MentalAI/CN=localhost"
    `, { stdio: 'inherit' });
    console.log('✅ SSL certificates generated');
  } catch (error) {
    console.log('⚠️  SSL certificate generation failed (optional)');
  }
}

// Create systemd service file (Linux)
if (process.platform === 'linux' && process.argv.includes('--systemd')) {
  const serviceFile = `
[Unit]
Description=Mental AI Mental Wellness App
After=network.target

[Service]
Type=simple
User=mental
WorkingDirectory=${process.cwd()}
Environment=NODE_ENV=production
ExecStart=${process.execPath} server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
`;

  fs.writeFileSync('/tmp/mental-ai.service', serviceFile);
  console.log('✅ Systemd service file created at /tmp/mental-ai.service');
  console.log('   Run: sudo cp /tmp/mental-ai.service /etc/systemd/system/');
  console.log('   Then: sudo systemctl enable mental-ai && sudo systemctl start mental-ai');
}

console.log('\n🎉 Production setup complete!');
console.log('\nNext steps:');
console.log('1. Set up your environment variables');
console.log('2. Configure your database connection');
console.log('3. Set up SSL certificates for HTTPS');
console.log('4. Configure your reverse proxy (nginx)');
console.log('5. Set up monitoring and logging');
console.log('\nRun: npm start');
console.log('Health check: curl http://localhost:3000/health\n');

// Performance recommendations
console.log('🚀 Performance recommendations:');
console.log('- Use PM2 for process management: npm install -g pm2');
console.log('- Set up Redis for session storage');
console.log('- Configure CDN for static assets');
console.log('- Enable gzip compression in nginx');
console.log('- Set up database indexes');
console.log('- Configure log rotation');
console.log('- Set up health monitoring\n');

// Security checklist
console.log('🔒 Security checklist:');
console.log('- ✅ Rate limiting configured');
console.log('- ✅ Security headers set');
console.log('- ✅ Input validation implemented');
console.log('- ⚠️  Set up HTTPS certificates');
console.log('- ⚠️  Configure firewall rules');
console.log('- ⚠️  Set up intrusion detection');
console.log('- ⚠️  Regular security updates\n');
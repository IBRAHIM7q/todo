const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're running on Netlify
const isNetlify = process.env.NETLIFY === 'true';

if (isNetlify) {
  console.log('Setting up database for Netlify deployment...');
  
  // Ensure the database file exists
  const dbPath = path.join(__dirname, '..', 'custom.db');
  if (!fs.existsSync(dbPath)) {
    console.log('Creating database file...');
    fs.closeSync(fs.openSync(dbPath, 'w'));
  }
  
  // Run Prisma migrations
  try {
    // Use the correct path for Netlify
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error.message);
    // Try to continue anyway as the database might already be set up
    console.log('Continuing with deployment...');
  }
} else {
  console.log('Not running on Netlify, skipping database setup');
}
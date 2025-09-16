const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're running on Netlify
const isNetlify = process.env.NETLIFY === 'true';

if (isNetlify) {
  console.log('Setting up database for Netlify deployment...');
  
  try {
    // Ensure the database file exists
    const dbPath = path.join(process.cwd(), 'custom.db');
    console.log('Database path:', dbPath);
    
    if (!fs.existsSync(dbPath)) {
      console.log('Creating database file...');
      fs.closeSync(fs.openSync(dbPath, 'w'));
    } else {
      console.log('Database file already exists');
    }
    
    // Run Prisma migrations
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error.message);
    console.error('Stack trace:', error.stack);
    // Try to continue anyway as the database might already be set up
    console.log('Continuing with deployment...');
  }
} else {
  console.log('Not running on Netlify, skipping database setup');
}
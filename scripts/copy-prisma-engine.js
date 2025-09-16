const fs = require('fs');
const path = require('path');

// Try to copy the Prisma engine file manually
const sourceDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
const targetFile = path.join(sourceDir, 'query_engine-windows.dll.node');

// Check if the source directory exists
if (fs.existsSync(sourceDir)) {
  console.log('Prisma client directory exists');
  
  // List files in the directory
  const files = fs.readdirSync(sourceDir);
  console.log('Files in Prisma client directory:', files);
  
  // Look for a .tmp file that we can rename
  const tmpFiles = files.filter(file => file.includes('.tmp'));
  if (tmpFiles.length > 0) {
    const tmpFile = tmpFiles[0];
    const tmpFilePath = path.join(sourceDir, tmpFile);
    console.log(`Found tmp file: ${tmpFile}`);
    
    try {
      // Try to rename the tmp file
      fs.renameSync(tmpFilePath, targetFile);
      console.log('Successfully renamed tmp file to engine file');
    } catch (error) {
      console.error('Error renaming tmp file:', error.message);
    }
  } else {
    console.log('No tmp files found');
  }
} else {
  console.log('Prisma client directory does not exist');
}
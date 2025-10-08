const fs = require('fs');
const path = require('path');

console.log('Cleaning up duplicate route files...');

const filesToRemove = [
  'src/app/api/support/tickets/[ticketNumber]/route.ts',
  'src/app/api/support/tickets/[ticketNumber]/messages/route.ts'
];

filesToRemove.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${filePath}`);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
  }
});

// Also remove the empty directory
const dirToRemove = path.join(__dirname, 'src/app/api/support/tickets/[ticketNumber]');
try {
  if (fs.existsSync(dirToRemove)) {
    fs.rmdirSync(dirToRemove);
    console.log(`✅ Removed directory: src/app/api/support/tickets/[ticketNumber]`);
  }
} catch (error) {
  console.error(`❌ Error removing directory:`, error.message);
}

console.log('Cleanup completed!');
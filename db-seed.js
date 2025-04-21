const fs = require('fs');
const path = require('path');

// Read current db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Add sample users if none exist
if (db.users.length === 0) {
  console.log('Adding sample users to db.json...');
  
  // Sample users
  const users = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // In a real app, this would be hashed
      roles: ['admin', 'user'],
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: '2',
      username: 'moderator',
      email: 'moderator@example.com',
      password: 'mod123', // In a real app, this would be hashed
      roles: ['moderator', 'user'],
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: '3',
      username: 'user',
      email: 'user@example.com',
      password: 'user123', // In a real app, this would be hashed
      roles: ['user'],
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];
  
  // Add users to the db
  db.users = users;
  
  // Write the updated db back to disk
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('Sample users added successfully!');
} else {
  console.log('Users already exist in db.json. No changes made.');
}

// Log sample credentials
console.log('\nSample Login Credentials:');
console.log('-------------------------');
console.log('Admin User:');
console.log('  Username: admin');
console.log('  Password: admin123');
console.log('\nModerator User:');
console.log('  Username: moderator');
console.log('  Password: mod123');
console.log('\nRegular User:');
console.log('  Username: user');
console.log('  Password: user123');
console.log('-------------------------');
console.log('\nYou can now run the auth server with: npm run auth-server'); 
const jsonServer = require('./node_modules/json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Set default middlewares (logger, static, cors, etc)
server.use(middlewares);
server.use(bodyParser.json());

// JWT secret key
const SECRET_KEY = 'your-secret-key';

// Token expiration time
const expiresIn = '24h';

// Create a token from a payload 
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify the token 
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => (decode !== undefined ? decode : err));
}

// Check if the user exists in database
function isAuthenticated({ email, username, password }) {
  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, './db.json'), 'utf8'));
  return dbData.users.some(user => {
    return (
      (user.email === email || user.username === username) && 
      user.password === password
    );
  });
}

// Check if username or email already exists
function isUserExist({ email, username }) {
  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, './db.json'), 'utf8'));
  return dbData.users.some(user => {
    return user.email === email || user.username === username;
  });
}

// Registration endpoint
server.post('/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isUserExist({ email, username })) {
    return res.status(400).json({ message: 'Username or email already exists' });
  }

  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, './db.json'), 'utf8'));
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password, // In a real app, we would hash this
    roles: ['user'],
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  // Add new user to db.json
  dbData.users.push(newUser);
  fs.writeFileSync(path.join(__dirname, './db.json'), JSON.stringify(dbData, null, 2));
  
  // Don't send password back to client
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    message: 'Registration successful',
    user: userWithoutPassword
  });
});

// Login endpoint
server.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  if (!isAuthenticated({ username, password })) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  
  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, './db.json'), 'utf8'));
  const user = dbData.users.find(u => u.username === username);
  
  // Create token
  const token = createToken({ username, userId: user.id });
  
  // Don't send password back to client
  const { password: _, ...userWithoutPassword } = user;
  
  res.status(200).json({ token, user: userWithoutPassword });
});

// Protect other endpoints
server.use(/^(?!\/auth).*$/, (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }
  
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Use default router
server.use(router);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
}); 
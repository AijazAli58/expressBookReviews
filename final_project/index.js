const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Import routes
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Session middleware configuration
app.use("/customer", session({
    secret: "fingerprint_customer", // Use a secure, environment-variable-based secret in production
    resave: true,
    saveUninitialized: true
}));

// JWT authentication middleware
app.use("/customer/auth/*", (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        console.log('Access attempt without token');
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY', (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.id;
        console.log('Token verified for user ID:', req.userId);
        next();
    });
});

// Use routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Set up the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

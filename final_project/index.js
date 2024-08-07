const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Initialize users array
const users = [];

// Import routers and pass users array
const customerRoutes = require('./router/auth_users.js')(users).authenticated;
const generalRoutes = require('./router/general.js')(users).general;

const app = express();

// Global middleware for parsing JSON bodies
app.use(express.json());

// Session middleware configuration for customer routes
app.use("/customer", session({
    secret: process.env.SESSION_SECRET || "fingerprint_customer", // Use a secure, environment-variable-based secret in production
    resave: false,
    saveUninitialized: false,
}));

// JWT authentication middleware for routes under "/customer/*"
app.use("/customer/*", (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Properly extract the token
    if (!token) {
        console.log('Access attempt without token');
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here', (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.userId; // Ensure 'userId' is correctly extracted
        console.log('Token verified for user ID:', req.userId);
        next();
    });
});

// Use routes
app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Set up the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

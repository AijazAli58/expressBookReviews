const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Assuming you have a secure way to store users and their passwords. For demonstration, using an array.
let users = []; 

// Environment variable or your secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key_here';

// Middleware to authenticate users
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication token is required" });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
};

// User registration
router.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    const user = { username, password };
    users.push(user);
    res.status(201).json({ message: 'User registered successfully' });
});

// User login
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username: user.username, userId: users.indexOf(user) }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: "Logged in successfully", token });
});

// Add or update a book review (authenticated route)
router.put("/review/:isbn", authenticate, (req, res) => {
    const { review } = req.body;
    const { isbn } = req.params;
    if (!review) {
        return res.status(400).json({ message: 'Review text is required' });
    }
    // Assuming `books` is accessible here, either via global scope or require/import
    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[req.user.username] = review;
    res.status(200).json({ message: 'Review added/updated successfully', review: books[isbn].reviews });
});

module.exports = { authenticated: router };

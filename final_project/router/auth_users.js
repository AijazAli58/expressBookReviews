const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const books = require("./booksdb.js"); // Assuming booksdb.js is correctly imported

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key_here';

module.exports = (users) => {
    const router = express.Router();

    // Middleware to authenticate users
    const authenticate = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Received Token:', token); // Log the received token
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required" });
        }
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log('Token verification error:', err.message); // Log the verification error
                return res.status(403).json({ message: "Invalid token" });
            }
            req.user = decoded;
            next();
        });
    };

    // User login
    router.post("/login", async (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ username: user.username, userId: users.indexOf(user) }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Logged in successfully", token });
    });

    // Add or update a book review
    router.put("/review/:isbn", authenticate, (req, res) => {
        const { review } = req.body;
        const { isbn } = req.params;
        if (!review) {
            return res.status(400).json({ message: 'Review text is required' });
        }
        if (!books[isbn]) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[req.user.username] = review;
        res.status(200).json({ message: 'Review added/updated successfully', review: books[isbn].reviews });
    });

    // Delete a book review
    router.delete("/review/:isbn", authenticate, (req, res) => {
        const { isbn } = req.params;
        if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[req.user.username]) {
            return res.status(404).json({ message: 'Review not found or no reviews by user for this book' });
        }
        delete books[isbn].reviews[req.user.username];
        res.json({ message: 'Review deleted successfully' });
    });

    return { authenticated: router };
};

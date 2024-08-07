const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const books = require("./booksdb.js"); // assuming this is correctly imported

module.exports = (users) => {
    const public_users = express.Router();
    public_users.use(bodyParser.json()); // for parsing application/json

    // User registration
    public_users.post("/register", async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        if (users.some(user => user.username === username)) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, password: hashedPassword };
        users.push(user);
        res.status(201).json({ message: 'User registered successfully' });
    });

    // Get all books
    public_users.get('/', (req, res) => {
        res.json({ books });
    });

    // Get book by ISBN
    public_users.get('/isbn/:isbn', (req, res) => {
        const { isbn } = req.params;
        const book = Object.values(books).find(book => book.isbn === isbn);
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    });

    // Get books by author
    public_users.get('/author/:author', (req, res) => {
        const author = req.params.author;
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        if (filteredBooks.length > 0) {
            res.json(filteredBooks);
        } else {
            res.status(404).json({ message: 'No books found by this author' });
        }
    });

    // Get books by title
    public_users.get('/title/:title', (req, res) => {
        const title = req.params.title;
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        if (filteredBooks.length > 0) {
            res.json(filteredBooks);
        } else {
            res.status(404).json({ message: 'No books found with this title' });
        }
    });

    // Get book reviews by ISBN
    public_users.get('/review/:isbn', (req, res) => {
        const { isbn } = req.params;
        const book = books[isbn];
        if (book && book.reviews && Object.keys(book.reviews).length > 0) {
            res.json(book.reviews);
        } else {
            res.status(404).json({ message: 'No reviews found for this book' });
        }
    });

    return { general: public_users };
};

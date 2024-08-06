const express = require('express');
const bodyParser = require('body-parser');
const books = require("./booksdb.js");  // assuming this is correctly imported

const public_users = express.Router();
public_users.use(bodyParser.json()); // for parsing application/json

// Start with one route
public_users.get('/', function (req, res) {
    res.json({ books });
});

// Then add the next
public_users.get('/isbn/:isbn', function (req, res) {
    const { isbn } = req.params;
    // Find the book by iterating over the values and matching the ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});


public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    if (filteredBooks.length > 0) {
        res.json(filteredBooks);
    } else {
        res.status(404).json({ message: 'No books found by this author' });
    }
});

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const filteredBooks = Object.values(books).filter(book => book.title === title);
    if (filteredBooks.length > 0) {
        res.json(filteredBooks);
    } else {
        res.status(404).json({ message: 'No books found with this title' });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews && Object.keys(book.reviews).length > 0) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: 'No reviews found for this book' });
    }
});

// Continue adding routes one at a time
// ...

module.exports = { general: public_users };

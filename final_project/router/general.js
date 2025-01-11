const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if the username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username is already taken
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await new Promise((resolve, reject) => {
      if (books) resolve(books);
      else reject("No books available");
    });

    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const { isbn } = req.params;

    const book = await new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) resolve(book);
      else reject("Book not found");
    });

    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const { author } = req.params;

    const booksByAuthor = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(book => book.author === author);
      if (result.length > 0) resolve(result);
      else reject("No books found by this author");
    });

    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const { title } = req.params;

    const booksByTitle = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(book => book.title === title);
      if (result.length > 0) resolve(result);
      else reject("No books found with this title");
    });

    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const { isbn } = req.params;

  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;

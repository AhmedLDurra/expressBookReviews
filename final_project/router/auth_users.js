const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user is authenticated
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
  req.session.token = token; // Store the token in the session

  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user?.username; // Retrieve the username from the token (added via middleware)

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review is provided
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Add or update the review for the book
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user?.username; // Retrieve the username from the token (added via middleware)

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if reviews exist for the book
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for the user" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

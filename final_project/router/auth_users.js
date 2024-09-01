const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    return username && !users.find(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
    const user = users.find(user => user.username === username);
    return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"}); 
  }

  if (!authenticatedUser( username, password)) {
    return res.status(401).json({message: "Invalid username or password"});  
  }

  const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: '1h'});
  
  return res.status(200).json({message: "Login successful", token: accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found" })
  }

  if (!review) {
    return res.status(400).json({message: "Review content is required" })
  }

  if(!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({message: "Review added/updated successfully", reviews: books[isbn].reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

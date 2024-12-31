const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS to allow frontend requests from different origins
app.use(cors());

// Serve static files (like CSS, JS, images) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',            // MySQL host (localhost in this case)
  user: 'admin',                // MySQL username
  password: 'Recipeproject1!',  // MySQL password
  database: 'meal_db'           // Database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Serve the home.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));  // Serve home.html from the public folder
});

// Serve the recipes.html page
app.get('/recipes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recipes.html'));  // Serve recipes.html from the public folder
});

// API route to get meals data with filtering and search
app.get('/api/meals', (req, res) => {
  let { category, area, search } = req.query;  // Capture filter parameters from query string

  // Base SQL query for meals
  let sqlQuery = 'SELECT * FROM meals';

  // Build dynamic query with filters and search
  let filters = [];
  let params = [];

  if (category) {
    filters.push('strCategory = ?');
    params.push(category);
  }
  if (area) {
    filters.push('strArea = ?');
    params.push(area);
  }
  if (search) {
    filters.push('(strMeal LIKE ? OR strCategory LIKE ? OR strArea LIKE ?)');
    const searchValue = '%' + search + '%';
    params.push(searchValue, searchValue, searchValue);
  }

  if (filters.length > 0) {
    sqlQuery += ' WHERE ' + filters.join(' AND ');
  }

  // Fetch meals based on the filters and search query
  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      res.status(500).send('Error fetching meal data');
      return;
    }
    res.json(results); // Send filtered recipes as JSON
  });
});

// API route to get categories for filtering
app.get('/api/categories', (req, res) => {
  db.query('SELECT DISTINCT strCategory FROM meals', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching categories');
      return;
    }
    res.json(results); // Send the distinct categories as JSON
  });
});

// API route to get areas for filtering
app.get('/api/areas', (req, res) => {
  db.query('SELECT DISTINCT strArea FROM meals', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching areas');
      return;
    }
    res.json(results); // Send the distinct areas as JSON
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});









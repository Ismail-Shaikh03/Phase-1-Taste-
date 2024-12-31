const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS to allow frontend requests from different origins
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',              // MySQL username
  password: 'Recipeproject1!', // MySQL password
  database: 'meal_db'         // Database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// API route to get meals data with filtering and search
app.get('/api/meals', (req, res) => {
  let { category, area, search } = req.query;

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

  // No pagination: fetch all meals
  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      res.status(500).send('Error fetching meal data');
      return;
    }
    res.json(results); // Send all meal data as JSON
  });
});

// API route to get all categories
app.get('/api/categories', (req, res) => {
  db.query('SELECT DISTINCT strCategory FROM meals', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching categories');
      return;
    }
    res.json(results); // Send the distinct categories as JSON
  });
});

// API route to get all areas
app.get('/api/areas', (req, res) => {
  db.query('SELECT DISTINCT strArea FROM meals', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching areas');
      return;
    }
    res.json(results); // Send the distinct areas as JSON
  });
});

// Handle the root ("/") route to serve "home.html"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html')); // Serve home.html from the public folder
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});








const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;  // Using port 3000 for local testing

// Enable CORS to allow frontend requests from different origins
app.use(cors());

// Serve static files (like CSS, JS, images) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',            // MySQL host (localhost in this case)
  user: 'admin',                // MySQL username
  password: 'Recipeproject1!',  // MySQL password
  database: 'meal_db',
  waitForConnections: true,
  connectionLimit: 10,          // Limit the number of connections
  queueLimit: 0                 // Queue limit for waiting connections
}).promise(); // Use promise-based queries for cleaner code

// Serve the home.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'), (err) => {
    if (err) {
      console.error('Error serving home.html:', err);
      res.status(500).json({ error: 'Error loading homepage' });
    }
  });
});

// Serve the recipes.html page
app.get('/recipes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recipes.html'), (err) => {
    if (err) {
      console.error('Error serving recipes.html:', err);
      res.status(500).json({ error: 'Error loading recipes page' });
    }
  });
});

// API route to get meals data with filtering and search
app.get('/api/meals', async (req, res) => {
  let { category, area, search } = req.query;  // Capture filter parameters from query string

  // Base SQL query for meals
  let sqlQuery = 'SELECT * FROM meals';
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
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue);
  }

  if (filters.length > 0) {
    sqlQuery += ' WHERE ' + filters.join(' AND ');
  }

  try {
    const [results] = await pool.query(sqlQuery, params);
    res.json(results); // Send filtered recipes as JSON
  } catch (err) {
    console.error('Error fetching meal data:', err);
    res.status(500).json({ error: 'Error fetching meal data', details: err.message });
  }
});

// API route to get categories for filtering
app.get('/api/categories', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT DISTINCT strCategory FROM meals');
    res.json(results); // Send the distinct categories as JSON
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Error fetching categories', details: err.message });
  }
});

// API route to get areas for filtering
app.get('/api/areas', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT DISTINCT strArea FROM meals');
    res.json(results); // Send the distinct areas as JSON
  } catch (err) {
    console.error('Error fetching areas:', err);
    res.status(500).json({ error: 'Error fetching areas', details: err.message });
  }
});

// Handle undefined routes (404 error)
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

// Start the server on port 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

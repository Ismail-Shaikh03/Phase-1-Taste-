import requests
import mysql.connector
import os

# Function to create a connection to the MySQL database
def create_connection():
    """ Create a database connection to the MySQL database. """
    conn = None
    try:
        conn = mysql.connector.connect(
            host="localhost",           # Use localhost for local MySQL connection
            user="admin",               # MySQL username (admin)
            password="Recipeproject1!", # MySQL password
            database="meal_db"          # The name of the database you created (meal_db)
        )
    except mysql.connector.Error as e:
        print(f"Error: {e}")
    return conn

# Function to create the meals table if it doesn't exist
def create_table(conn):
    """ Create the meals table in the database if it doesn't exist. """
    try:
        sql_create_meals_table = """ CREATE TABLE IF NOT EXISTS meals (
                                        idMeal VARCHAR(255) PRIMARY KEY,
                                        strMeal TEXT NOT NULL,
                                        strCategory TEXT,
                                        strArea TEXT,
                                        strInstructions TEXT,
                                        strMealThumb TEXT,
                                        strTags TEXT,
                                        strYoutube TEXT
                                    ); """
        cursor = conn.cursor()
        cursor.execute(sql_create_meals_table)
        print("Meals table created or already exists.")
    except mysql.connector.Error as e:
        print(f"Error: {e}")

# Function to insert meal data into the database
def insert_meal(conn, meal):
    """ Insert a meal into the meals table. """
    sql = ''' INSERT INTO meals(idMeal, strMeal, strCategory, strArea, strInstructions, strMealThumb, strTags, strYoutube)
              VALUES(%s, %s, %s, %s, %s, %s, %s, %s) '''
    cursor = conn.cursor()
    cursor.execute(sql, (meal['idMeal'], meal['strMeal'], meal['strCategory'], 
                         meal['strArea'], meal['strInstructions'], 
                         meal['strMealThumb'], meal['strTags'], meal['strYoutube']))
    conn.commit()
    print(f"Inserted meal: {meal['strMeal']}")  # Prints each inserted meal
    return cursor.lastrowid

def get_all_meals():
    base_url = "https://www.themealdb.com/api/json/v1/1/search.php?f="
    all_meals = []

    # Iterate over each letter in the alphabet to get all meals
    for letter in range(ord('a'), ord('z') + 1):
        api_url = base_url + chr(letter)
        response = requests.get(api_url)
        data = response.json()
        
        if data.get("meals"):  # Check if there are meals for this letter
            all_meals.extend(data["meals"])

    return all_meals

# Replace with your local MySQL database connection details
db_host = "localhost"
db_user = "admin"          # Your MySQL username
db_password = "Recipeproject1!"  # Your MySQL password
db_name = "meal_db"        # The name of the database you're using

# Create a database connection
conn = create_connection()

if conn is not None:
    # Create the meals table if it doesn't exist
    create_table(conn)

    # Fetch all meals and store them in the MySQL database
    all_meals_data = get_all_meals()
    for meal in all_meals_data:
        insert_meal(conn, meal)

    # Print the total number of meals and the first meal as an example
    print(f"Total meals fetched: {len(all_meals_data)}")
    if all_meals_data:
        print(all_meals_data[0])

    # Close the database connection
    conn.close()


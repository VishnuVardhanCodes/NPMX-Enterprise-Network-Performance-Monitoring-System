import pymysql
from config import *

def setup_db():
    try:
        # Connect to MySQL without database first
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        
        with connection.cursor() as cursor:
            # Task 7: Ensure database exists
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE}")
            cursor.execute(f"USE {MYSQL_DATABASE}")
            
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE,
                    password_hash VARCHAR(255),
                    role VARCHAR(20)
                )
            """)
            
            # Task 8: Insert admin user
            # Password: admin123 -> $2b$12$7F7TqP1nRHT7rW0PyzR6QO4Z1C1T3WlP2tL8yF0kT0z7VY8z6WmZG
            admin_user = 'admin'
            admin_pass_hash = '$2b$12$7F7TqP1nRHT7rW0PyzR6QO4Z1C1T3WlP2tL8yF0kT0z7VY8z6WmZG'
            admin_role = 'admin'
            
            cursor.execute("SELECT * FROM users WHERE username = %s", (admin_user,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
                    (admin_user, admin_pass_hash, admin_role)
                )
                print("Admin user inserted.")
            else:
                print("Admin user already exists.")
                
        connection.commit()
        print("Database setup complete.")
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_db()

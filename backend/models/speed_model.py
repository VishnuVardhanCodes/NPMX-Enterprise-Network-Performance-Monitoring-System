from database import get_connection
import logging

def create_speed_table():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS speed_tests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ping FLOAT,
                download FLOAT,
                upload FLOAT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cursor.close()
    except Exception as e:
        logging.error(f"Error creating speed_tests table: {e}")
    finally:
        conn.close()

def insert_speed_test(ping, download, upload):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO speed_tests
            (ping, download, upload)
            VALUES (%s, %s, %s)
        """, (ping, download, upload))
        conn.commit()
        cursor.close()
    finally:
        conn.close()

def get_speed_history():
    conn = get_connection()
    try:
        # Use DictCursor for dictionary return as requested (dictionary=True in mysql-connector, but we use pymysql with DictCursor)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT *
            FROM speed_tests
            ORDER BY timestamp DESC
            LIMIT 10
        """)
        data = cursor.fetchall()
        cursor.close()
        return data
    finally:
        conn.close()

# Ensure table exists
create_speed_table()

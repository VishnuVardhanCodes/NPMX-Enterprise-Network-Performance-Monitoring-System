from database import get_connection
import logging

def create_speed_test_table():
    """
    Creates the speed_tests table if it doesn't exist.
    """
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = """
                CREATE TABLE IF NOT EXISTS speed_tests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ping FLOAT,
                    download FLOAT,
                    upload FLOAT
                )
            """
            cursor.execute(query)
        connection.commit()
    except Exception as e:
        logging.error(f"Error creating speed_tests table: {str(e)}")
    finally:
        connection.close()

def save_speed_test_result(ping, download, upload):
    """
    Saves a speed test result to the database.
    """
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = """
                INSERT INTO speed_tests (ping, download, upload)
                VALUES (%s, %s, %s)
            """
            cursor.execute(query, (ping, download, upload))
        connection.commit()
        return True
    except Exception as e:
        logging.error(f"Error saving speed test result: {str(e)}")
        return False
    finally:
        connection.close()

def get_speed_test_history(limit=20):
    """
    Retrieves the history of speed test results.
    """
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = "SELECT * FROM speed_tests ORDER BY timestamp DESC LIMIT %s"
            cursor.execute(query, (limit,))
            return cursor.fetchall()
    finally:
        connection.close()

# Ensure table exists on import/initialization
create_speed_test_table()

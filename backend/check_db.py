import pymysql
from config import *

def check_db():
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        with connection.cursor() as cursor:
            cursor.execute(f"SHOW DATABASES LIKE '{MYSQL_DATABASE}'")
            result = cursor.fetchone()
            if result:
                print(f"Database {MYSQL_DATABASE} exists.")
                connection.select_db(MYSQL_DATABASE)
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                print("Tables:", tables)
            else:
                print(f"Database {MYSQL_DATABASE} does NOT exist.")
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()

import pymysql
from config import *

def check_data():
    conn = pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 5")
            print("Latest metrics:")
            for row in cursor.fetchall():
                print(row)
            
            cursor.execute("SELECT DATE_FORMAT(timestamp, '%H:%i') as time, AVG(latency) as val FROM metrics GROUP BY time ORDER BY time DESC LIMIT 5")
            print("\nGrouped metrics:")
            for row in cursor.fetchall():
                print(row)
    finally:
        conn.close()

if __name__ == "__main__":
    check_data()

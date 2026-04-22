import pymysql
from config import *

def check_metrics_columns():
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE metrics")
            columns = cursor.fetchall()
            print("Metrics table columns:")
            for col in columns:
                print(col)
            
            cursor.execute("DESCRIBE alerts")
            columns = cursor.fetchall()
            print("\nAlerts table columns:")
            for col in columns:
                print(col)
                
            cursor.execute("DESCRIBE snmp_metrics")
            columns = cursor.fetchall()
            print("\nSNMP Metrics table columns:")
            for col in columns:
                print(col)
                
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_metrics_columns()

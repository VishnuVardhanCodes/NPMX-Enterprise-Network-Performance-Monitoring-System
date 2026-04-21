from database import get_connection

def insert_log(username, action):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO system_logs (username, action) VALUES (%s, %s)"
            cursor.execute(sql, (username, action))
        connection.commit()
        return True
    except: return False
    finally: connection.close()

def get_logs():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 200"
            cursor.execute(sql)
            return cursor.fetchall()
    except: return []
    finally: connection.close()

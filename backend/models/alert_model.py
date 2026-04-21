from database import get_connection

def insert_alert(device_id, metric_type, metric_value, threshold_value, severity, alert_message):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO alerts (device_id, metric_type, metric_value, threshold_value, severity, alert_message)
                     VALUES (%s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (device_id, metric_type, metric_value, threshold_value, severity, alert_message))
        connection.commit()
        return True
    except Exception as e:
        print(f"Error inserting alert: {str(e)}")
        return False
    finally:
        connection.close()

def get_alerts():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT a.*, d.device_name, d.ip_address 
                FROM alerts a
                LEFT JOIN devices d ON a.device_id = d.id
                ORDER BY a.timestamp DESC
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()

def get_recent_alerts(limit=5):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT a.*, d.device_name, d.ip_address 
                FROM alerts a
                LEFT JOIN devices d ON a.device_id = d.id
                ORDER BY a.timestamp DESC LIMIT %s
            """
            cursor.execute(sql, (limit,))
            return cursor.fetchall()
    finally:
        connection.close()

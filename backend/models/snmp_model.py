from database import get_connection

def insert_snmp_metrics(device_id, in_octets, out_octets, bandwidth):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO snmp_metrics (device_id, in_octets, out_octets, bandwidth) 
                     VALUES (%s, %s, %s, %s)"""
            cursor.execute(sql, (device_id, in_octets, out_octets, bandwidth))
        connection.commit()
        return True
    except Exception as e:
        print(f"DB Error inserting SNMP metric: {str(e)}")
        return False
    finally:
        connection.close()

def get_snmp_metrics(device_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # Fetch 20 most recent entries
            sql = "SELECT * FROM snmp_metrics WHERE device_id = %s ORDER BY timestamp DESC LIMIT 20"
            cursor.execute(sql, (device_id,))
            results = cursor.fetchall()
            return sorted(results, key=lambda x: x['timestamp'])
    finally:
        connection.close()

def get_latest_snmp_metric(device_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM snmp_metrics WHERE device_id = %s ORDER BY timestamp DESC LIMIT 1"
            cursor.execute(sql, (device_id,))
            return cursor.fetchone()
    finally:
        connection.close()

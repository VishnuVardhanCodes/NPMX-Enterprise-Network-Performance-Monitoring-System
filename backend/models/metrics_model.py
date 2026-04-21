from database import get_connection

def insert_metric(device_id, latency, packet_loss=0):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # We assume metrics table structure: id, device_id, latency, packet_loss, timestamp
            sql = """INSERT INTO metrics (device_id, latency, packet_loss) 
                     VALUES (%s, %s, %s)"""
            cursor.execute(sql, (device_id, latency, packet_loss))
        connection.commit()
        return True
    except Exception as e:
        print(f"DB Error inserting metric: {str(e)}")
        return False
    finally:
        connection.close()

def get_metrics(device_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # Fetch the 20 most recent data points for charting
            sql = "SELECT * FROM metrics WHERE device_id = %s ORDER BY timestamp DESC LIMIT 20"
            cursor.execute(sql, (device_id,))
            results = cursor.fetchall()
            
            # Sort them chronologically ascending for Recharts Left-To-Right
            return sorted(results, key=lambda x: x['timestamp'])
    finally:
        connection.close()

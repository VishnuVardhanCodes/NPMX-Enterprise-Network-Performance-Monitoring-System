from database import get_connection

def get_threshold(device_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM thresholds WHERE device_id = %s"
            cursor.execute(sql, (device_id,))
            return cursor.fetchone()
    finally:
        connection.close()

def update_threshold(device_id, latency, packet_loss, bandwidth):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO thresholds (device_id, latency_threshold, packet_loss_threshold, bandwidth_threshold) 
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                latency_threshold=VALUES(latency_threshold),
                packet_loss_threshold=VALUES(packet_loss_threshold),
                bandwidth_threshold=VALUES(bandwidth_threshold)
            """
            cursor.execute(sql, (device_id, latency, packet_loss, bandwidth))
        connection.commit()
        return True
    finally:
        connection.close()

def create_default_threshold(device_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO thresholds (device_id) VALUES (%s) ON DUPLICATE KEY UPDATE id=id"
            cursor.execute(sql, (device_id,))
        connection.commit()
    finally:
        connection.close()

from database import get_connection

def get_all_devices():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = "SELECT * FROM devices"
            cursor.execute(query)
            return cursor.fetchall()
    finally:
        connection.close()


def add_device(device_name, ip_address, port, snmp_community, status="active"):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = """
                INSERT INTO devices
                (device_name, ip_address, port, snmp_community, status)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                device_name,
                ip_address,
                port,
                snmp_community,
                status or "active"
            ))
        connection.commit()
        return True
    finally:
        connection.close()


def delete_device(device_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            query = "DELETE FROM devices WHERE id=%s"
            cursor.execute(query, (device_id,))
        connection.commit()
        return True
    finally:
        connection.close()
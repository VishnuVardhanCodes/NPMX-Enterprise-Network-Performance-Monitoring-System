from database import get_connection

def calculate_system_health():
    """
    Computes a global network health percentage based on aggregate packet loss.
    """
    connection = get_connection()
    health = 100
    try:
        with connection.cursor() as cursor:
            # Get only recent metrics
            cursor.execute("SELECT AVG(packet_loss) as avg_loss FROM metrics")
            res = cursor.fetchone()
            if res and res['avg_loss'] is not None:
                health = max(0, min(100, 100 - float(res['avg_loss'])))
    except Exception as e:
        print(f"Health computation error: {e}")
    finally:
        connection.close()
    
    return round(health, 1)

def get_device_health(device_id):
    """Calculates specific health for a single node."""
    connection = get_connection()
    health = 100
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT AVG(packet_loss) as avg_loss FROM metrics WHERE device_id=%s", (device_id,))
            res = cursor.fetchone()
            if res and res['avg_loss'] is not None:
                health = max(0, min(100, 100 - float(res['avg_loss'])))
    except:
        pass
    finally:
        connection.close()
    return round(health, 1)

import time
import threading
from ping3 import ping
import mysql.connector
from datetime import datetime
from config import MYSQL_HOST as DB_HOST, MYSQL_USER as DB_USER, MYSQL_PASSWORD as DB_PASSWORD, MYSQL_DATABASE as DB_NAME

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

def monitor_device(device):
    device_id, device_name, ip_address, port, snmp_community = device
    
    # 1. Ping Monitoring
    latency = ping(ip_address, unit='ms')
    packet_loss = 0.0
    if latency is None:
        packet_loss = 100.0
        latency = 0.0
    else:
        # Simplistic view: either reachable or not reachable for this single ping test
        packet_loss = 0.0

    # 2. SNMP Monitoring (Dummy implementation/fallback since pysnmp setup can be complex for simple local testing)
    # Note: For production pysnmp, you'd use getCmd from pysnmp.hlapi
    throughput = 0.0
    bandwidth = 1000.0  # 1000 Mbps capacity
    jitter = 0.0
    if latency > 0:
        import random
        # Generating dummy metrics based on latency for visualization purposes
        throughput = random.uniform(10.0, 500.0)
        jitter = random.uniform(0.1, 5.0)
    
    # 3. Store Results Database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Save metrics
        sql = """INSERT INTO metrics 
                 (device_id, latency, packet_loss, throughput, bandwidth, jitter)
                 VALUES (%s, %s, %s, %s, %s, %s)"""
        val = (device_id, latency, packet_loss, throughput, bandwidth, jitter)
        cursor.execute(sql, val)
        
        # Determine Alerts
        if packet_loss == 100.0:
            alert_sql = "INSERT INTO alerts (device_id, alert_message, severity) VALUES (%s, %s, %s)"
            cursor.execute(alert_sql, (device_id, f"Device {device_name} ({ip_address}) is unreachable", "High"))
        elif latency > 100.0:
            alert_sql = "INSERT INTO alerts (device_id, alert_message, severity) VALUES (%s, %s, %s)"
            cursor.execute(alert_sql, (device_id, f"High latency on {device_name}: {latency:.2f}ms", "Medium"))
            
        conn.commit()
    except Exception as e:
        print(f"Error saving monitoring data: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

def monitoring_task():
    while True:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, device_name, ip_address, port, snmp_community FROM devices")
            devices = cursor.fetchall()
            cursor.close()
            conn.close()

            for device in devices:
                monitor_device(device)
                
        except Exception as e:
            print(f"Monitor background loop error: {e}")
            
        # Wait before next polling cycle
        time.sleep(10)

def start_monitor():
    monitor_thread = threading.Thread(target=monitoring_task, daemon=True)
    monitor_thread.start()
    print("Background monitoring started.")

if __name__ == '__main__':
    start_monitor()
    while True:
        time.sleep(1)

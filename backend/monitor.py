import time
import threading
from ping3 import ping
from database import get_connection

def get_db_connection():
    return get_connection()

from services.snmp_service import get_snmp_bandwidth
from services.alert_service import check_latency_alert, check_packet_loss_alert, check_bandwidth_alert
from models.metrics_model import insert_metric
from models.snmp_model import insert_snmp_metrics, get_latest_snmp_metric

def monitor_device(device):
    device_id = device['id']
    device_name = device['device_name']
    ip_address = device['ip_address']
    port = device['port']
    snmp_community = device['snmp_community']
    
    # 1. Ping Monitoring
    latency = ping(ip_address, unit='ms')
    packet_loss = 0.0
    if latency is None:
        packet_loss = 100.0
        latency = 0.0
    
    # 2. SNMP Monitoring
    snmp_data = get_snmp_bandwidth(ip_address, snmp_community, port)
    bandwidth = 0.0
    in_octets = 0
    out_octets = 0
    
    if snmp_data:
        in_octets = snmp_data['in_octets']
        out_octets = snmp_data['out_octets']
        current_total = in_octets + out_octets
        
        latest_snmp = get_latest_snmp_metric(device_id)
        if latest_snmp:
            prev_total = int(latest_snmp['in_octets'] or 0) + int(latest_snmp['out_octets'] or 0)
            prev_time = latest_snmp['timestamp'].timestamp()
            curr_time = time.time()
            time_diff = curr_time - prev_time
            
            if time_diff > 0 and current_total >= prev_total:
                byte_diff = current_total - prev_total
                bandwidth = round(((byte_diff * 8) / time_diff) / 1000000, 2)

    # 3. Store Results Database
    try:
        # Save metrics
        insert_metric(device_id, latency, packet_loss)
        if snmp_data:
            insert_snmp_metrics(device_id, in_octets, out_octets, bandwidth)
        
        # Determine Alerts based on Dynamic Thresholds
        check_latency_alert(device_id, latency)
        check_packet_loss_alert(device_id, packet_loss)
        if bandwidth > 0:
            check_bandwidth_alert(device_id, bandwidth)
            
    except Exception as e:
        print(f"Error saving monitoring data for {device_name}: {e}")

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

import csv
import os
from datetime import datetime
from database import get_connection

def generate_csv_report():
    """Exports all network metrics to a CSV for external analysis."""
    date_str = datetime.now().strftime("%Y-%m-%d")
    reports_dir = os.path.join(os.getcwd(), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    csv_filename = f"network_audit_{date_str}.csv"
    csv_path = os.path.join(reports_dir, csv_filename)
    
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # Join metrics and devices for a full audit log
            cursor.execute("""
                SELECT d.device_name, d.ip_address, m.latency, m.packet_loss, m.timestamp 
                FROM metrics m
                JOIN devices d ON m.device_id = d.id
                ORDER BY m.timestamp DESC
            """)
            rows = cursor.fetchall()
            
            with open(csv_path, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(["Device Name", "IP Address", "Latency (ms)", "Packet Loss (%)", "Timestamp"])
                for row in rows:
                    writer.writerow([
                        row['device_name'], 
                        row['ip_address'], 
                        row['latency'], 
                        row['packet_loss'], 
                        row['timestamp']
                    ])
                    
        return csv_path
    except Exception as e:
        print(f"CSV Export Error: {e}")
        return None
    finally:
        connection.close()

from database import get_connection

def insert_report(report_date, total_devices, active_devices, critical_alerts, avg_latency, max_bandwidth, packet_loss_events, pdf_path):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO reports 
                     (report_date, total_devices, active_devices, critical_alerts, avg_latency, max_bandwidth, packet_loss_events, pdf_path)
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                     ON DUPLICATE KEY UPDATE 
                     total_devices=VALUES(total_devices), active_devices=VALUES(active_devices), 
                     critical_alerts=VALUES(critical_alerts), avg_latency=VALUES(avg_latency),
                     max_bandwidth=VALUES(max_bandwidth), packet_loss_events=VALUES(packet_loss_events),
                     pdf_path=VALUES(pdf_path)"""
            cursor.execute(sql, (report_date, total_devices, active_devices, critical_alerts, avg_latency, max_bandwidth, packet_loss_events, pdf_path))
        connection.commit()
        return True
    except Exception as e:
        print(f"Report Insert DB Error: {e}")
        return False
    finally:
        connection.close()

def get_all_reports():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM reports ORDER BY report_date DESC"
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()

def get_report_by_date(date_str):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM reports WHERE report_date = %s"
            cursor.execute(sql, (date_str,))
            return cursor.fetchone()
    finally:
        connection.close()

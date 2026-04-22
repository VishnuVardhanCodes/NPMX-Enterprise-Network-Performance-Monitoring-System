import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from database import get_connection
from models.report_model import insert_report

def calculate_report_stats():
    connection = get_connection()
    stats = {
        "total_devices": 0, "active_devices": 0, "critical_alerts": 0,
        "avg_latency": 0.0, "max_bandwidth": 0.0, "packet_loss_events": 0
    }
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as v FROM devices")
            res = cursor.fetchone()
            if res: stats["total_devices"] = res["v"]
            
            cursor.execute("SELECT COUNT(*) as v FROM devices WHERE status IN ('active', 'online')")
            res = cursor.fetchone()
            if res: stats["active_devices"] = res["v"]
            
            cursor.execute("SELECT COUNT(*) as v FROM alerts WHERE severity='CRITICAL'")
            res = cursor.fetchone()
            if res: stats["critical_alerts"] = res["v"]
            
            cursor.execute("SELECT AVG(latency) as v FROM metrics WHERE latency > 0")
            res = cursor.fetchone()
            if res and res["v"]: stats["avg_latency"] = round(res["v"], 2)
            
            cursor.execute("SELECT MAX(bandwidth) as v FROM snmp_metrics")
            res = cursor.fetchone()
            if res and res["v"]: stats["max_bandwidth"] = round(res["v"], 2)
            
            cursor.execute("SELECT COUNT(*) as v FROM metrics WHERE packet_loss > 0")
            res = cursor.fetchone()
            if res: stats["packet_loss_events"] = res["v"]
            
        return stats
    except Exception as e:
        print(f"Error compiling stats: {e}")
        return stats
    finally:
        connection.close()

def generate_daily_report():
    date_str = datetime.now().strftime("%Y-%m-%d")
    reports_dir = os.path.join(os.getcwd(), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    pdf_path = os.path.join(reports_dir, f"daily_report_{date_str}.pdf")
    stats = calculate_report_stats()
    
    # Render PDF using reportlab Native Operations
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, 750, "NPMX Enterprise - Daily Network Analysis")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 720, f"Timestamp: {date_str}")
    c.line(50, 710, 550, 710)
    
    c.setFont("Helvetica", 14)
    y = 670
    c.drawString(50, y, f"Total Managed Devices: {stats['total_devices']}")
    y -= 30
    c.drawString(50, y, f"Currently Online/Active: {stats['active_devices']}")
    y -= 30
    if stats['critical_alerts'] > 0:
        c.setFillColorRGB(0.8, 0.1, 0.1) # Red text
    c.drawString(50, y, f"Critical System Alerts Today: {stats['critical_alerts']}")
    c.setFillColorRGB(0, 0, 0) # Black text
    
    y -= 30
    c.drawString(50, y, f"Average Network Latency: {stats['avg_latency']} ms")
    y -= 30
    c.drawString(50, y, f"Maximum Measured Bandwidth: {stats['max_bandwidth']} Mbps")
    y -= 30
    if stats['packet_loss_events'] > 0:
        c.setFillColorRGB(0.8, 0.1, 0.1)
    c.drawString(50, y, f"Total Packet Loss Triggers: {stats['packet_loss_events']}")
    c.setFillColorRGB(0, 0, 0)
    
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 50, "Generated Securely by the NPMX Surveillance & Telemetry Stack.")
    c.save()
    
    insert_report(date_str, stats["total_devices"], stats["active_devices"], stats["critical_alerts"], 
                  stats["avg_latency"], stats["max_bandwidth"], stats["packet_loss_events"], pdf_path)
    
    return {
        "date": date_str,
        "stats": stats,
        "pdf_path": pdf_path,
        "download_url": f"/api/reports/download/daily_report_{date_str}.pdf"
    }

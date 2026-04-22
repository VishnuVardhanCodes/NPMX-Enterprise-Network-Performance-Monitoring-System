from flask import Blueprint, jsonify
from database import get_connection

dashboard_routes = Blueprint('dashboard_routes', __name__)

@dashboard_routes.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    connection = get_connection()
    stats = {
        "total_devices": 0,
        "active_devices": 0,
        "network_health": "100%",
        "alerts_count": 0,
        "bandwidth_usage": "0 Mbps",
        "avg_latency": "0 ms",
        "traffic_data": []
    }
    try:
        with connection.cursor() as cursor:
            # 1. Total Devices
            cursor.execute("SELECT COUNT(*) as v FROM devices")
            res = cursor.fetchone()
            if res: stats["total_devices"] = res["v"]
            
            # 2. Active Devices
            cursor.execute("SELECT COUNT(*) as v FROM devices WHERE status='active'")
            res = cursor.fetchone()
            if res: stats["active_devices"] = res["v"]
            
            # 3. Alerts Count
            cursor.execute("SELECT COUNT(*) as v FROM alerts")
            res = cursor.fetchone()
            if res: stats["alerts_count"] = res["v"]
            
            # 4. Avg Latency
            cursor.execute("SELECT AVG(latency) as v FROM metrics WHERE latency > 0")
            res = cursor.fetchone()
            if res and res["v"]: stats["avg_latency"] = f"{round(res['v'], 1)} ms"
            
            # 5. Bandwidth Usage (Current sum of latest bandwidth)
            cursor.execute("""
                SELECT SUM(bandwidth) as v FROM snmp_metrics 
                WHERE timestamp > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            """)
            res = cursor.fetchone()
            if res and res["v"]: stats["bandwidth_usage"] = f"{round(res['v'], 1)} Mbps"
            
            # 6. Network Health (Online ratio)
            if stats["total_devices"] > 0:
                health = (stats["active_devices"] / stats["total_devices"]) * 100
                stats["network_health"] = f"{round(health, 0)}%"
            
            # 7. Traffic Data (Last 10 metrics for a mini-chart fallback)
            cursor.execute("""
                SELECT DATE_FORMAT(timestamp, '%H:%i') as time, AVG(latency) as value 
                FROM metrics 
                GROUP BY time 
                ORDER BY time DESC LIMIT 7
            """)
            rows = cursor.fetchall()
            stats["traffic_data"] = sorted(rows, key=lambda x: x['time'])

        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

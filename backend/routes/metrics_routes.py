from flask import Blueprint, jsonify
from models.metrics_model import insert_metric, get_metrics
from services.ping_service import ping_device
from services.alert_service import check_latency_alert, check_packet_loss_alert

metrics_bp = Blueprint('metrics_bp', __name__)

@metrics_bp.route('/ping/<int:device_id>', methods=['POST'])
def trigger_ping(device_id):
    try:
        connection = __import__('database').get_connection()
        device = None
        with connection.cursor() as cursor:
            cursor.execute("SELECT ip_address FROM devices WHERE id=%s", (device_id,))
            device = cursor.fetchone()
        connection.close()
        
        if not device:
            return jsonify({"error": "Device not found"}), 404
            
        ping_res = ping_device(device['ip_address'])
        latency = ping_res["latency"]
        packet_loss = ping_res["packet_loss"]
        
        insert_metric(device_id, latency, packet_loss)
        check_latency_alert(device_id, latency)
        check_packet_loss_alert(device_id, packet_loss)
        
        return jsonify({
            "message": "Ping processed",
            "latency": latency,
            "packet_loss": packet_loss
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@metrics_bp.route('/metrics/<int:device_id>', methods=['GET'])
def fetch_device_metrics(device_id):
    try:
        data = get_metrics(device_id)
        if not data or len(data) == 0:
            # Generate 5 dummy data points if database is empty 
            import datetime
            now = datetime.datetime.now()
            data = [
                {"timestamp": (now - datetime.timedelta(minutes=i*5)).isoformat(), "latency": 10 + (i*2), "packet_loss": 0}
                for i in range(5)
            ]
            data.reverse()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

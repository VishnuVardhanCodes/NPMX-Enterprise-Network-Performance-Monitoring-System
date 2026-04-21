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
            
        latency = ping_device(device['ip_address'])
        
        if latency is not None:
            insert_metric(device_id, latency, packet_loss=0)
            check_latency_alert(device_id, latency)
            check_packet_loss_alert(device_id, 0)
            return jsonify({"message": "Ping successful", "latency": latency}), 200
        else:
            insert_metric(device_id, 0, packet_loss=100)
            check_packet_loss_alert(device_id, 100)
            return jsonify({"error": "Ping timeout", "latency": 0}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@metrics_bp.route('/metrics/<int:device_id>', methods=['GET'])
def fetch_device_metrics(device_id):
    try:
        data = get_metrics(device_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

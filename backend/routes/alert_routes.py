from flask import Blueprint, jsonify
from models.alert_model import get_alerts, get_recent_alerts

alert_routes = Blueprint('alert_routes', __name__)

@alert_routes.route('/alerts', methods=['GET'])
def fetch_all_alerts():
    try:
        data = get_alerts()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alert_routes.route('/alerts/recent', methods=['GET'])
def fetch_recent_alerts():
    try:
        data = get_recent_alerts(limit=5)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

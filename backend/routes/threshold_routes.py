from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.threshold_model import get_threshold, update_threshold, create_default_threshold
from models.log_model import insert_log

threshold_routes = Blueprint('threshold_routes', __name__)

@threshold_routes.route('/threshold/', methods=['GET'])
@jwt_required()
def threshold_base_error():
    return jsonify({"error": "No device ID provided"}), 400

@threshold_routes.route('/threshold/<int:device_id>', methods=['GET'])
@jwt_required()
def fetch_device_thresholds(device_id):
    try:
        data = get_threshold(device_id)
        if not data:
            create_default_threshold(device_id)
            data = {"device_id": device_id, "latency_threshold": 100.0, "packet_loss_threshold": 5.0, "bandwidth_threshold": 80.0}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@threshold_routes.route('/threshold/<int:device_id>', methods=['POST'])
@jwt_required()
def modify_device_thresholds(device_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({"error": "Admin privileges required to alter mechanics"}), 403
        
    try:
        req = request.json
        success = update_threshold(device_id, req.get('latency_threshold'), req.get('packet_loss_threshold'), req.get('bandwidth_threshold'))
        if success:
            insert_log(current_user['username'], f"Modified Physical Threshold parameter limits for Node {device_id}")
            return jsonify({"message": "Thresholds updated dynamically"}), 200
        return jsonify({"error": "Failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

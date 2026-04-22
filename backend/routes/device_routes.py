from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from models.device_model import get_all_devices, delete_device
from services.device_service import validate_and_add_device
from models.log_model import insert_log

device_routes = Blueprint("device_routes", __name__)

@device_routes.route("/devices", methods=["GET"])
@jwt_required()
def get_devices():
    devices = get_all_devices()
    return jsonify(devices)

@device_routes.route("/devices", methods=["POST"])
@jwt_required()
def create_device():
    if current_user['role'] != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    data = request.json
    device_name = data["device_name"]
    result = validate_and_add_device(device_name, data["ip_address"], data["port"], data["snmp_community"])
    
    insert_log(current_user['username'], f"Device Added: {device_name} (Status: {result['status']})")
    return jsonify(result)

@device_routes.route("/devices/<int:id>", methods=["DELETE"])
@jwt_required()
def remove_device(id):
    if current_user['role'] != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    delete_device(id)
    insert_log(current_user['username'], f"Device Erased locally: ID {id}")
    return jsonify({"message": "Device deleted"})
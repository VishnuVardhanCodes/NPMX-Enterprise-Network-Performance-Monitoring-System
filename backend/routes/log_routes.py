from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.log_model import get_logs

log_routes = Blueprint("log_routes", __name__)

@log_routes.route('/logs', methods=['GET'])
@jwt_required()
def fetch_system_logs():
    current_user = get_jwt_identity()
    # Execute RBAC Shield
    if current_user['role'] != 'admin':
        return jsonify({"error": "Higher privileges required"}), 403
        
    data = get_logs()
    return jsonify(data), 200

from flask import Blueprint, request, jsonify
from models.topology_model import get_all_nodes, get_all_links, add_node, add_link, save_node_position

topology_routes = Blueprint('topology_routes', __name__)

@topology_routes.route('/topology/nodes', methods=['GET'])
def fetch_nodes():
    try:
        nodes = get_all_nodes()
        return jsonify(nodes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@topology_routes.route('/topology/links', methods=['GET'])
def fetch_links():
    try:
        links = get_all_links()
        return jsonify(links), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@topology_routes.route('/topology/node', methods=['POST'])
def create_node():
    data = request.json
    success = add_node(data.get('device_id'), data.get('position_x', 0), data.get('position_y', 0))
    if success:
        return jsonify({"message": "Node plotted successfully"}), 201
    return jsonify({"error": "Failed"}), 500

@topology_routes.route('/topology/link', methods=['POST'])
def create_link():
    data = request.json
    success = add_link(data.get('source_node'), data.get('target_node'))
    if success:
        return jsonify({"message": "Link connected successfully"}), 201
    return jsonify({"error": "Failed"}), 500

@topology_routes.route('/topology/node/position', methods=['PUT'])
def update_node_position():
    data = request.json
    success = save_node_position(data.get('device_id'), data.get('position_x'), data.get('position_y'))
    if success:
        return jsonify({"message": "Position Saved"}), 200
    return jsonify({"error": "Failed"}), 500

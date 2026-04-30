from flask import Blueprint, jsonify
from services.speed_test_service import run_speed_test
from models.speed_model import save_speed_test_result, get_speed_test_history
from flask_jwt_extended import jwt_required

speed_routes = Blueprint('speed_routes', __name__)

@speed_routes.route('/speed-test', methods=['GET'])
@jwt_required()
def start_speed_test():
    """
    Endpoint to run an internet speed test and save the result.
    """
    try:
        result = run_speed_test()
        
        # Save to database
        save_speed_test_result(
            ping=result['ping'],
            download=result['download'],
            upload=result['upload']
        )
        
        return jsonify({
            "status": "success",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@speed_routes.route('/speed-test/history', methods=['GET'])
@jwt_required()
def get_history():
    """
    Endpoint to get historical speed test results.
    """
    try:
        history = get_speed_test_history()
        return jsonify({
            "status": "success",
            "data": history
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

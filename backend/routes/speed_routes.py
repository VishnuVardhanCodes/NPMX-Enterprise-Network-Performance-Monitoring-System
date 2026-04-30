from flask import Blueprint, jsonify
from services.speed_test_service import run_speed_test
from models.speed_model import (
    insert_speed_test,
    get_speed_history
)

speed_bp = Blueprint("speed", __name__)

@speed_bp.route("/api/speed-test", methods=["GET"])
def speed_test():
    try:
        result = run_speed_test()

        # Save to database if no error
        if "error" not in result:
            insert_speed_test(
                result["ping"],
                result["download"],
                result["upload"]
            )

        return jsonify(result)
    except Exception as e:
        return jsonify({
            "ping": 0,
            "download": 0,
            "upload": 0,
            "error": str(e)
        }), 500

@speed_bp.route("/api/speed-test/history", methods=["GET"])
def history():
    try:
        data = get_speed_history()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

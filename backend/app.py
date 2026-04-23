from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import logging
import os
from config import FRONTEND_URL, JWT_SECRET_KEY

from routes.device_routes import device_routes
from routes.metrics_routes import metrics_bp
from routes.snmp_routes import snmp_routes
from routes.alert_routes import alert_routes
from routes.topology_routes import topology_routes
from routes.report_routes import report_routes
from routes.threshold_routes import threshold_routes
from routes.auth_routes import auth_routes
from routes.log_routes import log_routes
from routes.dashboard_routes import dashboard_routes

from flask_jwt_extended import JWTManager
from monitor import start_monitor

import json

# ==========================
# LOGGING CONFIG
# ==========================
if not os.path.exists("logs"):
    os.makedirs("logs")

logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app = Flask(__name__)
logging.info("Application started successfully.")

# ✅ Initialize bcrypt
bcrypt = Bcrypt(app)

# ✅ Correct CORS
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                FRONTEND_URL,
                "http://localhost:5173"
            ]
        }
    },
    supports_credentials=True
)

# ✅ Proper OPTIONS handling
@app.after_request
def after_request(response):
    origin = request.headers.get("Origin")

    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin

    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"

    return response


# ==========================
# JWT CONFIG
# ==========================

app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY or 'npmx-enterprise-super-secret-key-123!'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400

jwt = JWTManager(app)


@jwt.user_identity_loader
def user_identity_lookup(user_data):
    if isinstance(user_data, (dict, list)):
        return json.dumps(user_data)
    return str(user_data)


# ==========================
# REGISTER ROUTES
# ==========================

app.register_blueprint(device_routes, url_prefix='/api')
app.register_blueprint(metrics_bp, url_prefix='/api')
app.register_blueprint(snmp_routes, url_prefix='/api')
app.register_blueprint(alert_routes, url_prefix='/api')
app.register_blueprint(topology_routes, url_prefix='/api')
app.register_blueprint(report_routes, url_prefix='/api')
app.register_blueprint(threshold_routes, url_prefix='/api')
app.register_blueprint(auth_routes, url_prefix='/api')
app.register_blueprint(log_routes, url_prefix='/api')
app.register_blueprint(dashboard_routes, url_prefix='/api')


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "NPMX Backend Running Successfully 🚀"
    })


if __name__ == '__main__':
    start_monitor()
    app.run(host='0.0.0.0', port=5000, debug=False)
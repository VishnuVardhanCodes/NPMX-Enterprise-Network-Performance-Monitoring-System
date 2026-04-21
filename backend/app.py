from flask import Flask, jsonify
from flask_cors import CORS
from routes.device_routes import device_routes
from routes.metrics_routes import metrics_bp
from routes.snmp_routes import snmp_routes
from routes.alert_routes import alert_routes
from routes.topology_routes import topology_routes
from routes.report_routes import report_routes
from routes.threshold_routes import threshold_routes
from routes.auth_routes import auth_routes
from routes.log_routes import log_routes
from flask_jwt_extended import JWTManager
from monitor import start_monitor

app = Flask(__name__)
# Enhanced CORS to handle preflight and headers correctly
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
}}, supports_credentials=True)

# Secure Environment Injection
app.config['JWT_SECRET_KEY'] = 'npmx-enterprise-super-secret-key-123!'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400 # 24 hours
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

import json

jwt = JWTManager(app)

@jwt.user_identity_loader
def user_identity_lookup(user_data):
    if isinstance(user_data, (dict, list)):
        return json.dumps(user_data)
    return str(user_data)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    if isinstance(identity, str):
        try:
            return json.loads(identity)
        except:
            return identity
    return identity

# Diagnostics for JWT errors
@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Invalid token", "message": str(error)}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Authorization required", "message": "Missing Bearer Token"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token expired", "message": "Please login again"}), 401

# Register API blueprints
app.register_blueprint(device_routes, url_prefix='/api')
app.register_blueprint(metrics_bp, url_prefix='/api')
app.register_blueprint(snmp_routes, url_prefix='/api')
app.register_blueprint(alert_routes, url_prefix='/api')
app.register_blueprint(topology_routes, url_prefix='/api')
app.register_blueprint(report_routes, url_prefix='/api')
app.register_blueprint(threshold_routes, url_prefix='/api')
app.register_blueprint(auth_routes, url_prefix='/api')
app.register_blueprint(log_routes, url_prefix='/api')

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "NPMX Backend Running Successfully 🚀"
    })

if __name__ == '__main__':
    # Start background monitoring thread
    start_monitor()
    app.run(host='0.0.0.0', port=5000, debug=True)

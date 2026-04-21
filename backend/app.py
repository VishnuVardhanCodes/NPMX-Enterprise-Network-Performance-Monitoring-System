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

app = Flask(__name__)
CORS(app)

# Secure Environment Injection
app.config['JWT_SECRET_KEY'] = 'npmx-enterprise-super-secret-key-123!'
jwt = JWTManager(app)

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
    app.run(host='0.0.0.0', port=5000, debug=True)

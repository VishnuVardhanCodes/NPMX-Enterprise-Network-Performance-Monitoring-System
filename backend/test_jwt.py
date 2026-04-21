from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token, decode_token
import datetime

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'npmx-enterprise-super-secret-key-123!'
jwt = JWTManager(app)

with app.app_context():
    identity = {"id": 1, "username": "admin", "role": "admin"}
    token = create_access_token(identity=identity)
    print(f"Token: {token}")
    try:
        decoded = decode_token(token)
        print(f"Decoded: {decoded}")
        print(f"Identity: {decoded['sub']}")
    except Exception as e:
        print(f"Error: {e}")

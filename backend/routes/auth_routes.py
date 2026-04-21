from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models.user_model import create_user, get_user_by_username
from models.log_model import insert_log
import datetime

auth_routes = Blueprint("auth_routes", __name__)
bcrypt = Bcrypt()

@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # Default to 'user' role unless strictly pushed 'admin' via initial backend config DB seeding
    role = data.get('role', 'user') 
    
    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400
        
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    success = create_user(username, pw_hash, role)
    if success:
        insert_log(username, "User Registered")
        return jsonify({"message": "User securely registered"}), 201
    return jsonify({"error": "Username fully registered already"}), 400

@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = get_user_by_username(username)
    if user and bcrypt.check_password_hash(user['password_hash'], password):
        access_token = create_access_token(
            identity={"id": user['id'], "username": user['username'], "role": user['role']},
            expires_delta=datetime.timedelta(hours=24)
        )
        insert_log(username, "System Login Evaluated Successfully")
        return jsonify({"access_token": access_token, "role": user['role']}), 200
    return jsonify({"error": "Invalid enterprise credentials"}), 401

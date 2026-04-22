from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

from models.user_model import create_user, get_user_by_username
from models.log_model import insert_log

import datetime

auth_routes = Blueprint("auth_routes", __name__)

bcrypt = Bcrypt()


# ==========================
# REGISTER USER
# ==========================

@auth_routes.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    role = data.get('role', 'user')

    if not username or not password:
        return jsonify({
            "error": "Missing credentials"
        }), 400

    # Hash password properly
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    success = create_user(username, pw_hash, role)

    if success:
        insert_log(username, "User Registered")

        return jsonify({
            "message": "User securely registered"
        }), 201

    return jsonify({
        "error": "Username already exists"
    }), 400


# ==========================
# LOGIN USER
# ==========================

@auth_routes.route('/login', methods=['POST'])
def login():

    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            "error": "Missing credentials"
        }), 400

    user = get_user_by_username(username)

    if not user:
        return jsonify({
            "error": "Invalid username"
        }), 401

    stored_hash = user['password_hash']

    # Verify password safely
    if not bcrypt.check_password_hash(stored_hash, password):
        return jsonify({
            "error": "Invalid password"
        }), 401

    # Create JWT token
    access_token = create_access_token(
        identity={
            "id": user['id'],
            "username": user['username'],
            "role": user['role']
        },
        expires_delta=datetime.timedelta(hours=24)
    )

    insert_log(username, "Login Successful")

    return jsonify({
        "access_token": access_token,
        "username": user['username'],
        "role": user['role']
    }), 200
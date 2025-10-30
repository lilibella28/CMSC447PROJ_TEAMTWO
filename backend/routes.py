from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from backend.app import app, db
from backend.app.models import Admin

# Authentication Routes

@app.route("/auth/register", methods=["POST"])
def register():
    """
    Register a new admin user.
    
    Expects:
    - username: string (required)
    - password: string (required)
    
    Returns:
    - 201: Admin created successfully
    - 400: Missing fields or username already exists
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if Admin.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    admin = Admin(username=username)
    admin.set_password(password)

    db.session.add(admin)
    db.session.commit()

    return jsonify({"message": "Admin registered successfully"}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    """
    Authenticate an admin user and issue JWT tokens.
    
    Expects:
    - username: string (required)
    - password: string (required)
    
    Returns:
    - 200: Login successful, returns access_token, refresh_token, and username
    - 400: Missing fields
    - 401: Invalid credentials
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    admin = Admin.query.filter_by(username=username).first()

    if not admin or not admin.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=admin.id)
    refresh_token = create_refresh_token(identity=admin.id)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "username": admin.username
    }), 200

@app.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)  # Only accepts refresh tokens
def refresh():
    """
    Issue a new access token using a valid refresh token.
    
    Requires:
    - Valid refresh token in Authorization header
    
    Returns:
    - 200: New access token issued
    - 401: Invalid or expired refresh token
    """
    current_user_id = get_jwt_identity()  # Get user ID from refresh token
    access_token = create_access_token(identity=current_user_id)  # Create new access token
    return jsonify({"access_token": access_token}), 200

@app.route("/auth/protected", methods=["GET"])
@jwt_required()  # Requires valid access token
def protected():
    """
    Example protected endpoint that requires authentication.
    
    Requires:
    - Valid access token in Authorization header
    
    Returns:
    - 200: Successfully accessed protected resource
    - 401: Missing or invalid access token
    """
    current_user_id = get_jwt_identity()  # Get user ID from access token
    admin = Admin.query.get(current_user_id)  # Fetch admin user details
    return jsonify({
        "message": f"Protected endpoint accessed by {admin.username}",
        "user_id": current_user_id
    }), 200
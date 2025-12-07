from flask import Blueprint, request, jsonify, session
from backend.app import db
from backend.app.models import User, UserRoleEnum
from datetime import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)


# ============================================================================
# AUTHENTICATION DECORATORS
# ============================================================================
# 💡 TO DISABLE AUTHENTICATION FOR LOCAL DEVELOPMENT:
# Comment out the @login_required and @role_required decorators on routes
# Example:
#   @auth_bp.route('/protected')
#   # @login_required  <-- Comment this out
#   def protected_route():
#       ...
# ============================================================================


def login_required(f):
    """
    Decorator to require authentication
    
    TO DISABLE: Comment out this decorator on any route
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def role_required(required_role):
    """
    Decorator to require specific role or higher
    
    TO DISABLE: Comment out this decorator on any route
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({
                    'success': False,
                    'error': 'Authentication required'
                }), 401
            
            user = User.query.get(session['user_id'])
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'User not found'
                }), 404
            
            if not user.is_active:
                return jsonify({
                    'success': False,
                    'error': 'Account is inactive'
                }), 403
            
            if not user.has_permission(required_role):
                return jsonify({
                    'success': False,
                    'error': f'Insufficient permissions. Required role: {required_role.value}'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    
    Authenticate user and create session.
    
    Request Body:
    {
        "username": "admin",
        "password": "password123"
    }
    
    Returns:
        JSON with success status and user details
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'error': 'Username and password are required'
            }), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'Invalid username or password'
            }), 401
        
        # Check if account is active
        if not user.is_active:
            return jsonify({
                'success': False,
                'error': 'Account is inactive. Please contact an administrator.'
            }), 403
        
        # Verify password
        if not user.check_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid username or password'
            }), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create session
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role.value
        
        return jsonify({
            'success': True,
            'message': f'Welcome back, {user.first_name or user.username}!',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """
    POST /api/auth/logout
    
    Destroy user session.
    
    Returns:
        JSON with success status
    """
    try:
        username = session.get('username', 'User')
        session.clear()
        
        return jsonify({
            'success': True,
            'message': f'Goodbye, {username}!'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """
    GET /api/auth/me
    
    Get current authenticated user details.
    
    Returns:
        JSON with current user details
    """
    try:
        user = User.query.get(session['user_id'])
        
        if not user:
            session.clear()
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """
    POST /api/auth/change-password
    
    Change current user's password.
    
    Request Body:
    {
        "current_password": "oldpass123",
        "new_password": "newpass123"
    }
    
    Returns:
        JSON with success status
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({
                'success': False,
                'error': 'Both current_password and new_password are required'
            }), 400
        
        # Validate password strength
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'error': 'New password must be at least 8 characters long'
            }), 400
        
        user = User.query.get(session['user_id'])
        
        if not user.check_password(current_password):
            return jsonify({
                'success': False,
                'error': 'Current password is incorrect'
            }), 401
        
        # Set new password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/register', methods=['POST'])
@role_required(UserRoleEnum.admin)
def register_user():
    """
    POST /api/auth/register
    
    Create a new user account. Only admins can create new users.
    
    Request Body:
    {
        "username": "john_doe",
        "email": "john@umbc.edu",
        "password": "password123",
        "first_name": "John",
        "last_name": "Doe",
        "role": "viewer"
    }
    
    Returns:
        JSON with success status and user details
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        username = data['username']
        email = data['email']
        password = data['password']
        
        # Validate password strength
        if len(password) < 8:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 8 characters long'
            }), 400
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return jsonify({
                'success': False,
                'error': f'Username "{username}" already exists'
            }), 409
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'error': f'Email "{email}" already exists'
            }), 409
        
        # Parse role
        role_str = data.get('role', 'viewer')
        try:
            role = UserRoleEnum[role_str]
        except KeyError:
            return jsonify({
                'success': False,
                'error': f'Invalid role: {role_str}. Valid options: viewer, manager, admin, super_admin'
            }), 400
        
        # Only super_admin can create other super_admins
        current_user = User.query.get(session['user_id'])
        if role == UserRoleEnum.super_admin and current_user.role != UserRoleEnum.super_admin:
            return jsonify({
                'success': False,
                'error': 'Only super admins can create other super admins'
            }), 403
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role=role,
            is_active=data.get('is_active', True),
            created_by_id=session['user_id']
        )
        
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User {username} created successfully',
            'user': new_user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/users', methods=['GET'])
@role_required(UserRoleEnum.admin)
def get_all_users():
    """
    GET /api/auth/users
    
    Get all users. Only admins can view all users.
    
    Query Parameters:
        - role: Filter by role
        - is_active: Filter by active status (true/false)
        - page: Page number (default: 1)
        - per_page: Items per page (default: 50)
    
    Returns:
        JSON with list of users
    """
    try:
        # Get query parameters
        role_filter = request.args.get('role')
        is_active_filter = request.args.get('is_active')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Build query
        query = User.query
        
        if role_filter:
            try:
                role_enum = UserRoleEnum[role_filter]
                query = query.filter_by(role=role_enum)
            except KeyError:
                return jsonify({
                    'success': False,
                    'error': f'Invalid role: {role_filter}'
                }), 400
        
        if is_active_filter is not None:
            is_active = is_active_filter.lower() == 'true'
            query = query.filter_by(is_active=is_active)
        
        # Order by created date (newest first)
        query = query.order_by(User.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        users_list = [user.to_dict() for user in pagination.items]
        
        return jsonify({
            'success': True,
            'users': users_list,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_pages': pagination.pages,
                'total_items': pagination.total
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/users/<int:user_id>', methods=['GET'])
@role_required(UserRoleEnum.admin)
def get_user(user_id):
    """
    GET /api/auth/users/<user_id>
    
    Get specific user details.
    
    Returns:
        JSON with user details
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with id {user_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict(include_sensitive=True)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@role_required(UserRoleEnum.admin)
def update_user(user_id):
    """
    PUT /api/auth/users/<user_id>
    
    Update user details. Only admins can update users.
    
    Request Body:
    {
        "first_name": "John",
        "last_name": "Smith",
        "email": "john.smith@umbc.edu",
        "role": "manager",
        "is_active": true
    }
    
    Returns:
        JSON with success status and updated user details
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with id {user_id} not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update basic fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        if 'email' in data:
            # Check if email already exists for another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({
                    'success': False,
                    'error': f'Email "{data["email"]}" already exists'
                }), 409
            user.email = data['email']
        
        # Update role (with permission check)
        if 'role' in data:
            try:
                new_role = UserRoleEnum[data['role']]
                
                # Only super_admin can change roles to/from super_admin
                current_user = User.query.get(session['user_id'])
                if (new_role == UserRoleEnum.super_admin or user.role == UserRoleEnum.super_admin):
                    if current_user.role != UserRoleEnum.super_admin:
                        return jsonify({
                            'success': False,
                            'error': 'Only super admins can modify super admin roles'
                        }), 403
                
                user.role = new_role
            except KeyError:
                return jsonify({
                    'success': False,
                    'error': f'Invalid role: {data["role"]}'
                }), 400
        
        # Update active status
        if 'is_active' in data:
            # Prevent deactivating yourself
            if user_id == session['user_id'] and not data['is_active']:
                return jsonify({
                    'success': False,
                    'error': 'You cannot deactivate your own account'
                }), 400
            user.is_active = data['is_active']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User {user.username} updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@role_required(UserRoleEnum.super_admin)
def delete_user(user_id):
    """
    DELETE /api/auth/users/<user_id>
    
    Delete a user. Only super admins can delete users.
    
    Returns:
        JSON with success status
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with id {user_id} not found'
            }), 404
        
        # Prevent deleting yourself
        if user_id == session['user_id']:
            return jsonify({
                'success': False,
                'error': 'You cannot delete your own account'
            }), 400
        
        username = user.username
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User {username} deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@role_required(UserRoleEnum.admin)
def reset_user_password(user_id):
    """
    POST /api/auth/users/<user_id>/reset-password
    
    Reset a user's password. Only admins can reset passwords.
    
    Request Body:
    {
        "new_password": "newpass123"
    }
    
    Returns:
        JSON with success status
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with id {user_id} not found'
            }), 404
        
        data = request.get_json()
        
        if not data or not data.get('new_password'):
            return jsonify({
                'success': False,
                'error': 'new_password is required'
            }), 400
        
        new_password = data['new_password']
        
        # Validate password strength
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 8 characters long'
            }), 400
        
        # Set new password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Password reset successfully for user {user.username}'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@auth_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the auth service."""
    return jsonify({
        'success': True,
        'service': 'Authentication Service',
        'status': 'online'
    }), 200
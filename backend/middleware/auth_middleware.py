import jwt
from flask import request, jsonify, current_app
from functools import wraps
from models.models import User

def token_required(f):
    """Decorator to protect routes with JWT authentication.
    Injects `current_user` object as the first parameter.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Look for token in Authorization header (Bearer <token>)
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                parts = auth_header.split(" ")
                if len(parts) == 2 and parts[0].lower() == 'bearer':
                    token = parts[1]
                else:
                    return jsonify({'success': False, 'message': 'Authorization header must start with Bearer'}), 401
            except IndexError:
                return jsonify({'success': False, 'message': 'Token header is malformed'}), 401
                
        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is required'}), 401

        try:
            # Decode token using JWT Secret Key
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'success': False, 'message': 'User session no longer valid'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Session expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': f'Authentication error: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    """Decorator to restrict access to Admins only.
    Checks JWT token and ensures the decoded user has an 'admin' role.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                parts = auth_header.split(" ")
                if len(parts) == 2 and parts[0].lower() == 'bearer':
                    token = parts[1]
            except IndexError:
                return jsonify({'success': False, 'message': 'Token header is malformed'}), 401
                
        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is required'}), 401

        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'success': False, 'message': 'User session no longer valid'}), 401
            if current_user.role != 'admin':
                return jsonify({'success': False, 'message': 'Access denied: Admin privileges required'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Session expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': f'Authentication error: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

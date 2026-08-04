import jwt
import re
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from models.models import db, User

auth_bp = Blueprint('auth', __name__)

# Simple email validation regex pattern
EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    """Handles new user creation. Securely hashes password and validates fields."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        # Support registering as 'admin' in development/testing if specified
        role = data.get('role', 'user').strip().lower()

        # 1. Field validation
        if not name:
            return jsonify({'success': False, 'message': 'Name field is required'}), 400
        if not email:
            return jsonify({'success': False, 'message': 'Email field is required'}), 400
        if not password:
            return jsonify({'success': False, 'message': 'Password field is required'}), 400
            
        if not re.match(EMAIL_REGEX, email):
            return jsonify({'success': False, 'message': 'Please enter a valid email address'}), 400

        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400

        if role not in ['user', 'admin']:
            role = 'user'

        # 2. Check for email duplicate
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'success': False, 'message': 'An account with this email already exists'}), 409

        # 3. Save new user record
        new_user = User(name=name, email=email, role=role)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Registration successful! You can now log in.',
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates credentials and issues signed JWT."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'success': False, 'message': 'Incorrect email or password'}), 401

        # Generate JWT Token (payload contains id, email, role, and expiry timestamp)
        token_payload = {
            'user_id': user.user_id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }
        token = jwt.encode(token_payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """State-less JWT logout endpoint. Simply notifies client to destroy token."""
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

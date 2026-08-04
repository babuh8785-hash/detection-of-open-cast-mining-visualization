import re
from flask import Blueprint, request, jsonify
from models.models import db, User
from middleware.auth_middleware import token_required

user_bp = Blueprint('user', __name__)

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Retrieves standard account info for the currently authenticated user."""
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Modifies user name, email, or credentials.
    Requires password verification if changing credentials.
    """
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')

        # 1. Update text fields if present
        if name:
            current_user.name = name
            
        if email:
            if not re.match(EMAIL_REGEX, email):
                return jsonify({'success': False, 'message': 'Please enter a valid email address'}), 400
                
            # Verify new email doesn't collide
            if email != current_user.email:
                existing_user = User.query.filter_by(email=email).first()
                if existing_user:
                    return jsonify({'success': False, 'message': 'Email address is already in use by another user'}), 409
                current_user.email = email

        # 2. Secure credential updates
        if new_password:
            if not old_password:
                return jsonify({'success': False, 'message': 'Current password is required to change password'}), 400
                
            if not current_user.check_password(old_password):
                return jsonify({'success': False, 'message': 'Incorrect current password'}), 401
                
            if len(new_password) < 6:
                return jsonify({'success': False, 'message': 'New password must be at least 6 characters long'}), 400
                
            current_user.set_password(new_password)

        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Profile settings updated successfully',
            'user': current_user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Server error updating profile: {str(e)}'}), 500

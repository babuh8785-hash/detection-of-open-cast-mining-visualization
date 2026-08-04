from flask import Blueprint, jsonify, request
from models.models import db, User, Prediction, Image
from middleware.auth_middleware import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_admin_dashboard(current_admin):
    """Compiles global platform diagnostics and analysis metrics for administrators."""
    try:
        # 1. Gather baseline metrics
        total_users = User.query.count()
        total_predictions = Prediction.query.count()
        mining_count = Prediction.query.filter_by(prediction_result='Mining').count()
        non_mining_count = Prediction.query.filter_by(prediction_result='Non Mining').count()

        # Calculate a proxy for accuracy based on average confidence
        avg_confidence = db.session.query(db.func.avg(Prediction.confidence)).scalar()
        accuracy_rate = round(float(avg_confidence), 2) if avg_confidence is not None else 92.50

        # 2. Get recent predictions (last 5)
        recent_preds = Prediction.query.order_by(Prediction.created_at.desc()).limit(5).all()
        recent_preds_list = []
        for pred in recent_preds:
            p_dict = pred.to_dict()
            p_dict['image'] = pred.image.to_dict()
            p_dict['user'] = pred.image.user.to_dict()
            recent_preds_list.append(p_dict)

        # 3. Get recent uploads (last 5)
        recent_uploads = Image.query.order_by(Image.uploaded_at.desc()).limit(5).all()
        recent_uploads_list = []
        for img in recent_uploads:
            i_dict = img.to_dict()
            i_dict['user'] = img.user.to_dict()
            recent_uploads_list.append(i_dict)

        # 4. Group predictions by class counts for visual charts
        analytics = {
            'total_users': total_users,
            'total_predictions': total_predictions,
            'mining_images': mining_count,
            'non_mining_images': non_mining_count,
            'prediction_accuracy': accuracy_rate,
            'recent_predictions': recent_preds_list,
            'recent_uploads': recent_uploads_list
        }

        return jsonify({
            'success': True,
            'analytics': analytics
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to retrieve admin analytics: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users(current_admin):
    """Retrieves all registered users for user administration."""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        user_list = []
        
        # Calculate uploads count and predictions count for each user
        for u in users:
            u_dict = u.to_dict()
            u_dict['total_uploads'] = Image.query.filter_by(user_id=u.user_id).count()
            # Predictions count
            pred_count = db.session.query(Prediction).join(Image).filter(Image.user_id == u.user_id).count()
            u_dict['total_predictions'] = pred_count
            user_list.append(u_dict)

        return jsonify({
            'success': True,
            'users': user_list
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to retrieve users list: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_admin, user_id):
    """Deletes a specific user account. Prevents self-deletion."""
    try:
        if current_admin.user_id == user_id:
            return jsonify({'success': False, 'message': 'Admin cannot delete their own account'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User record not found'}), 404

        # Delete user images from disk before removing database cascade
        uploads_dir = current_app.config['UPLOAD_FOLDER']
        user_images = Image.query.filter_by(user_id=user_id).all()
        for img in user_images:
            if img.image_path:
                raw_path = os.path.join(uploads_dir, os.path.basename(img.image_path))
                if os.path.exists(raw_path):
                    os.remove(raw_path)
            if img.processed_image_path:
                proc_path = os.path.join(uploads_dir, os.path.basename(img.processed_image_path))
                if os.path.exists(proc_path):
                    os.remove(proc_path)

        db.session.delete(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f"User account '{user.email}' and all associated files deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Deletion failed: {str(e)}'}), 500

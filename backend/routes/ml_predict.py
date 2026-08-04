import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models.models import db, Image, Prediction
from middleware.auth_middleware import token_required
from utils.image_processing import validate_image, preprocess_image
from services.predict_service import predict_mining, ModelUnavailableError

ml_predict_bp = Blueprint('ml_predict', __name__)

def allowed_file(filename):
    """Helper to check if file extension is supported."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@ml_predict_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    """Static server route for images (original and processed)."""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@ml_predict_bp.route('/upload', methods=['POST'])
@token_required
def upload_image(current_user):
    """Securely handles raw file upload, validates image contents, and saves it."""
    try:
        # Support both 'file' and 'image' multipart keys
        file_key = 'file' if 'file' in request.files else ('image' if 'image' in request.files else None)
        
        if not file_key:
            return jsonify({'success': False, 'message': 'No image file found in the request'}), 400
            
        file = request.files[file_key]
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Empty file selected'}), 400

        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({
                'success': False, 
                'message': f'Unsupported file type. Allowed extensions: {", ".join(current_app.config["ALLOWED_EXTENSIONS"])}'
            }), 400

        # Create upload folder if missing
        upload_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename to prevent clashes
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(upload_dir, unique_name)

        # Save temporarily to validate
        file.save(save_path)

        # Validate file content is a readable image using PIL helper
        if not validate_image(save_path):
            os.remove(save_path)  # Delete invalid file
            return jsonify({'success': False, 'message': 'Invalid image file or corrupt data'}), 400

        # Create Image database entry
        # Store relative file URL so it's server-agnostic
        image_url_path = f"/uploads/{unique_name}"
        new_image = Image(
            user_id=current_user.user_id,
            image_name=secure_filename(file.filename),
            image_path=image_url_path
        )
        db.session.add(new_image)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'image': new_image.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Upload failed: {str(e)}'}), 500

@ml_predict_bp.route('/predict', methods=['POST'])
@token_required
def run_prediction(current_user):
    """Preprocesses raw image based on user options and runs CNN prediction.
    Stores the prediction result in the database.
    """
    try:
        data = request.get_json() or {}
        image_id = data.get('image_id')

        # Configuration options for pipeline (default True if omitted)
        resize = data.get('resize', True)
        normalize = data.get('normalize', True)
        noise_removal = data.get('noise_removal', True)
        enhancement = data.get('enhancement', True)

        if not image_id:
            return jsonify({'success': False, 'message': 'Image ID parameter is required'}), 400

        # Fetch image and verify access (Admins can predict any image, Users only their own)
        img_record = Image.query.get(image_id)
        if not img_record:
            return jsonify({'success': False, 'message': 'Image record not found'}), 404
            
        if current_user.role != 'admin' and img_record.user_id != current_user.user_id:
            return jsonify({'success': False, 'message': 'Access forbidden: You do not own this image'}), 403

        # Resolve paths
        uploads_dir = current_app.config['UPLOAD_FOLDER']
        raw_filename = os.path.basename(img_record.image_path)
        raw_filepath = os.path.join(uploads_dir, raw_filename)

        if not os.path.exists(raw_filepath):
            return jsonify({'success': False, 'message': 'Original image file could not be found on server disk'}), 404

        # Generate unique path for saving processed version
        proc_filename = f"processed_{raw_filename}"
        proc_filepath = os.path.join(uploads_dir, proc_filename)

        # Run preprocessing OpenCV logic
        try:
            normalized_array = preprocess_image(
                raw_filepath, 
                proc_filepath, 
                resize=resize, 
                normalize=normalize, 
                noise_removal=noise_removal, 
                enhancement=enhancement
            )
        except Exception as pe:
            return jsonify({'success': False, 'message': f'Image preprocessing failed: {str(pe)}'}), 400

        # Update image database record with processed URL
        img_record.processed_image_path = f"/uploads/{proc_filename}"
        db.session.add(img_record)

        # Run prediction
        try:
            label, confidence, processing_time = predict_mining(normalized_array)
        except ModelUnavailableError as me:
            # Trap model load issues gracefully (Requirement #26)
            db.session.commit()  # commit the processed image url first
            return jsonify({
                'success': False,
                'message': f"ML Model Service Unreachable: {str(me)}"
            }), 503

        # Log prediction result
        prediction = Prediction(
            image_id=img_record.image_id,
            prediction_result=label,
            confidence=confidence,
            processing_time=processing_time
        )
        db.session.add(prediction)
        db.session.commit()

        # Build response payload
        res_payload = prediction.to_dict()
        res_payload['image'] = img_record.to_dict()

        return jsonify({
            'success': True,
            'message': 'Prediction completed successfully',
            'prediction': res_payload
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Prediction execution failed: {str(e)}'}), 500

@ml_predict_bp.route('/history', methods=['GET'])
@token_required
def get_prediction_history(current_user):
    """Retrieves user's prediction history with support for search, sort, filter, and pagination."""
    try:
        # Read parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str).strip()
        result_filter = request.args.get('filter', '', type=str).strip() # 'Mining' or 'Non Mining'
        sort_by = request.args.get('sort', 'created_at', type=str)
        order = request.args.get('order', 'desc', type=str)

        # Create query joining predictions with image
        query = db.session.query(Prediction).join(Image)
        
        # Enforce user isolation (Admins see all records, standard users only their own)
        if current_user.role != 'admin':
            query = query.filter(Image.user_id == current_user.user_id)

        # Apply search filter (match image name)
        if search:
            query = query.filter(Image.image_name.ilike(f"%{search}%"))

        # Apply prediction filter
        if result_filter:
            query = query.filter(Prediction.prediction_result == result_filter)

        # Apply Sorting
        sort_col = getattr(Prediction, sort_by, Prediction.created_at)
        if order.lower() == 'asc':
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        # Total counts
        total_items = query.count()

        # Pagination
        offset = (page - 1) * limit
        results = query.offset(offset).limit(limit).all()

        history_list = []
        for pred in results:
            pred_dict = pred.to_dict()
            pred_dict['image'] = pred.image.to_dict()
            # If admin, append user who uploaded it
            if current_user.role == 'admin':
                pred_dict['user'] = pred.image.user.to_dict()
            history_list.append(pred_dict)

        return jsonify({
            'success': True,
            'data': history_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_items': total_items,
                'total_pages': (total_items + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to retrieve history: {str(e)}'}), 500

@ml_predict_bp.route('/history/<int:prediction_id>', methods=['GET'])
@token_required
def get_prediction_detail(current_user, prediction_id):
    """Retrieves specific prediction details ensuring ownership permission checks."""
    try:
        prediction = Prediction.query.get(prediction_id)
        if not prediction:
            return jsonify({'success': False, 'message': 'Prediction record not found'}), 404

        # Enforce security boundary
        if current_user.role != 'admin' and prediction.image.user_id != current_user.user_id:
            return jsonify({'success': False, 'message': 'Access denied: Unauthorized to view this record'}), 403

        pred_dict = prediction.to_dict()
        pred_dict['image'] = prediction.image.to_dict()
        pred_dict['user'] = prediction.image.user.to_dict()

        return jsonify({
            'success': True,
            'prediction': pred_dict
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@ml_predict_bp.route('/history/<int:prediction_id>', methods=['DELETE'])
@token_required
def delete_prediction(current_user, prediction_id):
    """Deletes prediction record and cleans up local raw/processed files from disk."""
    try:
        prediction = Prediction.query.get(prediction_id)
        if not prediction:
            return jsonify({'success': False, 'message': 'Prediction record not found'}), 404

        # Enforce security boundary
        if current_user.role != 'admin' and prediction.image.user_id != current_user.user_id:
            return jsonify({'success': False, 'message': 'Access denied: Unauthorized to delete this record'}), 403

        # Clean up files on disk
        img = prediction.image
        uploads_dir = current_app.config['UPLOAD_FOLDER']

        if img.image_path:
            raw_filepath = os.path.join(uploads_dir, os.path.basename(img.image_path))
            if os.path.exists(raw_filepath):
                os.remove(raw_filepath)

        if img.processed_image_path:
            proc_filepath = os.path.join(uploads_dir, os.path.basename(img.processed_image_path))
            if os.path.exists(proc_filepath):
                os.remove(proc_filepath)

        # Deleting image cascades deletions of associated prediction entries via ORM configuration
        db.session.delete(img)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Prediction and associated files successfully deleted'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Deletion failed: {str(e)}'}), 500

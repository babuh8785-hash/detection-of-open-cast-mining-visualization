import os
import sys

# Support running inside 'backend' folder directly (e.g. Railway root folder deployment)
# by adding the parent directory to sys.path so 'backend' can be resolved as a package
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config.config import Config
from backend.models.models import db, User
from backend.routes.auth import auth_bp
from backend.routes.user import user_bp
from backend.routes.ml_predict import ml_predict_bp
from backend.routes.admin import admin_bp

def create_app():
    """Application factory method to create and configure the Flask server."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS to work seamlessly with frontend frameworks
    # Supports credentials properly by parsing environment configurations
    cors_origins = app.config['CORS_ORIGIN']
    if cors_origins == '*':
        origins_list = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000"]
    else:
        origins_list = [o.strip() for o in cors_origins.split(',')]
        # Always allow localhost for development convenience
        origins_list.extend(["http://localhost:5173", "http://127.0.0.1:5173"])
        
    CORS(app, resources={r"/*": {"origins": origins_list}}, supports_credentials=True)

    # Initialize SQLAlchemy connection
    db.init_app(app)

    # Register blueprints with appropriate prefixes
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(ml_predict_bp, url_prefix='')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    # Centralized global error handling for JSON responses
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed_error(error):
        return jsonify({'success': False, 'message': 'HTTP Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500

    @app.errorhandler(413)
    def file_too_large(error):
        return jsonify({'success': False, 'message': 'File too large. Maximum size is 10MB.'}), 413

    # Startup procedures inside application context
    with app.app_context():
        # Create uploads folder if missing
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # 1. Automatically create all tables (Requirement #8)
        db.create_all()

        # 2. Seed default data for test environments (Requirement #25)
        # Default Admin account
        admin_email = 'admin@opencast.com'
        if not User.query.filter_by(email=admin_email).first():
            admin_user = User(
                name='System Administrator',
                email=admin_email,
                role='admin'
            )
            admin_user.set_password('adminpassword')
            db.session.add(admin_user)
            
        # Default standard User account
        user_email = 'user@opencast.com'
        if not User.query.filter_by(email=user_email).first():
            standard_user = User(
                name='Mining Researcher',
                email=user_email,
                role='user'
            )
            standard_user.set_password('userpassword')
            db.session.add(standard_user)

        db.session.commit()

        # 3. Check for ML model availability to cache on startup
        try:
            from backend.services.predict_service import load_ml_model
            # Lazily load or compile dummy model so it's ready in memory
            load_ml_model()
            print("TensorFlow model verified and loaded into cache successfully.")
        except Exception as e:
            # Trap model failures here to prevent server crash on startup (Requirement #26)
            print(f"Startup Warning - Model could not be cached: {str(e)}")

    return app

app = create_app()

if __name__ == '__main__':
    # Determine execution port
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

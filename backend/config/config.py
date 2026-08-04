import os
from datetime import timedelta

class Config:
    # Key used for password hashing, session cookies, etc.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-dev-key')
    
    # JWT authentication settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET', 'jwt-secret-dev-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # Database configuration - defaults to MySQL in production, local SQLite for easy development fallback
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if SQLALCHEMY_DATABASE_URI:
        if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        elif SQLALCHEMY_DATABASE_URI.startswith("mysql://"):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("mysql://", "mysql+pymysql://", 1)
    else:
        # Development fallback
        SQLALCHEMY_DATABASE_URI = 'sqlite:///opencast.db'
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Image upload configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}
    # Limit upload size to 10MB to protect memory and prevent DoS
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    
    # TensorFlow / Keras Model settings
    MODEL_PATH = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml', 'model.h5'))
    
    # CORS setup
    CORS_ORIGIN = os.environ.get('CORS_ORIGIN', '*')

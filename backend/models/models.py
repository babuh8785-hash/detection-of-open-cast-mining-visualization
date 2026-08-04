from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

# Initialize db object to be imported across routes and app setup
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship: Cascade delete images when user is deleted
    images = db.relationship('Image', backref='user', cascade='all, delete-orphan', lazy=True)

    def set_password(self, password):
        """Hashes password using bcrypt and stores it."""
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Verifies plain password against stored hash."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def to_dict(self):
        """Returns serializable dictionary format of User."""
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Image(db.Model):
    __tablename__ = 'images'
    
    image_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    image_name = db.Column(db.String(255), nullable=False)
    image_path = db.Column(db.String(500), nullable=False)
    processed_image_path = db.Column(db.String(500), nullable=True)  # Visual feedback for UI
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship: Cascade delete predictions when image is deleted
    predictions = db.relationship('Prediction', backref='image', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'image_id': self.image_id,
            'user_id': self.user_id,
            'image_name': self.image_name,
            'image_path': self.image_path,
            'processed_image_path': self.processed_image_path,
            'uploaded_at': self.uploaded_at.isoformat()
        }

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    prediction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    image_id = db.Column(db.Integer, db.ForeignKey('images.image_id', ondelete='CASCADE'), nullable=False)
    prediction_result = db.Column(db.String(50), nullable=False)  # 'Mining' or 'Non Mining'
    confidence = db.Column(db.Float, nullable=False)
    processing_time = db.Column(db.Float, nullable=False)  # in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'prediction_id': self.prediction_id,
            'image_id': self.image_id,
            'prediction_result': self.prediction_result,
            'confidence': self.confidence,
            'processing_time': self.processing_time,
            'created_at': self.created_at.isoformat()
        }

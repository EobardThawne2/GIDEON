import os
from datetime import timedelta

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///gideon.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-replace-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-dev-key-replace-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # AI Model
    MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
    WORKOUT_MODEL_PATH = os.path.join(MODEL_PATH, 'workout_model.keras')
    NUTRITION_MODEL_PATH = os.path.join(MODEL_PATH, 'nutrition_model.keras')
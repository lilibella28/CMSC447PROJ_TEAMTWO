import os

class Config:
    # Secret key for sessions, CSRF protection, etc.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key")

    # --- Database Configuration ---
    # Example: PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/visa_db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- Upload Folder for Excel Imports ---
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # backend/app
    PROJECT_ROOT = os.path.dirname(BASE_DIR)                       # backend
    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, "uploads")          # backend/uploads

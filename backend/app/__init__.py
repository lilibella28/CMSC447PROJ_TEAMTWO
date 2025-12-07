from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
        supports_credentials=True
    )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # 🚨 IMPORTANT:
    # Import models *after* db.init_app(app) is called
    from backend.app import models

    # Register blueprints
    from .routes.employees import employee_bp
    app.register_blueprint(employee_bp, url_prefix="/api/employees")

    from .routes.import_routes import import_bp
    app.register_blueprint(import_bp, url_prefix="/api/excel")
    from .routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from backend.app.routes.visa_history_routes import visa_history_bp 
    app.register_blueprint(visa_history_bp)

    return app

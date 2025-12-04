from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
# Assuming config is in the same directory, this is correct:
from .config import Config 

# Define extensions globally without initializing
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

    # Initialize extensions with the app instance
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so migrations detect them (USE RELATIVE IMPORT)
    from . import models

    # Register blueprints (USE RELATIVE IMPORTS)
    # Note: This assumes you have created the __init__.py file inside the 'routes' directory.
    from .routes.employees import employee_bp
    app.register_blueprint(employee_bp, url_prefix="/api/employees")

    from .routes.import_routes import import_bp
    app.register_blueprint(import_bp, url_prefix="/api/excel")

    from backend.app.routes.visa_history_routes import visa_history_bp 
    app.register_blueprint(visa_history_bp)


    app.config.from_object(Config)

    return app
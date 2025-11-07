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
    CORS(app)

    # initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # import models so migrations detect them
    from backend.app import models

    # register blueprints
    from backend.app.routes.employees import employee_bp
    app.register_blueprint(employee_bp, url_prefix="/api/employees")

    @app.route("/")
    def home():
        return {"message": "Visa Management Backend running"}

    return app

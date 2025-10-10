from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import Config

# initialize extensions
app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# import models so migrations detect them
from backend.app import models

@app.route("/")
def home():
    return {"message": "Visa Management Backend running"}

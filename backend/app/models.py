from . import db
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    # add password check and hash


class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)

    visas = db.relationship("Visa", back_populates="user", cascade="all, delete-orphan")
    alerts = db.relationship("Alert", back_populates="user", cascade="all, delete-orphan")


class Visa(db.Model):
    __tablename__ = "visas"
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    visa_type = db.Column(db.String(50), nullable=False)   # e.g., "H1-B", "J-1"
    expires_on = db.Column(db.Date, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # last time we alerted for THIS visa (helps avoid duplicates)
    last_alerted_at = db.Column(db.DateTime, nullable=True, index=True)

    user = db.relationship("User", back_populates="visas")
    alerts = db.relationship("Alert", back_populates="visa", cascade="all, delete-orphan")


class Alert(db.Model):
    __tablename__ = "alerts"
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    visa_id = db.Column(db.Integer, db.ForeignKey("visas.id"), nullable=False, index=True)

    # "expiry_window" for this use case; keep string for future types (e.g., "doc_missing")
    alert_type = db.Column(db.String(50), nullable=False, default="expiry_window")

    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    delivered_at = db.Column(db.DateTime, nullable=True)   # set if/when actually delivered

    user = db.relationship("User", back_populates="alerts")
    visa = db.relationship("Visa", back_populates="alerts")

    __table_args__ = (
        # Soft de-dupe: don’t insert identical alert twice for same visa within a short time
        db.Index("ix_alert_dedupe", "visa_id", "alert_type"),
    )


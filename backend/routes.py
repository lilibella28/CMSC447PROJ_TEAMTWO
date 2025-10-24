from datetime import datetime, date, timedelta
from flask import Blueprint, jsonify, request
from .models import db, User, Visa, Alert

api = Blueprint("api", __name__)

# ALERT CONFIGURATION
# -----------------------------------------------------------------------------------------------------------------------------------
ALERT_THRESHOLDS_DAYS = {
    "H1-B": 210,   # 7 months 210 days
    "J-1": 120,    # 4 months 120 days
}

ALERT_COOLDOWN_DAYS = 7
# -----------------------------------------------------------------------------------------------------------------------------------


# ALERT FUNCTIONS
# -----------------------------------------------------------------------------------------------------------------------------------
def _days_until(expiration_date: date) -> int:
    """Return number of days between today and the visa expiration date."""
    return (expiration_date - date.today()).days


def _visa_is_within_threshold(visa: Visa) -> tuple[bool, int, int]:
    """
    Check if a visa is within its alert threshold.
    Returns (should_alert, days_left, threshold_days)
    """
    days_left = _days_until(visa.expires_on)
    threshold_days = ALERT_THRESHOLDS_DAYS.get(visa.visa_type)
    if threshold_days is None:
        # Unknown visa type — no threshold configured
        return (False, days_left, 0)
    return (days_left <= threshold_days, days_left, threshold_days)


def _is_in_cooldown(visa: Visa) -> bool:
    """True if the visa was alerted recently and is within cooldown window."""
    if not visa.last_alerted_at:
        return False
    return (datetime.utcnow() - visa.last_alerted_at) < timedelta(days=ALERT_COOLDOWN_DAYS)


def _make_alert_message(visa: Visa, days_left: int, threshold_days: int) -> str:
    """Generate a user-friendly alert message."""
    if days_left < 0:
        return (
            f"Your {visa.visa_type} visa expired {-days_left} day(s) ago. "
            "Please update your records immediately."
        )
    return (
        f"Your {visa.visa_type} visa will expire in {days_left} day(s). "
        f"This is within the {threshold_days}-day alert window. "
        "Please update your information."
    )


def _create_alert(visa: Visa, message: str) -> Alert:
    """Insert a new alert and update the visa's last_alerted_at timestamp."""
    alert = Alert(
        user_id=visa.user_id,
        visa_id=visa.id,
        alert_type="expiry_window",
        message=message,
        created_at=datetime.utcnow(),
    )
    db.session.add(alert)
    visa.last_alerted_at = datetime.utcnow()
    return alert


def _serialize_alert(alert: Alert) -> dict:
    """Return alert as a JSON-serializable dictionary."""
    return {
        "id": alert.id,
        "user_id": alert.user_id,
        "visa_id": alert.visa_id,
        "alert_type": alert.alert_type,
        "message": alert.message,
        "created_at": alert.created_at.isoformat(),
        "delivered_at": alert.delivered_at.isoformat() if alert.delivered_at else None,
    }
# -----------------------------------------------------------------------------------------------------------------------------------

# ALERT ENDPOINTS
# -----------------------------------------------------------------------------------------------------------------------------------
@api.route("/api/alerts/run", methods=["POST"])
def run_alerts():
    """
    Scan all visas and create alerts for any that are expiring
    within the configured day-based thresholds.
    """
    created = []
    skipped_cooldown = 0
    skipped_unknown_type = 0

    user_id = request.args.get("user_id", type=int)
    query = Visa.query
    if user_id:
        query = query.filter(Visa.user_id == user_id)

    visas = query.all()

    for visa in visas:
        should_alert, days_left, threshold_days = _visa_is_within_threshold(visa)

        if not should_alert:
            if visa.visa_type not in ALERT_THRESHOLDS_DAYS:
                skipped_unknown_type += 1
            continue

        if _is_in_cooldown(visa):
            skipped_cooldown += 1
            continue

        message = _make_alert_message(visa, days_left, threshold_days)
        alert = _create_alert(visa, message)
        created.append(alert)

    db.session.commit()

    return jsonify({
        "created_count": len(created),
        "created_alerts": [_serialize_alert(a) for a in created],
        "skipped_cooldown": skipped_cooldown,
        "skipped_unknown_type": skipped_unknown_type,
        "timestamp": datetime.utcnow().isoformat()
    }), 201


@api.route("/api/users/<int:user_id>/alerts", methods=["GET"])
def list_user_alerts(user_id: int):
    """Return all alerts for a specific user, sorted newest first."""
    alerts = Alert.query.filter_by(user_id=user_id).order_by(Alert.created_at.desc()).all()
    return jsonify([_serialize_alert(a) for a in alerts])


@api.route("/api/alerts/preview", methods=["GET"])
def preview_alerts():
    """
    Dry-run version of run_alerts that doesn't create database records.
    Shows which visas *would* generate alerts today.
    """
    user_id = request.args.get("user_id", type=int)
    query = Visa.query
    if user_id:
        query = query.filter(Visa.user_id == user_id)

    visas = query.all()
    preview = []

    for visa in visas:
        should_alert, days_left, threshold_days = _visa_is_within_threshold(visa)
        if not should_alert:
            continue

        preview.append({
            "user_id": visa.user_id,
            "visa_id": visa.id,
            "visa_type": visa.visa_type,
            "expires_on": visa.expires_on.isoformat(),
            "days_left": days_left,
            "threshold_days": threshold_days,
            "cooldown_active": _is_in_cooldown(visa),
            "message": _make_alert_message(visa, days_left, threshold_days),
        })

    return jsonify(preview)
# -----------------------------------------------------------------------------------------------------------------------------------

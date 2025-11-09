from flask import Blueprint, jsonify
from backend.app import db
from backend.app.models import Employee, Visa

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/visas')
def list_visas():
    results = (
        db.session.query(Visa.id, Visa.employee_id, Visa.start_date, Visa.expiration_date, Visa.case_type,
                         Employee.first_name, Employee.last_name)
        .join(Employee, Employee.id == Visa.employee_id)
        .limit(50)
        .all()
    )

    visas = []
    for r in results:
        visas.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": f"{r.first_name} {r.last_name}",
            "start_date": r.start_date.isoformat() if r.start_date else None,
            "expiration_date": r.expiration_date.isoformat() if r.expiration_date else None,
            "case_type": r.case_type
        })
    return jsonify(visas)
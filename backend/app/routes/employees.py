from flask import Blueprint, jsonify, request
from backend.app.models import db, Employee
from datetime import datetime

employee_bp = Blueprint("employees", __name__)

# ✅ Create Employee (changed from "/" → "/newcase")
@employee_bp.route("/newcase", methods=["POST"])
def create_employee():
    data = request.json
    try:
        employee = Employee(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            personal_email=data.get("personal_email"),
            gender=data.get("gender"),
            country_of_birth=data.get("country_of_birth"),
            citizenship=data.get("citizenship"),
            department=data.get("department"),
            employee_title=data.get("employee_title"),
            department_admin=data.get("department_admin"),
            department_advisor=data.get("department_advisor"),
           annual_salary=data.get("annual_salary"),
            visa_type=data.get("visa_type"),
            status=data.get("status"),
            filed_by=data.get("filed_by"),
            case_type=data.get("case_type"),
           i94_number=data.get("i94_number "),
            sevis_id=data.get("sevis_id"),
            expiration_date=parse_date(data.get("expiration_date")),
            visa_start_date=parse_date(data.get("visa_start_date")),
            initial_h1b_start_date=parse_date(data.get("initial_h1b_start_date")),
            prep_extension_date =parse_date(data.get("prep_extension_date ")),
            max_h_period=parse_date(data.get("max_h_period")),
            i94_expiry_date=parse_date(data.get("i94_expiry_date")),
            pr_filing_date=parse_date(data.get("pr_filing_date")),
            pr_status=data.get("pr_status"),
            pr_notes=data.get("pr_notes"),
            highest_education=data.get("highest_education"),
            field_of_study=data.get("field_of_study"),
            soc_code=data.get("soc_code"),
            soc_code_description=data.get("soc_code_description"),
            general_notes=data.get("general_notes"),
            number_of_dependents =data.get("number_of_dependents "),
        )
        db.session.add(employee)
        db.session.commit()
        return jsonify({"message": "Employee created successfully", "employee": employee.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# 📖 Read All Employees
@employee_bp.route("/", methods=["GET"])
def get_employees():
    employees = Employee.query.all()
    return jsonify([emp.to_dict() for emp in employees])


# 🔍 Read One Employee
@employee_bp.route("/<int:id>", methods=["GET"])
def get_employee(id):
    employee = Employee.query.get_or_404(id)
    return jsonify(employee.to_dict())


# ✏️ Update Employee
@employee_bp.route("/<int:id>", methods=["PUT"])
def update_employee(id):
    data = request.json
    employee = Employee.query.get_or_404(id)
    try:
        for key, value in data.items():
            if hasattr(employee, key):
                if "Date" in key and value:
                    setattr(employee, key, parse_date(value))
                else:
                    setattr(employee, key, value)
        db.session.commit()
        return jsonify({"message": "Employee updated", "employee": employee.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# 🗑️ Delete Employee
@employee_bp.route("/<int:id>", methods=["DELETE"])
def delete_employee(id):
    employee = Employee.query.get_or_404(id)
    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": "Employee deleted"})


def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None



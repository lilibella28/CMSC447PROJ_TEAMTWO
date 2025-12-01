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
            personalEmail=data.get("personalEmail"),
            gender=data.get("gender"),
            countryOfBirth=data.get("countryOfBirth"),
            citizenship=data.get("citizenships"),
            department=data.get("department"),
            employeeTitle=data.get("employeeTitle"),
            departmentAdmin=data.get("departmentAdmin"),
            departmentAdvisor=data.get("departmentAdvisor"),
            annualSalary=data.get("annualSalary"),
            visaType=data.get("visaType"),
            status=data.get("status"),
            filedBy=data.get("filedBy"),
            caseType=data.get("caseType"),
            i94Number=data.get("i94Number"),
            sevisId=data.get("sevisId"),
            expirationDate=parse_date(data.get("expirationDate")),
            visaStartDate=parse_date(data.get("visaStartDate")),
            initialH1BStartDate=parse_date(data.get("initialH1BStartDate")),
            prepExtensionDate=parse_date(data.get("prepExtensionDate")),
            maxHPeriod=parse_date(data.get("maxHPeriod")),
            i94ExpiryDate=parse_date(data.get("i94ExpiryDate")),
            prFilingDate=parse_date(data.get("prFilingDate")),
            prStatus=data.get("prStatus"),
            prNotes=data.get("prNotes"),
            highestEducation=data.get("highestEducation"),
            fieldOfStudy=data.get("fieldOfStudy"),
            socCode=data.get("socCode"),
            socCodeDescription=data.get("socCodeDescription"),
            generalNotes=data.get("generalNotes"),
            numberOfDependents=data.get("numberOfDependents"),
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



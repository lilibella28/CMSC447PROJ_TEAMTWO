
from . import db
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import ENUM


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    # add password check and hash

class Employee(db.Model):
    """
    Core employee data. Matches Excel: names, emails, birth country, gender,
    dependents, initial H-1B start date. Notes are separate (EmployeeNote).
    Multiple citizenships are separate (Citizenship).
    """
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    last_name = db.Column(db.String(120), nullable=False)
    first_name = db.Column(db.String(120), nullable=False)

    umbc_email = db.Column(db.String(255), nullable=True)
    personal_email = db.Column(db.String(255), nullable=True)

    country_of_birth = db.Column(db.String(100), nullable=True)
    citizenship = db.Column(db.String(50),  nullable=True)
    gender           = db.Column(db.String(50),  nullable=True)
    dependents       = db.Column(db.Integer,     nullable=True)

    # If they had/have an H-1B initially
    initial_h1b_start_date = db.Column(db.Date, nullable=True)

    # Relationships
    visas = db.relationship("Visa", back_populates="employee",
                            cascade="all, delete-orphan")


    def __repr__(self):
        return f"<Employee {self.id}: {self.first_name} {self.last_name}>"

class VisaType(db.Model):
    __tablename__ = "visa_types"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    alert_period = db.Column(db.Integer, nullable=False)
    
    visas = db.relationship("Visa", back_populates="visa_type")
    def __repr__(self):
        return f"<VisaType {self.name}>"

VisaStatusEnum = ENUM("valid", "expiring_soon", "expired", "pending",
                      name="visa_status_enum")

class Visa(db.Model):
    """
    Each record is one visa period for an employee (current or old).
    Matches Excel fields: start/expiry, prep extension, max H period, I-94 exp,
    general notes, SOC, dept, title, admin, advisor/PI/chair, salary, edu level/field.
    Added: filed_by, case_type to match sheet.
    """
    __tablename__ = "visas"

    id = db.Column(db.Integer, primary_key=True)

    employee_id = db.Column(db.Integer,
                            db.ForeignKey("employees.id", ondelete="CASCADE"),
                            nullable=False, index=True)
    visa_type_id = db.Column(db.Integer,
                             db.ForeignKey("visa_types.id", ondelete="SET NULL"),
                             nullable=True)

    # Timeline
    start_date          = db.Column(db.Date, nullable=True)
    expiration_date     = db.Column(db.Date, nullable=True)
    prep_extension_date = db.Column(db.Date, nullable=True)
    max_h_period        = db.Column(db.Date, nullable=True)
    document_expiry_i94 = db.Column(db.Date, nullable=True)

    # Admin / metadata from Excel
    general_notes   = db.Column(db.Text, nullable=True)
    soc_code        = db.Column(db.String(20),  nullable=True)
    soc_description = db.Column(db.String(255), nullable=True)
    department      = db.Column(db.String(100), nullable=True)
    employee_title  = db.Column(db.String(120), nullable=True)
    admin           = db.Column(db.String(120), nullable=True)
    advisor_pi_chair= db.Column(db.String(120), nullable=True)
    annual_salary   = db.Column(db.Numeric(10, 2), nullable=True)
    educational_level = db.Column(db.String(100), nullable=True)
    educational_field = db.Column(db.String(150), nullable=True)

    filed_by  = db.Column(db.String(120), nullable=True)
    case_type = db.Column(db.String(80),  nullable=True)

    status = db.Column(VisaStatusEnum, nullable=False, server_default="valid")

    # Relationships
    employee = db.relationship("Employee", back_populates="visas")
    visa_type = db.relationship("VisaType", back_populates="visas")



    def __repr__(self):
        vt = self.visa_type.name if self.visa_type else "None"
        return f"<Visa {self.id} emp={self.employee_id} type={vt} exp={self.expiration_date}>"

class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
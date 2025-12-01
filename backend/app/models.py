from . import db
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import ENUM
import enum


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    # add password check and hash


class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))


class VisaStatusEnum(enum.Enum):
    valid = "valid"
    expired = "expired"
    pending = "pending"
    expiring_soon = "expiring_soon"


class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=False, nullable=True)
    personal_email = db.Column(db.String(120))
    gender = db.Column(db.String(50))
    country_of_birth = db.Column(db.String(100))
    citizenship = db.Column(db.JSON)
    department = db.Column(db.String(100))
    employeeTitle = db.Column(db.String(100))
    departmentAdmin = db.Column(db.String(100))
    departmentAdvisor = db.Column(db.String(100))
    annualSalary = db.Column(db.Float)
    visaType = db.Column(db.String(50))
    status = db.Column(db.String(50))
    filedBy = db.Column(db.String(100))
    caseType = db.Column(db.String(120))
    i94Number = db.Column(db.String(50))
    sevisId = db.Column(db.String(50))
    expirationDate = db.Column(db.Date)
    visaStartDate = db.Column(db.Date)
    initial_h1b_start  = db.Column(db.Date)
    prepExtensionDate = db.Column(db.Date)
    maxHPeriod = db.Column(db.Date)
    i94ExpiryDate = db.Column(db.Date)
    prFilingDate = db.Column(db.Date)
    prStatus = db.Column(db.String(50))
    prNotes = db.Column(db.Text)
    highestEducation = db.Column(db.String(50))
    fieldOfStudy = db.Column(db.String(100))
    socCode = db.Column(db.String(20))
    socCodeDescription = db.Column(db.String(200))
    generalNotes = db.Column(db.Text)
    dependents = db.Column(db.Integer)

    # Relationships
    visas = db.relationship("Visa", back_populates="employee", cascade="all, delete-orphan")

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

   
    
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
    """
    visa_type_id = db.Column(db.Integer,
                             db.ForeignKey("visa_types.id", ondelete="SET NULL"),
                             nullable=True)
    """
    
    # Timeline
    start_date          = db.Column(db.Date, nullable=True)
    expiration_date     = db.Column(db.Date, nullable=True)
    prep_extension_date = db.Column(db.Date, nullable=True)
    max_h_period        = db.Column(db.Date, nullable=True)
    document_expiry_i94 = db.Column(db.Date, nullable=True)

    # Admin / metadata from Excel
    permanent_residency_notes = db.Column(db.Text, nullable=True)
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

    status = db.Column(ENUM(VisaStatusEnum), nullable=False, server_default="valid")

    # Relationships
    employee = db.relationship("Employee", back_populates="visas")
    
    # visa_type = db.relationship("VisaType", back_populates="visas")

    def __repr__(self):
        return f"<Visa {self.id} emp={self.employee_id} exp={self.expiration_date}>"
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

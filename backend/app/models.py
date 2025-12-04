from . import db
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import ENUM
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum





class UserRoleEnum(enum.Enum):
    """User roles for role-based access control"""
    super_admin = "super_admin"  # Main admin - full access
    admin = "admin"              # Regular admin - can manage employees/visas
    manager = "manager"          # Can view and edit
    viewer = "viewer"            # Read-only access


class User(db.Model):
    """
    User model for authentication and authorization.
    Supports role-based access control (RBAC).
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    
    # Role and permissions
    role = db.Column(ENUM(UserRoleEnum), nullable=False, default=UserRoleEnum.viewer)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Metadata
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary (excluding password)"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role.value if self.role else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }
        
        if include_sensitive:
            data['created_by_id'] = self.created_by_id
        
        return data
    
    def has_permission(self, required_role):
        """Check if user has required role or higher"""
        role_hierarchy = {
            UserRoleEnum.viewer: 1,
            UserRoleEnum.manager: 2,
            UserRoleEnum.admin: 3,
            UserRoleEnum.super_admin: 4
        }
        
        user_level = role_hierarchy.get(self.role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        return user_level >= required_level
    
    def __repr__(self):
        return f"<User {self.username} ({self.role.value if self.role else 'no_role'})>"


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
    email = db.Column(db.String(120), unique=True, nullable=False)
    personal_email = db.Column(db.String(120))
    gender = db.Column(db.String(50))
    country_of_birth = db.Column(db.String(100))
    citizenship = db.Column(db.JSON)
    department = db.Column(db.String(100))
    employee_title = db.Column(db.String(100))
    department_admin = db.Column(db.String(100))
    department_advisor = db.Column(db.String(100))
    annual_salary = db.Column(db.Float)
    visa_type = db.Column(db.String(50))
    status = db.Column(db.String(50))
    filed_by = db.Column(db.String(100))
    case_type = db.Column(db.String(120))
    i94_number = db.Column(db.String(50))
    sevis_id = db.Column(db.String(50))
    expiration_date = db.Column(db.Date,  nullable=True)
    visa_start_date = db.Column(db.Date,  nullable=True)
    initial_h1b_start_date = db.Column(db.Date,  nullable=True) 
    prep_extension_date = db.Column(db.Date,  nullable=True)
    max_h_period = db.Column(db.Date,  nullable=True)
    i94_expiry_date = db.Column(db.Date,  nullable=True)
    pr_filing_date = db.Column(db.Date, nullable=True)
    pr_status = db.Column(db.String(50))
    pr_notes = db.Column(db.Text)
    highest_education = db.Column(db.String(50))
    field_of_study = db.Column(db.String(100))
    soc_code = db.Column(db.String(20))
    soc_code_description = db.Column(db.String(200))
    general_notes = db.Column(db.Text)
    number_of_dependents = db.Column(db.Integer)

    # Relationships
    visas = db.relationship("Visa", back_populates="employee", cascade="all, delete-orphan")
    visa_history = db.relationship("VisaHistory", back_populates="employee", cascade="all, delete-orphan", order_by="desc(VisaHistory.start_date)")

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
    
    # visa_type = db.relationship("visa_type", back_populates="visas")

    def __repr__(self):
        return f"<Visa {self.id} emp={self.employee_id} exp={self.expiration_date}>"
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class VisaHistory(db.Model):
    """
    Stores historical visa records for each employee.
    Tracks all past and current visa periods to maintain a complete timeline.
    
    Each record represents one visa period (past or current).
    When a new current visa is added, the old one remains in history.
    """
    __tablename__ = "visa_history"

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key to employee
    employee_id = db.Column(db.Integer, 
                           db.ForeignKey("employees.id", ondelete="CASCADE"),
                           nullable=False, index=True)
    
    # Visa details
    visa_type = db.Column(db.String(50), nullable=False)  # F-1, OPT, OPT STEM, H-1B, Permanent Resident
    status = db.Column(db.String(50), nullable=False)     # Active, Expired, Processing, etc.
    
    # Timeline
    start_date = db.Column(db.Date, nullable=False)
    expiration_date = db.Column(db.Date, nullable=False)
    
    # Metadata
    comments = db.Column(db.Text, nullable=True)
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    added_by = db.Column(db.String(100), nullable=True)  # Username or name of person who added
    
    # Optional: Link to user who added it
    added_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Track if this is the current/active visa
    is_current = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationships
    employee = db.relationship("Employee", back_populates="visa_history")
    
    def __repr__(self):
        return f"<VisaHistory {self.id} emp={self.employee_id} type={self.visa_type} {self.start_date}-{self.expiration_date}>"
    
    def to_dict(self):
        """Convert visa history record to dictionary for API responses"""
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'visa_type': self.visa_type,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'comments': self.comments,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'added_by': self.added_by,
            'is_current': self.is_current
        }
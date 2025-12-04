from flask import Blueprint, request, jsonify
from backend.app import db
from backend.app.models import Visa, Employee, VisaStatusEnum
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import desc

# ============================================================================
# 💡 TO ENABLE AUTHENTICATION PROTECTION:
# 1. Uncomment the imports below
# 2. Uncomment the decorators on routes (see examples below)
# ============================================================================

# from backend.app.routes.auth_routes import login_required, role_required
# from backend.app.models import UserRoleEnum

visa_bp = Blueprint('visa', __name__)


# ============================================================================
# EXAMPLE: How to protect routes with authentication
# ============================================================================
# @visa_bp.route('/add', methods=['POST'])
# @role_required(UserRoleEnum.manager)  # <-- Uncomment to require manager role
# def add_visa():
#     ...
# ============================================================================


def calculate_visa_status(expiration_date):
    """
    Calculate visa status based on expiration date.
    
    Rules:
    - expired: expiration date is in the past
    - expiring_soon: expiration date is within 90 days from today
    - valid: expiration date is more than 90 days from today
    """
    if not expiration_date:
        return VisaStatusEnum.pending
    
    today = date.today()
    
    # Convert to date if datetime
    if isinstance(expiration_date, datetime):
        expiration_date = expiration_date.date()
    
    days_until_expiration = (expiration_date - today).days
    
    if days_until_expiration < 0:
        return VisaStatusEnum.expired
    elif days_until_expiration <= 90:
        return VisaStatusEnum.expiring_soon
    else:
        return VisaStatusEnum.valid


def parse_date(date_str):
    """
    Parse date string in various formats to date object.
    Supports: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY
    """
    if not date_str:
        return None
    
    if isinstance(date_str, date):
        return date_str
    
    if isinstance(date_str, datetime):
        return date_str.date()
    
    # Try different date formats
    date_formats = [
        '%Y-%m-%d',      # 2024-12-01
        '%m/%d/%Y',      # 12/01/2024
        '%d-%m-%Y',      # 01-12-2024
        '%Y/%m/%d',      # 2024/12/01
        '%m-%d-%Y',      # 12-01-2024
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(str(date_str), fmt).date()
        except ValueError:
            continue
    
    raise ValueError(f"Unable to parse date: {date_str}")


@visa_bp.route('/add', methods=['POST'])
def add_visa():
    """
    POST /api/visas/add
    
    Add a new visa record for an existing employee.
    
    Request Body (JSON):
    {
        "employee_id": 1,
        "visa_type": "H-1B",
        "start_date": "2024-01-01",
        "expiration_date": "2027-01-01",
        "prep_extension_date": "2026-10-01",
        "max_h_period": "2027-01-01",
        "document_expiry_i94": "2027-01-15",
        "permanent_residency_notes": "PR filed",
        "general_notes": "Initial H-1B petition",
        "soc_code": "15-1251",
        "soc_description": "Computer Programmers",
        "department": "Computer Science",
        "employee_title": "Research Associate",
        "admin": "Dr. Jane Admin",
        "advisor_pi_chair": "Dr. John Advisor",
        "annual_salary": 65000,
        "educational_level": "Master's",
        "educational_field": "Computer Science",
        "filed_by": "University",
        "case_type": "H-1B New"
    }
    
    Returns:
        JSON with success status and visa details
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        employee_id = data.get('employee_id')
        if not employee_id:
            return jsonify({
                'success': False,
                'error': 'employee_id is required'
            }), 400
        
        # Check if employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({
                'success': False,
                'error': f'Employee with id {employee_id} not found'
            }), 404
        
        # Parse dates
        try:
            start_date = parse_date(data.get('start_date'))
            expiration_date = parse_date(data.get('expiration_date'))
            prep_extension_date = parse_date(data.get('prep_extension_date'))
            max_h_period = parse_date(data.get('max_h_period'))
            document_expiry_i94 = parse_date(data.get('document_expiry_i94'))
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid date format: {str(e)}'
            }), 400
        
        # Validate business rules
        if start_date and expiration_date and expiration_date <= start_date:
            return jsonify({
                'success': False,
                'error': 'Expiration date must be after start date'
            }), 400
        
        # Calculate visa status
        status = calculate_visa_status(expiration_date)
        
        # Create new visa record
        new_visa = Visa(
            employee_id=employee_id,
            start_date=start_date,
            expiration_date=expiration_date,
            prep_extension_date=prep_extension_date,
            max_h_period=max_h_period,
            document_expiry_i94=document_expiry_i94,
            permanent_residency_notes=data.get('permanent_residency_notes'),
            general_notes=data.get('general_notes'),
            soc_code=data.get('soc_code'),
            soc_description=data.get('soc_description'),
            department=data.get('department'),
            employee_title=data.get('employee_title'),
            admin=data.get('admin'),
            advisor_pi_chair=data.get('advisor_pi_chair'),
            annual_salary=data.get('annual_salary'),
            educational_level=data.get('educational_level'),
            educational_field=data.get('educational_field'),
            filed_by=data.get('filed_by'),
            case_type=data.get('case_type'),
            status=status
        )
        
        # Add to database
        db.session.add(new_visa)
        db.session.commit()
        
        # Return created visa
        visa_dict = new_visa.to_dict()
        # Convert date objects to strings for JSON serialization
        for key, value in visa_dict.items():
            if isinstance(value, (date, datetime)):
                visa_dict[key] = value.isoformat()
        
        return jsonify({
            'success': True,
            'message': f'Visa record added successfully for {employee.first_name} {employee.last_name}',
            'visa': visa_dict
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/employee/<int:employee_id>', methods=['GET'])
def get_employee_visas(employee_id):
    """
    GET /api/visas/employee/<employee_id>
    
    Get all visa records for a specific employee, ordered by expiration date (most recent first).
    
    Returns:
        JSON with list of visa records
    """
    try:
        # Check if employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({
                'success': False,
                'error': f'Employee with id {employee_id} not found'
            }), 404
        
        # Get all visas for this employee
        visas = Visa.query.filter_by(employee_id=employee_id)\
                          .order_by(desc(Visa.expiration_date))\
                          .all()
        
        # Convert to dict and serialize dates
        visas_list = []
        for visa in visas:
            visa_dict = visa.to_dict()
            for key, value in visa_dict.items():
                if isinstance(value, (date, datetime)):
                    visa_dict[key] = value.isoformat()
            visas_list.append(visa_dict)
        
        return jsonify({
            'success': True,
            'count': len(visas_list),
            'visas': visas_list
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/<int:visa_id>', methods=['GET'])
def get_visa(visa_id):
    """
    GET /api/visas/<visa_id>
    
    Get details of a specific visa record.
    
    Returns:
        JSON with visa details
    """
    try:
        visa = Visa.query.get(visa_id)
        if not visa:
            return jsonify({
                'success': False,
                'error': f'Visa with id {visa_id} not found'
            }), 404
        
        # Convert to dict and serialize dates
        visa_dict = visa.to_dict()
        for key, value in visa_dict.items():
            if isinstance(value, (date, datetime)):
                visa_dict[key] = value.isoformat()
        
        return jsonify({
            'success': True,
            'visa': visa_dict
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/<int:visa_id>', methods=['PUT'])
def update_visa(visa_id):
    """
    PUT /api/visas/<visa_id>
    
    Update an existing visa record.
    
    Request Body (JSON):
        Any fields from the visa model to update
    
    Returns:
        JSON with success status and updated visa details
    """
    try:
        visa = Visa.query.get(visa_id)
        if not visa:
            return jsonify({
                'success': False,
                'error': f'Visa with id {visa_id} not found'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update date fields
        date_fields = {
            'start_date': data.get('start_date'),
            'expiration_date': data.get('expiration_date'),
            'prep_extension_date': data.get('prep_extension_date'),
            'max_h_period': data.get('max_h_period'),
            'document_expiry_i94': data.get('document_expiry_i94')
        }
        
        for field, value in date_fields.items():
            if value is not None:
                try:
                    setattr(visa, field, parse_date(value))
                except ValueError as e:
                    return jsonify({
                        'success': False,
                        'error': f'Invalid date format for {field}: {str(e)}'
                    }), 400
        
        # Update other fields
        updateable_fields = [
            'permanent_residency_notes', 'general_notes', 'soc_code', 
            'soc_description', 'department', 'employee_title', 'admin',
            'advisor_pi_chair', 'annual_salary', 'educational_level',
            'educational_field', 'filed_by', 'case_type'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(visa, field, data[field])
        
        # Recalculate status if expiration date changed
        if 'expiration_date' in date_fields and date_fields['expiration_date']:
            visa.status = calculate_visa_status(visa.expiration_date)
        
        # Commit changes
        db.session.commit()
        
        # Return updated visa
        visa_dict = visa.to_dict()
        for key, value in visa_dict.items():
            if isinstance(value, (date, datetime)):
                visa_dict[key] = value.isoformat()
        
        return jsonify({
            'success': True,
            'message': 'Visa record updated successfully',
            'visa': visa_dict
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/<int:visa_id>', methods=['DELETE'])
def delete_visa(visa_id):
    """
    DELETE /api/visas/<visa_id>
    
    Delete a visa record.
    
    Returns:
        JSON with success status
    """
    try:
        visa = Visa.query.get(visa_id)
        if not visa:
            return jsonify({
                'success': False,
                'error': f'Visa with id {visa_id} not found'
            }), 404
        
        employee_name = f"{visa.employee.first_name} {visa.employee.last_name}"
        
        # Delete the visa
        db.session.delete(visa)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Visa record deleted successfully for {employee_name}'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/all', methods=['GET'])
def get_all_visas():
    """
    GET /api/visas/all
    
    Get all visa records with optional filtering and pagination.
    
    Query Parameters:
        - status: Filter by visa status (valid, expired, expiring_soon, pending)
        - employee_id: Filter by employee ID
        - page: Page number (default: 1)
        - per_page: Items per page (default: 50)
    
    Returns:
        JSON with list of visas and pagination info
    """
    try:
        # Get query parameters
        status_filter = request.args.get('status')
        employee_id_filter = request.args.get('employee_id', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Build query
        query = Visa.query
        
        if status_filter:
            try:
                status_enum = VisaStatusEnum[status_filter]
                query = query.filter_by(status=status_enum)
            except KeyError:
                return jsonify({
                    'success': False,
                    'error': f'Invalid status: {status_filter}. Valid options: valid, expired, expiring_soon, pending'
                }), 400
        
        if employee_id_filter:
            query = query.filter_by(employee_id=employee_id_filter)
        
        # Order by expiration date (most recent first)
        query = query.order_by(desc(Visa.expiration_date))
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Convert to dict and serialize dates
        visas_list = []
        for visa in pagination.items:
            visa_dict = visa.to_dict()
            for key, value in visa_dict.items():
                if isinstance(value, (date, datetime)):
                    visa_dict[key] = value.isoformat()
            visas_list.append(visa_dict)
        
        return jsonify({
            'success': True,
            'visas': visas_list,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_pages': pagination.pages,
                'total_items': pagination.total
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/expiring-soon', methods=['GET'])
def get_expiring_visas():
    """
    GET /api/visas/expiring-soon
    
    Get all visas expiring within the next 90 days.
    
    Query Parameters:
        - days: Number of days threshold (default: 90)
    
    Returns:
        JSON with list of expiring visas
    """
    try:
        days_threshold = request.args.get('days', 90, type=int)
        
        # Get visas with expiring_soon status
        visas = Visa.query.filter_by(status=VisaStatusEnum.expiring_soon)\
                          .order_by(Visa.expiration_date)\
                          .all()
        
        # Convert to dict and serialize dates
        visas_list = []
        for visa in visas:
            visa_dict = visa.to_dict()
            
            # Add days remaining
            if visa.expiration_date:
                days_remaining = (visa.expiration_date - date.today()).days
                visa_dict['days_remaining'] = days_remaining
            
            for key, value in visa_dict.items():
                if isinstance(value, (date, datetime)):
                    visa_dict[key] = value.isoformat()
            
            visas_list.append(visa_dict)
        
        return jsonify({
            'success': True,
            'count': len(visas_list),
            'visas': visas_list
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@visa_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the visa service."""
    return jsonify({
        'success': True,
        'service': 'Visa Management Service',
        'status': 'online'
    }), 200
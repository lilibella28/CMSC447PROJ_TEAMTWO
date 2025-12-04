from flask import Blueprint, request, jsonify
from backend.app import db
from backend.app.models import Employee, VisaHistory
from datetime import datetime, date
from sqlalchemy import desc

# ============================================================================
# 💡 TO ENABLE AUTHENTICATION PROTECTION:
# 1. Uncomment the imports below
# 2. Uncomment the decorators on routes (see examples below)
# ============================================================================

# from backend.app.routes.auth_routes import login_required, role_required
# from backend.app.models import UserRoleEnum

visa_history_bp = Blueprint('visa_history', __name__, url_prefix="/api/employees")



# ============================================================================
# EXAMPLE: How to protect routes with authentication
# ============================================================================
# @visa_history_bp.route('/<int:employee_id>/visa-history', methods=['GET'])
# @login_required  # <-- Uncomment to require login
# def get_visa_history(employee_id):
#     ...
# ============================================================================

def parse_date(date_str):
    """Parse date string in various formats to date object."""
    if not date_str:
        return None

    # NEW FIX: Handle numeric or invalid Excel values
    # If value is 0, 0.0, NaN, or anything non-date-like
    if isinstance(date_str, (int, float)) and date_str <= 0:
        return None

    if isinstance(date_str, date):
        return date_str
    
    if isinstance(date_str, datetime):
        return date_str.date()

    s = str(date_str).strip()

    if s in ["", "nan", "NaT", "None", "0", "0000-00-00"]:
        return None

    date_formats = [
        '%Y-%m-%d',
        '%m/%d/%Y',
        '%d-%m-%Y',
        '%Y/%m/%d',
        '%m-%d-%Y',
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    
    raise ValueError(f"Unable to parse date: {date_str}")



@visa_history_bp.route('/<int:employee_id>/visa-history', methods=['GET'])
# @login_required  # Uncomment to enable authentication
def get_visa_history(employee_id):
    """
    GET /api/employees/<employee_id>/visa-history
    
    Retrieve all visa history records for a specific employee.
    Returns records sorted by start_date in descending order (most recent first).
    
    Response:
    {
        "success": true,
        "employee_id": 123,
        "employee_name": "John Smith",
        "visa_history": [
            {
                "id": 1,
                "visa_type": "H-1B",
                "status": "Active",
                "start_date": "2022-01-15",
                "expiration_date": "2025-01-14",
                "comments": "Current visa",
                "added_at": "2022-01-10T10:30:00Z",
                "added_by": "Sarah Johnson",
                "is_current": true
            }
        ],
        "total_records": 1
    }
    """
    try:
        # Check if employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({
                'success': False,
                'error': 'Employee not found',
                'employee_id': employee_id
            }), 404
        
        # Get all visa history records for this employee (already ordered by relationship)
        visa_history_records = VisaHistory.query.filter_by(
            employee_id=employee_id
        ).order_by(desc(VisaHistory.start_date)).all()
        
        # Convert to dictionary format
        history_data = [record.to_dict() for record in visa_history_records]
        
        return jsonify({
            'success': True,
            'employee_id': employee_id,
            'employee_name': f"{employee.first_name} {employee.last_name}",
            'visa_history': history_data,
            'total_records': len(history_data)
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching visa history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@visa_history_bp.route('/<int:employee_id>/visa-history', methods=['POST'])
# @role_required(UserRoleEnum.manager)  # Uncomment to enable authentication
def add_visa_history(employee_id):
    """
    POST /api/employees/<employee_id>/visa-history
    
    Add a new visa history record for an employee.
    
    Request Body:
    {
        "visa_type": "H-1B",
        "status": "Active",
        "start_date": "2022-01-15",
        "expiration_date": "2025-01-14",
        "comments": "Initial H-1B petition approved",
        "added_by": "Sarah Johnson",
        "is_current": true
    }
    
    Response:
    {
        "success": true,
        "message": "Visa history record added successfully",
        "visa_history": { ... }
    }
    """
    try:
        # Check if employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({
                'success': False,
                'error': 'Employee not found',
                'employee_id': employee_id
            }), 404
        
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['visa_type', 'status', 'start_date', 'expiration_date']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
        
        # Parse dates
        try:
            start_date = parse_date(data.get("start_date"))
            expiration_date = parse_date(data.get("expiration_date"))

        except ValueError as e:
            return jsonify({
                'success': False,
                'error': 'Invalid date format',
                'message': str(e)
            }), 400
        
        # Validate date logic
        if start_date >= expiration_date:
            return jsonify({
                'success': False,
                'error': 'Start date must be before expiration date'
            }), 400
        
        # Check for duplicate records (same visa type + start date)
        existing_record = VisaHistory.query.filter_by(
            employee_id=employee_id,
            visa_type=data['visa_type'],
            start_date=start_date
        ).first()
        
        if existing_record:
            return jsonify({
                'success': False,
                'error': 'Duplicate visa history record',
                'message': f'A visa history record for {data["visa_type"]} starting on {start_date} already exists'
            }), 409
        
        # If this is marked as current, unmark all other current visas
        is_current = data.get('is_current', False)
        if is_current:
            VisaHistory.query.filter_by(
                employee_id=employee_id,
                is_current=True
            ).update({'is_current': False})
            
            # Also update the Employee table with current visa info
            employee.visa_type = data['visa_type']
            employee.status = data['status']
            employee.visa_start_date = start_date
            employee.expiration_date = expiration_date
        
        # Create new visa history record
        new_record = VisaHistory(
            employee_id=employee_id,
            visa_type=data['visa_type'],
            status=data['status'],
            start_date=start_date,
            expiration_date=expiration_date,
            comments=data.get('comments', ''),
            added_by=data.get('added_by', 'System'),
            is_current=is_current
        )
        
        db.session.add(new_record)
        db.session.commit()
        
        print(f"✅ Added visa history record for employee {employee_id}: {new_record}")
        
        return jsonify({
            'success': True,
            'message': 'Visa history record added successfully',
            'visa_history': new_record.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error adding visa history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@visa_history_bp.route('/visa-history/<int:history_id>', methods=['PUT'])
# @role_required(UserRoleEnum.manager)  # Uncomment to enable authentication
def update_visa_history(history_id):
    """
    PUT /api/visa-history/<history_id>
    
    Update an existing visa history record.
    Can update: comments, status, expiration_date
    Cannot update: employee_id, visa_type, start_date, added_by, added_at
    
    Request Body:
    {
        "status": "Expired",
        "expiration_date": "2025-01-14",
        "comments": "Visa expired, renewal in progress"
    }
    
    Response:
    {
        "success": true,
        "message": "Visa history updated successfully",
        "visa_history": { ... }
    }
    """
    try:
        # Get the visa history record
        record = VisaHistory.query.get(history_id)
        if not record:
            return jsonify({
                'success': False,
                'error': 'Visa history record not found',
                'history_id': history_id
            }), 404
        
        # Get request data
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            record.status = data['status']
        
        if 'expiration_date' in data:
            try:
                record.expiration_date = parse_date(data['expiration_date'])
            except ValueError as e:
                return jsonify({
                    'success': False,
                    'error': 'Invalid date format',
                    'message': str(e)
                }), 400
        
        if 'comments' in data:
            record.comments = data['comments']
        
        # If updating current visa, sync with Employee table
        if record.is_current:
            employee = Employee.query.get(record.employee_id)
            if employee:
                if 'status' in data:
                    employee.status = data['status']
                if 'expiration_date' in data:
                    employee.expiration_date = record.expiration_date
        
        db.session.commit()
        
        print(f"✅ Updated visa history record {history_id}")
        
        return jsonify({
            'success': True,
            'message': 'Visa history updated successfully',
            'visa_history': record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating visa history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@visa_history_bp.route('/visa-history/<int:history_id>', methods=['DELETE'])
# @role_required(UserRoleEnum.admin)  # Uncomment to enable authentication (admin only)
def delete_visa_history(history_id):
    """
    DELETE /api/visa-history/<history_id>
    
    Delete a visa history record.
    Note: Cannot delete the current visa record.
    
    Response:
    {
        "success": true,
        "message": "Visa history record deleted successfully"
    }
    """
    try:
        # Get the visa history record
        record = VisaHistory.query.get(history_id)
        if not record:
            return jsonify({
                'success': False,
                'error': 'Visa history record not found',
                'history_id': history_id
            }), 404
        
        # Prevent deletion of current visa
        if record.is_current:
            return jsonify({
                'success': False,
                'error': 'Cannot delete current visa record',
                'message': 'Please update the employee with a new current visa before deleting this record'
            }), 403
        
        db.session.delete(record)
        db.session.commit()
        
        print(f"✅ Deleted visa history record {history_id}")
        
        return jsonify({
            'success': True,
            'message': 'Visa history record deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting visa history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


def normalize_date(d):
    if isinstance(d, date):
        return d
    if isinstance(d, datetime):
        return d.date()

    s = str(d).strip()

    # If it's already ISO format → return
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except:
        pass

    # Handle Excel-style MM/DD/YY or MM/DD/YYYY
    try:
        return datetime.strptime(s, "%m/%d/%y").date()
    except:
        pass

    try:
        return datetime.strptime(s, "%m/%d/%Y").date()
    except:
        pass

    raise ValueError(f"Invalid date format: {d}")

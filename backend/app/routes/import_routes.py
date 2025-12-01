from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
# Import only 'db', which is globally defined in backend.app
from flask_cors import cross_origin

from backend.app import db 
# Assuming backend.import_from_excel is a valid import path outside of the app package
from backend.import_from_excel import import_excel_sheet

import_bp = Blueprint('import', __name__)

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    """Checks if the filename has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@import_bp.route('/import-excel', methods=['POST'])
@cross_origin(origins="http://localhost:3000")  
def import_excel():
    """
    POST endpoint to import employee and visa data from Excel file.
    
    Returns:
        JSON with: newRecords, updatedRecords, skippedRecords, visasAdded
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Only .xlsx and .xls files are allowed.'
            }), 400
        
        # Get optional sheet name
        sheet_name = request.form.get('sheet_name', 'Current H-1B cases')
        
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # --- START FIX 2: Use current_app for config access ---
        # Get upload directory from application configuration
        upload_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)
        # --- END FIX 2 ---
        
        # Save file to uploads directory
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        
        # Import the Excel sheet
        try:
            # --- START FIX 2: Use current_app.app_context() ---
            # Using current_app.app_context() ensures Flask extensions (like db) are available
            with current_app.app_context():
                created_employees, updated_employees, created_visas = import_excel_sheet(
                    filepath, 
                    sheet_name=sheet_name
                )
            # --- END FIX 2 ---
            
            # Clean up: remove the uploaded file after processing
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'success': True,
                'newRecords': created_employees,
                'updatedRecords': updated_employees,
                'skippedRecords': 0, 
                'visasAdded': created_visas,
                'message': f'Successfully imported {created_employees} new employees, updated {updated_employees} employees, and added {created_visas} visa records.'
            }), 200
            
        except Exception as import_error:
            # Clean up file on error
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'success': False,
                'error': f'Error importing Excel file: {str(import_error)}'
            }), 500
    
    except Exception as e:
        # Note: If this is an expected error, you might log it here
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@import_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the import service."""
    return jsonify({
        'success': True,
        'service': 'Excel Import Service',
        'status': 'online'
    }), 200
import os
import sys
import pandas as pd
from datetime import datetime
from decimal import Decimal, InvalidOperation

# Ensure project root in path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import db
from backend.app.models import Employee, Visa


# ------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------

def to_date(val):
    """Safely convert Excel / string date to Python date or None."""
    if not val:
        return None

    s = str(val).strip()

    # Common invalid Excel content
    if s.lower() in ("nan", "nat", "null", "none", "", "-", "--", "tbd", "n/a", "na"):
        return None

    # Excel serial number
    try:
        if isinstance(val, (int, float)) and val > 60:
            return pd.to_datetime(val, unit="D", origin="1899-12-30").date()
    except Exception:
        pass

    # Normal parsing
    try:
        return pd.to_datetime(s, errors="raise").date()
    except Exception:
        return None



def to_decimal(val):
    """Convert salary or numeric strings."""
    if val is None or val == "" or str(val).lower() in ["nan", "nat"]:
        return None
    try:
        return Decimal(str(val).replace(",", "").strip())
    except InvalidOperation:
        return None


def clean(val):
    """Return None for blank/NA values."""
    if val is None:
        return None
    s = str(val).strip()
    if s.lower() in ["", "nan", "nat", "none"]:
        return None
    return s


def find_employee_by_email_or_name(email, first, last):
    """Find employee using email first, then name."""
    if email:
        found = Employee.query.filter(Employee.email.ilike(email.strip())).first()
        if found:
            return found

    if first and last:
        found = Employee.query.filter(
            Employee.first_name.ilike(first.strip()),
            Employee.last_name.ilike(last.strip())
        ).first()
        if found:
            return found

    return None


# ------------------------------------------------------------
# MAIN IMPORT FUNCTION
# ------------------------------------------------------------

def import_excel_sheet(xlsx_path: str, sheet_name="Current H-1B cases", commit_every=200):

    df = pd.read_excel(xlsx_path, sheet_name=sheet_name, dtype=str, keep_default_na=False)

    # Normalize column lookup
    cols = {c.lower().strip(): c for c in df.columns}

    def col(name):
        """Case-insensitive Excel column resolution."""
        return cols.get(name.lower(), None)

    created_emp = updated_emp = created_visas = 0
    
    # Canonicalize Case type
    
    case_lookup = {}
    
    def normalize_key(s: str | None):
        if not isinstance(s, str):
            return None
        return s.strip().lower()


    for i, row in df.iterrows():

        # ------------------------------------------
        # BASIC EMPLOYEE FIELDS
        # ------------------------------------------
        first = clean(row.get(col("First Name")))
        last = clean(row.get(col("Last name")))
        full_name = f"{first} {last}".strip()
        raw_email = clean(row.get(col("Employee's UMBC email")))

        if not raw_email:
    # create placeholder based on name
             raw_email = f"{clean(row.get(col('First Name'))).lower()}.{clean(row.get(col('Last Name'))).lower()}@umbc.edu"

        email = raw_email

        # email = clean(row.get(col("Employee's UMBC email")))
        personal = clean(row.get(col("Personal email")))
        gender = clean(row.get(col("Gender")))
        country = clean(row.get(col("Country of Birth")))
        citizenship = clean(row.get(col("All citizenship")))
        department = clean(row.get(col("Department")))
        employee_title = clean(row.get(col("Employee Title")))
        admin = clean(row.get(col("Department Admin")))
        advisor = clean(row.get(col("Department Advisor/PI/chair")))
        status_raw = clean(row.get(col("Status")))
        filed_by = clean(row.get(col("Filed by")))
        
        raw_case = clean(row.get(col("Case type")))
        key = normalize_key(raw_case)
        
        if key:
            if key in case_lookup:
                case_type = case_lookup[key]
            else:
                case_type = raw_case
                case_lookup[key] = case_type
        else:
            case_type = None
        
        case_type = clean(row.get(col("Case type")))
        i94_number = clean(row.get(col("I-94 Number")))
        sevis_id = clean(row.get(col("Sevis ID")))
        pr_status = clean(row.get(col("PR status")))
        pr_notes = clean(row.get(col("PR notes")))
        general_notes = clean(row.get(col("General notes")))
        highest_edu = clean(row.get(col("Employee Educational  Level")))
        field_study = clean(row.get(col("Employee Educational Field")))
        soc_code = clean(row.get(col("soc code")))
        soc_desc = clean(row.get(col("soc code description")))

        number_of_dependents = clean(row.get(col("number_of_dependents")))
        try:
            number_of_dependents = int(number_of_dependents) if number_of_dependents else None
        except:
            number_of_dependents = None

        # ------------------------------------------
        # DATE FIELDS
        # ------------------------------------------
        visa_start = to_date(row.get(col("Visa Start Date")))
        expiration_date = to_date(row.get(col("Expiration Date")))
        prep_ext = to_date(row.get(col("Prep extension date")))
        max_h_period = to_date(row.get(col("Max H period")))
        initial_start = to_date(row.get(col("initial H-1B start")))
        i94_expiry = to_date(row.get(col("Document Expiry I-94")))
        pr_filing = to_date(row.get(col("PR filing date")))

        # Salary
        annual_salary = to_decimal(row.get(col("Annual Salary")))

        # ------------------------------------------
        # MATCH OR CREATE EMPLOYEE
        # ------------------------------------------
        emp = find_employee_by_email_or_name(email, first, last)

        # Build clean field map for employee
        field_map = {
            "first_name": first,
            "last_name": last,
            "full_name": full_name,
            "email": email,
            "personal_email": personal,
            "gender": gender,
            "country_of_birth": country,
            "citizenship": citizenship,
            "department": department,
            "employee_title": employee_title,
            "department_admin": admin,
            "department_advisor": advisor,
            "annual_salary": annual_salary,
            "visa_type": case_type,
            "status": status_raw,
            "filed_by": filed_by,
            "case_type": case_type,
            "i94_number": i94_number,
            "sevis_id": sevis_id,
            "expiration_date": expiration_date,
            "visa_start_date": visa_start,
            "initial_h1b_start_date": initial_start,
            "prep_extension_date": prep_ext,
            "max_h_period": max_h_period,
            "i94_expiry_date": i94_expiry,
            "pr_filing_date": pr_filing,
            "pr_status": pr_status,
            "pr_notes": pr_notes,
            "highest_education": highest_edu,
            "field_of_study": field_study,
            "soc_code": soc_code,
            "soc_code_description": soc_desc,
            "general_notes": general_notes,
            "number_of_dependents": number_of_dependents,
        }

        if emp:
            # ———————————————— UPDATE EMPLOYEE ————————————————
            for attr, value in field_map.items():
                if value not in [None, "", "nan", "NaT"]:
                    setattr(emp, attr, value)
            updated_emp += 1

        else:
            # ———————————————— NEW EMPLOYEE ————————————————
            cleaned_data = {
                attr: (value if value not in [None, "", "nan", "NaT"] else None)
                for attr, value in field_map.items()
            }

            emp = Employee(**cleaned_data)
            db.session.add(emp)
            db.session.flush()
            created_emp += 1

        # ------------------------------------------
        # CREATE VISA ENTRY
        # ------------------------------------------
        visa = Visa(
            employee_id=emp.id,
            start_date=visa_start,
            expiration_date=expiration_date,
            prep_extension_date=prep_ext,
            max_h_period=max_h_period,
            document_expiry_i94=i94_expiry,
            general_notes=general_notes,
            permanent_residency_notes=pr_notes,
            soc_code=soc_code,
            soc_description=soc_desc,
            department=department,
            employee_title=employee_title,
            admin=admin,
            advisor_pi_chair=advisor,
            annual_salary=annual_salary,
            educational_level=highest_edu,
            educational_field=field_study,
            filed_by=filed_by,
            case_type=case_type,
        )

        db.session.add(visa)
        created_visas += 1

        if (i + 1) % commit_every == 0:
            db.session.commit()

    # FINAL COMMIT
    db.session.commit()

    print(f"\nImport complete:")
    print(f" - Employees created: {created_emp}")
    print(f" - Employees updated: {updated_emp}")
    print(f" - Visas added:       {created_visas}")

    return created_emp, updated_emp, created_visas







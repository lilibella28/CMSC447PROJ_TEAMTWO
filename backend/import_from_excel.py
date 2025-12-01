import os, sys
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pandas as pd
from datetime import datetime, date
from decimal import Decimal, InvalidOperation

from backend.app import db              
from backend.app.models import Employee, Visa


def to_date(val):
    if val is None:
        return None
    # common fast paths
    if isinstance(val, datetime):
        return val.date()
    s = str(val).strip()
    if not s or s.lower() in {"nat", "none", "nan"}:
        return None
    try:
        # try strict parse
        dt = pd.to_datetime(s, errors="coerce")
        if pd.isna(dt):
            return None

        return dt.date() if hasattr(dt, "date") else dt
    except Exception:
        return None

def none_if_nat(val):
    """Convert Pandas NaT/NaN to None (useful for optional datetime fields)."""
    try:
        return None if val is pd.NaT or pd.isna(val) else val
    except Exception:
        return val

def to_decimal(val):
    if pd.isna(val) or val is None or str(val).strip() == "":
        return None
    try:
        return Decimal(str(val).replace(",", "").strip())
    except (InvalidOperation, ValueError):
        return None

"""
def get_or_create_visa_type(name: str, default_alert=6):
    if not name:
        name = "H-1B"
    vt = VisaType.query.filter_by(name=name).first()
    if not vt:
        vt = VisaType(name=name, alert_period=default_alert)
        db.session.add(vt)
        db.session.flush()
    return vt
"""

def find_employee_by_email_or_name(email, first_name, last_name):

    if email:
        e = Employee.query.filter(Employee.email.ilike(email.strip())).first()
        if e:
            return e

    if first_name and last_name:
        e = (Employee.query
             .filter(Employee.first_name.ilike(first_name.strip()),
                     Employee.last_name.ilike(last_name.strip()))
             .first())
        if e:
            return e
    return None

def import_excel_sheet(xlsx_path: str, sheet_name="Current H-1B cases", commit_every=200):

    df = pd.read_excel(xlsx_path, sheet_name=sheet_name, dtype=str, keep_default_na=False)


    cols = {c.lower().strip(): c for c in df.columns}

    def col(key): 
        return cols.get(key.lower())

    """
    # Pre-resolve visa type used in this sheet (most rows are H-1B)
    default_vt = get_or_create_visa_type("H-1B", default_alert=6)
    """

    created_emp = updated_emp = created_visa = 0

    for i, row in df.iterrows():
        first_name = (row.get(col("First Name")) or "").strip()
        last_name  = (row.get(col("Last name")) or "").strip()
        email = (row.get(col("Employee's UMBC email")) or "").strip()
        personal   = (row.get(col("Personal email")) or "").strip()
        country    = (row.get(col("Country of Birth")) or "").strip()
        citizenship= (row.get(col("All Citizenships")) or "").strip()
        gender     = (row.get(col("Gender")) or "").strip()

        dependents = row.get(col("Dependents"))
        try:
            dependents = int(dependents) if pd.notna(dependents) else None
        except Exception:
            dependents = None

        initial_h1b_start = to_date(row.get(col("initial H-1B start")))

        emp = find_employee_by_email_or_name(email, first_name, last_name)
        if emp:
            changed = False
            for attr, value in [
                ("personal_email", personal or emp.personal_email),
                ("country_of_birth", country or emp.country_of_birth),
                ("citizenship", citizenship or emp.citizenship),
                ("gender", gender or emp.gender),
                ("dependents", dependents if dependents is not None else emp.dependents),
                ("initial_h1b_start", initial_h1b_start or emp.initial_h1b_start),
            ]:
                setattr(emp, attr, value)
                changed = True
            if changed:
                updated_emp += 1
        else:
            emp = Employee(
                first_name=first_name,
                last_name=last_name,
                email=email or None,
                personal_email=personal or None,
                country_of_birth=country or None,
                citizenship=citizenship or None,
                gender=gender or None,
                dependents=dependents,
                initial_h1b_start=initial_h1b_start,
            )
            db.session.add(emp)
            db.session.flush() 
            created_emp += 1

        # Visa fields
        start_date          = to_date(row.get(col("Start date")))
        expiration_date     = to_date(row.get(col("Expiration Date")))
        prep_extension_date = to_date(row.get(col("Prep extension date")))
        max_h_period        = to_date(row.get(col("Max H period")))
        i94_expiry          = to_date(row.get(col("Document Expiry I-94")))
        general_notes       = (row.get(col("General notes")) or None)
        permanent_residency_notes = (row.get(col("Permanent residency notes")) or None)

        soc_code            = (row.get(col("soc code")) or None)
        soc_desc            = (row.get(col("soc code description")) or None)
        department          = (row.get(col("Department")) or None)
        employee_title      = (row.get(col("Employee Title")) or None)
        admin               = (row.get(col("Department Admin")) or None)
        advisor             = (row.get(col("Department Advisor/PI/chair")) or None)
        annual_salary       = to_decimal(row.get(col("Annual Salary")))
        edu_level           = (row.get(col("Employee Educational  Level")) or None)
        edu_field           = (row.get(col("Employee Educational Field")) or None)
        filed_by            = (row.get(col("Filed by")) or None)
        case_type           = (row.get(col("Case type")) or None)

        """
        # Visa type: try sheet column if present, else default H-1B
        vt_name_col = col("Visa Type") or col("Case type")  # sometimes case type includes "H-1B extension"
        visa_type_obj = default_vt
        if vt_name_col:
            vt_name_raw = row.get(vt_name_col)
            if vt_name_raw and isinstance(vt_name_raw, str):
                # extract base type like "H-1B" from "H-1B extension"
                base = vt_name_raw.split()[0].strip().upper().replace(",", "")
                if base in {"H-1B", "F-1", "J-1", "L-1", "O-1", "TN"}:
                    visa_type_obj = get_or_create_visa_type(base, default_alert=6 if base in {"H-1B","L-1","O-1"} else 4)
        """

        visa = Visa(
            employee_id=emp.id,
            start_date=start_date,
            expiration_date=expiration_date,
            prep_extension_date=prep_extension_date,
            max_h_period=max_h_period,
            document_expiry_i94=i94_expiry,
            general_notes=general_notes,
            permanent_residency_notes=permanent_residency_notes,
            soc_code=soc_code,
            soc_description=soc_desc,
            department=department,
            employee_title=employee_title,
            admin=admin,
            advisor_pi_chair=advisor,
            annual_salary=annual_salary,
            educational_level=edu_level,
            educational_field=edu_field,
            filed_by=filed_by,
            case_type=case_type,
        )
        db.session.add(visa)
        created_visa += 1

        if (i + 1) % commit_every == 0:
            db.session.commit()

    db.session.commit()
    print(f"Done. Employees: +{created_emp} new, ~{updated_emp} updated; Visas added: {created_visa}")
    return created_emp, updated_emp, created_visa

if __name__ == "__main__":
    
    
    import argparse
    from backend.app import app

    parser = argparse.ArgumentParser(
        description="Import Visa sheet from Excel into the database."
    )
    parser.add_argument("path", help="Path to the Excel file (e.g. 'Case tracking for CS class.xlsx')")
    parser.add_argument("--sheet", default="Current H-1B cases", help="Worksheet name")
    args = parser.parse_args()


    with app.app_context():
        from backend.import_from_excel import import_excel_sheet
        created, updated, visas = import_excel_sheet(args.path, sheet_name=args.sheet)

    print(f"Done. Employees: +{created} new, ~{updated} updated; Visas added: {visas}")
    
    
    
    
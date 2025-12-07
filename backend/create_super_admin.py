"""
Create Super Admin User

This script creates the first administrator user for the system.
Run this once after setting up the database.

Usage:
    python create_super_admin.py
"""

import os
import sys

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app, db
from backend.app.models import User, UserRoleEnum
from getpass import getpass


def create_super_admin():
    """Interactive script to create the first administrator user"""

    print("=" * 60)
    print("CREATE ADMINISTRATOR USER")
    print("=" * 60)
    print()

    app = create_app()

    with app.app_context():
        # Check if any administrator already exists
        existing_admin = User.query.filter_by(role=UserRoleEnum.super_admin).first()

        if existing_admin:
            print(f"⚠️  An administrator already exists: {existing_admin.username}")
            response = input("Do you want to create another administrator? (yes/no): ").strip().lower()
            if response not in ['yes', 'y']:
                print("Aborted.")
                return
            print()

        # Get user input
        print("Enter administrator details:")
        print("-" * 60)

        username = input("Username: ").strip()
        if not username:
            print("❌ Username cannot be empty")
            return

        # Check if username exists
        if User.query.filter_by(username=username).first():
            print(f"❌ Username '{username}' already exists")
            return

        email = input("Email: ").strip()
        if not email:
            print("❌ Email cannot be empty")
            return

        # Check if email exists
        if User.query.filter_by(email=email).first():
            print(f"❌ Email '{email}' already exists")
            return

        first_name = input("First Name (optional): ").strip() or None
        last_name = input("Last Name (optional): ").strip() or None

        # Get password
        while True:
            password = getpass("Password (min 8 characters): ")
            if len(password) < 8:
                print("❌ Password must be at least 8 characters long")
                continue

            password_confirm = getpass("Confirm Password: ")
            if password != password_confirm:
                print("❌ Passwords do not match")
                continue

            break

        print()
        print("-" * 60)
        print("Creating administrator user...")

        # Create administrator account
        admin_user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=UserRoleEnum.super_admin,   # ✅ FIXED HERE
            is_active=True
        )

        admin_user.set_password(password)

        db.session.add(admin_user)
        db.session.commit()

        print()
        print("✅ Administrator created successfully!")
        print()
        print("=" * 60)
        print("ADMINISTRATOR DETAILS")
        print("=" * 60)
        print(f"ID:         {admin_user.id}")
        print(f"Username:   {admin_user.username}")
        print(f"Email:      {admin_user.email}")
        print(f"First Name: {admin_user.first_name or 'N/A'}")
        print(f"Last Name:  {admin_user.last_name or 'N/A'}")
        print(f"Role:       {admin_user.role.value}")
        print(f"Active:     {admin_user.is_active}")
        print(f"Created:    {admin_user.created_at}")
        print("=" * 60)
        print()
        print("You can now login with these administrator credentials.")
        print()


if __name__ == "__main__":
    try:
        create_super_admin()
    except KeyboardInterrupt:
        print("\n\nAborted by user.")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

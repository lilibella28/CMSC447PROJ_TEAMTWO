import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "visa_db")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

def create_database():
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD or None,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
            print(f"✅ Database '{DB_NAME}' created successfully!")
        else:
            print(f"⚠️ Database '{DB_NAME}' already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print("❌ Error creating database:", e)

if __name__ == "__main__":
    create_database()

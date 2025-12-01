import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "visa_db")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

try:
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("Terminating active connections...")
    cur.execute(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='{DB_NAME}'")

    print(f"Dropping database '{DB_NAME}'...")
    cur.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")

    print("✔️ Database deleted successfully!")

    cur.close()
    conn.close()

except Exception as e:
    print("❌ Error:", e)

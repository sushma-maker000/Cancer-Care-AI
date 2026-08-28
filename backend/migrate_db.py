import sqlite3, os

db_path = os.path.join(os.path.dirname(__file__), "..", "cancercare.db")
if not os.path.exists(db_path):
    db_path = "cancercare.db"

print(f"Connecting to database at {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE patients ADD COLUMN patient_phone VARCHAR(50) DEFAULT '+91 98765 12345'")
    conn.commit()
    print("SUCCESS: Added patient_phone column to patients table!")
except Exception as e:
    print("Notice:", e)

conn.close()

from flask import Flask, jsonify, request
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# ------------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.errorhandler(Exception)
def handle_all_errors(e):
    response = jsonify({"error": str(e)})
    response.status_code = 500
    return response

# ------------------------------------------------------------------
@app.route("/createtable")
def createtable():
    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospitals(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        city TEXT,
        phone TEXT,
        general INTEGER,
        icu INTEGER,
        oxygen INTEGER,
        ventilator INTEGER
    )
    """)
    conn.commit()
    conn.close()
    return "Table created successfully"

# ------------------------------------------------------------------
@app.route("/createusertable")
def createusertable():
    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        password TEXT,
        role TEXT
    )
    """)
    conn.commit()
    conn.close()
    return "User table created successfully"

# ------------------------------------------------------------------
@app.route("/createsavedtable")
def createsavedtable():
    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_hospitals(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        hospital_id INTEGER,
        UNIQUE(user_id, hospital_id)
    )
    """)
    conn.commit()
    conn.close()
    return "Saved hospitals table created successfully"

# ------------------------------------------------------------------
@app.route("/addhospitals")
def addhospitals():
    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()

    hospitals_data = [
        ("Krishna Hospital", "Karad", "02164-241-100", 20, 5, 15, 2),
        ("Sanjeevani Multispeciality Hospital", "Karad", "02164-225-566", 12, 2, 8, 0),
        ("Karad Civil Hospital", "Karad", "02164-220-233", 30, 6, 22, 3),
        ("Yashwant Hospital", "Karad", "02164-232-410", 6, 0, 4, 0),
        ("Sarwoday Hospital", "Satara", "02162-234-500", 18, 4, 14, 1),
        ("Satara Civil Hospital", "Satara", "02162-233-333", 45, 8, 35, 4),
        ("Om Sai Multispeciality Hospital", "Satara", "02162-240-121", 9, 1, 6, 0),
        ("Sant Ramdas Hospital", "Satara", "02162-227-745", 5, 0, 3, 0),
    ]

    cursor.executemany("""
        INSERT INTO hospitals (name, city, phone, general, icu, oxygen, ventilator)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, hospitals_data)

    conn.commit()
    conn.close()
    return "Hospitals added successfully"

# ------------------------------------------------------------------
@app.route("/api/hospitals")
def get_hospitals():
    conn = sqlite3.connect("hospital_tracker.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospitals")
    rows = cursor.fetchall()
    conn.close()

    hospitals_list = []
    for row in rows:
        hospitals_list.append(dict(row))

    return jsonify(hospitals_list)

# ------------------------------------------------------------------
@app.route("/api/hospitals/<int:hospital_id>")
def get_hospital(hospital_id):
    conn = sqlite3.connect("hospital_tracker.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospitals WHERE id = ?", (hospital_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "Hospital not found"}), 404

    return jsonify(dict(row))

# ------------------------------------------------------------------
@app.route("/api/hospitals/<int:hospital_id>", methods=["PUT"])
def update_hospital(hospital_id):
    data = request.get_json()

    general = data["general"]
    icu = data["icu"]
    oxygen = data["oxygen"]
    ventilator = data["ventilator"]

    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE hospitals
        SET general = ?, icu = ?, oxygen = ?, ventilator = ?
        WHERE id = ?
    """, (general, icu, oxygen, ventilator, hospital_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Bed counts updated successfully"})

# ------------------------------------------------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data["fullName"]
    email = data["email"]
    phone = data["phone"]
    password = data["password"]
    role = data["role"]

    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_password = generate_password_hash(password)
    cursor.execute("""
        INSERT INTO users (full_name, email, phone, password, role)
        VALUES (?, ?, ?, ?, ?)
    """, (full_name, email, phone, hashed_password, role))
    conn.commit()
    conn.close()

    return jsonify({"message": "Account created successfully"})

# ------------------------------------------------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]

    conn = sqlite3.connect("hospital_tracker.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "Invalid email or password"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "fullName": user["full_name"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"]
        }
    })

# ------------------------------------------------------------------
@app.route("/api/saved", methods=["POST"])
def save_hospital():
    data = request.get_json()
    user_id = data["userId"]
    hospital_id = data["hospitalId"]

    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO saved_hospitals (user_id, hospital_id)
        VALUES (?, ?)
    """, (user_id, hospital_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Hospital saved successfully"})

# ------------------------------------------------------------------
@app.route("/api/saved/<int:user_id>")
def get_saved(user_id):
    conn = sqlite3.connect("hospital_tracker.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT hospitals.* FROM hospitals
        JOIN saved_hospitals ON hospitals.id = saved_hospitals.hospital_id
        WHERE saved_hospitals.user_id = ?
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])

# ------------------------------------------------------------------
@app.route("/api/saved/<int:user_id>/<int:hospital_id>", methods=["DELETE"])
def remove_saved(user_id, hospital_id):
    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM saved_hospitals WHERE user_id = ? AND hospital_id = ?
    """, (user_id, hospital_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Hospital removed from saved list"})

# ------------------------------------------------------------------
@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    full_name = data["fullName"]
    phone = data["phone"]

    conn = sqlite3.connect("hospital_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users SET full_name = ?, phone = ? WHERE id = ?
    """, (full_name, phone, user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully"})

# ------------------------------------------------------------------
@app.route("/api/change-password", methods=["POST"])
def change_password():
    data = request.get_json()
    user_id = data["userId"]
    current_password = data["currentPassword"]
    new_password = data["newPassword"]

    conn = sqlite3.connect("hospital_tracker.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if user is None or not check_password_hash(user["password"], current_password):
        conn.close()
        return jsonify({"error": "Current password is incorrect"}), 401

    new_hash = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Password changed successfully"})

@app.route("/api/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    return jsonify({}), 200
# ------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
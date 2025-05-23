import sqlite3

# Connect to SQLite database (or create if it doesn't exist)
conn = sqlite3.connect('mydatabase.db')
cursor = conn.cursor()

# Create students table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        class TEXT NOT NULL,
        marks INTEGER
    )
''')

# Create enrolled table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS enrolled (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        course1 TEXT NOT NULL,
        course2 TEXT NOT NULL,
        FOREIGN KEY (username) REFERENCES students(username)
    )
''')

# Insert sample students
sample_students = [
    ('Rahul Sharma', 'rahul123', 'pass123', '10A', 89),
    ('Priya Verma', 'priya456', 'secure456', '10B', 92),
    ('Amit Gupta', 'amit789', 'amitpass', '9C', 85)
]

cursor.executemany('''
    INSERT OR IGNORE INTO students (name, username, password, class, marks)
    VALUES (?, ?, ?, ?, ?)
''', sample_students)

# Insert sample enrolled records
sample_enrollments = [
    ('rahul123', 'C101', 'C102'),
    ('priya456', 'C103', 'C104')
]

cursor.executemany('''
    INSERT INTO enrolled (username, course1, course2)
    VALUES (?, ?, ?)
''', sample_enrollments)

# Commit and close
conn.commit()
conn.close()

print("SQLite database and sample data initialized.")

const express = require('express');
const session = require('express-session');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const cors = require('cors');
const port = 3000; // Use a different port than 3306 (MySQL default)

//App setup
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'yhs&$fa^5ff69%',
  resave: false,
  saveUninitialized: true,
}));

// SQLite connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite3:', err.message);
  } else {
    console.log('✅ Connected to SQLite3 database');
  }
});

// Create tables and insert sample data
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    username TEXT PRIMARY KEY,
    student_name TEXT,
    password TEXT,
    class TEXT,
    marks INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enrolled (
    username TEXT PRIMARY KEY,
    course1 TEXT,
    course2 TEXT
  )`);

  // Insert sample student
  db.run(`INSERT OR IGNORE INTO students (username, student_name, password, class, marks)
          VALUES ('john123', 'John Doe', 'pass123', '10', 85)`);
});

// Load courses from JSON
let courses = [];
const loadCourses = () => {
  try {
    const data = fs.readFileSync('courses.json', 'utf-8');
    courses = JSON.parse(data);
    console.log('Courses loaded successfully');
  } catch (err) {
    courses = [];
    console.log('No courses.json found. Starting with empty list.');
  }
};
const saveCourses = () => {
  fs.writeFileSync('courses.json', JSON.stringify(courses, null, 2));
};

// Admin credentials
const ADMIN_USER = "user";
const ADMIN_PASS = "pass";

loadCourses();

// Routes (update DB queries below to SQLite syntax)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.redirect('/admin');
  }
  const query = 'SELECT * FROM students WHERE username = ? AND password = ?';
  db.get(query, [username, password], (err, row) => {
    if (err) return res.status(500).send('Internal DB Error');
    if (row) {
      req.session.username = username;
      return res.redirect('/register');
    } else {
      return res.redirect('/');
    }
  });
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/choice.html')));
app.get('/add-student', (req, res) => res.sendFile(path.join(__dirname, 'student/add-student.html')));
app.get('/alter-student', (req, res) => res.sendFile(path.join(__dirname, 'student/alter-student.html')));
app.get('/display-std', (req, res) => res.sendFile(path.join(__dirname, 'student/display-std.html')));
app.get('/alter-course', (req, res) => res.sendFile(path.join(__dirname, 'course/alter-course.html')));
app.get('/display-cou', (req, res) => res.sendFile(path.join(__dirname, 'course/display-cou.html')));
app.get('/add-course', (req, res) => res.sendFile(path.join(__dirname, 'course/add-course.html')));

app.get('/courses', (req, res) => res.json(courses));

app.post('/add-course', (req, res) => {
  const inputData = req.body;
  if (!inputData.courseName || !inputData.courseDescription || !inputData.courseDuration) {
    return res.status(400).send({ error: 'Missing course details' });
  }
  const newCourse = {
    id: (courses.length + 101).toString(),
    name: inputData.courseName,
    description: inputData.courseDescription,
    duration: inputData.courseDuration,
  };
  courses.push(newCourse);
  saveCourses();
  res.json({ message: 'Course added successfully', redirect: true });
});

app.post('/update-course', (req, res) => {
  const { courseId, courseName, description, duration } = req.body;
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.name = courseName;
    course.description = description;
    course.duration = duration;
    saveCourses();
    res.json({ message: 'Course updated successfully', redirect: true });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.post('/delete-course', (req, res) => {
  const { courseId } = req.body;
  const index = courses.findIndex(c => c.id === courseId);
  if (index !== -1) {
    courses.splice(index, 1);
    saveCourses();
    res.json({ message: 'Course deleted successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.post('/add-students', (req, res) => {
  const { student_name, username, password, class: studentClass, marks } = req.body;
  const insertQuery = `INSERT INTO students (student_name, username, password, class, marks) VALUES (?, ?, ?, ?, ?)`;
  db.run(insertQuery, [student_name, username, password, studentClass, marks], function(err) {
    if (err) {
      console.error('Insert error:', err);
      res.send('Database error.');
    } else {
      res.send('Student added successfully.');
    }
  });
});

app.post('/update-student', (req, res) => {
  const { username, studentName, password, class: studentClass, marks } = req.body;
  const query = `UPDATE students SET student_name=?, password=?, class=?, marks=? WHERE username=?`;
  db.run(query, [studentName, password, studentClass, marks, username], function(err) {
    if (err) return res.status(500).send('Update error');
    if (this.changes === 0) return res.status(404).send('Student not found');
    res.send('Student updated successfully');
  });
});

app.post('/delete-student', (req, res) => {
  const { username } = req.body;
  const query = `DELETE FROM students WHERE username = ?`;
  db.run(query, [username], function(err) {
    if (err) return res.status(500).send('Delete error');
    if (this.changes === 0) return res.status(404).send('Student not found');
    res.send('Student deleted successfully');
  });
});

app.get('/display-students', (req, res) => {
  db.all('SELECT student_name, username, class, marks FROM students', [], (err, rows) => {
    if (err) return res.status(500).send('Fetch error');
    res.json(rows);
  });
});

app.post('/submit', (req, res) => {
  const username = req.session.username;
  const { course } = req.body;
  if (Array.isArray(course) && course.length === 2) {
    const query = 'INSERT OR REPLACE INTO enrolled (username, course1, course2) VALUES (?, ?, ?)';
    db.run(query, [username, course[0], course[1]], function(err) {
      if (err) {
        console.error('Submit error:', err.message);
        return res.status(500).send('Failed to register courses.');
      }
      res.send(`<h2>You have successfully registered for courses: ${course.join(' and ')}</h2>`);
    });
  } else {
    res.send('<h2>Please select exactly two courses.</h2>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout error');
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

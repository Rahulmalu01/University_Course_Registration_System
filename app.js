const express = require('express');
const session = require('express-session');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const app = express();
const cors = require('cors');
const port = 3306;

//App ka use
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'yhs&$fa^5ff69%',
  resave: false,
  saveUninitialized: true,
}));

//Variables defined
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root@rahul',
  database: 'mydatabase'
});
let courses = [];

//Admin login credential
const ADMIN_USER = "user";
const ADMIN_PASS = "pass";

//Extracting courses and required changes are saved
const loadCourses = () => {
  try {
    const data = fs.readFileSync('courses.json', 'utf-8');
    courses = JSON.parse(data);
    console.log('Courses loaded successfully from courses.json');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No existing courses file found. Starting with an empty list.');
      courses = [];
    } else {
      console.error('Error reading courses file:', err);
    }
  }
};
const saveCourses = () => {
  fs.writeFileSync('courses.json', JSON.stringify(courses, null, 2), (err) => {
    if (err) {
      console.error('Error saving courses to file:', err);
    } else {
      console.log('Courses saved to courses.json');
    }
  });
};

//Database connection MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

loadCourses();
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
      return res.redirect('/admin');
  }
  const query = 'SELECT * FROM students WHERE username = ? AND password = ?';
  const query1 = 'SELECT * FROM enrolled WHERE username = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    if (results.length > 0) {
      req.session.username = username;
      return res.redirect('/register');
    } else {
      return res.redirect('/');
    }
  });
});

//Redirect to the admin page if the user is logged in
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

//Redirect for student 
app.get('/add-student', (req, res) => {
  res.sendFile(path.join(__dirname, 'student/add-student.html'));}); //Add students

app.get('/alter-student', (req, res) => {
  res.sendFile(path.join(__dirname, 'student/alter-student.html'));});//Alter students

app.get('/display-std', (req, res) => {
  res.sendFile(path.join(__dirname, 'student/display-std.html'));});

//Redirect for courses
app.get('/alter-course', (req, res) => {
  res.sendFile(path.join(__dirname, 'course/alter-course.html'));});//Alter courses

app.get('/display-cou', (req, res) => {
  res.sendFile(path.join(__dirname, 'course/display-cou.html'));});

app.get('/add-course', (req, res) => {
  res.sendFile(path.join(__dirname, 'course/add-course.html'));});//Add courses

//Redirect main pages
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/choice.html'));});

//Display all the courses on screen 
app.get('/courses', (req, res) => {
  res.json(courses);});

//Add a new course in the database
app.post('/add-course', (req, res) => {
  const inputData = req.body;
  if (!inputData.courseName || !inputData.courseDescription || !inputData.courseDuration) {
      return res.status(400).send({ error: 'Missing required fields: courseName, courseDescription, or courseDuration.' });
  }
  const newCourse = {
      id: (courses.length + 101).toString(),
      name: inputData.courseName,
      description: inputData.courseDescription,
      duration: inputData.courseDuration,};
  courses.push(newCourse);
  saveCourses();
  res.json({ message: 'Course added successfully', redirect: true });
});

//Update a course in the database
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
      res.status(404).json({ message: 'Course not found', redirect: false });
  }
});

//Delete a course from database
app.post('/delete-course', (req, res) => {
    const { courseId } = req.body;
    const index = courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
        courses.splice(index, 1);
        saveCourses();
        res.json({ message: 'Course deleted successfully', redirect: true });
    } else {
        res.status(404).json({ message: 'Course not found', redirect: false });
    }
});

// Add a new student in the database
app.post('/add-students', (req, res) => {
  const { student_name, username, password, class: studentClass, marks } = req.body;

  // Insert data into the database
  const insertQuery = `INSERT INTO enrolled (student_name, username, password, class, marks) VALUES (?, ?, ?, ?, ?)`;

  db.query(insertQuery, [student_name, username, password, studentClass, marks], (err) => {
      if (err) {
          console.error('Error inserting data:', err);
          res.send('Error saving data to the database.');
      } else {
          console.log('Data successfully inserted');
          res.send('Student information successfully stored in the database.');
      }
  });
});

// Update a student information
app.post('/update-student', (req, res) => {
  const { username, studentName, password, class: studentClass, marks } = req.body;

  const query = `UPDATE students SET 
                 student_name = ?,
                 password = ?,
                 class = ?,
                 marks = ?
                 WHERE username = ?`;

  db.query(query, [studentName, password, studentClass, marks, username], (err, result) => {
      if (err) {
          console.error('Error updating student:', err);
          return res.status(500).send('Database error');
      }
      if (result.affectedRows === 0) {
          return res.status(404).send('Student not found');
      }
      res.send('Student details updated successfully');
  });
});

// Delete a student information
app.post('/delete-student', (req, res) => {
  const { username } = req.body;

  const query = `DELETE FROM students WHERE username = ?`;

  db.query(query, [username], (err, result) => {
      if (err) {
          console.error('Error deleting student:', err);
          return res.status(500).send('Database error');
      }

      if (result.affectedRows === 0) {
          return res.status(404).send('Student not found');
      }

      res.send('Student deleted successfully');
  });
});

// Display all students data
app.get('/display-students', (req, res) => {
  const query = 'SELECT name, username, class, marks FROM students';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching students:', err);
          res.status(500).send('Server error');
      } else {
          res.json(results);
      }
  });
});

//Student choice for course
app.post('/submit', (req, res) => {
  const username = req.session.username;  
  const { course } = req.body;
  if (Array.isArray(course) && course.length === 2) {
    const query = 'INSERT INTO enrolled (username, course1, course2) VALUES (?, ?, ?)';
    db.query(query, [username, course[0], course[1]], (err, results) => {
      if (err) {
        console.error('Error inserting into database:', err.message);
        return res.status(500).send('Failed to register courses.');
      }
      res.send(`<h2>You have successfully registered for courses with IDs: ${selectedCourses.join(' and ')}</h2>`);
      // res.redirect('/logout');
    });
  } else {
    res.send('<h2>Please select exactly two courses.</h2>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err.message);
      return res.status(500).send('Failed to log out.');
    }
    res.redirect('/');
  });
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

# Student Management System

This project is a **Student Management System** built with **Node.js**, **Express.js**, and **MySQL**. It allows administrators to manage students and courses, including adding, updating, deleting, and displaying student and course information. Students can register, log in, and select courses for enrollment.

## Features

- **Admin Authentication**: Admin users can log in using predefined credentials and manage student and course data.
- **Student Management**: Administrators can add, update, delete, and view student details such as name, username, class, and marks.
- **Course Management**: Administrators can manage courses (add, update, delete, and view course details).
- **Session Management**: The application uses sessions to keep track of logged-in users.
- **Student Registration**: Students can register for the system and select courses.
- **Responsive Frontend**: The application has a simple HTML frontend for interacting with the backend.

## Technology Stack

- **Backend**:
  - **Node.js**
  - **Express.js**
  - **MySQL** (for database management)
  - **Express-session** (for session management)
  - **CORS** (for cross-origin request handling)

- **Frontend**:
  - **HTML** (for user interfaces)
  - **CSS** (for styling)

## Installation

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (for running the server)
- [MySQL](https://www.mysql.com/) (for managing the database)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/student-management-system.git
   cd student-management-system
  ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up the MySQL Database**:

   * Create a MySQL database and name it `mydatabase`.
   * Set up the required tables:

     ```sql
     CREATE TABLE students (
         id INT AUTO_INCREMENT PRIMARY KEY,
         student_name VARCHAR(255),
         username VARCHAR(255) UNIQUE,
         password VARCHAR(255),
         class VARCHAR(255),
         marks DECIMAL(4,2)
     );

     CREATE TABLE courses (
         id INT AUTO_INCREMENT PRIMARY KEY,
         courseName VARCHAR(255),
         courseDescription TEXT,
         courseDuration VARCHAR(50)
     );

     CREATE TABLE enrolled (
         id INT AUTO_INCREMENT PRIMARY KEY,
         username VARCHAR(255),
         course1 VARCHAR(255),
         course2 VARCHAR(255)
     );
     ```

4. **Update database connection**:

   * In the backend code (`server.js`), update the `mysql.createConnection` with your MySQL credentials (username, password, database).

5. **Run the application**:

   ```bash
   npm start
   ```

6. The application should now be running on [http://localhost:5500](http://localhost:5500).

## Endpoints

### Public Routes:

* `GET /`: Displays the login page.
* `POST /login`: Logs in a user (either admin or student).
* `GET /register`: Displays a page for students to register for courses.
* `POST /submit`: Allows students to register for two courses.

### Admin Routes:

* `GET /admin`: Displays the admin management page.
* `GET /add-student`: Displays the form to add students.
* `POST /add-students`: Adds a new student to the database.
* `GET /alter-student`: Displays the form to update student details.
* `POST /update-student`: Updates student information.
* `POST /delete-student`: Deletes a student from the database.
* `GET /display-students`: Displays all students.

### Course Routes:

* `GET /add-course`: Displays the form to add a new course.
* `POST /add-course`: Adds a new course to the database.
* `GET /alter-course`: Displays the form to update course details.
* `POST /update-course`: Updates a course's information.
* `POST /delete-course`: Deletes a course from the database.
* `GET /display-cou`: Displays all courses.

## Security

* **Password Encryption**: For added security, it's recommended to hash the passwords before storing them in the database. Libraries like **bcrypt** can be used for this purpose.
* **SQL Injection Protection**: The app uses prepared statements for all database queries to prevent SQL injection attacks.

## Contributing

If you'd like to contribute to the development of this project, feel free to fork the repository and create a pull request with your changes.

### Steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Open a pull request to the `main` branch.


## Acknowledgments

* This project was inspired by various educational management systems.
* Special thanks to the **Node.js** and **Express.js** communities for their great documentation and support.

---

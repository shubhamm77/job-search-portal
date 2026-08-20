const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware settings
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Helps server to read JSON data

// MySQL database connection settings (fetching data from .env file)
/*const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});*/
const db = mysql.createConnection(mysql://avnadmin:AVNS_dPPIYAJ2Ee5gw_1KyXz@mysql-d99e0c3-shubhamkum18616-8f2b.e.aivencloud.com:17362/defaultdb?ssl-mode=REQUIRED);

// Connecting to the database
// Connecting to the database और ऑटोमैटिक टेबल क्रिएशन लॉजिक
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('MySQL database connected successfully!');

    // 1. Jobs Table अपने आप बनाने की क्वेरी
    const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        salary VARCHAR(100) DEFAULT 'Not Disclosed',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    // 2. Applications Table अपने आप बनाने की क्वेरी
    const createAppsTable = `
    CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );`;

    // टेबल्स को डेटाबेस में रन करना
    db.query(createJobsTable, (err) => {
        if (err) console.error('Error creating jobs table:', err);
        else {
            console.log('Jobs table is ready!');
            db.query(createAppsTable, (err) => {
                if (err) console.error('Error creating applications table:', err);
                else console.log('Applications table is ready!');
            });
        }
    });
});

// 1. API: Get all jobs (GET Request)
app.get('/api/jobs', (req, res) => {
    const query = 'SELECT * FROM jobs ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching jobs from database.' });
        }
        res.json(results);
    });
});

// 2. API: Post a new job (POST Request)
app.post('/api/jobs', (req, res) => {
    const { title, company, location, salary, description } = req.body;
    
    // Validation: Title and company name are required
    if (!title || !company) {
        return res.status(400).json({ error: 'Job title and company name are required.' });
    }

    const query = 'INSERT INTO jobs (title, company, location, salary, description) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, company, location || 'Ranchi', salary, description], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving job to database.' });
        }
        res.json({ message: 'Job posted successfully!', jobId: result.insertId });
    });
});

// 3. API: Submit a new job application (POST Request)
app.post('/api/applications', (req, res) => {
    const { job_id, student_name, student_email } = req.body;
    
    // Validation: All fields are required
    if (!job_id || !student_name || !student_email) {
        return res.status(400).json({ error: 'All fields (Job ID, Name, Email) are required.' });
    }

    const query = 'INSERT INTO applications (job_id, student_name, student_email) VALUES (?, ?, ?)';
    db.query(query, [job_id, student_name, student_email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving application to database.' });
        }
        res.json({ message: 'Application submitted successfully!', applicationId: result.insertId });
    });
});

// =======================================================
// [New Code Added Below] 4. API: Get all student applications for recruiters (GET Request)
// =======================================================
app.get('/api/applicants', (req, res) => {
    const query = `
        SELECT 
            a.id AS application_id,
            a.student_name,
            a.student_email,
            a.applied_at,
            j.title AS job_title,
            j.company AS company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        ORDER BY a.applied_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching applications from database.' });
        }
        res.json(results);
    });
});
// 5. API: Delete a job by its ID (DELETE Request)
app.delete('/api/jobs/:id', (req, res) => {
    const jobId = req.params.id;
    const query = 'DELETE FROM jobs WHERE id = ?';
    
    db.query(query, [jobId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error deleting job from database.' });
        }
        res.json({ message: 'Job deleted successfully!' });
    });
});

app.get("/",(req,res)=>{
    res.json({server:"fired up"});
})
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server started successfully on port ${PORT}.`);
});

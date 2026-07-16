console.log("App.js successfully loaded!");

// Backend server URL running on port 5000
const API_URL = 'https://job-search-portal-fnl4.onrender.com';/api/jobs

// Fetch data as soon as the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();
    fetchApplicants();
    
    // Handle the submit event of the job posting form
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', handleFormSubmit);
    }
});

// 1. Function to fetch jobs from database and display them on screen
async function fetchJobs() {
    const jobListContainer = document.getElementById('job-list');
    if (!jobListContainer) return;
    
    try {
        const response = await fetch(API_URL);
        const jobs = await response.json();
        
        if (jobs.length === 0) {
            jobListContainer.innerHTML = '<div class="loading">No jobs available at Ranchi right now.</div>';
            return;
        }
        
        jobListContainer.innerHTML = '';
        
        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            // yahana se change kiye hain ,,,,,,,,,,,,,,,,,,,,,
            jobCard.innerHTML = `
    <h3>${job.title}</h3>
    <div class="company-name">${job.company}</div>
    <div class="job-meta">
        <span>📍 ${job.location}</span>
        <span>💰 ${job.salary || 'Not Disclosed'}</span>
    </div>
    <p class="job-desc">${job.description || 'No description provided.'}</p>

    <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button class="apply-btn"
            onclick="openApplyModal(${job.id})"
            style="background: #2b6cb0; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Apply for Job
        </button>

        <button class="delete-btn"
            onclick="deleteJob(${job.id})"
            style="background: #e53e3e; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Delete Job
        </button>
    </div>
`;
            // iske uper tak change kiye hain ,,,,,,,,,,,,,,,,,,,,,,,,
            jobListContainer.appendChild(jobCard);
        });
        
    } catch (error) {
        console.error('Error fetching jobs:', error);
        jobListContainer.innerHTML = '<div class="loading" style="color: red;">Failed to connect to backend server. Make sure server is running on port 5000!</div>';
    }
}

// 2. Function to send new job to database through form
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const company = document.getElementById('company').value;
    const location = document.getElementById('location').value;
    const salary = document.getElementById('salary').value;
    const description = document.getElementById('description').value;
    
    const newJob = { title, company, location, salary, description };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newJob)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Success: ' + result.message);
            document.getElementById('job-form').reset();
            fetchJobs();
        } else {
            alert('Error: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error posting job:', error);
        alert('Could not post job. Check if server is running!');
    }
}

// Modal opening and closing logic
function openApplyModal(jobId) {
    document.getElementById('apply-job-id').value = jobId;
    document.getElementById('apply-modal').style.display = 'flex';
}

const closeModalBtn = document.getElementById('close-modal-btn');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        document.getElementById('apply-modal').style.display = 'none';
        document.getElementById('apply-form').reset();
    });
}

// Submit student application to database
const applyForm = document.getElementById('apply-form');
if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const job_id = document.getElementById('apply-job-id').value;
        const student_name = document.getElementById('student-name').value;
        const student_email = document.getElementById('student-email').value;
        
        const newApplication = { job_id, student_name, student_email };
        
        try {
            const response = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newApplication)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Success: ' + result.message);
                document.getElementById('apply-modal').style.display = 'none';
                document.getElementById('apply-form').reset();
                fetchApplicants(); // Update list instantly
            } else {
                alert('Error: ' + result.error);
            }
            
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Could not submit application. Check if server is running!');
        }
    });
}

// 3. Function to fetch and display student applications for recruiters
async function fetchApplicants() {
    const applicantsContainer = document.getElementById('applicants-list');
    if (!applicantsContainer) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/applicants');
        const applicants = await response.json();
        
        if (applicants.length === 0) {
            applicantsContainer.innerHTML = '<p style="color: #a0aec0; font-style: italic;">No applications received yet.</p>';
            return;
        }
        
        applicantsContainer.innerHTML = '';
        
        applicants.forEach(app => {
            const appRow = document.createElement('div');
            appRow.style.padding = '12px';
            appRow.style.borderBottom = '1px solid #edf2f7';
            appRow.style.marginBottom = '8px';
            
            appRow.innerHTML = `
                <div style="font-weight: bold; color: #2d3748; font-size: 15px;">${app.student_name}</div>
                <div style="color: #4a5568; font-size: 13px;">📧 ${app.student_email}</div>
                <div style="margin-top: 4px; font-size: 13px; color: #2b6cb0;">
                    Applied for: <strong>${app.job_title}</strong> (${app.company_name})
                </div>
            `;
            applicantsContainer.appendChild(appRow);
        });
        
    } catch (error) {
        console.error('Error fetching applicants:', error);
        applicantsContainer.innerHTML = '<p style="color: red; font-size: 13px;">Failed to load applications.</p>';
    }
}

//yahana se changes kiye,,,,,,,,,,,,,,,,,,,,,,,,,, 
// 4. Function to delete a job from database
async function deleteJob(jobId) {
    // यूजर से पक्का करने के लिए पूछना (Confirmation Pop-up)
    if (!confirm('Are you sure you want to delete this job posting?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Success: ' + result.message);
            fetchJobs();       // नौकरियों की लिस्ट को तुरंत अपडेट करना
            fetchApplicants(); // आवेदकों की लिस्ट को भी तुरंत अपडेट करना
        } else {
            alert('Error: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('Could not delete job. Check if server is running!');
    }
}

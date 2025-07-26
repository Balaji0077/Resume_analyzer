import React, { useEffect, useState } from 'react';
import UploadForm from './UploadForm';
import './ResumeDashboard.css';

const ResumeDashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/resumes')
      .then(res => res.json())
      .then(data => setResumes(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const handleViewDetails = (id) => {
    fetch(`http://localhost:5000/resumes/${id}`)
      .then(res => res.json())
      .then(data => setSelectedResume(data))
      .catch(err => console.error('Details fetch error:', err));
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>📄 All Resumes</h2>
        <ul className="resume-list">
          {resumes.map((resume) => (
            <li key={resume.id} className="resume-item">
              <span>{resume.file_name}</span>
              <button onClick={() => handleViewDetails(resume.id)}>View</button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <div className="upload-section">
          <UploadForm />
        </div>

        <div className="details-section">
          {selectedResume ? (
            <>
              <h3>Resume Details</h3>
              <p><strong>ID:</strong> {selectedResume.id}</p>
              <p><strong>File Name:</strong> {selectedResume.file_name}</p>
              <p><strong>Uploaded:</strong> {new Date(selectedResume.uploaded_at).toLocaleString()}</p>
              <pre>{JSON.stringify(selectedResume.analysis, null, 2)}</pre>
            </>
          ) : (
            <p>Select a resume to see the details.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResumeDashboard;

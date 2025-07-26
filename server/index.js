const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// File upload config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /upload
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await pdfParse(file.buffer);
    const resumeText = data.text;

    const prompt = `
Extract the following details from this resume:

Return JSON with:
{
  "name": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "portfolio": "",
  "summary": "",
  "work_experience": "",
  "education": "",
  "projects": "",
  "certifications": "",
  "technical_skills": [],
  "soft_skills": [],
  "rating": 0,
  "improvement_areas": [],
  "suggested_skills": []
}

Resume Text:
${resumeText}
`;

    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const aiResponse =  result.response.text();

    // Store in DB
    await pool.query(
      'INSERT INTO resumes (file_name, analysis) VALUES ($1, $2)',
      [file.originalname, aiResponse]
    );

    res.status(200).json({ message: 'Resume analyzed', analysis: JSON.parse(aiResponse) });

  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// GET /resumes
app.get('/resumes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, file_name, analysis, uploaded_at FROM resumes ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching resumes:', err);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// GET /resumes/:id
app.get('/resumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM resumes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume details' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


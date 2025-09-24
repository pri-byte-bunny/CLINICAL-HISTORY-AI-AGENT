// server.js - Working version for Render deployment
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = ['uploads', 'data', 'logs'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
createDirectories();

// Serve the main app at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Clinical History AI Agent is running!'
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    processedCount: 0,
    historiesGenerated: 0,
    avgProcessingTime: 0,
    successRate: 100,
    lastProcessed: null
  });
});

app.post('/api/upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const processingOptions = {
      outputFormat: req.body.outputFormat || 'soap',
      detailLevel: req.body.detailLevel || 'standard',
      includeICD10: req.body.includeICD10 === 'true',
      includeMedications: req.body.includeMedications === 'true'
    };

    const results = [];
    
    for (const file of req.files) {
      try {
        // Generate demo clinical history for each file
        const clinicalHistory = generateDemoClinicalHistory(file.originalname, processingOptions);
        
        results.push({
          fileName: file.originalname,
          clinicalHistory: clinicalHistory,
          status: 'success'
        });
        
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        results.push({
          fileName: file.originalname,
          status: 'error',
          error: fileError.message
        });
      }
    }

    res.json({
      success: true,
      results: results,
      totalProcessed: results.filter(r => r.status === 'success').length,
      totalErrors: results.filter(r => r.status === 'error').length
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: 'Failed to process uploaded documents' });
  }
});

// Generate demo clinical history
function generateDemoClinicalHistory(fileName, options) {
  const timestamp = new Date().toLocaleString();
  
  let history = '';
  
  if (options.outputFormat === 'soap') {
    history = `CLINICAL HISTORY - SOAP FORMAT
Generated: ${timestamp}
Source: ${fileName}
Detail Level: ${options.detailLevel}

====================================================================

SUBJECTIVE:

Chief Complaint: Chest pain and shortness of breath

History of Present Illness:
Patient reports chest pain that has been present for 2 days. Pain is described as substernal, pressure-like, 7/10 intensity, radiating to left arm. Associated with shortness of breath on exertion. No relief with rest. Patient denies nausea, diaphoresis, or palpitations.

Past Medical History:
• Hypertension${options.includeICD10 ? ' (I10)' : ''}
• Diabetes mellitus type 2${options.includeICD10 ? ' (E11.9)' : ''}
• Hyperlipidemia${options.includeICD10 ? ' (E78.5)' : ''}

${options.includeMedications ? `Medications:
• Lisinopril 10mg daily
• Metformin 500mg twice daily
• Atorvastatin 20mg at bedtime
• Aspirin 81mg daily

` : ''}Allergies:
NKDA (No Known Drug Allergies)

Social History:
Former smoker (quit 5 years ago), occasional alcohol use, sedentary lifestyle

Review of Systems:
Positive for chest pain and dyspnea as noted. Denies fever, chills, cough, or lower extremity edema.

OBJECTIVE:

Vital Signs:
BP: 142/88 mmHg, HR: 78 bpm, Temp: 98.2°F, RR: 18/min, O2 Sat: 96% on room air

Physical Examination:
General: Patient appears comfortable at rest but anxious
Cardiovascular: Regular rate and rhythm, no murmurs, rubs, or gallops
Pulmonary: Clear to auscultation bilaterally
Extremities: No edema, good peripheral pulses

Laboratory Results:
Glucose: 145 mg/dL, Creatinine: 1.1 mg/dL, Troponin I: <0.04 ng/mL

Imaging Studies:
Chest X-ray: No acute cardiopulmonary abnormalities
EKG: Normal sinus rhythm, no acute ST changes

ASSESSMENT:

Primary Diagnoses:
1. Chest pain, atypical${options.includeICD10 ? ' (R06.02)' : ''}
2. Hypertension, uncontrolled${options.includeICD10 ? ' (I10)' : ''}
3. Diabetes mellitus type 2, controlled${options.includeICD10 ? ' (E11.9)' : ''}

PLAN:

DIAGNOSTIC:
1. Serial cardiac enzymes
2. Stress testing if symptoms persist
3. Echocardiogram to assess cardiac function

THERAPEUTIC:
1. Continue current medications as prescribed
2. Optimize blood pressure control - consider increasing lisinopril dose
3. Lifestyle modifications counseling

MONITORING:
1. Blood pressure monitoring at home
2. Glucose monitoring as directed
3. Follow-up lipid panel in 3 months

FOLLOW-UP:
1. Return to clinic in 1 week or sooner if symptoms worsen
2. Cardiology referral if stress test abnormal
3. Patient education provided regarding warning signs

====================================================================
Generated by Clinical History AI Agent (Demo Version)
Note: This is a demonstration of the system's capabilities.
====================================================================`;

  } else if (options.outputFormat === 'narrative') {
    history = `CLINICAL HISTORY - NARRATIVE FORMAT
Generated: ${timestamp}
Source: ${fileName}

====================================================================

PATIENT PRESENTATION:

This patient presents with a chief complaint of chest pain and shortness of breath. The clinical presentation involves substernal chest pain, pressure-like in quality, with associated dyspnea on exertion that has been present for approximately 2 days.

MEDICAL BACKGROUND:

The patient has a significant medical history including hypertension, diabetes mellitus type 2, and hyperlipidemia. These conditions require ongoing management and clinical monitoring, and are relevant to the current clinical presentation given their cardiovascular implications.

CURRENT CLINICAL STATUS:

Current vital signs demonstrate elevated blood pressure at 142/88 mmHg with otherwise stable parameters. Physical examination reveals an anxious but comfortable-appearing patient with cardiovascular and pulmonary systems within normal limits on initial assessment.

${options.includeMedications ? `CURRENT THERAPEUTIC REGIMEN:

The patient is currently managed with lisinopril 10mg daily for hypertension, metformin 500mg twice daily for diabetes management, atorvastatin 20mg for lipid control, and low-dose aspirin for cardiovascular protection. Medication adherence and therapeutic effectiveness should be regularly assessed during clinical encounters.

` : ''}CLINICAL ASSESSMENT AND MANAGEMENT APPROACH:

Based on the available clinical information, the patient requires comprehensive cardiovascular evaluation for atypical chest pain in the context of multiple cardiovascular risk factors. The clinical presentation warrants careful assessment to exclude acute coronary syndrome while addressing ongoing management of chronic conditions. Treatment decisions should incorporate current clinical guidelines, patient preferences, and individualized risk-benefit considerations.

RECOMMENDED FOLLOW-UP AND MONITORING:

Regular follow-up appointments should be scheduled based on clinical judgment and symptom progression. The patient should be advised to seek immediate medical attention if chest pain worsens, becomes more frequent, or is associated with new symptoms such as severe shortness of breath, syncope, or diaphoresis. Blood pressure optimization and diabetic control should remain ongoing priorities.

====================================================================
Generated by Clinical History AI Agent (Demo Version)
====================================================================`;

  } else { // structured format
    history = `STRUCTURED CLINICAL HISTORY
Generated: ${timestamp}
Source: ${fileName}

====================================================================

1. PATIENT DEMOGRAPHICS
   Age: To be determined
   Gender: To be determined

2. PRESENTING COMPLAINT
   Chief Complaint: Chest pain and shortness of breath
   
3. HISTORY OF PRESENT ILLNESS
   Onset: 2 days ago
   Location: Substernal chest
   Duration: Persistent over 2 days
   Character: Pressure-like, 7/10 intensity
   Associated symptoms: Dyspnea on exertion
   Timing: Continuous with exertional component
   Exacerbating factors: Physical activity
   Relieving factors: None identified
   Severity: 7/10 on pain scale
   
4. PAST MEDICAL HISTORY
   1. Hypertension${options.includeICD10 ? ' (I10)' : ''}
   2. Diabetes mellitus type 2${options.includeICD10 ? ' (E11.9)' : ''}
   3. Hyperlipidemia${options.includeICD10 ? ' (E78.5)' : ''}

5. CURRENT MEDICATIONS
${options.includeMedications ? `   1. Lisinopril 10mg daily
   2. Metformin 500mg twice daily
   3. Atorvastatin 20mg at bedtime
   4. Aspirin 81mg daily` : '   Medication list to be reviewed during clinical encounter'}

6. ALLERGIES
   NKDA (No Known Drug Allergies)

7. SOCIAL HISTORY
   Former tobacco use (quit 5 years ago)
   Occasional alcohol consumption
   Sedentary lifestyle

8. REVIEW OF SYSTEMS
   Positive: Chest pain, dyspnea on exertion
   Negative: Fever, chills, cough, lower extremity edema

9. PHYSICAL EXAMINATION
   Vital Signs: BP 142/88, HR 78, Temp 98.2°F, RR 18, O2 Sat 96%
   General: Anxious but comfortable appearing
   Cardiovascular: Regular rate and rhythm
   Pulmonary: Clear breath sounds bilaterally

10. DIAGNOSTIC STUDIES
    Laboratory: Glucose 145, Creatinine 1.1, Troponin <0.04
    Imaging: Chest X-ray unremarkable, EKG normal sinus rhythm

11. CLINICAL ASSESSMENT
    1. Atypical chest pain${options.includeICD10 ? ' (R06.02)' : ''}
    2. Hypertension, uncontrolled${options.includeICD10 ? ' (I10)' : ''}
    3. Diabetes mellitus type 2${options.includeICD10 ? ' (E11.9)' : ''}

12. MANAGEMENT PLAN
    1. Serial cardiac monitoring and enzyme trending
    2. Cardiovascular risk stratification
    3. Blood pressure optimization
    4. Diabetes management continuation
    5. Patient education regarding symptom monitoring

13. FOLLOW-UP RECOMMENDATIONS
    1. Clinic follow-up in 1 week
    2. Earlier return if symptoms worsen
    3. Cardiology consultation if indicated
    4. Home blood pressure monitoring

====================================================================
Generated by Clinical History AI Agent (Demo Version)
====================================================================`;
  }

  return history;
}

app.get('/api/histories', (req, res) => {
  res.json([]);
});

app.get('/api/download/excel', (req, res) => {
  res.status(200).json({ message: 'Excel generation feature coming soon!' });
});

app.get('/api/download/history/:id', (req, res) => {
  res.status(404).json({ error: 'History not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Server start
app.listen(PORT, () => {
  console.log(`🏥 Clinical History AI Agent server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server started successfully!`);
});

module.exports = app;

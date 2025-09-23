const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
require('dotenv').config();

const documentProcessor = require('./services/documentProcessor');
const clinicalHistoryGenerator = require('./services/clinicalHistoryGenerator');
const excelService = require('./services/excelService');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARE SETUP
// ======================

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to track request start time
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// ======================
// LOGGING SETUP
// ======================

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'clinical-history-ai' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// ======================
// ROUTES
// ======================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get system statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await excelService.getSystemStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting system stats:', error);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

// Upload and process documents
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
        logger.info(`Processing file: ${file.originalname}`);
        
        // Extract text from document
        const extractedText = await documentProcessor.extractText(file);
        
        // Generate clinical history
        const clinicalHistory = await clinicalHistoryGenerator.generate(
          extractedText, 
          file.originalname, 
          processingOptions
        );
        
        // Save to Excel
        const excelData = {
          fileName: file.originalname,
          fileSize: file.size,
          processingTime: Date.now() - req.startTime,
          extractedText: extractedText,
          clinicalHistory: clinicalHistory,
          processingOptions: processingOptions,
          timestamp: new Date().toISOString()
        };
        
        await excelService.saveToExcel(excelData);
        
        results.push({
          fileName: file.originalname,
          clinicalHistory: clinicalHistory,
          status: 'success'
        });
        
        // Clean up uploaded file
        await fs.remove(file.path);
        
      } catch (fileError) {
        logger.error(`Error processing file ${file.originalname}:`, fileError);
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
    logger.error('Upload processing error:', error);
    res.status(500).json({ error: 'Failed to process uploaded documents' });
  }
});

// Download Excel report
app.get('/api/download/excel', async (req, res) => {
  try {
    const excelBuffer = await excelService.generateExcelReport();
    const fileName = `clinical-histories-${moment().format('YYYY-MM-DD-HHmm')}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': excelBuffer.length
    });
    
    res.send(excelBuffer);
    
  } catch (error) {
    logger.error('Excel download error:', error);
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

// Download individual clinical history
app.get('/api/download/history/:id', async (req, res) => {
  try {
    const historyData = await excelService.getHistoryById(req.params.id);
    
    if (!historyData) {
      return res.status(404).json({ error: 'Clinical history not found' });
    }
    
    const fileName = `${historyData.fileName.replace(/\.[^/.]+$/, "")}-clinical-history.txt`;
    
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${fileName}"`
    });
    
    res.send(historyData.clinicalHistory);
    
  } catch (error) {
    logger.error('History download error:', error);
    res.status(500).json({ error: 'Failed to download clinical history' });
  }
});

// Get all processed histories
app.get('/api/histories', async (req, res) => {
  try {
    const histories = await excelService.getAllHistories();
    res.json(histories);
  } catch (error) {
    logger.error('Error getting histories:', error);
    res.status(500).json({ error: 'Failed to retrieve clinical histories' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Global error handler:', error);
  
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

// ======================
// SERVER START
// ======================

async function startServer() {
  try {
    // Ensure directories exist
    await fs.ensureDir('uploads');
    await fs.ensureDir('logs');
    await fs.ensureDir('data');
    
    app.listen(PORT, () => {
      logger.info(`Clinical History AI Agent server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Access the application at: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

startServer();

module.exports = app;


const mammoth = require('mammoth');
const textract = require('textract');
const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class DocumentProcessor {
  
  async extractText(file) {
    try {
      
        logger.info(`Processing file: ${file.originalname}`);
      
      switch (file.mimetype) {
        case 'text/plain':
          return await this.extractFromTxt(file.path);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocx(file.path);
        
        case 'application/pdf':
          return await this.extractFromPdf(file.path);
        
        default:
          throw new Error(`Unsupported file type: \${file.mimetype}`);
      }
      
    } catch (error) {
      logger.error(`Text extraction failed for \${file.originalname}:`, error);
      throw error;
    }
  }
  
  async extractFromTxt(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return content.trim();
  }
  
  async extractFromDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  }
  
  async extractFromPdf(filePath) {
    return new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, (error, text) => {
        if (error) {
          // Fallback for PDF processing
          logger.warn(`PDF extraction failed, using fallback: \${error.message}`);
          resolve(`[PDF Content - Text extraction failed]\\n\\nThis PDF document contains medical information that requires manual review. Please process the original document directly.`);
        } else {
          resolve(text.trim());
        }
      });
    });
  }
  
  preprocessText(text) {
    // Clean and normalize the extracted text
    return text
      .replace(/\\r\\n/g, '\\n')
      .replace(/\\r/g, '\\n')
      .replace(/\\n{3,}/g, '\\n\\n')
      .replace(/[^\\x20-\\x7E\\n]/g, '')
      .trim();
  }
}

module.exports = new DocumentProcessor();

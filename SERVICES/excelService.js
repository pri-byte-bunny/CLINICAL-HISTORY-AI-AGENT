const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class ExcelService {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.excelFile = path.join(this.dataDir, 'clinical-histories.xlsx');
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    await fs.ensureDir(this.dataDir);
  }

  async saveToExcel(data) {
    try {
      logger.info(`Saving clinical history to Excel: ${data.fileName}`);

      let workbook;
      let worksheet;

      // Check if Excel file exists
      if (await fs.pathExists(this.excelFile)) {
        workbook = XLSX.readFile(this.excelFile);
        worksheet = workbook.Sheets['Clinical Histories'];
        if (!worksheet) {
          worksheet = XLSX.utils.aoa_to_sheet([[
            'ID', 'Date', 'Time', 'File Name', 'File Size', 'Processing Time (ms)', 
            'Output Format', 'Detail Level', 'ICD-10 Included', 'Medications Included',
            'Extracted Text', 'Clinical History'
          ]]);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Clinical Histories');
        }
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([[
          'ID', 'Date', 'Time', 'File Name', 'File Size', 'Processing Time (ms)', 
          'Output Format', 'Detail Level', 'ICD-10 Included', 'Medications Included',
          'Extracted Text', 'Clinical History'
        ]]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clinical Histories');
      }

      const id = this.generateUniqueId();
      const timestamp = moment(data.timestamp);

      const rowData = [
        id,
        timestamp.format('YYYY-MM-DD'),
        timestamp.format('HH:mm:ss'),
        data.fileName,
        data.fileSize,
        data.processingTime || 0,
        data.processingOptions.outputFormat,
        data.processingOptions.detailLevel,
        data.processingOptions.includeICD10 ? 'Yes' : 'No',
        data.processingOptions.includeMedications ? 'Yes' : 'No',
        this.truncateText(data.extractedText, 1000),
        data.clinicalHistory
      ];

      // Append row at the end
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const nextRow = range.e.r + 1;
      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: { r: nextRow, c: 0 } });

      this.autoSizeColumns(worksheet);
      XLSX.writeFile(workbook, this.excelFile);

      logger.info(`Successfully saved clinical history with ID: ${id}`);
      return id;

    } catch (error) {
      logger.error('Error saving to Excel:', error);
      throw error;
    }
  }

  async generateExcelReport() {
    try {
      if (!(await fs.pathExists(this.excelFile))) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([['No clinical histories processed yet.']]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      }

      const workbook = XLSX.readFile(this.excelFile);
      const summaryData = await this.generateSummaryData(workbook);
      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary', { origin: 0 });

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    } catch (error) {
      logger.error('Error generating Excel report:', error);
      throw error;
    }
  }

  async getSystemStats() {
    try {
      if (!(await fs.pathExists(this.excelFile))) {
        return {
          processedCount: 0,
          historiesGenerated: 0,
          avgProcessingTime: 0,
          successRate: 100,
          totalFileSize: 0,
          lastProcessed: null
        };
      }

      const workbook = XLSX.readFile(this.excelFile);
      const worksheet = workbook.Sheets['Clinical Histories'];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length <= 1) return {
        processedCount: 0,
        historiesGenerated: 0,
        avgProcessingTime: 0,
        successRate: 100,
        totalFileSize: 0,
        lastProcessed: null
      };

      const records = data.slice(1);
      const processingTimes = records.map(row => parseInt(row[5]) || 0);
      const fileSizes = records.map(row => parseInt(row[4]) || 0);
      const lastRecord = records[records.length - 1];

      return {
        processedCount: records.length,
        historiesGenerated: records.length,
        avgProcessingTime: Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length),
        successRate: 100,
        totalFileSize: fileSizes.reduce((a, b) => a + b, 0),
        lastProcessed: lastRecord ? `${lastRecord[1]} ${lastRecord[2]}` : null
      };

    } catch (error) {
      logger.error('Error getting system stats:', error);
      throw error;
    }
  }

  async getAllHistories() {
    try {
      if (!(await fs.pathExists(this.excelFile))) return [];

      const workbook = XLSX.readFile(this.excelFile);
      const worksheet = workbook.Sheets['Clinical Histories'];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      return jsonData.map(row => ({
        id: row.ID,
        fileName: row['File Name'],
        date: row.Date,
        time: row.Time,
        outputFormat: row['Output Format'],
        detailLevel: row['Detail Level'],
        clinicalHistory: row['Clinical History']
      }));

    } catch (error) {
      logger.error('Error getting all histories:', error);
      throw error;
    }
  }

  async getHistoryById(id) {
    try {
      const histories = await this.getAllHistories();
      return histories.find(history => history.id === id);
    } catch (error) {
      logger.error(`Error getting history by ID ${id}:`, error);
      throw error;
    }
  }

  generateUniqueId() {
    return `CH-${moment().format('YYYYMMDD')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '... [truncated]';
  }

  autoSizeColumns(worksheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const colWidths = [];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellValue = cell.v.toString();
          maxWidth = Math.max(maxWidth, Math.min(cellValue.length, 50));
        }
      }
      colWidths[C] = { wch: maxWidth };
    }

    worksheet['!cols'] = colWidths;
  }

  async generateSummaryData(workbook) {
    const worksheet = workbook.Sheets['Clinical Histories'];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length <= 1) {
      return [
        ['Clinical Histories Summary'],
        ['No data available'],
        [''],
        ['Generated:', moment().format('YYYY-MM-DD HH:mm:ss')]
      ];
    }

    const records = data.slice(1);
    const stats = await this.getSystemStats();

    const formatCounts = {};
    const dailyCounts = {};

    records.forEach(row => {
      const format = row[6] || 'Unknown';
      const date = row[1];
      formatCounts[format] = (formatCounts[format] || 0) + 1;
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const summaryData = [
      ['CLINICAL HISTORIES SUMMARY REPORT'],
      ['Generated:', moment().format('YYYY-MM-DD HH:mm:ss')],
      [''],
      ['OVERALL STATISTICS'],
      ['Total Documents Processed:', stats.processedCount],
      ['Total Clinical Histories Generated:', stats.historiesGenerated],
      ['Average Processing Time (ms):', stats.avgProcessingTime],
      ['Success Rate:', stats.successRate + '%'],
      ['Total File Size Processed (bytes):', stats.totalFileSize],
      ['Last Processed:', stats.lastProcessed || 'N/A'],
      [''],
      ['OUTPUT FORMAT DISTRIBUTION'],
      ...Object.entries(formatCounts).map(([format, count]) => [format + ':', count]),
      [''],
      ['DAILY PROCESSING VOLUME'],
      ...Object.entries(dailyCounts).map(([date, count]) => [date + ':', count]),
      [''],
      ['RECENT ACTIVITY'],
      ...records.slice(-5).map(row => [`${row[1]} ${row[2]}`, row[3]])
    ];

    return summaryData;
  }
}

module.exports = new ExcelService();

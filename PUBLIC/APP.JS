// PUBLIC/APP.JS - Complete JavaScript for Clinical History AI Agent
// Save this file as public/app.js

console.log('🚀 Clinical History AI Agent Loading...');

class ClinicalHistoryApp {
    constructor() {
        this.uploadedFiles = [];
        this.apiBase = '/api';
        this.isInitialized = false;
    }

    async init() {
        console.log('🔧 Initializing Clinical History App...');
        
        try {
            // Wait for DOM to be fully ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            this.setupEventListeners();
            await this.checkServerHealth();
            await this.updateStats();
            this.startPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('✅ App initialization complete!');
            
            // Show success notification
            this.showNotification('Clinical History AI Agent is ready!', 'success');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Get DOM elements
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const browseBtn = document.getElementById('browseFilesBtn');
        const clearBtn = document.getElementById('clearFilesBtn');
        const processBtn = document.getElementById('processBtn');
        const downloadExcelBtn = document.getElementById('downloadExcelBtn');
        const viewHistoriesBtn = document.getElementById('viewHistoriesBtn');
        const clearOutputBtn = document.getElementById('clearOutputBtn');
        const exportOutputBtn = document.getElementById('exportOutputBtn');
        const settingsForm = document.getElementById('settingsForm');

        // File input handler - CRITICAL for file browsing
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('📁 File input changed:', e.target.files.length, 'files selected');
                if (e.target.files.length > 0) {
                    const files = Array.from(e.target.files);
                    this.addFiles(files);
                    // Clear input for reselection
                    e.target.value = '';
                }
            });
            console.log('✅ File input listener attached');
        } else {
            console.error('❌ File input element not found!');
        }

        // Browse Files button - CRITICAL for triggering file dialog
        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Browse Files button clicked');
                
                if (fileInput) {
                    fileInput.click();
                    console.log('📂 File dialog opened');
                } else {
                    console.error('❌ File input not found when browse button clicked');
                    this.showNotification('File input error', 'error');
                }
            });
            console.log('✅ Browse button listener attached');
        } else {
            console.error('❌ Browse button not found!');
        }

        // Upload area drag & drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
            
            // Also make upload area clickable
            uploadArea.addEventListener('click', (e) => {
                if (e.target === uploadArea || uploadArea.contains(e.target)) {
                    console.log('📦 Upload area clicked');
                    if (fileInput) {
                        fileInput.click();
                    }
                }
            });
            console.log('✅ Upload area listeners attached');
        }

        // Clear Files button
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearFiles();
            });
        }

        // Process Documents button
        if (processBtn) {
            processBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processDocuments();
            });
        }

        // Download Excel button
        if (downloadExcelBtn) {
            downloadExcelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadExcel();
            });
        }

        // View Histories button
        if (viewHistoriesBtn) {
            viewHistoriesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewAllHistories();
            });
        }

        // Clear Output button
        if (clearOutputBtn) {
            clearOutputBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearOutput();
            });
        }

        // Export Output button
        if (exportOutputBtn) {
            exportOutputBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportOutput();
            });
        }

        // Settings form
        if (settingsForm) {
            settingsForm.addEventListener('change', this.saveSettings.bind(this));
        }

        this.loadSettings();
        console.log('✅ All event listeners setup complete');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        console.log('📥 Files dropped:', files.length);
        this.addFiles(files);
    }

    addFiles(files) {
        console.log('➕ Adding files:', files.length);
        
        const validFiles = files.filter(file => {
            const validTypes = [
                'application/pdf', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                'text/plain',
                'application/msword' // for .doc files
            ];
            const maxSize = 50 * 1024 * 1024; // 50MB
            
            const isValidType = validTypes.includes(file.type) || 
                               file.name.toLowerCase().endsWith('.pdf') ||
                               file.name.toLowerCase().endsWith('.docx') ||
                               file.name.toLowerCase().endsWith('.txt') ||
                               file.name.toLowerCase().endsWith('.doc');
            const isValidSize = file.size <= maxSize;
            
            if (!isValidType) {
                console.warn(`❌ Invalid file type: ${file.type} for file: ${file.name}`);
            }
            if (!isValidSize) {
                console.warn(`❌ File too large: ${this.formatFileSize(file.size)} for file: ${file.name}`);
            }
            
            return isValidType && isValidSize;
        });

        if (validFiles.length !== files.length) {
            this.showNotification('Some files were rejected. Only PDF, DOCX, TXT, and DOC files under 50MB are allowed.', 'warning');
        }

        if (validFiles.length > 0) {
            this.uploadedFiles = [...this.uploadedFiles, ...validFiles];
            console.log(`✅ Added ${validFiles.length} valid files. Total: ${this.uploadedFiles.length}`);
            
            this.renderFileList();
            this.updateProcessButton();
            this.showNotification(`Added ${validFiles.length} file(s) successfully`, 'success');
        } else {
            console.warn('⚠️ No valid files to add');
            this.showNotification('No valid files selected', 'warning');
        }
    }

    removeFile(index) {
        console.log(`🗑️ Removing file at index: ${index}`);
        if (index >= 0 && index < this.uploadedFiles.length) {
            const removedFile = this.uploadedFiles.splice(index, 1)[0];
            this.renderFileList();
            this.updateProcessButton();
            this.showNotification(`Removed ${removedFile.name}`, 'info');
        }
    }

    clearFiles() {
        console.log('🗑️ Clearing all files');
        this.uploadedFiles = [];
        this.renderFileList();
        this.updateProcessButton();
        this.showNotification('All files cleared', 'info');
    }

    renderFileList() {
        const fileList = document.getElementById('fileList');
        if (!fileList) {
            console.error('❌ File list element not found!');
            return;
        }

        if (this.uploadedFiles.length === 0) {
            fileList.innerHTML = '';
            return;
        }

        fileList.innerHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-item fade-in">
                <span class="file-name">📄 ${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <button class="remove-file" data-file-index="${index}">×</button>
            </div>
        `).join('');

        // Add event listeners to remove buttons
        const removeButtons = fileList.querySelectorAll('.remove-file');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-file-index'));
                this.removeFile(index);
            });
        });

        console.log(`📋 Rendered ${this.uploadedFiles.length} files in list`);
    }

    updateProcessButton() {
        const processBtn = document.getElementById('processBtn');
        if (processBtn) {
            processBtn.disabled = this.uploadedFiles.length === 0;
            
            if (this.uploadedFiles.length > 0) {
                processBtn.innerHTML = `⚡ Process ${this.uploadedFiles.length} Document(s)`;
            } else {
                processBtn.innerHTML = '⚡ Process Documents';
            }
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processDocuments() {
        if (this.uploadedFiles.length === 0) {
            this.showNotification('Please upload at least one document to process.', 'error');
            return;
        }

        console.log('🔄 Starting document processing...');
        this.showLoadingModal('Preparing documents for processing...');
        
        try {
            const formData = new FormData();
            
            // Add files to form data
            this.uploadedFiles.forEach((file, index) => {
                console.log(`📎 Adding file ${index + 1}: ${file.name} (${this.formatFileSize(file.size)})`);
                formData.append('documents', file);
            });

            // Add settings
            const settings = this.getSettings();
            Object.keys(settings).forEach(key => {
                formData.append(key, settings[key]);
            });

            this.showProgress(0);
            this.updateLoadingText('Uploading documents to server...');

            console.log('📡 Sending request to server...');
            const response = await fetch(`${this.apiBase}/upload`, {
                method: 'POST',
                body: formData
            });

            console.log(`📡 Server response: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Processing result:', result);
            
            this.hideLoadingModal();
            this.showProcessingResults(result);
            
            // Clear uploaded files after successful processing
            this.uploadedFiles = [];
            this.renderFileList();
            this.updateProcessButton();
            
            // Update stats and history
            await this.updateStats();
            await this.updateHistoryTable();

        } catch (error) {
            console.error('❌ Processing error:', error);
            this.hideLoadingModal();
            this.showNotification(`Error processing documents: ${error.message}`, 'error');
        }
    }

    showProcessingResults(result) {
        const outputArea = document.getElementById('outputArea');
        if (!outputArea) {
            console.error('❌ Output area not found!');
            return;
        }

        // Hide placeholder
        const placeholder = outputArea.querySelector('.output-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Generate output text
        let output = `PROCESSING COMPLETED - ${new Date().toLocaleString()}\n`;
        output += `${'='.repeat(60)}\n\n`;
        output += `📊 SUMMARY:\n`;
        output += `Total Files: ${result.results.length}\n`;
        output += `✅ Successfully Processed: ${result.totalProcessed}\n`;
        output += `❌ Errors: ${result.totalErrors}\n\n`;

        result.results.forEach((item, index) => {
            output += `📄 [${index + 1}] ${item.fileName}\n`;
            output += `Status: ${item.status.toUpperCase()}\n`;
            
            if (item.status === 'success') {
                output += `\n📋 CLINICAL HISTORY:\n`;
                output += `${'-'.repeat(40)}\n`;
                output += `${item.clinicalHistory}\n`;
            } else if (item.error) {
                output += `❌ Error: ${item.error}\n`;
            }
            
            output += `\n${'='.repeat(60)}\n\n`;
        });

        outputArea.textContent = output;
        outputArea.scrollTop = 0;

        // Show notification
        if (result.totalProcessed > 0) {
            this.showNotification(`✅ Successfully processed ${result.totalProcessed} of ${result.results.length} documents`, 'success');
        } else {
            this.showNotification(`❌ Failed to process any documents`, 'error');
        }
    }

    async downloadExcel() {
        try {
            this.showLoadingModal('Generating Excel report...');
            
            const response = await fetch(`${this.apiBase}/download/excel`);
            
            if (!response.ok) {
                throw new Error(`Failed to generate Excel report: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinical-histories-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.hideLoadingModal();
            this.showNotification('📊 Excel report downloaded successfully', 'success');

        } catch (error) {
            console.error('❌ Download error:', error);
            this.hideLoadingModal();
            this.showNotification(`Error downloading Excel report: ${error.message}`, 'error');
        }
    }

    async viewAllHistories() {
        try {
            console.log('📋 Loading all histories...');
            const response = await fetch(`${this.apiBase}/histories`);
            
            if (!response.ok) {
                throw new Error(`Failed to load histories: ${response.status}`);
            }
            
            const histories = await response.json();

            if (histories.length === 0) {
                this.showNotification('📋 No clinical histories found', 'info');
                return;
            }

            let output = `ALL CLINICAL HISTORIES - ${new Date().toLocaleString()}\n`;
            output += `${'='.repeat(60)}\n`;
            output += `📊 Total Records: ${histories.length}\n\n`;

            histories.forEach((history, index) => {
                output += `📄 [${index + 1}] ID: ${history.id}\n`;
                output += `📁 File: ${history.fileName}\n`;
                output += `📅 Date: ${history.date} ${history.time}\n`;
                output += `📋 Format: ${history.outputFormat}\n`;
                output += `📊 Detail Level: ${history.detailLevel}\n`;
                output += `${'-'.repeat(40)}\n`;
                output += `${history.clinicalHistory}\n`;
                output += `\n${'='.repeat(60)}\n\n`;
            });

            const outputArea = document.getElementById('outputArea');
            const placeholder = outputArea.querySelector('.output-placeholder');
            
            if (placeholder) {
                placeholder.style.display = 'none';
            }

            outputArea.textContent = output;
            outputArea.scrollTop = 0;

            this.showNotification(`📋 Loaded ${histories.length} clinical histories`, 'success');

        } catch (error) {
            console.error('❌ Error fetching histories:', error);
            this.showNotification(`Error loading histories: ${error.message}`, 'error');
        }
    }

    clearOutput() {
        const outputArea = document.getElementById('outputArea');
        if (!outputArea) return;

        outputArea.innerHTML = `
            <div class="output-placeholder">
                <div class="placeholder-icon">📄</div>
                <div class="placeholder-text">Processed clinical histories will appear here...</div>
                <div class="placeholder-hint">Upload and process medical documents to begin</div>
            </div>
        `;
        
        this.showNotification('🗑️ Output cleared', 'info');
    }

    async exportOutput() {
        const outputArea = document.getElementById('outputArea');
        const content = outputArea.textContent;
        
        if (!content || content.trim() === '' || content.includes('will appear here')) {
            this.showNotification('⚠️ No content to export', 'warning');
            return;
        }

        try {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinical-histories-export-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('📥 Output exported successfully', 'success');
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showNotification('Error exporting output', 'error');
        }
    }

    async checkServerHealth() {
        try {
            const response = await fetch(`${this.apiBase}/health`, { 
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            const serverStatusEl = document.getElementById('serverStatus');
            if (response.ok) {
                if (serverStatusEl) {
                    serverStatusEl.textContent = '🟢 Online';
                    serverStatusEl.style.color = '#22543d';
                }
                console.log('✅ Server is online');
            } else {
                throw new Error(`Server returned ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ Server health check failed:', error.message);
            const serverStatusEl = document.getElementById('serverStatus');
            if (serverStatusEl) {
                serverStatusEl.textContent = '🔴 Offline';
                serverStatusEl.style.color = '#c53030';
            }
        }
    }

    async updateStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            if (!response.ok) throw new Error(`Stats API error: ${response.status}`);
            
            const stats = await response.json();

            const elements = {
                processedCount: document.getElementById('processedCount'),
                historiesGenerated: document.getElementById('historiesGenerated'),
                avgProcessingTime: document.getElementById('avgProcessingTime'),
                successRate: document.getElementById('successRate'),
                lastUpdated: document.getElementById('lastUpdated')
            };

            if (elements.processedCount) elements.processedCount.textContent = stats.processedCount || 0;
            if (elements.historiesGenerated) elements.historiesGenerated.textContent = stats.historiesGenerated || 0;
            if (elements.avgProcessingTime) elements.avgProcessingTime.textContent = `${((stats.avgProcessingTime || 0) / 1000).toFixed(1)}s`;
            if (elements.successRate) elements.successRate.textContent = `${stats.successRate || 100}%`;
            if (elements.lastUpdated) elements.lastUpdated.textContent = stats.lastProcessed || 'Never';

        } catch (error) {
            console.warn('⚠️ Error updating stats:', error.message);
        }
    }

    async updateHistoryTable() {
        try {
            const response = await fetch(`${this.apiBase}/histories`);
            if (!response.ok) return;
            
            const histories = await response.json();
            const tbody = document.getElementById('historyTableBody');
            if (!tbody) return;
            
            if (histories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="no-data">No processing history available</td></tr>';
                return;
            }

            tbody.innerHTML = histories.slice(-10).reverse().map(history => `
                <tr>
                    <td>${history.date} ${history.time}</td>
                    <td>${history.fileName}</td>
                    <td>${history.outputFormat}</td>
                    <td><span style="color: #22543d;">✅ Success</span></td>
                    <td>
                        <button class="btn btn-small" data-history-id="${history.id}">
                            📥 Download
                        </button>
                    </td>
                </tr>
            `).join('');

            // Add event listeners to download buttons
            const downloadButtons = tbody.querySelectorAll('[data-history-id]');
            downloadButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const historyId = e.target.getAttribute('data-history-id');
                    this.downloadHistory(historyId);
                });
            });

        } catch (error) {
            console.warn('⚠️ Error updating history table:', error.message);
        }
    }

    async downloadHistory(id) {
        try {
            const response = await fetch(`${this.apiBase}/download/history/${id}`);
            
            if (!response.ok) {
                throw new Error(`Failed to download history: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinical-history-${id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('📥 Clinical history downloaded successfully', 'success');

        } catch (error) {
            console.error('❌ Download error:', error);
            this.showNotification(`Error downloading history: ${error.message}`, 'error');
        }
    }

    getSettings() {
        return {
            outputFormat: document.getElementById('outputFormat')?.value || 'soap',
            detailLevel: document.getElementById('detailLevel')?.value || 'standard',
            includeICD10: document.getElementById('includeICD10')?.checked || false,
            includeMedications: document.getElementById('includeMedications')?.checked || false
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('clinicalHistorySettings', JSON.stringify(this.getSettings()));
            console.log('💾 Settings saved');
        } catch (error) {
            console.warn('⚠️ Failed to save settings:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('clinicalHistorySettings');
            if (saved) {
                const settings = JSON.parse(saved);
                const elements = {
                    outputFormat: document.getElementById('outputFormat'),
                    detailLevel: document.getElementById('detailLevel'),
                    includeICD10: document.getElementById('includeICD10'),
                    includeMedications: document.getElementById('includeMedications')
                };

                if (elements.outputFormat) elements.outputFormat.value = settings.outputFormat || 'soap';
                if (elements.detailLevel) elements.detailLevel.value = settings.detailLevel || 'standard';
                if (elements.includeICD10) elements.includeICD10.checked = settings.includeICD10 !== false;
                if (elements.includeMedications) elements.includeMedications.checked = settings.includeMedications !== false;
                
                console.log('📂 Settings loaded');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load settings:', error);
        }
    }

    showLoadingModal(text) {
        const modal = document.getElementById('loadingModal');
        const loadingText = document.getElementById('loadingText');
        if (modal && loadingText) {
            loadingText.textContent = text;
            modal.style.display = 'flex';
        }
    }

    hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateLoadingText(text) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    showProgress(percentage) {
        const container = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (container) container.style.display = 'block';
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
    }

    hideProgress() {
        const container = document.getElementById('progressContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 15px;">×</button>
        `;

        // Add click handler to close button
        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    startPeriodicUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
            this.updateHistoryTable();
            this.checkServerHealth();
        }, 30000);
        
        console.log('🔄 Periodic updates started (30s interval)');
    }
}

// Initialize the application
window.app = new ClinicalHistoryApp();

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.init();
    });
} else {
    window.app.init();
}

// Test file input functionality
setTimeout(() => {
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseFilesBtn');
    
    console.log('🧪 File Input Test:');
    console.log('File input element:', fileInput ? '✅ Found' : '❌ Missing');
    console.log('Browse button element:', browseBtn ? '✅ Found' : '❌ Missing');
    
    if (fileInput) {
        console.log('File input accept attribute:', fileInput.accept);
        console.log('File input multiple:', fileInput.multiple);
    }
}, 1000);
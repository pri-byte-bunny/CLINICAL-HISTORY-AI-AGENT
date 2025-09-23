// services/clinicalHistoryGenerator.js
// Complete Clinical History Generator with Advanced AI Processing

const winston = require('winston');
const moment = require('moment');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/clinical-generator.log' })
  ]
});

class ClinicalHistoryGenerator {
  
  constructor() {
    this.medicalTerms = {
      complaints: [
        'chest pain', 'shortness of breath', 'abdominal pain', 'headache', 
        'fatigue', 'nausea', 'dizziness', 'back pain', 'joint pain', 
        'cough', 'fever', 'weight loss', 'palpitations', 'syncope',
        'dyspnea', 'orthopnea', 'paroxysmal nocturnal dyspnea', 'edema',
        'claudication', 'angina', 'dysphagia', 'hemoptysis', 'hematuria',
        'melena', 'hematochezia', 'jaundice', 'pruritus', 'rash',
        'night sweats', 'chills', 'malaise', 'anorexia', 'polyuria',
        'polydipsia', 'polyphagia', 'diplopia', 'blurred vision',
        'tinnitus', 'vertigo', 'seizures', 'tremor', 'weakness',
        'numbness', 'tingling', 'confusion', 'memory loss'
      ],
      
      conditions: [
        'hypertension', 'diabetes mellitus type 2', 'diabetes mellitus type 1',
        'coronary artery disease', 'myocardial infarction', 'angina pectoris',
        'congestive heart failure', 'atrial fibrillation', 'atrial flutter',
        'ventricular tachycardia', 'bradycardia', 'heart block',
        'chronic obstructive pulmonary disease', 'asthma', 'pneumonia',
        'pulmonary embolism', 'pleural effusion', 'pneumothorax',
        'hyperlipidemia', 'hypercholesterolemia', 'hypertriglyceridemia',
        'chronic kidney disease', 'acute kidney injury', 'nephrolithiasis',
        'urinary tract infection', 'benign prostatic hyperplasia',
        'osteoarthritis', 'rheumatoid arthritis', 'osteoporosis',
        'fibromyalgia', 'gout', 'depression', 'anxiety', 'bipolar disorder',
        'schizophrenia', 'dementia', 'alzheimer disease', 'parkinson disease',
        'epilepsy', 'migraine', 'tension headache', 'stroke',
        'transient ischemic attack', 'peripheral artery disease',
        'deep vein thrombosis', 'gastroesophageal reflux disease',
        'peptic ulcer disease', 'inflammatory bowel disease', 'irritable bowel syndrome',
        'hepatitis', 'cirrhosis', 'pancreatitis', 'cholecystitis',
        'cholelithiasis', 'diverticulitis', 'appendicitis', 'hernia',
        'thyroid disorders', 'hypothyroidism', 'hyperthyroidism',
        'adrenal insufficiency', 'cushing syndrome', 'obesity',
        'metabolic syndrome', 'sleep apnea', 'chronic fatigue syndrome',
        'anemia', 'thrombocytopenia', 'leukopenia', 'lymphoma',
        'leukemia', 'multiple myeloma', 'breast cancer', 'lung cancer',
        'colon cancer', 'prostate cancer', 'skin cancer', 'melanoma'
      ],
      
      medications: [
        'lisinopril', 'enalapril', 'losartan', 'valsartan', 'amlodipine',
        'nifedipine', 'metoprolol', 'atenolol', 'carvedilol', 'propranolol',
        'hydrochlorothiazide', 'furosemide', 'spironolactone', 'chlorthalidone',
        'metformin', 'glipizide', 'glyburide', 'insulin', 'pioglitazone',
        'sitagliptin', 'empagliflozin', 'liraglutide', 'atorvastatin',
        'simvastatin', 'rosuvastatin', 'pravastatin', 'ezetimibe',
        'aspirin', 'clopidogrel', 'warfarin', 'rivaroxaban', 'apixaban',
        'heparin', 'enoxaparin', 'omeprazole', 'pantoprazole', 'ranitidine',
        'famotidine', 'sucralfate', 'levothyroxine', 'methimazole',
        'prednisone', 'prednisolone', 'hydrocortisone', 'dexamethasone',
        'albuterol', 'ipratropium', 'tiotropium', 'fluticasone',
        'budesonide', 'montelukast', 'theophylline', 'digoxin',
        'amiodarone', 'diltiazem', 'verapamil', 'nitroglycerin',
        'isosorbide', 'acetaminophen', 'ibuprofen', 'naproxen',
        'celecoxib', 'tramadol', 'morphine', 'oxycodone', 'codeine',
        'gabapentin', 'pregabalin', 'amitriptyline', 'nortriptyline',
        'sertraline', 'fluoxetine', 'paroxetine', 'citalopram',
        'escitalopram', 'venlafaxine', 'duloxetine', 'bupropion',
        'trazodone', 'mirtazapine', 'lorazepam', 'alprazolam',
        'clonazepam', 'diazepam', 'zolpidem', 'eszopiclone',
        'phenytoin', 'carbamazepine', 'valproic acid', 'levetiracetam',
        'lamotrigine', 'topiramate', 'levodopa', 'carbidopa',
        'donepezil', 'memantine', 'rivastigmine', 'galantamine'
      ],
      
      icd10Codes: {
        // Cardiovascular
        'hypertension': 'I10',
        'essential hypertension': 'I10',
        'coronary artery disease': 'I25.9',
        'myocardial infarction': 'I21.9',
        'acute myocardial infarction': 'I21.9',
        'congestive heart failure': 'I50.9',
        'heart failure': 'I50.9',
        'atrial fibrillation': 'I48.91',
        'chest pain': 'R06.02',
        'angina pectoris': 'I20.9',
        
        // Respiratory
        'shortness of breath': 'R06.00',
        'dyspnea': 'R06.00',
        'chronic obstructive pulmonary disease': 'J44.9',
        'copd': 'J44.9',
        'asthma': 'J45.9',
        'pneumonia': 'J18.9',
        'cough': 'R05',
        
        // Gastrointestinal
        'abdominal pain': 'R10.9',
        'nausea': 'R11.0',
        'vomiting': 'R11.10',
        'gastroesophageal reflux disease': 'K21.9',
        'gerd': 'K21.9',
        'peptic ulcer disease': 'K27.9',
        
        // Endocrine
        'diabetes mellitus': 'E11.9',
        'diabetes mellitus type 2': 'E11.9',
        'diabetes mellitus type 1': 'E10.9',
        'hypothyroidism': 'E03.9',
        'hyperthyroidism': 'E05.9',
        'obesity': 'E66.9',
        
        // Neurological
        'headache': 'R51.9',
        'migraine': 'G43.909',
        'seizures': 'R56.9',
        'epilepsy': 'G40.909',
        'stroke': 'I63.9',
        'transient ischemic attack': 'G93.1',
        'dizziness': 'R42',
        'vertigo': 'R42',
        
        // Musculoskeletal
        'back pain': 'M54.9',
        'joint pain': 'M25.9',
        'arthralgia': 'M25.9',
        'osteoarthritis': 'M19.90',
        'rheumatoid arthritis': 'M06.9',
        'osteoporosis': 'M81.0',
        
        // Psychiatric
        'depression': 'F32.9',
        'anxiety': 'F41.9',
        'bipolar disorder': 'F31.9',
        
        // Genitourinary
        'urinary tract infection': 'N39.0',
        'acute kidney injury': 'N17.9',
        'chronic kidney disease': 'N18.9',
        
        // Hematologic
        'anemia': 'D64.9',
        'iron deficiency anemia': 'D50.9',
        
        // General symptoms
        'fatigue': 'R53.83',
        'fever': 'R50.9',
        'weight loss': 'R63.4',
        'malaise': 'R53.1',
        'syncope': 'R55'
      },
      
      procedures: [
        'electrocardiogram', 'ecg', 'ekg', 'echocardiogram', 'stress test',
        'cardiac catheterization', 'angiography', 'chest x-ray', 'ct scan',
        'mri', 'ultrasound', 'colonoscopy', 'endoscopy', 'bronchoscopy',
        'biopsy', 'blood work', 'complete blood count', 'basic metabolic panel',
        'comprehensive metabolic panel', 'lipid panel', 'liver function tests',
        'thyroid function tests', 'hemoglobin a1c', 'glucose tolerance test',
        'urinalysis', 'urine culture', 'stool culture', 'blood culture'
      ],
      
      specialties: [
        'cardiology', 'pulmonology', 'gastroenterology', 'endocrinology',
        'nephrology', 'neurology', 'psychiatry', 'orthopedics', 'urology',
        'dermatology', 'ophthalmology', 'otolaryngology', 'oncology',
        'hematology', 'infectious disease', 'rheumatology', 'geriatrics'
      ]
    };
    
    this.clinicalTemplates = {
      soap: {
        subjective: [
          'Patient is a {age}-year-old {gender} with a history of {conditions} presenting with {complaint}.',
          'The patient reports {complaint} that has been {duration}.',
          'Associated symptoms include {symptoms}.',
          'The patient denies {negativeSymptoms}.',
          'Review of systems is otherwise negative except as noted above.'
        ],
        objective: [
          'Vital signs: {vitals}',
          'Physical examination reveals {physicalFindings}.',
          'Laboratory results show {labResults}.',
          'Imaging studies demonstrate {imagingFindings}.'
        ],
        assessment: [
          'The patient presents with {complaint} in the setting of {context}.',
          'Differential diagnosis includes {differentials}.',
          'Most likely diagnosis is {diagnosis}.'
        ],
        plan: [
          'Continue current medications as prescribed.',
          'Initiate {newTreatment} as indicated.',
          'Follow-up in {timeframe} or sooner if symptoms worsen.',
          'Patient education provided regarding {condition} management.',
          'Return precautions discussed.'
        ]
      }
    };
  }
  
  async generate(extractedText, fileName, options = {}) {
    try {
      logger.info(`Generating clinical history for: ${fileName}`);
      
      // Clean and preprocess the text
      const cleanedText = this.preprocessText(extractedText);
      
      // Extract medical information using NLP-like processing
      const medicalInfo = this.extractMedicalInfo(cleanedText);
      
      // Enhance with clinical reasoning
      const enhancedInfo = this.enhanceMedicalInfo(medicalInfo, options);
      
      // Generate clinical history based on format
      let clinicalHistory = '';
      
      switch (options.outputFormat) {
        case 'soap':
          clinicalHistory = this.generateSOAPNote(enhancedInfo, options);
          break;
        case 'narrative':
          clinicalHistory = this.generateNarrativeHistory(enhancedInfo, options);
          break;
        case 'structured':
          clinicalHistory = this.generateStructuredHistory(enhancedInfo, options);
          break;
        default:
          clinicalHistory = this.generateSOAPNote(enhancedInfo, options);
      }
      
      // Add metadata and validation
      const finalHistory = this.addMetadataAndValidation(clinicalHistory, fileName, options);
      
      logger.info(`Successfully generated clinical history for: ${fileName}`);
      return finalHistory;
      
    } catch (error) {
      logger.error(`Clinical history generation failed for ${fileName}:`, error);
      throw new Error(`Failed to generate clinical history: ${error.message}`);
    }
  }
  
  preprocessText(text) {
    if (!text) return '';
    
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  extractMedicalInfo(text) {
    const lowerText = text.toLowerCase();
    
    const info = {
      demographics: this.extractDemographics(text),
      chiefComplaint: this.extractChiefComplaint(lowerText),
      symptoms: this.extractSymptoms(lowerText),
      conditions: this.extractConditions(lowerText),
      medications: this.extractMedications(lowerText),
      procedures: this.extractProcedures(lowerText),
      vitals: this.extractVitals(text),
      labs: this.extractLabs(text),
      imaging: this.extractImaging(text),
      allergies: this.extractAllergies(text),
      socialHistory: this.extractSocialHistory(text),
      familyHistory: this.extractFamilyHistory(text),
      reviewOfSystems: this.extractReviewOfSystems(lowerText),
      physicalExam: this.extractPhysicalExam(text),
      timeline: this.extractTimeline(text)
    };
    
    return info;
  }
  
  extractDemographics(text) {
    const demographics = {
      age: null,
      gender: null,
      race: null
    };
    
    // Extract age
    const agePatterns = [
      /(\d+)[\s-]?year[\s-]?old/i,
      /age[:\s]*(\d+)/i,
      /(\d+)\s*yo/i,
      /(\d+)\s*y\.?o\.?/i
    ];
    
    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match) {
        demographics.age = parseInt(match[1]);
        break;
      }
    }
    
    // Extract gender
    const malePatterns = /\b(male|man|gentleman|mr\.?|he|his|him)\b/i;
    const femalePatterns = /\b(female|woman|lady|ms\.?|mrs\.?|she|her|hers)\b/i;
    
    if (text.match(malePatterns)) {
      demographics.gender = 'male';
    } else if (text.match(femalePatterns)) {
      demographics.gender = 'female';
    }
    
    return demographics;
  }
  
  extractChiefComplaint(text) {
    // Look for common chief complaint patterns
    const ccPatterns = [
      /chief complaint[:\s]*(.*?)(?:\n|\.)/i,
      /presenting complaint[:\s]*(.*?)(?:\n|\.)/i,
      /cc[:\s]*(.*?)(?:\n|\.)/i,
      /patient.*?(?:presents|complains of|reports)[:\s]*(.*?)(?:\n|\.)/i
    ];
    
    for (const pattern of ccPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Fallback: find most prominent symptom
    const symptoms = this.extractSymptoms(text);
    if (symptoms.length > 0) {
      return symptoms[0];
    }
    
    return 'General medical evaluation';
  }
  
  extractSymptoms(text) {
    const foundSymptoms = [];
    
    this.medicalTerms.complaints.forEach(symptom => {
      const pattern = new RegExp(`\\b${symptom.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (pattern.test(text)) {
        foundSymptoms.push(symptom);
      }
    });
    
    return [...new Set(foundSymptoms)]; // Remove duplicates
  }
  
  extractConditions(text) {
    const foundConditions = [];
    
    this.medicalTerms.conditions.forEach(condition => {
      const pattern = new RegExp(`\\b${condition.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (pattern.test(text)) {
        foundConditions.push(condition);
      }
    });
    
    return [...new Set(foundConditions)];
  }
  
  extractMedications(text) {
    const foundMedications = [];
    
    this.medicalTerms.medications.forEach(medication => {
      const pattern = new RegExp(`\\b${medication}\\b`, 'i');
      if (pattern.test(text)) {
        // Try to extract dosage information
        const dosagePattern = new RegExp(`${medication}\\s*([\\d\\.]+\\s*(?:mg|mcg|g|units?)?)`, 'i');
        const dosageMatch = text.match(dosagePattern);
        
        if (dosageMatch && dosageMatch[1]) {
          foundMedications.push(`${medication} ${dosageMatch[1]}`);
        } else {
          foundMedications.push(medication);
        }
      }
    });
    
    return [...new Set(foundMedications)];
  }
  
  extractProcedures(text) {
    const foundProcedures = [];
    
    this.medicalTerms.procedures.forEach(procedure => {
      const pattern = new RegExp(`\\b${procedure.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (pattern.test(text)) {
        foundProcedures.push(procedure);
      }
    });
    
    return [...new Set(foundProcedures)];
  }
  
  extractVitals(text) {
    const vitals = {};
    
    // Blood pressure
    const bpPattern = /(?:bp|blood pressure)[:\s]*(\d+)\/(\d+)/i;
    const bpMatch = text.match(bpPattern);
    if (bpMatch) {
      vitals.bloodPressure = `${bpMatch[1]}/${bpMatch[2]}`;
    }
    
    // Heart rate
    const hrPattern = /(?:hr|heart rate|pulse)[:\s]*(\d+)/i;
    const hrMatch = text.match(hrPattern);
    if (hrMatch) {
      vitals.heartRate = hrMatch[1];
    }
    
    // Temperature
    const tempPattern = /(?:temp|temperature)[:\s]*(\d+\.?\d*)/i;
    const tempMatch = text.match(tempPattern);
    if (tempMatch) {
      vitals.temperature = tempMatch[1];
    }
    
    // Respiratory rate
    const rrPattern = /(?:rr|respiratory rate|resp)[:\s]*(\d+)/i;
    const rrMatch = text.match(rrPattern);
    if (rrMatch) {
      vitals.respiratoryRate = rrMatch[1];
    }
    
    // Oxygen saturation
    const o2Pattern = /(?:o2|oxygen|sat|spo2)[:\s]*(\d+)%?/i;
    const o2Match = text.match(o2Pattern);
    if (o2Match) {
      vitals.oxygenSaturation = `${o2Match[1]}%`;
    }
    
    return Object.keys(vitals).length > 0 ? vitals : null;
  }
  
  extractLabs(text) {
    const labs = {};
    
    // Common lab values
    const labPatterns = {
      glucose: /(?:glucose|blood sugar)[:\s]*(\d+)/i,
      hemoglobin: /(?:hemoglobin|hgb|hb)[:\s]*(\d+\.?\d*)/i,
      hematocrit: /(?:hematocrit|hct)[:\s]*(\d+\.?\d*)/i,
      creatinine: /creatinine[:\s]*(\d+\.?\d*)/i,
      bun: /bun[:\s]*(\d+)/i,
      sodium: /(?:sodium|na)[:\s]*(\d+)/i,
      potassium: /(?:potassium|k)[:\s]*(\d+\.?\d*)/i,
      chloride: /(?:chloride|cl)[:\s]*(\d+)/i,
      co2: /co2[:\s]*(\d+)/i,
      wbc: /(?:wbc|white blood cell)[:\s]*(\d+\.?\d*)/i,
      platelets: /platelets[:\s]*(\d+)/i
    };
    
    Object.keys(labPatterns).forEach(lab => {
      const match = text.match(labPatterns[lab]);
      if (match) {
        labs[lab] = match[1];
      }
    });
    
    return Object.keys(labs).length > 0 ? labs : null;
  }
  
  extractImaging(text) {
    const imagingFindings = [];
    
    const imagingPatterns = [
      /(?:chest x-ray|cxr)[:\s]*(.*?)(?:\n|\.)/i,
      /(?:ct scan|computed tomography)[:\s]*(.*?)(?:\n|\.)/i,
      /(?:mri|magnetic resonance)[:\s]*(.*?)(?:\n|\.)/i,
      /(?:ultrasound|us)[:\s]*(.*?)(?:\n|\.)/i,
      /(?:echocardiogram|echo)[:\s]*(.*?)(?:\n|\.)/i,
      /(?:ekg|ecg|electrocardiogram)[:\s]*(.*?)(?:\n|\.)/i
    ];
    
    imagingPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match && match[1]) {
        imagingFindings.push(match[1].trim());
      }
    });
    
    return imagingFindings.length > 0 ? imagingFindings : null;
  }
  
  extractAllergies(text) {
    const allergyPatterns = [
      /allergies?[:\s]*(.*?)(?:\n|\.)/i,
      /allergic to[:\s]*(.*?)(?:\n|\.)/i,
      /nkda|no known drug allergies/i
    ];
    
    for (const pattern of allergyPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].toLowerCase().includes('nkda') || match[0].toLowerCase().includes('no known')) {
          return 'NKDA (No Known Drug Allergies)';
        } else if (match[1]) {
          return match[1].trim();
        }
      }
    }
    
    return null;
  }
  
  extractSocialHistory(text) {
    const socialPatterns = [
      /social history[:\s]*(.*?)(?:\n|\.)/i,
      /smoking[:\s]*(.*?)(?:\n|\.)/i,
      /alcohol[:\s]*(.*?)(?:\n|\.)/i,
      /tobacco[:\s]*(.*?)(?:\n|\.)/i
    ];
    
    const socialFindings = [];
    
    socialPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match && match[1]) {
        socialFindings.push(match[1].trim());
      }
    });
    
    return socialFindings.length > 0 ? socialFindings.join('; ') : null;
  }
  
  extractFamilyHistory(text) {
    const familyPatterns = [
      /family history[:\s]*(.*?)(?:\n|\.)/i,
      /fh[:\s]*(.*?)(?:\n|\.)/i
    ];
    
    for (const pattern of familyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }
  
  extractReviewOfSystems(text) {
    const rosFindings = [];
    
    // Look for positive ROS findings
    const rosPatterns = [
      /review of systems[:\s]*(.*?)(?:\n|\.)/i,
      /ros[:\s]*(.*?)(?:\n|\.)/i,
      /patient (?:reports|denies|admits to)[:\s]*(.*?)(?:\n|\.)/i
    ];
    
    rosPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match && match[1]) {
        rosFindings.push(match[1].trim());
      }
    });
    
    return rosFindings.length > 0 ? rosFindings : null;
  }
  
  extractPhysicalExam(text) {
    const examFindings = [];
    
    const examPatterns = [
      /physical exam[:\s]*(.*?)(?:\n|\.)/i,
      /examination[:\s]*(.*?)(?:\n|\.)/i,
      /on exam[:\s]*(.*?)(?:\n|\.)/i,
      /appears[:\s]*(.*?)(?:\n|\.)/i
    ];
    
    examPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match && match[1]) {
        examFindings.push(match[1].trim());
      }
    });
    
    return examFindings.length > 0 ? examFindings : null;
  }
  
  extractTimeline(text) {
    const timelinePatterns = [
      /(\d+)\s*(?:days?|weeks?|months?|years?)\s*(?:ago|prior)/i,
      /since\s*(\d+)\s*(?:days?|weeks?|months?|years?)/i,
      /for\s*(\d+)\s*(?:days?|weeks?|months?|years?)/i
    ];
    
    const timeline = [];
    
    timelinePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        timeline.push(matches[0]);
      }
    });
    
    return timeline.length > 0 ? timeline : null;
  }
  
  enhanceMedicalInfo(info, options) {
    // Set appropriate chief complaint
    if (!info.chiefComplaint || info.chiefComplaint === 'General medical evaluation') {
      if (info.symptoms.length > 0) {
        info.chiefComplaint = info.symptoms[0];
      }
    }
    
    // Add clinical context
    info.clinicalContext = this.generateClinicalContext(info);
    
    // Generate differential diagnosis
    info.differentialDiagnosis = this.generateDifferentialDiagnosis(info);
    
    // Add assessment and plan considerations
    info.assessmentPlan = this.generateAssessmentPlan(info, options);
    
    return info;
  }
  
  generateClinicalContext(info) {
    const contexts = [];
    
    if (info.demographics.age) {
      if (info.demographics.age < 18) {
        contexts.push('pediatric patient');
      } else if (info.demographics.age > 65) {
        contexts.push('elderly patient');
      }
    }
    
    if (info.conditions.length > 0) {
      contexts.push(`known ${info.conditions.join(', ')}`);
    }
    
    if (info.medications.length > 0) {
      contexts.push('on current medications');
    }
    
    return contexts.join(' with ');
  }
  
  generateDifferentialDiagnosis(info) {
    const differentials = [];
    
    // Based on chief complaint and symptoms
    if (info.chiefComplaint.includes('chest pain')) {
      differentials.push('acute coronary syndrome', 'pulmonary embolism', 'costochondritis', 'gastroesophageal reflux');
    }
    
    if (info.chiefComplaint.includes('shortness of breath')) {
      differentials.push('heart failure', 'pulmonary embolism', 'pneumonia', 'asthma exacerbation');
    }
    
    if (info.chiefComplaint.includes('abdominal pain')) {
      differentials.push('appendicitis', 'cholecystitis', 'peptic ulcer disease', 'bowel obstruction');
    }
    
    // Add based on existing conditions
    info.conditions.forEach(condition => {
      if (condition.includes('diabetes') && info.symptoms.includes('fatigue')) {
        differentials.push('diabetic ketoacidosis', 'hypoglycemia');
      }
    });
    
    return [...new Set(differentials)];
  }
  
  generateAssessmentPlan(info, options) {
    const plan = {
      diagnostic: [],
      therapeutic: [],
      monitoring: [],
      followUp: []
    };
    
    // Diagnostic considerations
    if (info.symptoms.includes('chest pain')) {
      plan.diagnostic.push('EKG', 'chest X-ray', 'cardiac enzymes');
    }
    
    if (info.symptoms.includes('shortness of breath')) {
      plan.diagnostic.push('chest X-ray', 'BNP', 'arterial blood gas');
    }
    
    if (info.conditions.includes('diabetes mellitus')) {
      plan.monitoring.push('hemoglobin A1c', 'glucose monitoring');
    }
    
    // Therapeutic considerations
    if (info.conditions.includes('hypertension')) {
      plan.therapeutic.push('continue antihypertensive therapy', 'lifestyle modifications');
    }
    
    // Follow-up
    plan.followUp.push('return in 1-2 weeks or sooner if symptoms worsen');
    
    return plan;
  }
  
  generateSOAPNote(info, options) {
    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    
    let soap = `CLINICAL HISTORY - SOAP FORMAT
Generated: ${timestamp}
Detail Level: ${options.detailLevel || 'standard'}
Source: AI-Generated from Medical Documentation

====================================================================

SUBJECTIVE:

Chief Complaint: ${this.capitalizeFirst(info.chiefComplaint)}

History of Present Illness:
${this.generateHPI(info, options)}

Past Medical History:
${this.generatePMH(info)}

Medications:
${this.generateMedicationList(info, options)}

Allergies:
${info.allergies || 'NKDA (No Known Drug Allergies)'}

Social History:
${info.socialHistory || 'To be obtained during clinical encounter'}

Family History:
${info.familyHistory || 'Non-contributory or to be obtained'}

Review of Systems:
${this.generateROS(info)}

OBJECTIVE:

Vital Signs:
${this.formatVitals(info.vitals)}

Physical Examination:
${this.generatePhysicalExam(info)}

Laboratory Results:
${this.formatLabs(info.labs)}

Imaging Studies:
${this.formatImaging(info.imaging)}

ASSESSMENT:
${this.generateAssessment(info, options)}

PLAN:
${this.generatePlan(info, options)}

====================================================================
Generated by Clinical History AI Agent
Note: This is an AI-generated summary. Please verify all clinical information
and correlate with direct patient assessment before making medical decisions.
====================================================================`;

    return soap;
  }
  
  generateNarrativeHistory(info, options) {
    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    
    return `CLINICAL HISTORY - NARRATIVE FORMAT
Generated: ${timestamp}
Detail Level: ${options.detailLevel || 'standard'}

====================================================================

PATIENT PRESENTATION:

${this.generatePatientIntroduction(info)} The patient presents with ${info.chiefComplaint}. ${this.generateNarrativeHPI(info)}

MEDICAL BACKGROUND:

${this.generateMedicalHistoryNarrative(info)}

CURRENT CLINICAL STATUS:

${this.generateCurrentStatusNarrative(info)}

${options.includeMedications && info.medications.length > 0 ? 
`CURRENT THERAPEUTIC REGIMEN:

The patient is currently managed with ${this.formatMedicationsNarrative(info.medications)}. Medication adherence and therapeutic effectiveness should be regularly assessed during clinical encounters.` : ''}

CLINICAL ASSESSMENT AND MANAGEMENT APPROACH:

${this.generateAssessmentAndPlanNarrative(info, options)}

RECOMMENDED FOLLOW-UP AND MONITORING:

${this.generateFollowUpRecommendations(info)}

CLINICAL CONSIDERATIONS:

${this.generateClinicalConsiderations(info)}

====================================================================
Generated by Clinical History AI Agent
Note: This narrative summary is AI-generated from source documentation.
All clinical information should be verified through direct patient assessment.
====================================================================`;
  }
  
  generateStructuredHistory(info, options) {
    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    
    return `STRUCTURED CLINICAL HISTORY
Generated: ${timestamp}
Detail Level: ${options.detailLevel || 'standard'}

====================================================================

1. PATIENT DEMOGRAPHICS
   ${this.formatDemographics(info.demographics)}

2. PRESENTING COMPLAINT
   Chief Complaint: ${this.capitalizeFirst(info.chiefComplaint)}
   
3. HISTORY OF PRESENT ILLNESS
   ${this.generateStructuredHPI(info)}
   
4. PAST MEDICAL HISTORY
${info.conditions.length > 0 ? 
  info.conditions.map((c, i) => `   ${i + 1}. ${this.capitalizeFirst(c)} ${this.getICD10(c, options)}`).join('\n') :
  '   No significant past medical history documented'}

5. CURRENT MEDICATIONS
${info.medications.length > 0 ?
  info.medications.map((med, i) => `   ${i + 1}. ${this.capitalizeFirst(med)}`).join('\n') :
  '   No current medications documented'}

6. ALLERGIES
   ${info.allergies || 'NKDA (No Known Drug Allergies)'}

7. SOCIAL HISTORY
   ${info.socialHistory || 'To be obtained during clinical encounter'}

8. FAMILY HISTORY
   ${info.familyHistory || 'Non-contributory or to be obtained'}

9. REVIEW OF SYSTEMS
   ${this.generateStructuredROS(info)}

10. PHYSICAL EXAMINATION
    ${this.generateStructuredPhysicalExam(info)}

11. DIAGNOSTIC STUDIES
    ${this.generateDiagnosticStudies(info)}

12. CLINICAL ASSESSMENT
    ${this.generateStructuredAssessment(info, options)}

13. MANAGEMENT PLAN
    ${this.generateStructuredManagementPlan(info, options)}

14. FOLLOW-UP RECOMMENDATIONS
    ${this.generateStructuredFollowUp(info)}

====================================================================
Generated by Clinical History AI Agent
Clinical Decision Support Tool - Verify all information clinically
====================================================================`;
  }
  
  // Helper methods for generating specific sections
  
  generateHPI(info, options) {
    const hpiElements = [];
    
    // Primary complaint
    hpiElements.push(`Patient reports ${info.chiefComplaint} that has been present for ${this.getTimeFrame(info)}.`);
    
    // Associated symptoms
    if (info.symptoms.length > 1) {
      const associatedSymptoms = info.symptoms.slice(1);
      hpiElements.push(`Associated symptoms include ${associatedSymptoms.join(', ')}.`);
    }
    
    // Severity and quality
    hpiElements.push(this.generateSeverityQuality(info));
    
    // Precipitating factors
    hpiElements.push('Precipitating and alleviating factors to be determined during clinical assessment.');
    
    // Timeline
    if (info.timeline) {
      hpiElements.push(`Timeline: ${info.timeline.join(', ')}.`);
    }
    
    return hpiElements.join(' ');
  }
  
  generateNarrativeHPI(info) {
    return `The clinical presentation involves ${info.symptoms.join(', ') || 'symptoms requiring evaluation'} in the context of ${info.conditions.join(', ') || 'the patient\'s medical history'}. Detailed assessment and clinical correlation are indicated to establish the etiology and guide appropriate management.`;
  }
  
  generateStructuredHPI(info) {
    const elements = [];
    elements.push(`Onset: ${this.getTimeFrame(info)}`);
    elements.push(`Location: ${this.getLocation(info)}`);
    elements.push(`Duration: ${this.getDuration(info)}`);
    elements.push(`Character: ${this.getCharacter(info)}`);
    elements.push(`Associated symptoms: ${info.symptoms.slice(1).join(', ') || 'None specifically noted'}`);
    elements.push(`Timing: ${this.getTiming(info)}`);
    elements.push(`Exacerbating factors: To be determined`);
    elements.push(`Relieving factors: To be determined`);
    elements.push(`Severity: To be assessed (1-10 scale)`);
    
    return elements.map(e => `   ${e}`).join('\n');
  }
  
  generatePMH(info) {
    if (info.conditions.length === 0) {
      return '• No significant past medical history documented';
    }
    
    return info.conditions.map(condition => {
      const icd10 = this.medicalTerms.icd10Codes[condition] || 'ICD-10: To be determined';
      return `• ${this.capitalizeFirst(condition)} (${icd10})`;
    }).join('\n');
  }
  
  generateMedicationList(info, options) {
    if (!options.includeMedications || info.medications.length === 0) {
      return '• No medications documented or medication reconciliation needed';
    }
    
    return info.medications.map(med => `• ${this.capitalizeFirst(med)}`).join('\n');
  }
  
  generateROS(info) {
    if (info.reviewOfSystems && info.reviewOfSystems.length > 0) {
      return info.reviewOfSystems.join('; ') + '\nComplete review of systems to be obtained during clinical encounter.';
    }
    return 'Complete review of systems to be obtained during clinical encounter.';
  }
  
  generatePhysicalExam(info) {
    if (info.physicalExam && info.physicalExam.length > 0) {
      return info.physicalExam.join('; ') + '\nComplete physical examination to be performed during clinical encounter.';
    }
    return 'Complete physical examination to be performed during clinical encounter.';
  }
  
  generateAssessment(info, options) {
    let assessment = 'PRIMARY DIAGNOSES:\n';
    
    if (info.conditions.length > 0) {
      info.conditions.forEach((condition, index) => {
        const icd10 = options.includeICD10 ? 
          ` (${this.medicalTerms.icd10Codes[condition] || 'ICD-10: To be determined'})` : '';
        assessment += `${index + 1}. ${this.capitalizeFirst(condition)}${icd10}\n`;
      });
    } else {
      assessment += '1. Working diagnosis pending comprehensive clinical evaluation\n';
    }
    
    if (info.symptoms.length > 0) {
      assessment += '\nSYMPTOMS FOR EVALUATION:\n';
      info.symptoms.forEach((symptom, index) => {
        const icd10 = options.includeICD10 ? 
          ` (${this.medicalTerms.icd10Codes[symptom] || 'R69 - Illness, unspecified'})` : '';
        assessment += `${index + 1}. ${this.capitalizeFirst(symptom)}${icd10}\n`;
      });
    }
    
    if (info.differentialDiagnosis && info.differentialDiagnosis.length > 0) {
      assessment += '\nDIFFERENTIAL DIAGNOSIS:\n';
      info.differentialDiagnosis.forEach((dx, index) => {
        assessment += `${index + 1}. ${this.capitalizeFirst(dx)}\n`;
      });
    }
    
    return assessment;
  }
  
  generatePlan(info, options) {
    const planSections = [];
    
    // Diagnostic plan
    if (info.assessmentPlan && info.assessmentPlan.diagnostic.length > 0) {
      planSections.push('DIAGNOSTIC:');
      info.assessmentPlan.diagnostic.forEach((item, index) => {
        planSections.push(`${index + 1}. ${item}`);
      });
      planSections.push('');
    }
    
    // Therapeutic plan
    planSections.push('THERAPEUTIC:');
    if (info.assessmentPlan && info.assessmentPlan.therapeutic.length > 0) {
      info.assessmentPlan.therapeutic.forEach((item, index) => {
        planSections.push(`${index + 1}. ${item}`);
      });
    } else {
      planSections.push('1. Continue current medications as prescribed with regular monitoring');
      planSections.push('2. Lifestyle modifications as appropriate');
    }
    planSections.push('');
    
    // Monitoring plan
    planSections.push('MONITORING:');
    if (info.assessmentPlan && info.assessmentPlan.monitoring.length > 0) {
      info.assessmentPlan.monitoring.forEach((item, index) => {
        planSections.push(`${index + 1}. ${item}`);
      });
    } else {
      planSections.push('1. Regular clinical assessment and vital signs monitoring');
      planSections.push('2. Laboratory studies as clinically indicated');
    }
    planSections.push('');
    
    // Follow-up plan
    planSections.push('FOLLOW-UP:');
    if (info.assessmentPlan && info.assessmentPlan.followUp.length > 0) {
      info.assessmentPlan.followUp.forEach((item, index) => {
        planSections.push(`${index + 1}. ${this.capitalizeFirst(item)}`);
      });
    } else {
      planSections.push('1. Clinical reassessment in 1-2 weeks or sooner if symptoms worsen');
      planSections.push('2. Patient education provided regarding condition management');
      planSections.push('3. Return precautions discussed');
    }
    
    return planSections.join('\n');
  }
  
  // Additional helper methods
  
  formatVitals(vitals) {
    if (!vitals) {
      return 'Vital signs to be obtained during clinical encounter';
    }
    
    const vitalStrings = [];
    if (vitals.bloodPressure) vitalStrings.push(`BP: ${vitals.bloodPressure} mmHg`);
    if (vitals.heartRate) vitalStrings.push(`HR: ${vitals.heartRate} bpm`);
    if (vitals.temperature) vitalStrings.push(`Temp: ${vitals.temperature}°F`);
    if (vitals.respiratoryRate) vitalStrings.push(`RR: ${vitals.respiratoryRate}/min`);
    if (vitals.oxygenSaturation) vitalStrings.push(`O2 Sat: ${vitals.oxygenSaturation}`);
    
    return vitalStrings.join(', ') || 'Stable, within normal limits';
  }
  
  formatLabs(labs) {
    if (!labs) {
      return 'Laboratory studies to be obtained as clinically indicated';
    }
    
    const labStrings = [];
    Object.keys(labs).forEach(lab => {
      labStrings.push(`${lab}: ${labs[lab]}`);
    });
    
    return labStrings.join(', ');
  }
  
  formatImaging(imaging) {
    if (!imaging || imaging.length === 0) {
      return 'Imaging studies to be obtained as clinically indicated';
    }
    
    return imaging.join('; ');
  }
  
  formatDemographics(demographics) {
    const parts = [];
    
    if (demographics.age) {
      parts.push(`Age: ${demographics.age} years old`);
    }
    
    if (demographics.gender) {
      parts.push(`Gender: ${this.capitalizeFirst(demographics.gender)}`);
    }
    
    if (demographics.race) {
      parts.push(`Race: ${this.capitalizeFirst(demographics.race)}`);
    }
    
    return parts.join(', ') || 'Demographics to be obtained';
  }
  
  getICD10(condition, options) {
    if (!options.includeICD10) return '';
    
    const code = this.medicalTerms.icd10Codes[condition.toLowerCase()];
    return code ? `(${code})` : '(ICD-10: TBD)';
  }
  
  getTimeFrame(info) {
    if (info.timeline && info.timeline.length > 0) {
      return info.timeline[0];
    }
    return 'an undetermined duration';
  }
  
  getLocation(info) {
    // Simple location extraction based on complaint
    if (info.chiefComplaint.includes('chest')) return 'chest';
    if (info.chiefComplaint.includes('abdominal')) return 'abdomen';
    if (info.chiefComplaint.includes('head')) return 'head';
    if (info.chiefComplaint.includes('back')) return 'back';
    return 'to be determined';
  }
  
  getDuration(info) {
    return this.getTimeFrame(info);
  }
  
  getCharacter(info) {
    // Provide character based on complaint type
    if (info.chiefComplaint.includes('pain')) {
      return 'character to be described (sharp, dull, aching, burning, etc.)';
    }
    return 'quality to be characterized during assessment';
  }
  
  getTiming(info) {
    return 'timing pattern to be established during clinical interview';
  }
  
  generateSeverityQuality(info) {
    if (info.chiefComplaint.includes('pain')) {
      return 'Pain severity and quality to be assessed using appropriate pain scales.';
    }
    return 'Symptom severity and characteristics to be evaluated during clinical assessment.';
  }
  
  generatePatientIntroduction(info) {
    const demo = info.demographics;
    let intro = 'This patient is ';
    
    if (demo.age && demo.gender) {
      intro += `a ${demo.age}-year-old ${demo.gender}`;
    } else if (demo.age) {
      intro += `a ${demo.age}-year-old individual`;
    } else if (demo.gender) {
      intro += `a ${demo.gender} patient`;
    } else {
      intro += 'an individual';
    }
    
    if (info.conditions.length > 0) {
      intro += ` with a medical history significant for ${info.conditions.join(', ')}.`;
    } else {
      intro += ' with no significant documented past medical history.';
    }
    
    return intro;
  }
  
  formatMedicationsNarrative(medications) {
    if (medications.length === 0) return 'no documented medications';
    if (medications.length === 1) return medications[0];
    if (medications.length === 2) return `${medications[0]} and ${medications[1]}`;
    
    const lastMed = medications[medications.length - 1];
    const otherMeds = medications.slice(0, -1);
    return `${otherMeds.join(', ')}, and ${lastMed}`;
  }
  
  generateMedicalHistoryNarrative(info) {
    if (info.conditions.length === 0) {
      return 'The patient has no significant documented past medical history at this time.';
    }
    
    return `The patient has a significant medical history including ${info.conditions.join(', ')}. These conditions require ongoing management and clinical monitoring, and may be relevant to the current clinical presentation.`;
  }
  
  generateCurrentStatusNarrative(info) {
    const statusElements = [];
    
    if (info.vitals) {
      statusElements.push(`Current vital signs: ${this.formatVitals(info.vitals)}.`);
    }
    
    if (info.labs) {
      statusElements.push(`Recent laboratory results show: ${this.formatLabs(info.labs)}.`);
    }
    
    if (info.imaging) {
      statusElements.push(`Imaging studies demonstrate: ${this.formatImaging(info.imaging)}.`);
    }
    
    if (statusElements.length === 0) {
      return 'Current clinical status requires comprehensive assessment including vital signs, physical examination, and appropriate diagnostic studies.';
    }
    
    return statusElements.join(' ');
  }
  
  generateAssessmentAndPlanNarrative(info, options) {
    return `Based on the available clinical information, the patient requires comprehensive evaluation for ${info.chiefComplaint}. The clinical presentation in the context of ${info.conditions.join(', ') || 'the patient\'s overall health status'} warrants careful assessment and evidence-based management. Treatment decisions should incorporate current clinical guidelines, patient preferences, and individualized risk-benefit considerations.`;
  }
  
  generateFollowUpRecommendations(info) {
    const recommendations = [
      'Regular follow-up appointments should be scheduled based on clinical judgment and condition severity.',
      'Patient should be advised to seek immediate medical attention if symptoms worsen or new concerning features develop.',
      'Medication adherence and therapeutic response should be monitored at each visit.',
      'Lifestyle modifications and patient education should be reinforced during follow-up encounters.'
    ];
    
    return recommendations.join(' ');
  }
  
  generateClinicalConsiderations(info) {
    const considerations = [];
    
    if (info.conditions.length > 2) {
      considerations.push('Multi-morbidity considerations require coordinated care approach.');
    }
    
    if (info.medications.length > 5) {
      considerations.push('Polypharmacy assessment needed for drug interactions and optimization.');
    }
    
    if (info.demographics.age && info.demographics.age > 65) {
      considerations.push('Geriatric considerations include age-appropriate screening and functional assessment.');
    }
    
    if (considerations.length === 0) {
      considerations.push('Standard clinical considerations apply for comprehensive patient care.');
    }
    
    return considerations.join(' ');
  }
  
  generateStructuredROS(info) {
    if (info.reviewOfSystems && info.reviewOfSystems.length > 0) {
      return `   Positive: ${info.reviewOfSystems.join(', ')}\n   Negative: Complete ROS to be obtained`;
    }
    return '   Complete review of systems to be obtained during clinical encounter';
  }
  
  generateStructuredPhysicalExam(info) {
    if (info.physicalExam && info.physicalExam.length > 0) {
      return `   Findings: ${info.physicalExam.join(', ')}\n   Complete examination to be performed`;
    }
    return '   Complete physical examination to be performed during clinical encounter';
  }
  
  generateDiagnosticStudies(info) {
    const studies = [];
    
    if (info.labs) {
      studies.push(`Laboratory: ${this.formatLabs(info.labs)}`);
    }
    
    if (info.imaging) {
      studies.push(`Imaging: ${this.formatImaging(info.imaging)}`);
    }
    
    if (info.procedures && info.procedures.length > 0) {
      studies.push(`Procedures: ${info.procedures.join(', ')}`);
    }
    
    if (studies.length === 0) {
      return '   Diagnostic studies to be obtained as clinically indicated';
    }
    
    return studies.map(s => `   ${s}`).join('\n');
  }
  
  generateStructuredAssessment(info, options) {
    const assessment = [];
    
    assessment.push('   Clinical impression based on available information:');
    
    if (info.conditions.length > 0) {
      assessment.push('   Established diagnoses:');
      info.conditions.forEach((condition, index) => {
        const icd10 = this.getICD10(condition, options);
        assessment.push(`     ${index + 1}. ${this.capitalizeFirst(condition)} ${icd10}`);
      });
    }
    
    if (info.symptoms.length > 0) {
      assessment.push('   Active symptoms requiring evaluation:');
      info.symptoms.forEach((symptom, index) => {
        assessment.push(`     ${index + 1}. ${this.capitalizeFirst(symptom)}`);
      });
    }
    
    return assessment.join('\n');
  }
  
  generateStructuredManagementPlan(info, options) {
    const plan = [];
    
    plan.push('   Comprehensive management approach:');
    plan.push('     1. Continue evidence-based treatment protocols');
    plan.push('     2. Monitor therapeutic response and adjust as needed');
    plan.push('     3. Address modifiable risk factors');
    plan.push('     4. Coordinate care with specialists as appropriate');
    plan.push('     5. Patient education and counseling');
    
    return plan.join('\n');
  }
  
  generateStructuredFollowUp(info) {
    return `   1. Schedule appropriate follow-up based on condition acuity
   2. Provide clear return precautions and warning signs
   3. Ensure medication reconciliation and adherence
   4. Coordinate with other healthcare providers as needed
   5. Document all clinical decisions and patient communications`;
  }
  
  addMetadataAndValidation(clinicalHistory, fileName, options) {
    const metadata = `
DOCUMENT METADATA:
=================
Source File: ${fileName}
Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}
Format: ${options.outputFormat || 'SOAP'}
Detail Level: ${options.detailLevel || 'standard'}
ICD-10 Codes: ${options.includeICD10 ? 'Included' : 'Not included'}
Medications: ${options.includeMedications ? 'Included' : 'Not included'}
Generator: Clinical History AI Agent v1.0

IMPORTANT DISCLAIMERS:
=====================
• This clinical history is AI-generated from source documentation
• All information should be verified through direct patient assessment
• Clinical correlation and professional judgment are required
• This tool is for clinical decision support only
• Always follow institutional protocols and guidelines

`;
    
    return clinicalHistory + '\n\n' + metadata;
  }
  
  capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = new ClinicalHistoryGenerator();
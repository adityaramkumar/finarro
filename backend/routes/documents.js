const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and CSV files are allowed.'));
    }
  }
});

// Get all documents for user
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const documents = await db('documents')
      .where('user_id', req.user.id)
      .select('*')
      .orderBy('created_at', 'desc');

    res.json(documents);
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Upload document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, type } = req.body;
    
    // Check for duplicate document (same filename, size, and user)
    const existingDocument = await db('documents')
      .where('user_id', req.user.id)
      .where('original_filename', req.file.originalname)
      .where('file_size', req.file.size.toString())
      .first();

    if (existingDocument) {
      // Remove the uploaded file since it's a duplicate
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(409).json({ 
        error: 'Document already exists', 
        message: `A document with the name "${req.file.originalname}" and same size already exists in your account.`,
        existing_document: existingDocument
      });
    }
    
    const result = await db('documents').insert({
      user_id: req.user.id,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      document_type: type || 'other',
      file_path: req.file.path,
      file_size: req.file.size.toString(),
      mime_type: req.file.mimetype,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    let documentId;
    if (Array.isArray(result)) {
      documentId = result[0].id || result[0];
    } else {
      documentId = result.id || result;
    }
    
    const document = await db('documents')
      .where('id', documentId)
      .first();

    res.status(201).json(document);
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await db('documents')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await db('documents')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = document.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, document.original_filename);
  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await db('documents')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await db('documents').where('id', req.params.id).del();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update document metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    const document = await db('documents')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db('documents')
      .where('id', req.params.id)
      .update({
        original_filename: name,
        document_type: type,
        updated_at: new Date()
      });

    const updatedDocument = await db('documents')
      .where('id', req.params.id)
      .first();

    res.json(updatedDocument);
  } catch (error) {
    logger.error('Error updating document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analyze document with AI
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const document = await db('documents')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // For now, return a basic analysis based on document type
    // In a real implementation, you would use AI to analyze the document content
    const analysis = {
      summary: `Analysis of ${document.original_filename} (${document.document_type})`,
      insights: [
        'Document uploaded successfully',
        'Ready for review and processing',
        'Use AI chat for detailed analysis'
      ],
      keyMetrics: {
        fileSize: document.file_size,
        uploadDate: document.created_at,
        documentType: document.document_type
      }
    };

    // Update document with analysis
    await db('documents')
      .where('id', req.params.id)
      .update({
        ai_analysis: JSON.stringify(analysis),
        is_processed: true,
        processed_at: new Date(),
        updated_at: new Date()
      });

    res.json(analysis);
  } catch (error) {
    logger.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
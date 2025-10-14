import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import prisma from '../src/db/prismaClient.js';
import { parsePDF } from '../utils/pdfParser.js';
import { parseCSV } from '../utils/csvParser.js';
import { storeMedicalDocument, deleteMedicalDocumentEmbeddings } from '../services/vectorStorage.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/medical'); // Fixed: relative to backend directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// Upload file
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Extract data based on file type
    let extractedData = null;
    let extractedText = '';
    
    try {
      if (req.file.mimetype === 'application/pdf') {
        extractedData = await parsePDF(req.file.path); // Use req.file.path for local files
        extractedText = extractedData?.text || '';
      } else if (req.file.mimetype === 'text/csv') {
        extractedData = await parseCSV(req.file.path); // Use req.file.path for local files
        // Convert CSV rows to text for embedding
        if (extractedData?.rows) {
          extractedText = extractedData.rows
            .map(row => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', '))
            .join('\n');
        }
      }
      // Add image OCR parsing here if needed
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      // Continue even if parsing fails
    }

    // Save to database (Prisma)
    const medicalFile = await prisma.medicalFile.create({
      data: {
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: `/uploads/medical/${req.file.filename}`, // Local URL
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        extractedData
      }
    });

    // 💾 STORE EMBEDDINGS: Store document in ChromaDB asynchronously
    if (extractedText && extractedText.trim().length > 0) {
      storeMedicalDocument(medicalFile.id, extractedText, {
        userId: req.user.id,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        category: medicalFile.category
      }).catch(err => console.error('Error storing document embeddings:', err));
    }

    // Return file data including extracted info for display
    res.json({
      success: true,
      file: {
        ...medicalFile,
        hasExtractedData: extractedText && extractedText.trim().length > 0,
        textPreview: extractedText ? extractedText.substring(0, 200) : null
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get user's files
router.get('/', authenticate, async (req, res) => {
  try {
    const files = await prisma.medicalFile.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    // Add hasExtractedData flag for each file
    const filesWithMeta = files.map(file => ({
      ...file,
      hasExtractedData: file.extractedData && !file.extractedData.error
    }));
    
    res.json({ files: filesWithMeta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/:fileId', authenticate, async (req, res) => {
  try {
    const file = await prisma.medicalFile.findFirst({
      where: { id: req.params.fileId, userId: req.user.id }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    await prisma.medicalFile.delete({
      where: { id: req.params.fileId }
    });
    
    deleteMedicalDocumentEmbeddings(req.params.fileId).catch(err =>
      console.error('Error deleting document embeddings:', err)
    );
    
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
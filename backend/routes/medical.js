import express from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../src/db/prismaClient.js';

const router = express.Router();

// Basic health check for medical routes
router.get('/ping', (req, res) => {
  res.json({ ok: true, route: 'medical' });
});

// Get medical statistics for dashboard
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Count medical files
    const fileCount = await prisma.medicalFile.count({
      where: { userId }
    });
    
    // Count chats
    const chatCount = await prisma.chat.count({
      where: { userId, isActive: true }
    });
    
    // Count total messages
    const messageCount = await prisma.message.count({
      where: {
        chat: { userId }
      }
    });
    
    // Get file categories breakdown
    const filesByCategory = await prisma.medicalFile.groupBy({
      by: ['category'],
      where: { userId },
      _count: true
    });
    
    // Recent activity
    const recentFiles = await prisma.medicalFile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        originalName: true,
        fileType: true,
        category: true,
        createdAt: true
      }
    });
    
    const recentChats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      statistics: {
        totalFiles: fileCount,
        totalChats: chatCount,
        totalMessages: messageCount,
        filesByCategory: filesByCategory.map(item => ({
          category: item.category,
          count: item._count
        }))
      },
      recentActivity: {
        files: recentFiles,
        chats: recentChats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get medical file by ID with details
router.get('/file/:fileId', authenticate, async (req, res) => {
  try {
    const file = await prisma.medicalFile.findFirst({
      where: {
        id: req.params.fileId,
        userId: req.user.id
      }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;




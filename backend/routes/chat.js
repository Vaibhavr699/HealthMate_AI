import express from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../src/db/prismaClient.js';
import { CohereClient } from 'cohere-ai';
import { storeChatMessage, searchAll, deleteChatEmbeddings } from '../services/vectorStorage.js';

const router = express.Router();
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true, isActive: true }
    });
    
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search/:keyword', authenticate, async (req, res) => {
  try {
    const keyword = req.params.keyword.toLowerCase();
    
    const chats = await prisma.chat.findMany({
      where: { 
        userId: req.user.id,
        messages: {
          some: {
            content: {
              contains: keyword,
              mode: 'insensitive'
            }
          }
        }
      },
      include: {
        messages: {
          where: {
            content: {
              contains: keyword,
              mode: 'insensitive'
            }
          },
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({ 
      keyword, 
      results: chats,
      count: chats.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, userId: req.user.id },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/message', authenticate, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id;

    console.log('🔍 Searching for relevant context for:', message);
    const semanticResults = await searchAll(message, userId, {
      chatMessagesLimit: 5,
      medicalDocsLimit: 3
    });
    
    console.log('📊 Search results:');
    console.log('   Chat messages:', semanticResults.chatMessages?.length || 0);
    console.log('   Medical docs:', semanticResults.medicalDocuments?.length || 0);

    const relevantChatHistory = semanticResults.chatMessages
      .filter(msg => msg.similarity > 0.5)
      .map(msg => {
        console.log('   ✓ Chat msg (similarity:', msg.similarity.toFixed(2), ')');
        return `${msg.metadata.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
      })
      .join('\n');

    const relevantMedicalDocs = semanticResults.medicalDocuments
      .filter(doc => doc.similarity > 0.5)
      .map(doc => {
        console.log('   ✓ Doc (similarity:', doc.similarity.toFixed(2), '):', doc.metadata.filename);
        return `[${doc.metadata.filename}]: ${doc.content}`;
      })
      .join('\n\n');
    
    console.log('📝 Final context lengths - Chat:', relevantChatHistory.length, 'Docs:', relevantMedicalDocs.length);




    let currentChatContext = '';
    if (chatId) {
      const currentChat = await prisma.chat.findFirst({
        where: { id: chatId, userId },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 6
          }
        }
      });
      
      if (currentChat) {
        currentChatContext = currentChat.messages
          .reverse()
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');
      }
    }

    const systemPrompt = `You are a helpful medical assistant. You provide medical information and education like a professional experienced Doctor. You can also read the Medical record of the patient and provide advise to them.

${currentChatContext ? `Current Conversation:\n${currentChatContext}\n` : ''}

${relevantMedicalDocs ? `Relevant Medical Records:\n${relevantMedicalDocs}\n` : ''}

${relevantChatHistory ? `Relevant Past Discussions:\n${relevantChatHistory}\n` : ''}

Important Guidelines: 
- Explain what symptoms or conditions might mean in general terms
- Always suggest consulting a doctor for serious concerns
- Be empathetic and clear
- Use simple language
- Reference the relevant context above when answering
- If user asks about their medical records, use the medical records context
- If user asks about past discussions, reference the past discussions
- If user describes symptoms, suggest seeing a healthcare provider
- Provide general information about medications — what they are, how they work, and possible side effects — without prescribing or recommending them
- Help user prepare questions to ask their doctor`;

    const chatResult = await cohere.v2.chat({
      model: 'command-r-08-2024',
      messages: [
        {
          role: 'user',
          content: systemPrompt + '\n\n' + message
        }
      ]
    });
    
    const response = (chatResult?.message?.content?.[0]?.text || '').trim() || "I'm sorry, I couldn't process that request.";

    let chat;
    let userMessage, assistantMessage;
    
    if (chatId) {
      chat = await prisma.chat.update({
        where: { id: chatId },
        data: {
          updatedAt: new Date(),
          messages: {
            create: [
              { role: 'user', content: message },
              { role: 'assistant', content: response }
            ]
          }
        },
        include: { messages: { orderBy: { timestamp: 'asc' } } }
      });
      
      const newMessages = chat.messages.slice(-2);
      userMessage = newMessages[0];
      assistantMessage = newMessages[1];
    } else {
      chat = await prisma.chat.create({
        data: {
          userId: req.user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          messages: {
            create: [
              { role: 'user', content: message },
              { role: 'assistant', content: response }
            ]
          }
        },
        include: { messages: { orderBy: { timestamp: 'asc' } } }
      });
      
      userMessage = chat.messages[0];
      assistantMessage = chat.messages[1];
    }

    Promise.all([
      storeChatMessage(userMessage.id, userMessage.content, {
        userId,
        chatId: chat.id,
        role: 'user',
        timestamp: userMessage.timestamp.toISOString()
      }),
      storeChatMessage(assistantMessage.id, assistantMessage.content, {
        userId,
        chatId: chat.id,
        role: 'assistant',
        timestamp: assistantMessage.timestamp.toISOString()
      })
    ]).catch(err => console.error('Error storing message embeddings:', err));

    res.json({
      response,
      chatId: chat.id,
      messages: chat.messages,
      semanticContext: {
        relevantMessages: semanticResults.chatMessages.length,
        relevantDocuments: semanticResults.medicalDocuments.length
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

router.get('/export/all', authenticate, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: req.user.email,
        name: req.user.name
      },
      totalChats: chats.length,
      totalMessages: chats.reduce((acc, chat) => acc + chat.messages.length, 0),
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messages.length,
        messages: chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      }))
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, userId: req.user.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      chat: {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messages.length,
        messages: chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      }
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, userId: req.user.id }
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    await prisma.chat.delete({
      where: { id: req.params.chatId }
    });
    
    deleteChatEmbeddings(req.params.chatId).catch(err => 
      console.error('Error deleting chat embeddings:', err)
    );
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
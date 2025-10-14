// backend/src/db/chromaClient.js
import { CloudClient } from 'chromadb';

// Initialize Chroma Cloud client
const chromaClient = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE
});

// Collection names
const COLLECTIONS = {
  CHAT_MESSAGES: 'chat_messages',
  MEDICAL_DOCUMENTS: 'medical_documents'
};

/**
 * Get or create a collection in ChromaDB
 */
async function getOrCreateCollection(name, metadata = {}) {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name,
      metadata: {
        description: metadata.description || `HealthMate AI ${name} collection`,
        ...metadata
      }
    });
    return collection;
  } catch (error) {
    console.error(`Error getting/creating collection ${name}:`, error);
    throw error;
  }
}

/**
 * Initialize all collections
 */
export async function initializeCollections() {
  try {
    console.log('Initializing ChromaDB collections...');
    
    await getOrCreateCollection(COLLECTIONS.CHAT_MESSAGES, {
      description: 'Embeddings for chat messages and conversation history'
    });
    
    await getOrCreateCollection(COLLECTIONS.MEDICAL_DOCUMENTS, {
      description: 'Embeddings for medical documents and PDF content'
    });
    
    console.log('ChromaDB collections initialized successfully');
  } catch (error) {
    console.error('Error initializing ChromaDB collections:', error);
    // Don't throw - allow app to continue even if ChromaDB is not available
  }
}

/**
 * Get chat messages collection
 */
export async function getChatMessagesCollection() {
  return await getOrCreateCollection(COLLECTIONS.CHAT_MESSAGES);
}

/**
 * Get medical documents collection
 */
export async function getMedicalDocumentsCollection() {
  return await getOrCreateCollection(COLLECTIONS.MEDICAL_DOCUMENTS);
}

export { chromaClient, COLLECTIONS };
export default chromaClient;


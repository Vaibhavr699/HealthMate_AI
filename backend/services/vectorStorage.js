// backend/services/vectorStorage.js
import { getChatMessagesCollection, getMedicalDocumentsCollection } from '../src/db/chromaClient.js';
import { generateDocumentEmbeddings, generateQueryEmbedding, chunkText } from '../utils/embeddings.js';

/**
 * Store a chat message in ChromaDB
 * @param {string} messageId - Unique message ID
 * @param {string} content - Message content
 * @param {object} metadata - Additional metadata (userId, chatId, role, timestamp)
 */
export async function storeChatMessage(messageId, content, metadata = {}) {
  try {
    console.log('🔄 Storing chat message:', messageId);
    const collection = await getChatMessagesCollection();
    
    // Generate embedding
    console.log('🔄 Generating embedding for message...');
    const embedding = await generateDocumentEmbeddings([content]);
    console.log('✅ Embedding generated');
    
    await collection.add({
      ids: [messageId],
      embeddings: embedding,
      documents: [content],
      metadatas: [metadata]
    });
    
    console.log(`✅ Stored chat message embedding: ${messageId}`);
  } catch (error) {
    console.error('❌ Error storing chat message:', error);
    console.error('   Message ID:', messageId);
    console.error('   Error:', error.message);
    // Don't throw - allow app to continue even if vector storage fails
  }
}

/**
 * Store multiple chat messages in ChromaDB
 * @param {Array} messages - Array of {id, content, metadata}
 */
export async function storeChatMessages(messages) {
  try {
    if (!messages || messages.length === 0) return;
    
    const collection = await getChatMessagesCollection();
    
    // Extract data
    const ids = messages.map(m => m.id);
    const contents = messages.map(m => m.content);
    const metadatas = messages.map(m => m.metadata || {});
    
    // Generate embeddings
    const embeddings = await generateDocumentEmbeddings(contents);
    
    await collection.add({
      ids,
      embeddings,
      documents: contents,
      metadatas
    });
    
    console.log(`Stored ${messages.length} chat message embeddings`);
  } catch (error) {
    console.error('Error storing chat messages:', error);
  }
}

/**
 * Store a medical document (PDF/CSV) in ChromaDB with chunking
 * @param {string} fileId - Unique file ID
 * @param {string} text - Document text content
 * @param {object} metadata - Additional metadata (userId, filename, fileType)
 */
export async function storeMedicalDocument(fileId, text, metadata = {}) {
  try {
    console.log('🔄 Starting to store medical document:', fileId);
    console.log('   Text length:', text?.length || 0);
    
    const collection = await getMedicalDocumentsCollection();
    console.log('✅ Got medical documents collection');
    
    // Chunk the text for better retrieval
    const chunks = chunkText(text, 500, 50);
    console.log('✅ Generated', chunks.length, 'chunks');
    
    if (chunks.length === 0) {
      console.warn(`⚠️ No chunks generated for file: ${fileId}`);
      return;
    }
    
    // Generate embeddings for all chunks
    console.log('🔄 Generating embeddings for', chunks.length, 'chunks...');
    const embeddings = await generateDocumentEmbeddings(chunks);
    console.log('✅ Embeddings generated successfully');
    
    // Create unique IDs for each chunk
    const chunkIds = chunks.map((_, idx) => `${fileId}_chunk_${idx}`);
    
    // Add chunk index to metadata
    const chunkMetadatas = chunks.map((chunk, idx) => ({
      ...metadata,
      fileId,
      chunkIndex: idx,
      totalChunks: chunks.length,
      chunkText: chunk.substring(0, 100) // Preview
    }));
    
    console.log('🔄 Adding to ChromaDB collection...');
    await collection.add({
      ids: chunkIds,
      embeddings,
      documents: chunks,
      metadatas: chunkMetadatas
    });
    
    console.log(`✅ Stored ${chunks.length} chunks for medical document: ${fileId}`);
  } catch (error) {
    console.error('❌ Error storing medical document:', error);
    console.error('   File ID:', fileId);
    console.error('   Error message:', error.message);
  }
}

/**
 * Search for relevant chat messages
 * @param {string} query - Search query
 * @param {string} userId - User ID to filter by
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Relevant messages with scores
 */
export async function searchChatMessages(query, userId, topK = 10) {
  try {
    const collection = await getChatMessagesCollection();
    
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Search with user filter
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: { userId }
    });
    
    // Format results
    const formattedResults = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        formattedResults.push({
          id: results.ids[0][i],
          content: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i],
          similarity: 1 - results.distances[0][i] // Convert distance to similarity
        });
      }
    }
    
    return formattedResults;
  } catch (error) {
    console.error('Error searching chat messages:', error);
    return [];
  }
}

/**
 * Search for relevant medical documents
 * @param {string} query - Search query
 * @param {string} userId - User ID to filter by
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Relevant document chunks with scores
 */
export async function searchMedicalDocuments(query, userId, topK = 5) {
  try {
    console.log('🔍 searchMedicalDocuments - Query:', query, 'UserId:', userId);
    const collection = await getMedicalDocumentsCollection();
    
    // Check collection count
    const count = await collection.count();
    console.log('   Collection has', count, 'documents');
    
    // Generate query embedding
    console.log('   Generating query embedding...');
    const queryEmbedding = await generateQueryEmbedding(query);
    console.log('   ✅ Query embedding generated');
    
    // Search with user filter
    console.log('   Searching with userId filter:', userId);
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: { userId }
    });
    
    console.log('   Raw results:', results.ids?.[0]?.length || 0, 'items found');
    
    // Format results
    const formattedResults = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        formattedResults.push({
          id: results.ids[0][i],
          content: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i],
          similarity: 1 - results.distances[0][i]
        });
        console.log('   - Result', i, ':', formattedResults[i].metadata.filename, 'similarity:', formattedResults[i].similarity.toFixed(2));
      }
    }
    
    return formattedResults;
  } catch (error) {
    console.error('❌ Error searching medical documents:', error);
    console.error('   Error message:', error.message);
    return [];
  }
}

/**
 * Search across both chat messages and medical documents
 * @param {string} query - Search query
 * @param {string} userId - User ID to filter by
 * @param {object} options - Search options
 * @returns {Promise<object>} - Combined search results
 */
export async function searchAll(query, userId, options = {}) {
  const {
    chatMessagesLimit = 5,
    medicalDocsLimit = 3
  } = options;
  
  try {
    const [chatResults, docResults] = await Promise.all([
      searchChatMessages(query, userId, chatMessagesLimit),
      searchMedicalDocuments(query, userId, medicalDocsLimit)
    ]);
    
    return {
      chatMessages: chatResults,
      medicalDocuments: docResults,
      totalResults: chatResults.length + docResults.length
    };
  } catch (error) {
    console.error('Error in searchAll:', error);
    return {
      chatMessages: [],
      medicalDocuments: [],
      totalResults: 0
    };
  }
}

/**
 * Delete chat message embeddings for a specific chat
 * @param {string} chatId - Chat ID
 */
export async function deleteChatEmbeddings(chatId) {
  try {
    const collection = await getChatMessagesCollection();
    
    await collection.delete({
      where: { chatId }
    });
    
    console.log(`Deleted embeddings for chat: ${chatId}`);
  } catch (error) {
    console.error('Error deleting chat embeddings:', error);
  }
}

/**
 * Delete medical document embeddings
 * @param {string} fileId - File ID
 */
export async function deleteMedicalDocumentEmbeddings(fileId) {
  try {
    const collection = await getMedicalDocumentsCollection();
    
    await collection.delete({
      where: { fileId }
    });
    
    console.log(`Deleted embeddings for medical document: ${fileId}`);
  } catch (error) {
    console.error('Error deleting medical document embeddings:', error);
  }
}



// backend/utils/embeddings.js
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

/**
 * Generate embeddings for text using Cohere
 * @param {string|string[]} texts - Single text or array of texts
 * @param {string} inputType - 'search_document' or 'search_query'
 * @returns {Promise<number[]|number[][]>} - Single embedding or array of embeddings
 */
export async function generateEmbeddings(texts, inputType = 'search_document') {
  try {
    const isArray = Array.isArray(texts);
    const textsToEmbed = isArray ? texts : [texts];
    
    // Filter out empty texts
    const validTexts = textsToEmbed.filter(t => t && t.trim().length > 0);
    
    if (validTexts.length === 0) {
      console.warn('No valid texts to embed');
      return isArray ? [] : [];
    }
    
    const response = await cohere.embed({
      texts: validTexts,
      model: 'embed-english-v3.0',
      inputType: inputType, // 'search_document' for storage, 'search_query' for queries
      embeddingTypes: ['float']
    });
    
    const embeddings = response.embeddings.float;
    
    return isArray ? embeddings : embeddings[0];
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Generate embedding for a search query
 * @param {string} query - The search query
 * @returns {Promise<number[]>} - Query embedding
 */
export async function generateQueryEmbedding(query) {
  return await generateEmbeddings(query, 'search_query');
}

/**
 * Generate embeddings for documents (for storage)
 * @param {string[]} documents - Array of document texts
 * @returns {Promise<number[][]>} - Array of embeddings
 */
export async function generateDocumentEmbeddings(documents) {
  return await generateEmbeddings(documents, 'search_document');
}

/**
 * Chunk large text into smaller pieces for embedding
 * @param {string} text - Text to chunk
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
export function chunkText(text, maxChunkSize = 500, overlap = 50) {
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + maxChunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    startIndex = endIndex - overlap;
    
    // Prevent infinite loop
    if (startIndex >= text.length - overlap) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} - Similarity score (0-1)
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}




// Test Chroma Cloud Connection
import dotenv from 'dotenv';
import { CloudClient } from 'chromadb';

dotenv.config();

async function testChromaConnection() {
  console.log('🔗 Testing Chroma Cloud Connection...\n');
  
  try {
    // Initialize client
    console.log('API Key:', process.env.CHROMA_API_KEY?.substring(0, 10) + '...');
    console.log('Tenant:', process.env.CHROMA_TENANT);
    console.log('Database:', process.env.CHROMA_DATABASE);
    console.log('');

    const client = new CloudClient({
      apiKey: process.env.CHROMA_API_KEY,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE
    });

    console.log('✅ Client initialized successfully\n');

    // Test: List existing collections
    console.log('📋 Listing collections...');
    const collections = await client.listCollections();
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.name));
    console.log('');

    // Test: Create test collection
    console.log('🆕 Creating test collection...');
    const testCollection = await client.getOrCreateCollection({
      name: 'test_connection',
      metadata: { description: 'Test collection to verify Chroma Cloud connection' }
    });
    console.log('✅ Test collection created:', testCollection.name);
    console.log('');

    // Test: Add sample data
    console.log('💾 Adding sample documents...');
    await testCollection.add({
      ids: ['test-1', 'test-2'],
      documents: ['Hello from HealthMate AI!', 'Chroma Cloud is working!'],
      metadatas: [
        { type: 'test', timestamp: new Date().toISOString() },
        { type: 'test', timestamp: new Date().toISOString() }
      ]
    });
    console.log('✅ Documents added successfully');
    console.log('');

    // Test: Query data
    console.log('🔍 Querying documents...');
    const results = await testCollection.query({
      queryTexts: ['Hello'],
      nResults: 2
    });
    console.log('✅ Query successful!');
    console.log('Results:', results);
    console.log('');

    // Test: Get collection count
    const count = await testCollection.count();
    console.log(`📊 Collection has ${count} documents`);
    console.log('');

    // Cleanup: Delete test collection
    console.log('🗑️  Cleaning up test collection...');
    await client.deleteCollection({ name: 'test_connection' });
    console.log('✅ Test collection deleted');
    console.log('');

    console.log('🎉 All tests passed! Chroma Cloud is working perfectly!\n');
    console.log('✨ You can now start your backend server with: npm start');
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
    console.error('\n💡 Make sure you have added these to your .env file:');
    console.error('   CHROMA_API_KEY=your-api-key');
    console.error('   CHROMA_TENANT=your-tenant-id');
    console.error('   CHROMA_DATABASE=your-database-name');
    process.exit(1);
  }
}

testChromaConnection();







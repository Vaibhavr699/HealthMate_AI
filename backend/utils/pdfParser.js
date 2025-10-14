// backend/utils/pdfParser.js
import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export const parsePDF = async (filePath) => {
  try {
    console.log('📄 Parsing PDF from path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File does not exist:', filePath);
      return { error: 'File not found' };
    }
    
    // Read the file from disk
    const dataBuffer = fs.readFileSync(filePath);
    console.log('✅ File read successfully, size:', dataBuffer.length, 'bytes');
    
    // Convert Buffer to Uint8Array (required by pdf.js)
    const uint8Array = new Uint8Array(dataBuffer);
    console.log('✅ Converted to Uint8Array');
    
    // Create PDFParse instance
    const parser = new PDFParse(uint8Array);
    
    // Extract text and info (load() is called internally)
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();
    
    console.log('✅ PDF parsed successfully');
    console.log('   Pages:', textResult.numPages);
    console.log('   Text length:', textResult.text?.length || 0);
    console.log('   Title:', infoResult.info?.Title);
    
    return {
      text: textResult.text,
      numPages: textResult.numPages,
      info: infoResult.info,
      metadata: infoResult.metadata,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ PDF parsing error:', error.message);
    console.error('Full error:', error);
    return { error: 'Failed to parse PDF: ' + error.message };
  }
};
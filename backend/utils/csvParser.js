import fs from 'fs';

export const parseCSV = async (filePath) => {
  try {
    // Read the file from disk
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [headerLine, ...rows] = lines;
    if (!headerLine) return { rows: [], headers: [] };

    const headers = headerLine.split(',').map(h => h.trim());
    const data = rows.map(line => {
      const values = line.split(',');
      const record = {};
      headers.forEach((h, i) => { record[h] = values[i] ?? null; });
      return record;
    });

    return { headers, rows: data, extractedAt: new Date().toISOString() };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return { error: 'Failed to parse CSV' };
  }
};




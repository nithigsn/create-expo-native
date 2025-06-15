import fs from 'fs-extra';
import path from 'path';

const insertImport = async (filePath: string, importLine: string, insertAtLine = 6) => {
  // Read the file
  const fileContent = await fs.readFile(filePath, 'utf8');
  const lines = fileContent.split('\n');

  // Avoid duplicate imports
  if (!lines.includes(importLine)) {
    lines.splice(insertAtLine - 1, 0, importLine); // -1 because arrays are 0-based
    const updatedContent = lines.join('\n');

    await fs.writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ Inserted import in: ${filePath}`);
  } else {
    console.log(`ℹ️ Import already exists in: ${filePath}`);
  }
};

export default insertImport



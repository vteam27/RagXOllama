import pdf from 'pdf-parse-fork';
import fs from 'fs';
import path from 'path';

async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfText=await pdf(dataBuffer);
  return pdfText.text;
}

function chunkText(text) {
  const words = text.split(/\s+/);
  const chunkSize = 50
  ;
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }
  
  return chunks;
}

export async function addPDFToCollection(pdfPath, collection) {
  const pdfText = await extractTextFromPDF(pdfPath);
  const chunks = chunkText(pdfText);

  const pdfName = pdfPath.split('/').pop(); // Get PDF name from path
  const ids = chunks.map((_, index) => `${pdfName}_chunk_${index + 1}`);
  const metadatas = chunks.map(() => ({ source: pdfName }));
  
  console.log(`Ingesting PDF ${pdfName}\n...`)
  const er1=await collection.add({
    ids,
    metadatas,
    documents: chunks,
  });

  console.log(er1);
}

export async function addPDFsToCollection(folderPath, collection) {
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    if (path.extname(file).toLowerCase() === '.pdf') {
      const filePath = path.join(folderPath, file);
      await addPDFToCollection(filePath, collection);
    }
  }
}

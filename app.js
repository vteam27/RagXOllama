import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import { Ollama } from 'ollama';
import { addFilesToCollection } from './data_loader.js';

const app = express();
const port = 3000;

app.use(express.static('public'));

const client = new ChromaClient();
const emb_fn = new DefaultEmbeddingFunction();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=>{
res.sendFile(__dirname+"/public/index.html");
});
app.post('/uploadFiles', async (req, res) => { 
  const { filePath } = req.body;
  const collection = await getOrCreateCollection("News");
  await addFilesToCollection(filePath, collection);
  res.send({ message: 'Files added to database successfully' });
});

app.post('/chat', async (req, res) => {
  console.log("query receiced!");
  const { query } = req.body;
  const collection = await getOrCreateCollection("News");
  const dbres = await queryCollection(collection, 5, [query]);
  const context=dbres.documents[0];
  const final_query = `Give your answers formatted in HTML tags only. Do not add any non html content, start and end with <div> </div> only. Format using bullet points, bold, italic, etc. You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use the relevant part of the context provided. If you don\'t know the answer, just say that you don\'t know. Question: ${query} Context: ${context}. Properly format your answer with html tags Answer:`;
  
  const ollama = new Ollama({ host: 'http://localhost:11434' });
  const response = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: final_query }],
  });
  console.log(response.message.content);
  res.send(response);
});


async function getOrCreateCollection(name) {
    const collection = await client.getOrCreateCollection({
      name,
      metadata: {
        description: "Private Docs",
        "hnsw:space": "l2" 
      },
      embeddingFunction: emb_fn,
    });
    return collection;
  }
  

async function queryCollection(collection, nResults, queryTexts) {
    const results = await collection.query({
      nResults,
      queryTexts,
    });
    return results;
  }

async function fillDB()
{
  const collection = await getOrCreateCollection("News");

  const pdfPath = 'Docs/';
  await addFilesToCollection(pdfPath, collection);
  console.log("Documents ingested successfully!");
} 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  fillDB();
});

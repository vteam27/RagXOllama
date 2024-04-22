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

  
const ollama = new Ollama({ host: process.env.OLLAMA_URL||'http://localhost:11434' });

const client = new ChromaClient({
  path: process.env.CHROMA_URL||"http://localhost:8000"
});
const emb_fn = new DefaultEmbeddingFunction();

await fillDB();

const statusm= await ollama.pull({ // ~5 GB of download
  model: 'llama3'
});
console.log(statusm);

app.use(express.static('public'));

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
  console.log(final_query);
  // const final_query=`Using the context, answer the following Question: ${query} Context: ${context}` //for tinyllama
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

  async function fillDB(retryCount = 5, delay = 5000) {
    try {
      const collection = await getOrCreateCollection("News");
  
      const pdfPath = 'Docs/';
      await addFilesToCollection(pdfPath, collection);
      
      console.log("Documents ingested successfully!");
    } catch (error) {
      console.error("Error filling DB:", error.message);
      
      if (retryCount > 0) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        await fillDB(retryCount - 1, delay);
      } else {
        console.error("Max retries reached. Failed to fill DB.");
      }
    }
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

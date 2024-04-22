import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import { Ollama } from 'ollama';
import { addFilesToCollection } from './data_loader.js';

const app = express();
const port = 3000;

const client = new ChromaClient();
const emb_fn = new DefaultEmbeddingFunction();

app.use(bodyParser.json());
app.use(cors());

app.post('/uploadFiles', async (req, res) => { // for now it just takes in the dir name
  const { filePath } = req.body;
  const collection = await getOrCreateCollection("News");
  await addFilesToCollection(filePath, collection);
  res.send({ message: 'Files added to database successfully' });
});

app.post('/chat', async (req, res) => {
  const { query } = req.body;
  const collection = await getOrCreateCollection("News");
  const dbres = await queryCollection(collection, 5, [query]);
  const context=dbres.documents[0];
  const final_query = `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use the relevant part of the context provided. If you don't know the answer, just say that you don't know. Keep the answer concise and start directly to the point. Question: ${query} Context: ${context} Answer:`;
  
  const ollama = new Ollama({ host: 'http://localhost:11434' });
  const response = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: final_query }],
  });
  // console.log(response.message.content);
  res.send(response);
});


async function getOrCreateCollection(name) {
    const collection = await client.getOrCreateCollection({
      name,
      metadata: {
        description: "Private Docs",
        "hnsw:space": "l2" // define distance function
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

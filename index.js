import { ChromaClient, DefaultEmbeddingFunction } from "chromadb";
import { Ollama } from 'ollama';
import { addPDFsToCollection } from "./data_loader.js";

const client = new ChromaClient();
const emb_fn = new DefaultEmbeddingFunction();

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

async function main() {
  const collection = await getOrCreateCollection("News");

  const pdfPath = 'Docs/';
  await addPDFsToCollection(pdfPath, collection)

  const original_query = "Who are the team members of the project Proximity Detection System?";
  const results = await queryCollection(collection, 3, [original_query]); // top 3 chunks
  console.log(`Retrieved Context:`);
  console.log(results);

  const context = results.documents[0];
  const final_query = `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use the context only if you find it relevant, else discard the irrelevant context, If you don\'t know the answer, just say that you don\'t know. Use three sentences maximum and keep the answer concise. Question: ${original_query} Context: ${context} Answer:`;
  console.log(final_query);

  const ollama = new Ollama({ host: 'http://localhost:11434' });
  const res = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: final_query }],
  });

  console.log(res);
  /*
  See logs for detailed output:
  content: 'Based on the provided context, I can answer your question about the team members of the Proximity Detection System project.\n' +
  '\n' +
  'The team members are:\n' +
  '\n' +
  '1. Vaibhav Tiwari\n' +
  '2. Harsiddak Singh Bedi\n' +
  '3. Uday\n' +
  '4. Apoorva\n' +
  '5. Harkirat Singh\n' +
  '6. Garv Grover'
  */
}

main().catch(error => {
  console.error("Error:", error);
});


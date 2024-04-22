import { ChromaClient, DefaultEmbeddingFunction } from "chromadb";
import { Ollama } from 'ollama';
import { addFilesToCollection } from "./data_loader.js";

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
  await addFilesToCollection(pdfPath, collection)

  const original_query = "Tell me about the Project OreSense.";
  const results = await queryCollection(collection, 5, [original_query]); // top 5 chunks
  console.log(`Retrieved Context:`);
  console.log(results);

  const context = results.documents[0];
  const final_query = `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use the relevant part of the context provided. If you don\'t know the answer, just say that you don\'t know. Keep the answer concise and start directly to the point. Question: ${original_query} Context: ${context} Answer:`;
  console.log(final_query);

  const ollama = new Ollama({ host: 'http://localhost:11434' });
  const res = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: final_query }],
  });

  console.log(res);
  //view logs.txt for detialed output
}

main().catch(error => {
  console.error("Error:", error);
});


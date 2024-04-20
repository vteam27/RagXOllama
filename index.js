import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "chromadb";
import { Ollama } from 'ollama'

const client = new ChromaClient();
const emb_fn = new DefaultEmbeddingFunction()

const collection = await client.getOrCreateCollection({
    name: "News",
    metadata: {
      description: "A news vector store",
      "hnsw:space": "l2"
    },
    embeddingFunction: emb_fn,
  });

// const collections = await client.listCollections();
// console.log(collections)

await collection.add({
    ids: ["id1", "id2"],
    metadatas: [{ source: "NDTV News" }, { source: "AAJ TAK News" }],
    documents: ["Hardik Pandya Suffering Mental Health Issues Due To Booing In IPL Games: Star Slams MI Captain's Trolls", "\"Hardest Part Is...\" Shark Tank India's Vineeta Singh On Death Reports. The Shark Tank India judge shared a screenshot of a misleading report with the headline, \"A hard day for India: We say goodbye to Vineeta Singh.\""],
  });

var original_query="Is Vineeta Singh dead?"
const results = await collection.query({
    nResults: 1,
    queryTexts: [original_query],
  });

console.log(results);
// console.log(await emb_fn.generate(["hello", "cool"]));

var context= results.documents[0];

var final_query= `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don\'t know the answer, just say that you don\'t know. Use three sentences maximum and keep the answer concise. Question: ${original_query} Context: ${context} Answer:`;
console.log(final_query);
const ollama = new Ollama({ host: 'http://localhost:11434' })
const res = await ollama.chat({
  model: 'llama3',
  messages: [{ role: 'user', content: final_query }],
})

console.log(res)
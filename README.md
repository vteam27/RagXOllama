# RagXOllama
Node.js server for a Retrieval-Augmented Generation (RAG) system using ChromaDB and Ollama!

## Setup
On separate terminals run:
1. [Ollama](https://ollama.com/) : To serve open source LLMs locally ```ollama run llama```
2. [ChromaDB Backend](https://docs.trychroma.com/deployment): Spin up the ChromaDB core
   ```
   docker pull chromadb/chroma
   docker run -p 8000:8000 chromadb/chroma
   ```
3. Install dependencies and run!
   ```
   cd RagXOllama
   npm install
   node index.js
   ```

## Example
![RAG_example](https://github.com/vteam27/RagXOllama/assets/94956831/11031cff-618f-47ad-b6dd-5f5306450526)

0. Ingestion: Feed relevant information into the chromaDB vector store collection. (eg. A lot of latest news article)
1. Retrieve: We retrieve relevant (top n) chunks of factual information stored in chromaDB using squared l2 normalized euclidean distance between vectors(in this case).
2. Augment: We append this context into our prompt.
3. Generate: We feed this prompt to a ```8B llama3 4-bit quantized``` model served by ollama to generate the desired response.

## Explaination

Retrieval-Augmented Generation (RAG) allows:
- Improved Factual Accuracy: By relying on retrieved information, RAG systems can ensure answers are grounded in real-world data.
- Domain Specificity: RAG allows you to integrate domain-specific knowledge bases, making the system more knowledgeable in a particular area.
- Adaptability to New Information: By using external knowledge sources, RAG systems can stay up-to-date with the latest information, even if the LLM itself wasn't specifically trained on it.

![image](https://github.com/vteam27/RagXOllama/assets/94956831/146028a4-ef93-4c98-9408-b66f2db697fe)

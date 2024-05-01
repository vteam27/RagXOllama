# RagXOllama
A minimal Node.js RESTful server for a Retrieval-Augmented Generation (RAG) system using ChromaDB and Ollama!

![image](https://github.com/vteam27/RagXOllama/assets/94956831/2c7a8bd3-0b95-4afe-946f-d7f9e36ae1df)


## Setup
### Method 1 (using Docker)
1. Clone this repo.
```
git clone https://github.com/vteam27/RagXOllama
cd RagXOllama
```
2. Add your documents to ```Docs/ ```folder.
3. Simply build the docker containers using
```
docker compose up 
```
2. Wait for the data to be ingested to DB and the LLM model to be downloaded.
3. Go to ```http://localhost:3000``` 

### Method 2 (build locally)
1. [Ollama](https://ollama.com/) : To serve open source LLMs locally (one time setup)
    ```
    ollama serve
    ollama run llama3
    ```
2. [ChromaDB Backend](https://docs.trychroma.com/deployment): Spin up the ChromaDB core
   ```
   docker pull chromadb/chroma
   docker run -p 8000:8000 chromadb/chroma
   ```
3. Add your PDF documents to ```Docs/ ```
4. Install dependencies and run!
   ```
   git clone https://github.com/vteam27/RagXOllama
   cd RagXOllama
   npm install
   node app.js
   ```
5. Go to ```http://localhost:3000``` to chat using a web demo.

6. Alternatively, you can run ``` node pipeline.js ``` to interact using terminal, easy development and testing.

## Features
- Chat with private documents securely!
- Search and query your data easily using Natural Language only!
- Keep all your LLMs up to date with the latest data.
- Use any open source LLM of your choice. [Browse LLMs](https://ollama.com/library)
- This repo can be used as a template to easily integrate LLMs with RAG functionality into your MERN (or any other node.js) stack apps.

## Example
![RAG_example](https://github.com/vteam27/RagXOllama/assets/94956831/11031cff-618f-47ad-b6dd-5f5306450526)

0. Ingestion: Feed relevant information into the chromaDB vector store collection.
1. Retrieve: We retrieve relevant (top n) chunks of factual information stored in chromaDB using a algorithm that calculates it's similarity score with the user query.
2. Augment: We append this context into our prompt.
3. Generate: We feed this prompt to a ```8B llama3 4-bit quantized``` model served by ollama to generate the desired response.

View the ```logs.txt``` file for the full output of my code.

## About RAG

With the help of Retrieval-Augmented Generation (RAG) we can achieve:
- Improved Factual Accuracy: By relying on retrieved information, RAG systems can ensure answers are grounded in real-world data.
- Domain Specificity: RAG allows you to integrate domain-specific knowledge bases, making the system more knowledgeable in a particular area.
- Adaptability to New Information: By using external knowledge sources, RAG systems can stay up-to-date with the latest information, even if the LLM itself wasn't specifically trained on it.

![image](https://github.com/vteam27/RagXOllama/assets/94956831/146028a4-ef93-4c98-9408-b66f2db697fe)

## Milestones

- [x] Setup chromaDB and ollama
- [x] Build a basic RAG pipeline
- [x] Build a data loader to chunk and ingest data into chromaDB.
- [x] Add support for text, pdf and docx files.
- [x] Implement a REST API Architecture.
- [x] Build demo UI for easy interaction
- [x] Containarize and publish image to dockerhub
- [x] All done for now :)
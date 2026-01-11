
import os
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
import chromadb

load_dotenv()

class RAGService:
    def __init__(self):
        self.persist_directory = "chroma_db"
        
        # Check API Key
        if not os.getenv("GOOGLE_API_KEY"):
             raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure LlamaIndex Settings
        Settings.embed_model = GeminiEmbedding(model_name="models/text-embedding-004")
        Settings.llm = Gemini(model_name="models/gemini-2.5-flash")

    def ingest_data(self, file_path: str):
        # Create client and vector store
        db = chromadb.PersistentClient(path=self.persist_directory)
        chroma_collection = db.get_or_create_collection("quickstart")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        # Load documents
        # SimpleDirectoryReader with input_files handles PDFs if pypdf is installed
        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
        
        # Create index (upsert into chroma)
        self.index = VectorStoreIndex.from_documents(
            documents, storage_context=storage_context
        )
        print(f"Ingested {file_path} successfully!")

    def get_answer(self, query: str):
        try:
            if not hasattr(self, 'index'):
                 # Try to load existing
                 db = chromadb.PersistentClient(path=self.persist_directory)
                 chroma_collection = db.get_or_create_collection("quickstart")
                 vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
                 self.index = VectorStoreIndex.from_vector_store(
                     vector_store,
                     embed_model=Settings.embed_model
                 )
    
            query_engine = self.index.as_query_engine()
            response = query_engine.query(query)
            return {"result": str(response)}
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "ResourceExhausted" in error_msg or "Quota" in error_msg:
                return {
                    "result": "My cognitive batteries are drained (API Quota Exhausted). Please give me a moment to recharge or check your plan.",
                    "error": "quota_exhausted"
                }
            # Re-raise other errors
            raise e

rag_service = RAGService()


from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_service import rag_service
import os
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    reasoning: str

@app.on_event("startup")
def startup_event():
    # Since we cd into backend/, the file is just in the current directory
    kb_path = "knowledge_base.md"
    if os.path.exists(kb_path):
        try:
            rag_service.ingest_data(kb_path)
        except Exception as e:
            print(f"Startup ingestion failed (likely quota): {e}")
    else:
        print(f"Knowledge base not found at {kb_path}!")

@app.get("/")
def read_root():
    return {"message": "Gemini RAG API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"Received upload request for: {file.filename}")
    try:
        # Save to temp file
        temp_file_path = f"temp_{file.filename}"
        print(f"Saving to {temp_file_path}")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"Ingesting {temp_file_path}")
        # Ingest
        rag_service.ingest_data(temp_file_path)
        
        # Cleanup
        os.remove(temp_file_path)
        print("Upload successful")
        
        return {"message": f"Successfully processed {file.filename}"}
    except Exception as e:
        print(f"ERROR in upload: {e}")
        import traceback
        traceback.print_exc()
        
        # Check for Quota/API errors
        error_msg = str(e)
        if "429" in error_msg or "ResourceExhausted" in error_msg or "Quota" in error_msg:
             return {
                 "status": "error",
                 "message": "My cognitive batteries are drained (API Quota Exhausted). Please give me a moment to recharge."
             }
        
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=QueryResponse)
def chat(request: QueryRequest):
    try:
        # For "reasoning", Gemini 1.5 flash doesn't inherently output separate reasoning tag unless prompted
        # The prompt in RetrievalQA is standard. 
        # We will just return the result.
        
        result = rag_service.get_answer(request.query)
        # Result is usually a dict {query: ..., result: ...}
        
        if "error" in result and result["error"] == "quota_exhausted":
             return {
                 "answer": result["result"], # "My cognitive batteries..."
                 "reasoning": "API Quota Exhausted"
             }

        return {
            "answer": result["result"],
            "reasoning": "Processed based on knowledge base." # Placeholder/Enhancement later
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

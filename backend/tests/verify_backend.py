import sys, os
sys.path.insert(0, os.path.abspath('.'))
os.chdir(os.path.abspath('.'))

from dotenv import load_dotenv
load_dotenv()

print("Testing all backend imports...")
from app.db.database import Base, engine
Base.metadata.create_all(bind=engine)
print("DB OK")

from app.api import api_router
print("API router OK")

from app.rag.retriever import get_rag_collection
col = get_rag_collection()
print(f"RAG collection: {col.count()} chunks indexed")

from app.safety.triage_rules import triage_symptom
level, ctx, msg = triage_symptom("I have a fever and chills")
print(f"Triage test: {level}")

print("\nAll backend components initialized successfully!")

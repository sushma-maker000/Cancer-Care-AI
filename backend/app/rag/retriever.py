"""
RAG Retriever Service (§10, §11)
=================================
Uses ChromaDB with sentence-transformers embeddings.
Supports metadata-filtered retrieval for:
  - MEDICATION_KB  (drug-specific questions)
  - NUTRITION_KB   (dietary support during chemo)
  - CANCER_KB      (education about cancer, treatment)
"""
import os
from typing import List, Dict, Optional
import chromadb
from chromadb.utils import embedding_functions

from app.rag.knowledge_docs import KNOWLEDGE_CHUNKS

CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
COLLECTION_NAME = "cancercare_kb"

_client: Optional[chromadb.PersistentClient] = None
_collection = None

def _get_embedding_function():
    """Use sentence-transformers for free, local embeddings."""
    return embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

def get_rag_collection():
    """Get or initialize the ChromaDB collection."""
    global _client, _collection
    if _collection is not None:
        return _collection

    os.makedirs(CHROMA_DIR, exist_ok=True)
    _client = chromadb.PersistentClient(path=CHROMA_DIR)
    ef = _get_embedding_function()
    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    # Ingest docs if collection is empty
    if _collection.count() == 0:
        print("[RAG] Indexing knowledge base documents...")
        _ingest_knowledge_base()
    else:
        print(f"[RAG] Using existing index with {_collection.count()} chunks.")

    return _collection


def _ingest_knowledge_base():
    """Index all KNOWLEDGE_CHUNKS into ChromaDB."""
    col = _collection
    ids = [chunk["id"] for chunk in KNOWLEDGE_CHUNKS]
    documents = [chunk["text"] for chunk in KNOWLEDGE_CHUNKS]
    metadatas = [chunk["metadata"] for chunk in KNOWLEDGE_CHUNKS]

    col.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
    )
    print(f"[RAG] Indexed {len(KNOWLEDGE_CHUNKS)} knowledge chunks.")



def retrieve_relevant_chunks(
    query: str,
    knowledge_type: Optional[str] = None,   # "medication", "nutrition", "cancer"
    drug_name: Optional[str] = None,
    topic: Optional[str] = None,
    n_results: int = 4,
) -> List[Dict]:
    """
    Retrieve top-k relevant chunks with optional metadata filtering.
    Returns list of {text, source, drug_name, knowledge_type, topic, distance}
    """
    try:
        col = get_rag_collection()

        # Build ChromaDB where filter
        where: Dict = {}
        if knowledge_type and drug_name:
            where = {"$and": [
                {"knowledge_type": {"$eq": knowledge_type}},
                {"drug_name": {"$eq": drug_name}},
            ]}
        elif knowledge_type:
            where = {"knowledge_type": {"$eq": knowledge_type}}
        elif drug_name:
            where = {"drug_name": {"$eq": drug_name}}

        query_kwargs = {
            "query_texts": [query],
            "n_results": min(n_results, col.count()),
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            query_kwargs["where"] = where

        results = col.query(**query_kwargs)

        chunks = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            chunks.append({
                "text": doc,
                "source": meta.get("source", "Unknown"),
                "drug_name": meta.get("drug_name", ""),
                "knowledge_type": meta.get("knowledge_type", "general"),
                "topic": meta.get("topic", ""),
                "relevance_score": round(1 - dist, 3),
            })

        return chunks

    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return []


def detect_intent_and_filters(query: str, patient_medications: List[str] = None) -> Dict:
    """
    Simple rule-based intent detection to select the right KB and filters.
    Returns {knowledge_type, drug_name, topic}
    """
    q = query.lower()

    # Detect drug mentions
    drug_name = None
    drug_keywords = {
        "Docetaxel": ["docetaxel", "taxotere"],
        "Cyclophosphamide": ["cyclophosphamide", "cytoxan"],
        "Dexamethasone": ["dexamethasone", "decadron", "steroids", "steroid"],
        "Aprepitant": ["aprepitant", "emend", "anti-nausea", "antiemetic"],
    }
    for drug, kws in drug_keywords.items():
        if any(kw in q for kw in kws):
            drug_name = drug
            break

    # Detect knowledge type
    nutrition_keywords = [
        "eat", "food", "diet", "nausea", "vomit", "appetite", "taste", "nutrition",
        "drink", "hydration", "water", "constipation", "diarrhea", "mouth sore",
        "energy", "protein", "supplement", "cook", "recipe", "bland"
    ]
    medication_keywords = [
        "side effect", "dosage", "dose", "take", "medicine", "drug", "interaction",
        "warning", "hair loss", "alopecia", "neutropenia", "neuropathy"
    ]
    cancer_keywords = [
        "cancer", "breast cancer", "chemo", "chemotherapy", "treatment", "regimen",
        "cycle", "tc regimen", "immune", "white blood cell", "neutropenia"
    ]

    if any(kw in q for kw in nutrition_keywords):
        knowledge_type = "nutrition"
    elif any(kw in q for kw in medication_keywords):
        knowledge_type = "medication"
    elif any(kw in q for kw in cancer_keywords):
        knowledge_type = "cancer"
    else:
        knowledge_type = None

    return {"knowledge_type": knowledge_type, "drug_name": drug_name}

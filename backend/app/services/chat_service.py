"""
AI Chat Service (§12)
======================
Handles intent routing, RAG retrieval, and empathetic LLM response generation.
Intent Router:
  symptom_safety  → triage_rules → RAG MEDICATION_KB
  nutrition       → RAG NUTRITION_KB
  medication_info → RAG MEDICATION_KB
  cancer_education→ RAG CANCER_KB
  adherence       → deterministic coaching
  emotional       → empathetic LLM
  general         → general LLM
"""
import os
import json
import requests
from typing import List, Dict, Optional, Tuple

from app.rag.retriever import retrieve_relevant_chunks, detect_intent_and_filters
from app.safety.triage_rules import triage_symptom

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are CancerCare AI — a compassionate, knowledgeable cancer medication adherence and patient-support assistant.

Your role:
- Provide clear, empathetic, patient-friendly explanations based ONLY on the provided reference excerpts.
- Always cite the source of information (e.g., "According to the Docetaxel product monograph...").
- Use simple language (Grade 8 reading level). Avoid medical jargon without explanation.
- For nutrition questions, provide practical, culturally relevant advice (include Indian food options when appropriate).
- NEVER diagnose conditions, prescribe medications, or recommend stopping/changing prescribed treatments.
- NEVER instruct a patient to double their dose if they missed one.
- If the reference excerpts don't clearly answer the question, say: "I don't have enough information to answer that reliably — please discuss this with your oncology team."
- Always be warm, non-judgmental, and supportive.

IMPORTANT SAFETY RULE: You are an educational and supportive assistant only. For any urgent medical concerns, always remind the patient to contact their healthcare team or emergency services."""


def build_rag_context(chunks: List[Dict]) -> str:
    """Format retrieved chunks as numbered reference excerpts."""
    if not chunks:
        return "No specific reference excerpts found."
    context = ""
    for i, chunk in enumerate(chunks, 1):
        context += f"\n[{i}] Source: {chunk['source']}\n{chunk['text']}\n"
    return context


def build_sources_list(chunks: List[Dict]) -> List[Dict]:
    """Build deduplicated source list for frontend citation display."""
    seen = set()
    sources = []
    for chunk in chunks:
        src = chunk["source"]
        if src not in seen:
            seen.add(src)
            sources.append({
                "source": src,
                "knowledge_type": chunk.get("knowledge_type", "general"),
                "drug_name": chunk.get("drug_name", ""),
                "topic": chunk.get("topic", ""),
            })
    return sources


def call_mistral_chat(
    user_message: str,
    system_context: str,
    chat_history: List[Dict] = None,
) -> str:
    """Call Mistral API for response generation."""
    api_key = os.getenv("MISTRAL_API_KEY", "")
    model = os.getenv("MISTRAL_MODEL", "mistral-medium-latest")

    if not api_key or api_key == "your_mistral_api_key_here":
        return (
            "I'm sorry — the AI service is temporarily unavailable. "
            "Please consult your oncology team for any questions about your medications."
        )

    messages = [{"role": "system", "content": system_context}]
    if chat_history:
        messages.extend(chat_history[-6:])  # Keep last 3 turns for context
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": model,
        "temperature": 0.3,
        "max_tokens": 600,
        "messages": messages,
    }

    try:
        res = requests.post(
            MISTRAL_API_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        if res.status_code == 200:
            return res.json()["choices"][0]["message"]["content"]
        else:
            print(f"Mistral chat error {res.status_code}: {res.text[:300]}")
            return _fallback_response(user_message)
    except Exception as e:
        print(f"Mistral chat exception: {e}")
        return _fallback_response(user_message)


def _fallback_response(query: str) -> str:
    q = query.lower()
    if any(w in q for w in ["nausea", "vomit", "sick"]):
        return (
            "Nausea is a common side effect of chemotherapy. Try eating small, bland meals every 2-3 hours. "
            "Ginger tea, crackers, and room-temperature foods often help. Take Aprepitant exactly as prescribed "
            "on Days 2 and 3 after chemotherapy. Contact your oncology team if vomiting is severe or persistent."
        )
    if any(w in q for w in ["eat", "food", "diet", "nutrition"]):
        return (
            "During chemotherapy, focus on small frequent meals with protein-rich foods. "
            "Good Indian options include dal, curd, paneer, eggs, and idli. Stay well hydrated with "
            "2-3 litres of fluids daily. Avoid raw foods, uncooked sprouts, and street food during "
            "your low immunity period (Days 7-14 after chemo)."
        )
    return (
        "Thank you for your question. I don't have enough specific information to answer reliably right now. "
        "Please discuss this with your oncology nurse or doctor at your next visit, or call your clinic helpline."
    )


def process_chat_message(
    user_message: str,
    patient_medications: List[str] = None,
    chat_history: List[Dict] = None,
    language: str = "English",
) -> Dict:
    """
    Main chat processing pipeline:
    1. Safety triage (deterministic)
    2. Intent detection & RAG retrieval
    3. LLM response generation with grounded context
    """
    # Step 1: Deterministic safety triage (§9, §19)
    triage_level, drug_context, triage_message = triage_symptom(user_message, patient_medications)

    if triage_level == "red_flag":
        return {
            "response": triage_message,
            "triage_level": "red_flag",
            "sources": [],
            "intent": "symptom_safety",
        }

    # Step 2: Intent detection + RAG retrieval
    filters = detect_intent_and_filters(user_message, patient_medications)
    chunks = retrieve_relevant_chunks(
        query=user_message,
        knowledge_type=filters.get("knowledge_type"),
        drug_name=filters.get("drug_name"),
        n_results=4,
    )

    # Step 3: Build system context and call LLM
    rag_context = build_rag_context(chunks)
    sources = build_sources_list(chunks)

    intent = "general"
    if filters.get("knowledge_type") == "nutrition":
        intent = "nutrition"
    elif filters.get("knowledge_type") == "medication":
        intent = "medication_info"
    elif filters.get("knowledge_type") == "cancer":
        intent = "cancer_education"
    elif triage_level == "concerning":
        intent = "symptom_safety"

    system_context = f"""{SYSTEM_PROMPT}

RELEVANT REFERENCE EXCERPTS FROM MEDICAL KNOWLEDGE BASE:
{rag_context}

{"IMPORTANT: " + triage_message if triage_level == "concerning" else ""}

{"Please respond in Tamil language as the patient prefers Tamil." if language == "Tamil" else "Please respond in clear, simple English."}

Based on the above excerpts only, provide a helpful, accurate, and empathetic response. Cite sources as [1], [2], etc."""

    ai_response = call_mistral_chat(
        user_message=user_message,
        system_context=system_context,
        chat_history=chat_history,
    )

    return {
        "response": ai_response,
        "triage_level": triage_level,
        "sources": sources,
        "intent": intent,
    }

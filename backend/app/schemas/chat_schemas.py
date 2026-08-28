from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    patient_id: int
    message: str
    language: Optional[str] = "English"
    chat_history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatSource(BaseModel):
    source: str
    knowledge_type: Optional[str] = "general"
    drug_name: Optional[str] = ""
    topic: Optional[str] = ""


class ChatResponse(BaseModel):
    response: str
    triage_level: str  # "low_concern" | "concerning" | "red_flag"
    intent: str
    sources: List[ChatSource]
    is_emergency: bool

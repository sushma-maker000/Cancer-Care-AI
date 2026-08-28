"""
Deterministic Safety Triage Engine (§9, §19)
============================================
This module makes all safety ESCALATION decisions.
The LLM is NEVER the sole decision-maker for emergency escalation.
Rules are evaluated first; LLM only provides friendly wording.

Triage Levels:
  RED_FLAG    → Urgent/Emergency care recommendation immediately
  CONCERNING  → Advise contacting healthcare team within 12-24h
  LOW_CONCERN → General information + monitoring guidance
"""

from typing import Dict, Tuple, List

# ---------------------------------------------------------------------------
# RED FLAG PATTERNS  — Immediate escalation, do NOT wait for chatbot
# Source: Docetaxel/Cyclophosphamide/Dexamethasone/Aprepitant monographs
# ---------------------------------------------------------------------------
RED_FLAG_PATTERNS: List[Dict] = [
    {
        "keywords": ["blood in urine", "hematuria", "red urine", "pink urine", "bloody urine",
                     "blood when urinating", "blood while urinating",
                     "urine is red", "urine is pink", "noticed blood", "blood in my urine"],
        "drug_context": "Cyclophosphamide",
        "message": (
            "⚠️ URGENT: Blood in urine can be a sign of hemorrhagic cystitis, a serious side effect of "
            "Cyclophosphamide. This requires immediate medical attention. "
            "Please contact your oncology team or go to the emergency department NOW. "
            "Do NOT wait for the next scheduled appointment."
        ),
    },
    {
        "keywords": ["fever", "temperature", "38", "chills and fever", "febrile",
                     "high temperature", "sweating and fever"],
        "drug_context": "Docetaxel/Cyclophosphamide (Nadir)",
        "threshold_note": "Fever ≥38.1°C during chemotherapy nadir is a medical emergency.",
        "message": (
            "⚠️ URGENT: Fever during chemotherapy treatment may indicate febrile neutropenia — "
            "a life-threatening infection risk when your immune system is at its lowest (nadir). "
            "Please call your oncology team or emergency services immediately. "
            "Do NOT take paracetamol/fever reducers without calling them first, as it may mask the fever."
        ),
    },
    {
        "keywords": ["chest pain", "chest tightness", "difficulty breathing", "shortness of breath",
                     "can't breathe", "cannot breathe", "heart racing", "severe palpitations",
                     "anaphylaxis", "anaphylactic", "severe allergic reaction"],
        "drug_context": "Docetaxel Hypersensitivity / Cardiac",
        "message": (
            "⚠️ EMERGENCY: Chest pain, difficulty breathing, or severe allergic symptoms require "
            "IMMEDIATE emergency medical attention. Call 108 (India) or your local emergency number NOW. "
            "This may be a serious cardiac or anaphylactic reaction to chemotherapy."
        ),
    },
    {
        "keywords": ["face swelling", "facial swelling", "lip swelling", "tongue swelling",
                     "throat swelling", "swollen face", "skin blistering", "blisters on skin",
                     "sores all over body", "severe rash all over",
                     "lips are swelling", "lips swelling", "swollen lips", "lip is swollen",
                     "tongue is swelling", "face is swelling"],
        "drug_context": "Angioedema / Stevens-Johnson Syndrome",
        "message": (
            "⚠️ EMERGENCY: Severe facial/lip/tongue swelling or widespread skin blistering may indicate "
            "a life-threatening allergic reaction (angioedema or Stevens-Johnson Syndrome). "
            "Call emergency services immediately and do NOT take any more medication until evaluated."
        ),
    },
    {
        "keywords": ["unconscious", "fainted", "passed out", "not responsive", "seizure",
                     "convulsion", "collapse"],
        "drug_context": "General Emergency",
        "message": (
            "⚠️ EMERGENCY: Loss of consciousness, seizures, or collapse require immediate emergency care. "
            "Call 108 (India) or your local emergency number NOW."
        ),
    },
]

# ---------------------------------------------------------------------------
# CONCERNING PATTERNS — Contact oncology team within 24 hours
# ---------------------------------------------------------------------------
CONCERNING_PATTERNS: List[Dict] = [
    {
        "keywords": ["persistent vomiting", "can't keep food down", "vomiting all day",
                     "vomiting for hours", "unable to eat anything", "severe nausea"],
        "message": (
            "This level of nausea and vomiting needs prompt attention to prevent dehydration. "
            "Please contact your oncology team or nurse helpline today. They may adjust your anti-nausea "
            "medications (Aprepitant is already part of your regimen to help with this)."
        ),
    },
    {
        "keywords": ["numb fingers", "numbness in hands", "tingling fingers", "burning feet",
                     "neuropathy", "pins and needles", "electric shock feeling",
                     "tingling", "numbness", "numb", "tingling and numbness",
                     "hands are numb", "feet are numb"],
        "drug_context": "Docetaxel peripheral neuropathy",
        "message": (
            "Numbness or tingling in your hands or feet may be a sign of peripheral neuropathy, "
            "a known side effect of Docetaxel. Please report this to your oncology team at your next visit "
            "or call them if the symptoms are worsening rapidly — they may need to adjust your treatment plan."
        ),
    },
    {
        "keywords": ["blurred vision", "vision changes", "eyesight blurry", "can't see clearly",
                     "watery eyes", "eye pain"],
        "drug_context": "Docetaxel cystoid macular edema",
        "message": (
            "Changes in vision can sometimes occur with Docetaxel. Please contact your oncology team "
            "promptly — they will likely refer you for an eye examination to rule out cystoid macular edema."
        ),
    },
    {
        "keywords": ["severe swelling", "legs very swollen", "whole body swelling",
                     "fluid retention", "weight gain rapidly", "edema"],
        "drug_context": "Docetaxel fluid retention",
        "message": (
            "Significant swelling or rapid weight gain may indicate fluid retention, a known side effect "
            "of Docetaxel. This can sometimes require medical management. Please contact your oncology nurse "
            "or team today to report this symptom."
        ),
    },
    {
        "keywords": ["mouth sores severe", "can't eat due to mouth pain", "bleeding mouth",
                     "severe mucositis"],
        "message": (
            "Severe mouth sores (mucositis) can affect nutrition and need prompt attention. "
            "Please contact your oncology team — they can prescribe specific mouth rinses or pain management. "
            "In the meantime, rinse with a baking soda-salt solution (1/4 tsp baking soda + 1/8 tsp salt in 1 cup warm water)."
        ),
    },
]

# ---------------------------------------------------------------------------
# Triage Function
# ---------------------------------------------------------------------------

def triage_symptom(symptom_text: str, patient_medications: List[str] = None) -> Tuple[str, str, str]:
    """
    Deterministically classify a patient's symptom report.
    
    Returns:
        (triage_level, drug_context, safety_message)
        triage_level: "red_flag" | "concerning" | "low_concern"
    """
    text_lower = symptom_text.lower()

    # Check RED FLAGS first (highest priority)
    for pattern in RED_FLAG_PATTERNS:
        if any(kw in text_lower for kw in pattern["keywords"]):
            return (
                "red_flag",
                pattern.get("drug_context", "General"),
                pattern["message"],
            )

    # Check CONCERNING patterns
    for pattern in CONCERNING_PATTERNS:
        if any(kw in text_lower for kw in pattern["keywords"]):
            return (
                "concerning",
                pattern.get("drug_context", "General"),
                pattern["message"],
            )

    # Default: LOW CONCERN → route to RAG
    return (
        "low_concern",
        "General Supportive Care",
        (
            "Thank you for sharing how you're feeling. This sounds like it may be a common side effect "
            "that we can help address with information from your medication guides and nutrition resources. "
            "Let me look that up for you now."
        ),
    )

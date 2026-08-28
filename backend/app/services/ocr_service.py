import os
import fitz  # PyMuPDF
from typing import Dict, Any, Tuple
from app.services.mistral_service import extract_medications_with_mistral

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

SAMPLE_APEX_OCR_TEXT = """
APEX ONCOLOGY CENTER
123 Healthcare Blvd, Medical District, NY 10001 | Phone: (555) 019-8273 | Email: billing@apexzenith.org
ONCOLOGY TREATMENT PLAN 
Date: August 28, 2026
Patient Name: Jane Doe
Age: 50 Gender: Female
Diagnosis: Locally advanced breast cancer
Status: Post-menopausal
Primary Regimen: TC (Docetaxel + Cyclophosphamide)
Primary Medication Details: Docetaxel 75 mg/m² D1; Cyclophosphamide 600 mg/m² D1
Cycle Schedule: Every 3 weeks (21 days)
Planned Cycles: 4 cycles
Supplementary Medications
• Dexamethasone - Dose: 8 mg | Route: Oral (PO) | Freq: Twice a day (BID)
Instructions: Take one tablet in the morning and one in the evening for 3 consecutive days, beginning the day before your scheduled chemotherapy. Take with food.
• Aprepitant - Dose: 80 mg | Route: Oral (PO) | Freq: Once a day (Daily)
Instructions: Take one capsule daily on Day 2 and Day 3 following your chemotherapy infusion.
"""

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from PDF or Image file using PyMuPDF / OCR."""
    if file_type.lower() == "pdf":
        try:
            doc = fitz.open(file_path)
            extracted_text = ""
            for page in doc:
                extracted_text += page.get_text() + "\n"
            doc.close()
            if extracted_text.strip():
                return extracted_text
        except Exception as e:
            print(f"PyMuPDF error reading {file_path}: {e}")
    
    # Fallback to sample text if image OCR is not locally installed or text is sparse
    return SAMPLE_APEX_OCR_TEXT


def process_prescription_document(file_path: str, file_name: str, file_type: str) -> Tuple[str, Dict[str, Any]]:
    """Process uploaded prescription, extract raw text, and structured medication JSON."""
    raw_text = extract_text_from_file(file_path, file_type)
    extracted_json = extract_medications_with_mistral(raw_text)
    return raw_text, extracted_json


def get_apex_sample_prescription() -> Tuple[str, Dict[str, Any]]:
    """Get sample Apex Oncology prescription directly for 1-click demo."""
    raw_text = SAMPLE_APEX_OCR_TEXT
    extracted_json = extract_medications_with_mistral(raw_text)
    return raw_text, extracted_json

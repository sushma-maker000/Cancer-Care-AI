from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class PatientBase(BaseModel):
    name: str = Field(..., example="Sarah Jenkins")
    age: int = Field(..., ge=1, le=120, example=52)
    gender: str = Field(..., example="Female")
    preferred_language: str = Field(default="English", example="English")
    smoking_status: str = Field(default="Non-smoker", example="Non-smoker")
    alcohol_consumption: str = Field(default="None", example="None")
    medical_history: Optional[str] = Field(default="", example="Hypertension (controlled)")
    condition_or_disease: Optional[str] = Field(default="Breast Cancer", example="Invasive Ductal Carcinoma")
    cancer_type: Optional[str] = Field(default="Breast Cancer (Stage IIA)", example="Breast Cancer (HER2+)")
    treatment_type: Optional[str] = Field(default="Adjuvant Chemotherapy", example="Chemotherapy + Targeted Therapy")
    
    caregiver_name: Optional[str] = Field(default=None, example="Mark Jenkins")
    caregiver_email: Optional[str] = Field(default=None, example="mark.jenkins@example.com")
    caregiver_phone: Optional[str] = Field(default=None, example="+91 98765 43210")
    notification_preference: Optional[str] = Field(default="In-App", example="In-App")
    escalation_after_minutes: Optional[int] = Field(default=30, ge=5, le=1440, example=30)


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = None
    smoking_status: Optional[str] = None
    alcohol_consumption: Optional[str] = None
    medical_history: Optional[str] = None
    condition_or_disease: Optional[str] = None
    cancer_type: Optional[str] = None
    treatment_type: Optional[str] = None
    caregiver_name: Optional[str] = None
    caregiver_email: Optional[str] = None
    caregiver_phone: Optional[str] = None
    notification_preference: Optional[str] = None
    escalation_after_minutes: Optional[int] = None


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(50), nullable=False)
    preferred_language = Column(String(50), default="English")
    patient_phone = Column(String(50), nullable=True, default="+91 98765 12345")
    smoking_status = Column(String(50), default="Non-smoker")
    alcohol_consumption = Column(String(50), default="None")
    medical_history = Column(Text, default="")
    condition_or_disease = Column(String(255), default="Cancer")
    cancer_type = Column(String(255), default="Breast Cancer")
    treatment_type = Column(String(255), default="Chemotherapy")
    
    # Caregiver details
    caregiver_name = Column(String(255), nullable=True)
    caregiver_email = Column(String(255), nullable=True)
    caregiver_phone = Column(String(50), nullable=True)
    notification_preference = Column(String(50), default="In-App")
    escalation_after_minutes = Column(Integer, default=30)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    dose_events = relationship("DoseEvent", back_populates="patient", cascade="all, delete-orphan")
    symptoms = relationship("SymptomReport", back_populates="patient", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("TreatmentAppointment", back_populates="patient", cascade="all, delete-orphan")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # jpg, png, pdf
    ocr_raw_text = Column(Text, default="")
    extracted_json = Column(JSON, default=dict)
    is_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    medications = relationship("Medication", back_populates="prescription")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=True)
    name = Column(String(255), nullable=False)
    strength = Column(String(100), default="")
    dose = Column(String(100), default="1 tablet")
    route = Column(String(100), default="oral")
    frequency = Column(String(100), default="Once daily")
    scheduled_times = Column(JSON, default=list)  # e.g. ["08:00", "20:00"]
    duration_days = Column(Integer, default=30)
    instructions = Column(Text, default="")
    confidence = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="medications")
    prescription = relationship("Prescription", back_populates="medications")
    dose_events = relationship("DoseEvent", back_populates="medication", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="medication", uselist=False, cascade="all, delete-orphan")


class DoseEvent(Base):
    __tablename__ = "dose_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="scheduled")  # scheduled, taken, missed, snoozed, busy, help
    response_time = Column(DateTime, nullable=True)
    missed_reason = Column(String(255), nullable=True)
    support_notes = Column(Text, nullable=True)
    caregiver_notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="dose_events")
    medication = relationship("Medication", back_populates="dose_events")


class AdherenceEvent(Base):
    __tablename__ = "adherence_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    date = Column(String(50), nullable=False)  # YYYY-MM-DD
    total_scheduled = Column(Integer, default=0)
    total_taken = Column(Integer, default=0)
    adherence_percentage = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False)
    initial_quantity = Column(Integer, default=30)
    current_quantity = Column(Integer, default=30)
    units_per_dose = Column(Integer, default=1)
    refill_threshold = Column(Integer, default=5)
    refill_alert_active = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="inventory_items")
    medication = relationship("Medication", back_populates="inventory")


class SymptomReport(Base):
    __tablename__ = "symptom_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    symptom_text = Column(Text, nullable=False)
    extracted_symptom = Column(String(255), default="")
    medication_context = Column(String(255), default="")
    triage_level = Column(String(50), default="low")  # low, concerning, red_flag
    recommendation = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="symptoms")


class TreatmentAppointment(Base):
    __tablename__ = "treatment_appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    treatment_type = Column(String(255), default="Chemotherapy")
    scheduled_date = Column(String(50), nullable=False)  # YYYY-MM-DD
    scheduled_time = Column(String(50), nullable=False)  # HH:MM
    location = Column(String(255), default="Apollo Cancer Institute")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")

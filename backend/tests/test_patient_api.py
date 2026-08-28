import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_create_and_get_patient():
    new_patient = {
        "name": "Test Patient",
        "age": 45,
        "gender": "Male",
        "preferred_language": "English",
        "smoking_status": "Former smoker",
        "alcohol_consumption": "Occasional",
        "medical_history": "Type 2 Diabetes",
        "condition_or_disease": "Colorectal Cancer",
        "cancer_type": "Stage II Colorectal Cancer",
        "treatment_type": "FOLFOX Regimen",
        "caregiver_name": "Jane Doe",
        "caregiver_email": "jane@example.com",
        "caregiver_phone": "+91 91234 56789",
        "notification_preference": "In-App",
        "escalation_after_minutes": 30
    }
    
    # Create patient
    create_res = client.post("/api/patients", json=new_patient)
    assert create_res.status_code == 201
    created_data = create_res.json()
    patient_id = created_data["id"]
    assert created_data["name"] == "Test Patient"
    
    # Retrieve patient
    get_res = client.get(f"/api/patients/{patient_id}")
    assert get_res.status_code == 200
    assert get_res.json()["condition_or_disease"] == "Colorectal Cancer"
    
    # Update patient
    update_res = client.put(f"/api/patients/{patient_id}", json={"preferred_language": "Tamil"})
    assert update_res.status_code == 200
    assert update_res.json()["preferred_language"] == "Tamil"


def test_seed_synthetic_patient():
    res = client.post("/api/patients/seed-synthetic?language=Tamil")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Sarah Jenkins"
    assert data["preferred_language"] == "Tamil"


if __name__ == "__main__":
    test_health_endpoint()
    test_create_and_get_patient()
    test_seed_synthetic_patient()
    print("All backend patient API tests passed!")

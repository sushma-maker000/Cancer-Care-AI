import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_prescription_and_adherence_flow():
    # 1. Seed patient
    seed_res = client.post("/api/patients/seed-synthetic?language=English")
    assert seed_res.status_code == 200
    patient_id = seed_res.json()["id"]

    # 2. Load Apex Oncology sample prescription
    sample_res = client.post("/api/prescriptions/load-sample", data={"patient_id": patient_id})
    assert sample_res.status_code == 200
    rx_data = sample_res.json()
    assert rx_data["prescription_id"] > 0
    assert len(rx_data["medications"]) >= 4

    med_names = [m["name"].lower() for m in rx_data["medications"]]
    assert any("dexamethasone" in name for name in med_names)
    assert any("aprepitant" in name for name in med_names)
    assert any("docetaxel" in name for name in med_names)
    assert any("cyclophosphamide" in name for name in med_names)

    # 3. Patient confirms prescription
    confirm_payload = {
        "medications": rx_data["medications"],
        "start_date": "2026-08-28"
    }
    confirm_res = client.post(
        f"/api/prescriptions/{rx_data['prescription_id']}/confirm",
        json=confirm_payload
    )
    assert confirm_res.status_code == 200
    conf_data = confirm_res.json()
    assert conf_data["status"] == "confirmed"
    assert conf_data["active_medications_count"] == 4
    assert conf_data["dose_events_generated"] > 0

    # 4. Check active medications
    meds_res = client.get(f"/api/patients/{patient_id}/medications")
    assert meds_res.status_code == 200
    assert len(meds_res.json()) == 4

    # 5. Check dose events
    events_res = client.get(f"/api/patients/{patient_id}/dose-events")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) > 0
    first_event_id = events[0]["id"]

    # 6. Perform dose actions: taken
    action_res = client.post(
        f"/api/dose-events/{first_event_id}/action",
        json={"action": "taken"}
    )
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "taken"

    # 7. Check adherence calculation
    adh_res = client.get(f"/api/patients/{patient_id}/adherence")
    assert adh_res.status_code == 200
    adh_data = adh_res.json()
    assert adh_data["total_taken"] >= 1
    assert adh_data["adherence_percentage"] == 100.0

    # 8. Check inventory
    inv_res = client.get(f"/api/patients/{patient_id}/inventory")
    assert inv_res.status_code == 200
    assert len(inv_res.json()) >= 1

    print("✅ All Prescription OCR, Extraction, Confirmation & Adherence tests passed successfully!")

if __name__ == "__main__":
    test_full_prescription_and_adherence_flow()

import pytest

def test_specialists_directory(client):
    res = client.get("/api/specialists")
    assert res.status_code == 200
    data = res.json()
    assert "dermatologists" in data
    assert "consultants" in data
    assert len(data["dermatologists"]) > 0
    assert len(data["consultants"]) > 0
    assert any(d["role"] == "dermatologist" for d in data["dermatologists"])
    assert any(c["role"] == "consultant" for c in data["consultants"])

def test_consultation_end_to_end_workflow(client):
    # 1. Login as patient
    pat_res = client.post("/auth/login", json={"email": "alex@demo.com", "password": "password123"})
    assert pat_res.status_code == 200
    pat_token = pat_res.json()["access_token"]
    pat_headers = {"Authorization": f"Bearer {pat_token}"}

    # 2. Login as dermatologist
    doc_res = client.post("/auth/login", json={"email": "dr.chen@demo.com", "password": "password123"})
    assert doc_res.status_code == 200
    doc_token = doc_res.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # 3. Patient creates a new consultation request
    create_res = client.post("/consultations", json={
        "subject": "Cystic acne breakout on cheeks",
        "description": "Painful papules after testing a new oil serum. Redness and flaking.",
        "priority": "high"
    }, headers=pat_headers)
    assert create_res.status_code == 201
    cons_id = create_res.json()["consultation_id"]

    # 4. Dermatologist checks queue and sees the consultation
    queue_res = client.get("/consultations/queue", headers=doc_headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()
    assert any(c["id"] == cons_id for c in queue)

    # 5. Dermatologist views consultation details (was 403 previously)
    detail_res = client.get(f"/consultations/{cons_id}", headers=doc_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["subject"] == "Cystic acne breakout on cheeks"

    # 6. Dermatologist accepts the consultation
    accept_res = client.patch(f"/consultations/{cons_id}/accept", headers=doc_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "in_review"

    # 7. Patient sends a message to dermatologist
    msg1_res = client.post(f"/consultations/{cons_id}/messages", json={
        "message": "Dr. Chen, should I apply hydrocortisone until we meet?"
    }, headers=pat_headers)
    assert msg1_res.status_code == 201

    # 8. Dermatologist replies in chat
    msg2_res = client.post(f"/consultations/{cons_id}/messages", json={
        "message": "Avoid hydrocortisone on facial acne. Wash with lukewarm water and use a light ceramide moisturizer."
    }, headers=doc_headers)
    assert msg2_res.status_code == 201

    # 9. Verify message exchange
    msgs_res = client.get(f"/consultations/{cons_id}/messages", headers=pat_headers)
    assert msgs_res.status_code == 200
    messages = msgs_res.json()
    assert len(messages) >= 2

    # 10. Dermatologist finalizes clinical evaluation & regimen
    resp_res = client.patch(f"/consultations/{cons_id}/respond", json={
        "dermatologist_notes": "Contact dermatitis with secondary papular acneiform reaction.",
        "recommendations": "1. Discontinue facial oils. 2. Prescribed 1% clindamycin lotion. 3. Barrier support."
    }, headers=doc_headers)
    assert resp_res.status_code == 200
    assert resp_res.json()["status"] == "completed"

    # 11. Patient verifies completed consultation with notes
    final_res = client.get(f"/consultations/{cons_id}", headers=pat_headers)
    assert final_res.status_code == 200
    assert final_res.json()["status"] == "completed"
    assert "clindamycin" in final_res.json()["recommendations"]

def test_dermatologist_dashboard(client):
    doc_res = client.post("/auth/login", json={"email": "dr.chen@demo.com", "password": "password123"})
    assert doc_res.status_code == 200
    doc_headers = {"Authorization": f"Bearer {doc_res.json()['access_token']}"}

    dash_res = client.get("/api/dermatologist/dashboard", headers=doc_headers)
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "kpis" in data
    assert "queue" in data
    assert "patient_insights" in data
    assert "skin_condition_reports" in data
    assert "progress_analytics" in data

def test_consultant_dashboard(client):
    cons_res = client.post("/auth/login", json={"email": "maya.consultant@demo.com", "password": "password123"})
    assert cons_res.status_code == 200
    cons_headers = {"Authorization": f"Bearer {cons_res.json()['access_token']}"}

    dash_res = client.get("/api/consultant/dashboard", headers=cons_headers)
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "kpis" in data
    assert "client_profiles" in data
    assert "assessment_reports" in data
    assert "progress_monitoring" in data
    assert "recommendation_management" in data

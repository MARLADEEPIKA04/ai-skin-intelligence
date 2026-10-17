import pytest

def test_notifications_crud_and_read(client):
    # 1. Login as patient
    login_res = client.post("/auth/login", json={"email": "alex@demo.com", "password": "password123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a notification / reminder
    create_res = client.post("/api/notifications", json={
        "title": "Evening Barrier Repair Reminder",
        "message": "Apply 0.3% Retinol and follow with Ceramide Cream.",
        "category": "routine",
        "action_url": "/progress"
    }, headers=headers)
    assert create_res.status_code == 201
    notif = create_res.json()
    assert notif["title"] == "Evening Barrier Repair Reminder"
    assert notif["is_read"] is False
    notif_id = notif["id"]

    # 3. Check unread count
    count_res = client.get("/api/notifications/unread-count", headers=headers)
    assert count_res.status_code == 200
    assert count_res.json()["unread_count"] >= 1

    # 4. Mark as read
    read_res = client.patch(f"/api/notifications/{notif_id}/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # 5. List notifications
    list_res = client.get("/api/notifications", headers=headers)
    assert list_res.status_code == 200
    raw_notes = list_res.json()
    notifications = raw_notes if isinstance(raw_notes, list) else raw_notes.get("notifications", [])
    assert any(n["id"] == notif_id for n in notifications)


def test_appointment_booking_and_lifecycle(client):
    # 1. Login as patient
    pat_res = client.post("/auth/login", json={"email": "alex@demo.com", "password": "password123"})
    assert pat_res.status_code == 200
    pat_token = pat_res.json()["access_token"]
    pat_headers = {"Authorization": f"Bearer {pat_token}"}

    # 2. Get specialists to get Dr. Chen's ID
    spec_res = client.get("/api/specialists")
    assert spec_res.status_code == 200
    dr_chen = spec_res.json()["dermatologists"][0]
    dr_id = dr_chen["id"]

    # 3. Query available slots
    slots_res = client.get(f"/api/appointments/available-slots?specialist_id={dr_id}&date=2026-11-01")
    assert slots_res.status_code == 200
    slots = slots_res.json()["available_slots"]
    assert len(slots) > 0
    chosen_slot = slots[0]

    # 4. Book appointment
    book_res = client.post("/api/appointments", json={
        "specialist_id": dr_id,
        "appointment_date": "2026-11-01",
        "time_slot": chosen_slot,
        "consultation_type": "tele-video",
        "reason": "Sudden erythema and flaking after new retinol serum."
    }, headers=pat_headers)
    assert book_res.status_code == 201
    appt = book_res.json()["appointment"]
    assert appt["status"] == "scheduled"
    assert "meeting_url" in appt
    assert "telehealth.skinsmart.ai" in appt["meeting_url"]
    appt_id = appt["id"]

    # 5. Patient checks their scheduled appointments
    my_appts_res = client.get("/api/appointments/my", headers=pat_headers)
    assert my_appts_res.status_code == 200
    raw_appts = my_appts_res.json()
    my_appts = raw_appts if isinstance(raw_appts, list) else raw_appts.get("appointments", [])
    assert any(a["id"] == appt_id for a in my_appts)

    # 6. Cancel appointment
    cancel_res = client.patch(f"/api/appointments/{appt_id}/cancel", headers=pat_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"


def test_ingredient_conflict_and_synergy_matrix(client):
    # 0. Login as patient for auth
    login_res = client.post("/auth/login", json={"email": "alex@demo.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch Master matrix
    mat_res = client.get("/api/ingredients/interactions/matrix")
    assert mat_res.status_code == 200
    matrix = mat_res.json()["matrix"]
    assert len(matrix) >= 5

    # 2. Test high conflict scenario (Retinol + Glycolic Acid + Benzoyl Peroxide)
    conflict_res = client.post("/api/ingredients/interactions", json={
        "ingredients": ["Retinol", "Glycolic Acid", "Benzoyl Peroxide"]
    }, headers=headers)
    assert conflict_res.status_code == 200
    data = conflict_res.json()
    assert data["score"] < 60
    assert len(data["conflicts"]) >= 1
    assert "morning" in data["layering_schedule"]
    assert "evening" in data["layering_schedule"]

    # 3. Test synergy scenario (Retinol + Ceramides + Niacinamide)
    synergy_res = client.post("/api/ingredients/interactions", json={
        "ingredients": ["Retinol", "Ceramides", "Niacinamide"]
    }, headers=headers)
    assert synergy_res.status_code == 200
    syn_data = synergy_res.json()
    assert syn_data["score"] >= 80
    assert len(syn_data["synergies"]) >= 1


def test_ai_virtual_skincare_chatbot(client):
    # 1. Login as patient
    login_res = client.post("/auth/login", json={"email": "alex@demo.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Ask standard routine query
    chat_res = client.post("/api/ai/chat", json={
        "message": "Can I layer Vitamin C and Hyaluronic Acid together?",
        "history": []
    }, headers=headers)
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "response" in data
    assert data["is_red_flag"] is False
    assert len(data["response"]) > 20

    # 3. Ask emergency symptom query (should trigger red flag detection!)
    emergency_res = client.post("/api/ai/chat", json={
        "message": "My face is having sudden severe facial swelling, burning rash, and blisters!",
        "history": []
    }, headers=headers)
    assert emergency_res.status_code == 200
    em_data = emergency_res.json()
    assert em_data["is_red_flag"] is True
    assert em_data["urgency"] == "critical"
    assert "book_urgent_telehealth" in em_data["suggested_actions"]

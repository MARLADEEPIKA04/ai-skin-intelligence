import pytest
import uuid

def test_new_user_registration_and_independent_profile_lifecycle(client):
    test_id = uuid.uuid4().hex[:8]
    test_email = f"jane.{test_id}@testhospital.org"

    # 1. Register a brand new user
    new_user_payload = {
        "full_name": "Dr. Jane Hopper",
        "email": test_email,
        "password": "SecurePassword999!",
        "role": "user"
    }
    reg_res = client.post("/auth/register", json=new_user_payload)
    assert reg_res.status_code == 201

    # 2. Login with the new user credentials
    login_res = client.post("/auth/login", json={
        "email": test_email,
        "password": "SecurePassword999!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Verify the new user initially has NO appointments pre-seeded
    appts_res = client.get("/api/appointments/my", headers=headers)
    assert appts_res.status_code == 200
    appts = appts_res.json()
    assert len(appts) == 0, "New user should not have fake pre-seeded appointments"

    # 4. Verify notifications: only a welcoming alert, no fake replenishment
    notifs_res = client.get("/api/notifications", headers=headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert len(notifs) >= 1
    assert any("Welcome" in n["title"] for n in notifs)
    assert not any("15% remaining" in n.get("message", "") for n in notifs)

    # 5. AI Chat recognizes new user by name and notes profile is pending
    chat_res = client.post("/api/ai/chat", json={
        "message": "Hello, how does this platform work?",
        "history": []
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "Jane Hopper" in chat_data["reply"]
    assert "Profile pending" in chat_data["reply"] or "Skin Profile" in chat_data["reply"]

    # 6. User submits their own customized skin profile
    profile_payload = {
        "age_group": "45-54",
        "skin_type": "Dry",
        "primary_concern": "Barrier Redness & Sensitivity",
        "allergies": "Fragrance, Lanolin, Essential Oils",
        "sensitivities": "Retinol, Glycolic Acid",
        "lifestyle_habits": "Frequent swimming, outdoor cycling",
        "sleep_quality": "8 hours",
        "water_intake": "2.5 Liters",
        "environmental_exposure": "High wind & dry air"
    }
    save_profile_res = client.post("/api/profile", json=profile_payload, headers=headers)
    assert save_profile_res.status_code == 200
    profile_data = save_profile_res.json()["profile"]
    assert profile_data["skin_type"] == "Dry"
    assert profile_data["primary_concern"] == "Barrier Redness & Sensitivity"

    # 7. Now Dashboard Overview reflects Jane's unique profile data
    dash_res = client.get("/api/dashboard/overview", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["user"]["name"] == "Dr. Jane Hopper"
    assert dash_data["profile"]["skin_type"] == "Dry"
    assert dash_data["profile"]["primary_concern"] == "Barrier Redness & Sensitivity"

    # 8. User books an actual appointment with Dr. Chen
    specs_res = client.get("/api/specialists")
    dr_chen = specs_res.json()["dermatologists"][0]
    book_res = client.post("/api/appointments", json={
        "specialist_id": dr_chen["id"],
        "appointment_date": "2026-11-15",
        "time_slot": "11:00 AM - 11:30 AM",
        "consultation_type": "tele-video",
        "reason": "Severe barrier flaking after swimming in chlorinated pool."
    }, headers=headers)
    assert book_res.status_code == 201

    # 9. Appointment is now present and reflects Jane Hopper
    my_appts_res = client.get("/api/appointments/my", headers=headers)
    my_appts = my_appts_res.json()
    assert len(my_appts) == 1
    assert my_appts[0]["slot_time"] == "11:00 AM - 11:30 AM"

    # 10. AI Chat now personalizes with Jane's real Dry skin profile
    chat2_res = client.post("/api/ai/chat", json={
        "message": "What should I focus on for my skin?",
        "history": []
    }, headers=headers)
    assert chat2_res.status_code == 200
    assert "Dry skin" in chat2_res.json()["reply"]

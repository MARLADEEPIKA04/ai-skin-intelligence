import pytest

def test_skin_profile_crud_and_assessment(client, patient_headers):
    # 1. Update/Save skin profile
    profile_payload = {
        "age_group": "25-34",
        "skin_type": "combination",
        "primary_concern": "acne",
        "allergies": "fragrance",
        "sensitivities": "essential oils",
        "lifestyle_habits": "moderate stress, screen time",
        "sleep_quality": "average",
        "water_intake": "1 - 2 L",
        "environmental_exposure": "urban air, air conditioning"
    }

    save_res = client.post("/api/profile", json=profile_payload, headers=patient_headers)
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert "assessment" in save_data
    assert save_data["assessment"]["primary_concern"] == "acne"

    # 2. Retrieve saved profile
    get_res = client.get("/skin-profile/me", headers=patient_headers)
    assert get_res.status_code == 200
    profile_data = get_res.json()
    assert profile_data["skin_type"] == "combination"
    assert profile_data["primary_concern"] == "acne"

    # 3. AI Skin Analysis endpoint
    ai_res = client.get("/api/ai/skin-analysis", headers=patient_headers)
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert "analysis" in ai_data
    analysis = ai_data["analysis"]
    assert "overall_score" in analysis
    assert "insights" in analysis
    assert "recommended_actions" in analysis

    # 4. Personalized Recommendations
    rec_res = client.get("/api/ai/recommendations", headers=patient_headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "recommendations" in rec_data
    recs = rec_data["recommendations"]
    assert "morning_recommendations" in recs
    assert "evening_recommendations" in recs
    assert "safety_notes" in recs

    # 5. Dermatology Triage Decision Support
    derm_res = client.get("/api/ai/dermatology-recommendation", headers=patient_headers)
    assert derm_res.status_code == 200
    derm_data = derm_res.json()
    assert "recommendation" in derm_data
    assert "consultation_recommended" in derm_data["recommendation"]

    # 6. Skin Index
    idx_res = client.get("/api/ai/skin-index", headers=patient_headers)
    assert idx_res.status_code == 200
    idx_data = idx_res.json()
    assert "skin_health_score" in idx_data
    assert idx_data["skin_health_score"] >= 0

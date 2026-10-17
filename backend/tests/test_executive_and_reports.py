import pytest

def test_executive_dashboard(client, patient_headers):
    res = client.get("/api/admin/executive-dashboard", headers=patient_headers)
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "consultations_telemetry" in data
    assert "distributions" in data
    assert "lesion_telemetry" in data

    # Validate KPIs structure
    kpis = data["kpis"]
    assert "total_users" in kpis
    assert "total_consultations" in kpis
    assert "completion_rate_pct" in kpis
    assert "total_checkins" in kpis

    # Validate Lesion Telemetry
    lesions = data["lesion_telemetry"]
    assert "total_pimples_detected" in lesions
    assert "total_scars_recorded" in lesions
    assert "total_stretch_marks_recorded" in lesions
    assert "total_wrinkles_recorded" in lesions

def test_clinical_summary_report(client, patient_headers):
    res = client.get("/api/reports/clinical-summary", headers=patient_headers)
    assert res.status_code == 200
    report = res.json()
    assert "report_id" in report
    assert "patient" in report
    assert "skin_profile" in report
    assert "clinical_assessment" in report
    assert "prescribed_routine" in report
    assert "dermatology_triage" in report
    assert "disclaimer" in report

def test_csv_and_json_exports(client, patient_headers):
    # CSV Export
    csv_res = client.get("/api/reports/export/csv", headers=patient_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")
    csv_text = csv_res.text
    assert "AI SKIN INTELLIGENCE" in csv_text
    assert "DAILY ROUTINE LOGS" in csv_text
    assert "SKIN HEALTH BIOMETRIC PROGRESS" in csv_text
    assert "PHOTO-ASSISTED LESION & ERYTHEMA CHECK-INS" in csv_text

    # JSON Export
    json_res = client.get("/api/reports/export/json", headers=patient_headers)
    assert json_res.status_code == 200
    json_data = json_res.json()
    assert "user" in json_data
    assert "profile" in json_data
    assert "routine_logs_count" in json_data
    assert "progress_entries_count" in json_data
    assert "checkins_count" in json_data
    assert "consultations_count" in json_data

def test_system_capabilities(client):
    res = client.get("/api/system/capabilities")
    assert res.status_code == 200
    data = res.json()
    assert data["version"] == "1.4.0"
    assert data["milestone1"] is True
    assert data["milestone2"] is True
    assert data["milestone3"] is True
    assert data["milestone4"] is True

import pytest
import io
from PIL import Image

def _generate_test_image_bytes():
    img = Image.new('RGB', (100, 100), color=(220, 180, 170))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

def test_camera_and_photo_checkin(client, patient_headers):
    # 1. Test live webcam upload endpoint (base64)
    img_bytes = _generate_test_image_bytes()
    import base64
    b64_str = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode('utf-8')

    cam_res = client.post("/api/skin-checkin/upload-camera", json={
        "image_base64": b64_str
    }, headers=patient_headers)
    assert cam_res.status_code == 200
    cam_data = cam_res.json()
    assert "photo_url" in cam_data
    assert cam_data["photo_source"] == "camera"
    assert "photo_quality" in cam_data

    # 2. Test file upload
    file_res = client.post(
        "/api/skin-checkin/upload",
        files={"file": ("checkin.jpg", img_bytes, "image/jpeg")},
        headers=patient_headers
    )
    assert file_res.status_code == 200
    file_data = file_res.json()
    assert "photo_url" in file_data
    photo_url = file_data["photo_url"]

    # 3. Test check-in analysis with structured lesion observations
    checkin_payload = {
        "pimple_count": 3,
        "scar_count": 2,
        "has_scars": True,
        "stretch_mark_count": 1,
        "has_stretch_marks": True,
        "wrinkle_count": 1,
        "has_wrinkles": True,
        "pigmentation_spot_count": 1,
        "redness_level": 2,
        "dryness_level": 1,
        "irritation_level": 1,
        "photo_url": photo_url,
        "photo_source": "gallery",
        "notes": "Testing structured lesion check-in"
    }

    analyze_res = client.post("/api/skin-checkin/analyze", json=checkin_payload, headers=patient_headers)
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert "analysis" in analysis
    assert "score" in analysis["analysis"]
    assert "signals" in analysis["analysis"]
    assert "actions" in analysis["analysis"]
    assert "dermatologist_recommendation" in analysis

    # 4. Test latest checkin
    latest_res = client.get("/api/skin-checkin/latest", headers=patient_headers)
    assert latest_res.status_code == 200
    latest = latest_res.json()
    assert latest["checkin"] is not None
    assert latest["checkin"]["pimple_count"] == 3
    assert latest["checkin"]["has_scars"] is True

    # 5. Test history
    history_res = client.get("/api/skin-checkin/history", headers=patient_headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert "checkins" in history
    assert len(history["checkins"]) > 0

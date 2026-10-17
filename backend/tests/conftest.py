import os
import sys
import pytest

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session")
def patient_token(client):
    # Authenticate with the pre-seeded or freshly created patient
    res = client.post("/auth/login", json={"email": "patient@demo.com", "password": "password123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    
    # Otherwise register new patient
    client.post("/auth/register", json={
        "email": "test_patient@demo.com",
        "password": "password123",
        "full_name": "Test Patient",
        "role": "user"
    })
    res = client.post("/auth/login", json={"email": "test_patient@demo.com", "password": "password123"})
    return res.json()["access_token"]

@pytest.fixture(scope="session")
def doctor_token(client):
    # Authenticate with the pre-seeded or freshly created dermatologist
    res = client.post("/auth/login", json={"email": "doctor@demo.com", "password": "password123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    
    # Otherwise register new doctor
    client.post("/auth/register", json={
        "email": "test_doctor@demo.com",
        "password": "password123",
        "full_name": "Dr. Test Vance",
        "role": "dermatologist"
    })
    res = client.post("/auth/login", json={"email": "test_doctor@demo.com", "password": "password123"})
    return res.json()["access_token"]

@pytest.fixture(scope="session")
def patient_headers(patient_token):
    return {"Authorization": f"Bearer {patient_token}"}

@pytest.fixture(scope="session")
def doctor_headers(doctor_token):
    return {"Authorization": f"Bearer {doctor_token}"}

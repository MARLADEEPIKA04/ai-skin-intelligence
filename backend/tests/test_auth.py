import pytest
import uuid

def test_user_registration_and_login(client):
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register (201 Created)
    reg_res = client.post("/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": "Alex Mercer",
        "role": "user"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == unique_email
    assert user_data["role"] == "user"
    assert "id" in user_data

    # 2. Duplicate registration fails
    dup_res = client.post("/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": "Alex Mercer Duplicate",
        "role": "user"
    })
    assert dup_res.status_code == 400

    # 3. Successful login
    login_res = client.post("/auth/login", json={
        "email": unique_email,
        "password": password
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    token = token_data["access_token"]

    # 4. Invalid login
    bad_login = client.post("/auth/login", json={
        "email": unique_email,
        "password": "wrongpassword"
    })
    assert bad_login.status_code == 401

    # 5. Access /auth/me
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == unique_email
    assert me_data["full_name"] == "Alex Mercer"

def test_unauthenticated_access(client):
    res = client.get("/auth/me")
    assert res.status_code == 401

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Operational"

def test_system_stats():
    response = client.get("/api/system/stats")
    assert response.status_code == 200

# Other tests require database setup, omitting for brevity in offline mode

def test_health_check_returns_ok_status(client):
    response = client.get("/api/health/")

    assert response.status_code == 200
    assert response.is_json
    assert response.get_json() == {"status": "ok"}

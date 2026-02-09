
def test_get_tasks_requires_auth(client):
    response = client.get("/api/tasks/")
    assert response.status_code == 401


def test_get_tasks_successful(client, auth_headers):
    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 200
    assert response.is_json
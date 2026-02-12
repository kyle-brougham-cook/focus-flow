from focus_flow_app.models import Task, User
from focus_flow_app.__init__app import db
from sqlalchemy import select


def test_get_tasks_requires_auth(client):
    response = client.get("/api/tasks/")
    assert response.status_code == 401


def test_get_tasks_successful(client, auth_headers):
    response = client.get("/api/tasks/", headers=auth_headers)
    
    assert response.status_code == 200
    assert response.is_json
   
    data = response.get_json()

    assert isinstance(data, list)
    assert data == []


def test_get_tasks_returns_only_users_tasks(client, auth_headers, dbf, user):
    db.session.add(
        Task(
            user_id=user.id,
            name="testTaskName",
            description="testTaskDescription",
            done=False
        )
    )

    dbf.session.commit()

    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 200
    assert response.is_json

    data = response.get_json()

    assert isinstance(data, list)
    assert len(data) == 1


from focus_flow_app.models import Task, User
from focus_flow_app.__init__app import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash


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

    userB = User(
                username="testUserNameB",
                email="testUserB@example.com",
                password=generate_password_hash("pass")
            )

    db.session.add(userB)

    db.session.commit()
    userB = db.session.get(User, 2)

    db.session.add(
        Task(
            user_id=userB.id,
            name="testTaskNameB",
            description="testTaskDescriptionB",
            done=False
        )
    )

    db.session.add(
        Task(
            user_id=user.id,
            name="testTaskName",
            description="testTaskDescription",
            done=False
        )
    )

    db.session.commit()

    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 200
    assert response.is_json

    data = response.get_json()

    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "testTaskName"



def test_post_tasks_creation_no_token(client, dbf):
    response = client.post("/api/tasks/", json={})
    assert response.status_code == 401


def test_post_tasks_creation(client, auth_headers, dbf, user):
    exptKeys = ["id", "name", "done", "description"]
    response = client.post(
        "/api/tasks/",
            headers=auth_headers,
            json={"name": "postTestTaskName", "description": "test"}
    )

    assert response.status_code == 201
    assert response.is_json

    data = response.get_json()

    assert isinstance(data["id"], int)

    assert set(exptKeys).issubset(data.keys())

    created_id = data["id"]
    tasks = client.get("/api/tasks/", headers=auth_headers).get_json()
    assert any(task["id"] == created_id for task in tasks)



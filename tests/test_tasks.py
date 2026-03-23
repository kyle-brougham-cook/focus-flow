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
        password=generate_password_hash("pass"),
    )

    db.session.add(userB)
    db.session.commit()

    db.session.add(
        Task(
            user_id=userB.id,
            name="testTaskNameB",
            description="testTaskDescriptionB",
            done=False,
        )
    )

    db.session.add(
        Task(
            user_id=user.id,
            name="testTaskName",
            description="testTaskDescription",
            done=False,
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
        json={"name": "postTestTaskName", "description": "test"},
    )

    assert response.status_code == 201
    assert response.is_json

    data = response.get_json()

    assert isinstance(data["id"], int)

    assert set(exptKeys).issubset(data.keys())

    created_id = data["id"]
    tasks = client.get("/api/tasks/", headers=auth_headers).get_json()
    assert any(task["id"] == created_id for task in tasks)


def test_patch_tasks_edit(client, auth_headers, dbf, user):
    exptKeys = ["id", "name", "done", "description"]

    task = Task(
        user_id=user.id, name="patchTestTaskName", description="test", done=False
    )

    db.session.add(task)
    db.session.commit()

    response = client.patch(
        f"/api/tasks/{task.id}/",
        headers=auth_headers,
        json={"name": "newPatchTaskName", "description": "newTest"},
    )

    assert response.status_code == 200
    assert response.is_json

    editedTask = response.get_json()

    assert set(exptKeys).issubset(editedTask.keys())
    assert editedTask["name"] == "newPatchTaskName"
    assert editedTask["description"] == "newTest"


def test_delete_task_no_token(client, dbf, user):

    task = Task(
        user_id=user.id,
        name="testDeleteTaskName",
        description="testDeleteTaskDescription",
        done=False,
    )

    db.session.add(task)
    db.session.commit()

    response = client.delete(f"/api/tasks/{task.id}/delete/")

    assert response.status_code == 401


def test_delete_task_success(client, dbf, user, auth_headers):

    task = Task(
        user_id=user.id,
        name="testDeleteTaskName",
        description="testDeleteTaskDescription",
        done=False,
    )

    db.session.add(task)
    db.session.commit()

    response = client.delete(f"/api/tasks/{task.id}/delete/", headers=auth_headers)

    assert response.status_code == 200

    tasks = client.get("/api/tasks/", headers=auth_headers).get_json()

    assert len(tasks) == 0


def test_delete_another_users_task(client, dbf, user):

    userB = User(
        username="testUserNameDeleteTest",
        email="testUserDeleteTest@example.com",
        password=generate_password_hash("pass"),
    )

    task = Task(
        user_id=user.id,
        name="testDeleteUserATaskName",
        description="testDeleteUserATaskDescription",
        done=False,
    )

    db.session.add(task)
    db.session.add(userB)
    db.session.commit()

    token = create_access_token(identity=str(userB.id))

    auth_headers_user_b = {"Authorization": f"Bearer {token}"}

    response = client.delete(
        f"/api/tasks/{task.id}/delete/", headers=auth_headers_user_b
    )

    assert response.status_code == 404


def test_patch_task_done_status_no_token(client, dbf, user):

    task = Task(
        user_id=user.id,
        name="testPatchUserTaskDoneName",
        description="testPatchUserTaskDoneDescription",
        done=False,
    )

    db.session.add(task)
    db.session.commit()

    response = client.patch(f"/api/tasks/{task.id}/done/")

    assert response.status_code == 401


def test_patch_task_done_status(client, user, dbf, auth_headers):

    userB = User(
        username="testUserNameDoneTest",
        email="testUserDoneTest@example.com",
        password=generate_password_hash("pass"),
    )

    task = Task(
        user_id=user.id,
        name="testPatchUserTaskDoneSuccessName",
        description="testPatchUserTaskDoneSuccessDescription",
        done=False,
    )

    db.session.add_all([task, userB])
    db.session.commit()

    userB_headers = {
        "Authorization": f"Bearer {create_access_token(identity=str(userB.id))}"
    }

    taskB = Task(
        user_id=userB.id,
        name="testPatchUserTaskDoneSuccessNameB",
        description="testPatchUserTaskDoneSuccessDescriptionB",
        done=False,
    )

    db.session.add(taskB)
    db.session.commit()

    responseTrue = client.patch(f"/api/tasks/{task.id}/done/", headers=auth_headers)

    assert responseTrue.status_code == 200
    assert responseTrue.is_json
    assert responseTrue.get_json()["done"] is True

    responseDoneToggle = client.patch(
        f"/api/tasks/{task.id}/done/", headers=userB_headers
    )
    assert responseDoneToggle.status_code == 404

    responseFalse = client.patch(f"/api/tasks/{task.id}/done/", headers=auth_headers)

    assert responseFalse.status_code == 200
    assert responseFalse.is_json
    assert responseFalse.get_json()["done"] is False

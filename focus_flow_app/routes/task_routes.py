from flask import Blueprint, jsonify, request
from datetime import datetime
from sqlalchemy import select
from ..models import db, Task, User
from flask_jwt_extended import get_jwt_identity, jwt_required


tasks_bp = Blueprint("tasks", __name__)


def get_user():
    """Get current user id from the token and return the corrosponding User model"""
    user_id = get_jwt_identity()

    if not user_id:
        return False

    current_user = db.session.get(User, int(user_id))

    return current_user


@tasks_bp.route("/", methods=["GET"])
@jwt_required()
def get_tasks():
    """
    Retrieve all tasks from the database,
    serialize them into JSON, and return.
    """

    current_user = get_user()
    if not current_user:
        return jsonify({}), 401

    tasks = current_user.tasks.all()

    task_list = []
    for task in tasks:
        if validator(task):

            # Serialize each task into a dictionary.
            task_list.append(
                {
                    "id": task.id,
                    "name": task.name,
                    "description": task.description,
                    "done": task.done,
                    "date": task.date.strftime("%Y-%m-%d %H:%M"),
                }
            )
        else:
            return (
                jsonify(
                    {
                        "Error": f"The following task: {task} \
                        could not be added \
                        to the front-end"
                    }
                ),
                500,
            )
    return jsonify(task_list), 200


def validator_json(data: dict) -> bool:
    """This function validates our json data to be added
    to the database ensuring all needed data is added"""
    # The array to test against for data validation
    required_keys = ["name", "description"]

    # Check all keys are present
    if not all(key in data for key in required_keys):
        return False

    # Check all keys values are of the correct datatype
    if not isinstance(data["name"], str) or not isinstance(data["description"], str):
        return False

    return True


def validator(task: Task) -> bool:
    """This function validates our task data ensuring no data
      is missing before sending a task to the front-end

    Args:
        iShort (Bool) : this is for when we only need the name,
        descripiton and id of a task.

    """

    elList = [task.user_id, task.name, task.description, task.done, task.date]

    expectedDict = {0: int, 1: str, 2: str, 3: bool, 4: datetime}

    # This part checks that the regular validation logic of the function is expecting
    # the right amount of items to check against...
    for idx in expectedDict.keys():
        if idx > len(elList):
            return False
        else:
            continue

    # This part checks against the expectedDict to ensure
    # we are getting the expected datatypes...
    for keyIdx, value in expectedDict.items():
        if not isinstance(elList[keyIdx], value):
            print(elList[keyIdx], "\n", value)
            return False

    return True


@tasks_bp.route("/", methods=["POST"])  # type: ignore
@jwt_required()
def add_tasks():
    """
    Add a new task in the database.
    Expects JSON data with task details.
    """

    current_user = get_user()
    if not current_user:
        return jsonify({"error": "No such user."}), 404

    data = request.get_json()
    if validator_json(data):
        new_task = Task(
            name=data["name"],  # type: ignore
            description=data["description"],  # type: ignore
            user_id=current_user.id,  # type: ignore
        )
        db.session.add(new_task)
        db.session.commit()

        new_task_data = {
            "id": new_task.id,
            "name": new_task.name,
            "description": new_task.description,
            "done": new_task.done
        }

        return jsonify(new_task_data), 201
    else:
        return (
            jsonify(
                {"error": "the provided data did not include all required info"}
            ),
            422,
        )


@tasks_bp.route("/<int:taskId>/", methods=["PATCH"])
@jwt_required()
def update_tasks(taskId):
    """
    Update task's name and description using PATCH.
    """

    current_user = get_user()
    if not current_user:
        return jsonify({"error": "No such user."}), 404

    # We use this list to check for the expected
    # keys we are meant to recieve from the front-end
    exp_keys = ["name", "description"]

    data = request.get_json()
    missing = [k for k in exp_keys if k not in data]
    if missing:
        return jsonify({"error": f"missing keys: {missing}"}), 400

    # Grabbing the task if it exists
    task = current_user.tasks.filter(Task.id == taskId).first()
    if not task:
        return (
            jsonify({"error": "Task not found or does not belong to current user"}),
            404,
        )

    # Making the changes to the task
    task.name = data["name"]
    task.description = data["description"]
    db.session.commit()


    edited_task = {
        "id": task.id,
        "name": task.name,
        "description": task.description,
        "done": task.done
    }


    return jsonify(edited_task), 200


@tasks_bp.route("/<int:taskId>/delete/", methods=["DELETE"])
@jwt_required()
def delete_task(taskId):
    """
    Delete the task with the specified ID.
    Returns an error if the task is not found.
    """
    current_user = get_user()
    if not current_user:
        return jsonify({}), 401

    task = current_user.tasks.filter(Task.id == taskId).first()
    if task is None:
        return jsonify({"error": "Task not found!"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({}), 200


@tasks_bp.route("/<int:taskId>/done/", methods=["PATCH"])
@jwt_required()
def completed_tasks(taskId):
    """
    Mark the specified task as done or not done.
    """
    current_user = get_user()
    if not current_user:
        return jsonify({"error": "No such user."}), 404


    task = db.session.scalars(select(Task).where(Task.id == taskId, Task.user_id == current_user.id)).first()
    if not task:
        return jsonify({"error": f"The Task with the ID: {taskId} doesnt exist!"}), 404
    
    task.done = not task.done
    db.session.commit()

    # Return a response with the updated task state.
    return jsonify({"done": task.done}), 200
    
       

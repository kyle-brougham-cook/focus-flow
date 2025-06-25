from flask import Blueprint, jsonify, request, render_template
from datetime import datetime
from flask_login import current_user, login_required
from ..models import db, Task
from sqlalchemy import select, desc


task_bp = Blueprint("task", __name__, url_prefix="/task")


@task_bp.route("/dashboard/view", methods=["GET"])
@login_required
def view_dashboard():
    return render_template("dashboard.html")


@task_bp.route("/dashboard", methods=["GET"])
@login_required
def get_tasks():
    """
    Retrieve all tasks from the database,
    serialize them into JSON, and return.
    """
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
    return jsonify(task_list)


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

    # This check is here incase we are dealing with the short version of this
    # function where we only access the first 2/3 elements for validation...
    if len(elList) < 3:
        return False
    elif len(elList) == 3:
        return all(isinstance(item, (str, int)) for item in elList[:3])

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


@task_bp.route("/tasks", methods=["POST", "PATCH"])  # type: ignore
@login_required
def add_tasks():
    """
    Add a new task or update an existing task in the database.
    Expects JSON data with task details.
    """

    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
            if validator_json(data):
                new_task = Task(
                    name=data["name"],  # type: ignore
                    description=data["description"],  # type: ignore
                    user_id=current_user.id,  # type: ignore
                )
                db.session.add(new_task)
                db.session.commit()
                return jsonify({"message": "Task added!", "task_id": new_task.id}), 201
            else:
                return (
                    jsonify(
                        {"error": "the provided data did not include all required info"}
                    ),
                    422,
                )
        else:
            return jsonify({"error": "there was no json in the response!"}), 400

    elif request.method == "PATCH":
        """
        Update task's name and description using PATCH.
        """
        # We use this list to check for the expected
        #  keys we are meant to recieve from the front-end
        exp_keys = ["name", "description", "id"]

        if not request.is_json:
            return jsonify({"error": "data must be JSON"}), 415

        data = request.get_json()
        missing = [k for k in exp_keys if k not in data]
        if missing:
            return jsonify({"error": f"missing keys: {missing}"}), 400

        # check for missing data
        if (
            not isinstance(data["name"], str)
            or not isinstance(data["description"], str)
            or not isinstance(data["id"], int)
        ):
            return jsonify({"error": f"wrong data types - {data}"}), 422

        # Grabbing the task if it exists
        tid = data["id"]
        task = current_user.tasks.filter(Task.id == tid).first()
        if not task:
            return (
                jsonify({"error": "Task not found or does not belong to current user"}),
                404,
            )

        # Making the changes to the task
        task.name = data["name"]
        task.description = data["description"]
        db.session.commit()
        return jsonify({"message": "Task updated!"}), 200


@task_bp.route("/delete/<int:id>", methods=["DELETE"])
@login_required
def delete_task(id):
    """
    Delete the task with the specified ID.
    Returns an error if the task is not found.
    """
    task = current_user.tasks.filter(Task.id == id).first()
    if task is None:
        return jsonify({"error": "Task not found!"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted!"}), 200


@task_bp.route("/getTasksLength/", methods=["GET"])  # type: ignore
@login_required
def amount_of_tasks():
    latestTaskId = (
        db.session.execute(
            select(Task.id)
            .where(Task.user_id == current_user.id)
            .order_by(desc(Task.id))
        )
        .scalars()
        .first()
    )
    print(latestTaskId)
    if latestTaskId:
        return jsonify({"amount": latestTaskId}), 200
    else:
        return (
            jsonify({"error": "There are no Task entries under the current user"}),
            404,
        )


@task_bp.route("/done/<int:id>", methods=["PATCH"])
@login_required
def completed_tasks(id):
    """
    Mark the specified task as done or not done.
    """
    if not request.is_json:
        return jsonify({"error": "invalid data, data needs to be inside json"}), 400

    data = request.get_json()

    # Update the 'done' attribute of the task.
    task = current_user.tasks.filter(Task.id == id).first()
    if not task:
        return jsonify({"error": f"The Task with the ID: {id} doesnt exist!"}), 404

    if "bool" in data and isinstance(data["bool"], bool):
        task.done = data["bool"]
        db.session.commit()
        # Return a response with the updated task state.
        return jsonify({"message": f"Task done set as {data['bool']}!"}), 200
    else:
        return (
            jsonify(
                {
                    "error": f"data doesnt have the correct key-value pair \
                    (bool:true|false) instead it has {data}"
                }
            ),
            400,
        )

from flask import (
    Blueprint,
    request,
    jsonify,
    make_response,
)
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from sqlalchemy import select
from ..models import User, db


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])  # type: ignore
def create_New_User_Account():
    """Our signup route it requires an email, username and password"""
    data = request.get_json()
    expected_keys = ["email", "name", "password"]

    if not all(key in data for key in expected_keys):
        return (
            jsonify(
                {"error": "ERROR: INVALID KEY_PAIR RECEIVED! CONTACT AN ADMIN ASAP!"}
            ),
            422,
        )

    if not all(data[key].strip() for key in expected_keys):
        return (
            jsonify({"error": "ERROR: NO VALUES IN FORM_DATA! CONTACT AN ADMIN ASAP!"}),
            422,
        )

    user = db.session.execute(
        select(User).where(
            (User.email == data.get("email").strip())  # type: ignore
            | (User.username == data.get("name").strip())  # type: ignore
        )
    ).scalar_one_or_none()

    if user:
        if user.email == data.get("email").strip():  # type: ignore
            return jsonify(
                {"error": "A User with that Email already exists! Please try again."}
            )

        else:
            return jsonify(
                {"error": "A User with that name already exists! Please try again."}
            )
    else:
        new_user = User(
            username=data.get("name").strip(),  # type: ignore
            password=generate_password_hash(  # type: ignore
                data.get("password").strip()  # type: ignore
            ),  # type: ignore
            email=data.get("email").strip(),  # type: ignore
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({}), 200


@auth_bp.route("/login", methods=["POST", "GET"])
def login_page():
    """Our login route needs the email and password of the user"""

    data = request.get_json()
    user = db.session.execute(
        select(User).where(User.email == data.get("email"))  # type: ignore
    ).scalar_one_or_none()
    if user is not None:
        if not check_password_hash(
            user.password, data.get("password").strip()  # type: ignore
        ):  # type: ignore
            return jsonify({"status": "wrong_password"})
        else:
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))

            response = make_response(
                jsonify({"access_token": access_token, "user_name": user.username})
            )

            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=30 * 24 * 60 * 60,
            )

            return response
    else:
        return jsonify({"status": "no_user"})


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def token_refresh():
    """This is our JWT access token refresh route"""
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200

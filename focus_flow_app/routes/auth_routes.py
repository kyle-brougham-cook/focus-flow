from flask import (
    Blueprint,
    request,
    render_template,
    redirect,
    flash,
    url_for,
    session,
)
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import select
from ..models import User, db


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/signup", methods=["POST", "GET"])
def create_New_User_Account():
    """Our signup route it requires an email, username and password"""
    if request.method == "GET":
        return render_template("signup.html")
    else:
        form = request.form
        expected_keys = ["user_email", "user_name", "user_password"]
        form_data = form.to_dict()

        if not all(key in form_data for key in expected_keys):
            flash("ERROR: INVALID KEY_PAIR RECEIVED! CONTACT AN ADMIN ASAP!")
            return redirect(url_for("auth.login_page")), 422

        if not all(form_data[key].strip() for key in expected_keys):
            flash("ERROR: NO VALUES IN FORM_DATA! CONTACT AN ADMIN ASAP!")
            return redirect(url_for("auth.login_page")), 422

        user = db.session.execute(
            select(User).where(
                (User.email == form.get("user_email").strip())  # type: ignore
                | (User.username == form.get("user_name").strip())  # type: ignore
            )
        ).scalar_one_or_none()

        if user:
            if user.email == form.get("user_email").strip():  # type: ignore
                flash("A User with that Email already exists! Please try again.")
                return redirect(url_for("auth.create_New_User_Account"))

            else:
                flash("A User with that name already exists! Please try again.")
                return redirect(url_for("auth.create_New_User_Account"))
        else:
            new_user = User(
                username=form.get("user_name").strip(),  # type: ignore
                password=generate_password_hash(  # type: ignore
                    form.get("user_password").strip()  # type: ignore
                ),  # type: ignore
                email=form.get("user_email").strip(),  # type: ignore
            )

            db.session.add(new_user)
            db.session.commit()

            login_user(new_user)
            return redirect(url_for("task.view_dashboard"))


@auth_bp.route("/login_page", methods=["POST", "GET"])
def login_page():
    """Our login route needs the email and password of the user"""
    if request.method == "GET":
        return render_template("login.html")

    form = request.form
    user = db.session.execute(
        select(User).where(User.email == form.get("user_email"))
    ).scalar_one_or_none()
    if user is not None:
        if not check_password_hash(
            user.password, form.get("user_password").strip()  # type: ignore
        ):  # type: ignore
            flash("Incorrect password!")
            return redirect(url_for("auth.login_page"), code=302)
        else:
            login_user(user)
            session.permanent = True
            return redirect(url_for("task.view_dashboard"), code=302)
    else:
        flash(f"A user with the email: {form.get('user_email')} doesn't exist.")
        return redirect(url_for("auth.login_page"), code=302)


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    """Our logout route"""
    flash(f"{current_user.username} was logged out.")
    logout_user()
    return redirect(url_for("auth.login_page"), code=303)

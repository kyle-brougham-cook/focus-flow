import pytest
from focus_flow_app.__init__app import create_app, db
from focus_flow_app.models import User
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    # Create the Flask app with the testing configuration
    app = create_app("testing")

    # Push app context
    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    # Initialize the testing client on the app
    return app.test_client()


@pytest.fixture
def dbf(app):
    # Setup the database with the current app context
    db.create_all()
    # Yield the db controller to the test
    yield db
    # Teardown
    db.drop_all()


@pytest.fixture
def user(dbf):
    user = User(
        username="testinguser",
        email="test@example.com",
        password=generate_password_hash("password123"),
    )

    db.session.add(user)
    db.session.commit()

    return user


@pytest.fixture
def auth_headers(user):
    token = create_access_token(identity=str(user.id))
    return {"Authorization": f"Bearer {token}"}

import os
from dotenv import load_dotenv
from flask import Flask
from config import config_map
from flask_cors import CORS
from sqlalchemy import select
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate


db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()


def create_app(config_name: str | None = None):
    load_dotenv()

    cfg_key = config_name or os.getenv("FLASK_CONFIG", "development")
    cfg_class = config_map.get(cfg_key)
    if not cfg_class:
        raise RuntimeError(f"Unknown FLASK_CONFIG: {cfg_key}")

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(cfg_class)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login_page"  # type: ignore

    CORS(app, supports_credentials=True, origins=app.config["CORS_ORIGINS"])

    from .routes.__init__routes import register_routes

    register_routes(app)

    @login_manager.user_loader
    def load_user(user_id):
        from .models import User

        return db.session.execute(
            select(User).where(User.id == int(user_id))
        ).scalar_one_or_none()

    return app

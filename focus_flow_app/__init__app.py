import os
from dotenv import load_dotenv
from flask import Flask
from config import config_map
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name: str | None = None):
    load_dotenv()

    cfg_key = config_name or os.getenv("FLASK_CONFIG", "development")
    cfg_class = config_map.get(cfg_key)
    if not cfg_class:
        raise RuntimeError(f"Unknown FLASK_CONFIG: {cfg_key}")

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(cfg_class)
    jwt.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)

    CORS(app, supports_credentials=True, origins=[app.config["CORS_ORIGINS"]])

    from .routes.__init__routes import register_routes

    register_routes(app)

    return app

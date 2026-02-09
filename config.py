import os

base_dir = os.path.abspath(os.path.dirname(__file__))


class Config:
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_CSRF_IN_COOKIES = True
    JWT_CSRF_METHODS = ["POST", "PUT", "PATCH", "DELETE"]
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")


class DevelopmentConfig(Config):
    JWT_COOKIE_SECURE = True
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DEV_DATABASE_URL", "sqlite:///" + os.path.join(base_dir, "instance", "dev.db")
    )


class ProductionConfig(Config):
    JWT_COOKIE_SECURE = True
    DEBUG = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "")


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test_secret_key"
    JWT_SECRET_KEY = "test_jwt_secret_key"


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}

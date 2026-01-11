from .auth_routes import auth_bp
from .main_routes import main_bp
from .task_routes import task_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(main_bp, url_prefix="/api/main")
    app.register_blueprint(task_bp, url_prefix="/api/task")

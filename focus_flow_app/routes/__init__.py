from .auth_routes import auth_bp
from .misc_routes import misc_bp
from .task_routes import task_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(misc_bp)
    app.register_blueprint(task_bp)

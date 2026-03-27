from .auth_routes import auth_bp
from .main_routes import main_bp
from .task_routes import tasks_bp
from .health_routes import health_db

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(main_bp, url_prefix="/api/main")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(health_db, url_prefix="/api/health")

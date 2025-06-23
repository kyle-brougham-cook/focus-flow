from flask import Blueprint, render_template  # Web server and helper methods

misc_bp = Blueprint("main", __name__)


@misc_bp.route("/")
def load_landing_page():
    """Serve the main HTML file for the application."""
    # Return the main structure file.
    return render_template("home.html")

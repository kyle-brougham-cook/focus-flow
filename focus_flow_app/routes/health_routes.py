from flask import Blueprint, jsonify

health_db = Blueprint("health", __name__)


@health_db.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

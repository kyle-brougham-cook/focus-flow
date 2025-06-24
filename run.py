from focus_flow_app.__init__app import create_app
from dotenv import load_dotenv
import os

# Loading the .env.example file to populate our app
load_dotenv(".env")


cfg = os.getenv("FLASK_CONFIG", "development").lower()
app = create_app(cfg)

print("DB URI →", app.config["SQLALCHEMY_DATABASE_URI"])


if __name__ == "__main__":

    # Loading everything from the .env.example
    domain = os.getenv("DOMAIN", "localhost")
    port = int(os.getenv("PORT", 5000))
    ssl_cert = os.getenv("SSL_CERT")
    ssl_key = os.getenv("SSL_KEY")

    app.run(
        host=domain,
        port=port,
        ssl_context=(ssl_cert, ssl_key) if ssl_cert and ssl_key else None,
    )

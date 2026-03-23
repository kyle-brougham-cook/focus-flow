from focus_flow_app.__init__app import create_app
from dotenv import load_dotenv
import os

# Loading the .env.example file to populate our app
load_dotenv()


cfg = os.getenv("FLASK_CONFIG", "development").lower()
app = create_app(cfg)


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=(cfg == "development"),
    )

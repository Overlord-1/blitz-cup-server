from app import app  # If your file is named `app.py`

if __name__ == "__main__":
    app.run()

application = app  # This is what Gunicorn looks for

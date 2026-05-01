import importlib.util
import os

# Gunicorn can't import app.py directly because the app/ package directory
# takes priority. This file loads app.py explicitly by file path.
spec = importlib.util.spec_from_file_location(
    "main",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.py")
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

flask_app = module.flask_app

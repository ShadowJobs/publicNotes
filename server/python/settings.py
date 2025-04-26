import os

AUTH_REQUIRED = os.getenv("AUTH_REQUIRED") is not None

AUTH_SERVICE = os.getenv("AUTH_SERVICE") or "http://127.0.0.1:10087"

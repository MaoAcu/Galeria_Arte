import os
from flask import Flask
from flask_cors import CORS


def get_allowed_origins():
    origins_csv = os.getenv("CORS_ORIGINS", "").strip()

    if not origins_csv:
        return ["*"]

    return [origin.strip() for origin in origins_csv.split(",") if origin.strip()]


def init_cors(app: Flask):
    origins = get_allowed_origins()
    CORS(
        app,
        origins=origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )


def init_security_headers(app: Flask):
    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )
        return response

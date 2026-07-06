"""Gedeelde fixtures voor de browser-smoke tests.

Serveert de repo-root als statische site op een vrije poort, precies zoals
GitHub Pages de site aanbiedt, en breekt 'm daarna weer af.
"""

import functools
import http.server
import socketserver
import threading
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    """Zelfde als de standaard handler, maar zonder request-log-spam."""

    def log_message(self, *args):  # noqa: D401 - stil houden
        pass


@pytest.fixture(scope="session")
def server_url():
    """Start `http.server` op de repo-root en geef de base-URL terug."""
    handler = functools.partial(_QuietHandler, directory=str(REPO_ROOT))
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            yield f"http://127.0.0.1:{port}"
        finally:
            httpd.shutdown()

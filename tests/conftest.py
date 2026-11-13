"""Gedeelde fixtures voor de browser-smoke tests.

Start de echte brandbook-server (`server/server.js`) op een vrije poort, met
een lege database in een tijdelijke map en een bekend testwachtwoord, en
breekt 'm daarna weer af. Zo test de gate precies wat er in Azure draait:
statische pagina's, `/present/<id>` en de API.
"""

import hashlib
import os
import secrets
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
SERVER_DIR = REPO_ROOT / "server"
TEST_PASSWORD = "testwachtwoord"


def _password_hash(password):
    """Zelfde formaat als server/auth.js: `salt:hash`, scrypt met Node-defaults."""
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=32)
    return f"{salt}:{digest.hex()}"


def _free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@pytest.fixture(scope="session")
def server_url():
    """Start de Node-server en geef de base-URL terug."""
    if not (SERVER_DIR / "node_modules").exists():
        subprocess.run(["npm", "ci"], cwd=SERVER_DIR, check=True, shell=os.name == "nt")

    port = _free_port()
    data_dir = tempfile.mkdtemp(prefix="brandbook-test-")
    env = {
        **os.environ,
        "PORT": str(port),
        "DATA_DIR": data_dir,
        "SESSION_SECRET": secrets.token_hex(16),
        "APP_PASSWORD_HASH": _password_hash(TEST_PASSWORD),
        "NODE_NO_WARNINGS": "1",
    }
    process = subprocess.Popen(
        ["node", "server.js"], cwd=SERVER_DIR, env=env,
        stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
    )
    url = f"http://127.0.0.1:{port}"
    try:
        for _ in range(100):
            if process.poll() is not None:
                raise RuntimeError(f"Server stopte: {process.stderr.read().decode()}")
            try:
                urllib.request.urlopen(f"{url}/api/me", timeout=1)
                break
            except OSError:
                time.sleep(0.1)
        else:
            raise RuntimeError("Server kwam niet op")
        yield url
    finally:
        process.terminate()
        process.wait(timeout=10)
        shutil.rmtree(data_dir, ignore_errors=True)


@pytest.fixture
def logged_in(page, server_url):
    """Een pagina met een geldige sessie."""
    response = page.request.post(f"{server_url}/login", data={"password": TEST_PASSWORD})
    assert response.ok
    return page

import os
import subprocess
import time
import urllib.request
import webbrowser

#CAMINHOS DO PROJETO
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

BACKEND_PYTHON = os.path.join(
    BACKEND_DIR,
    ".venv",
    "Scripts",
    "python.exe"
)


#AGUARDA UM SERVIDOR FICAR DISPONÍVEL
def esperar_servidor(url, processo, timeout=60):
    inicio = time.time()

    while time.time() - inicio < timeout:

        # Verifica se o processo morreu antes de ficar disponível
        if processo.poll() is not None:
            return False

        try:
            with urllib.request.urlopen(url, timeout=2) as resposta:

                if resposta.status == 200:
                    return True

        except Exception:
            time.sleep(0.5)

    return False


#INICIA BACKEND
def iniciar_backend():

    return subprocess.Popen(
        [
            BACKEND_PYTHON,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000"
        ],
        cwd=BACKEND_DIR,
        creationflags=subprocess.CREATE_NO_WINDOW
    )


#INICIA FRONTEND
def iniciar_frontend():

    return subprocess.Popen(
        [
            "cmd",
            "/c",
            "npm",
            "start"
        ],
        cwd=FRONTEND_DIR,
        creationflags=subprocess.CREATE_NO_WINDOW
    )


#ENCERRA PROCESSO
def encerrar_processo(processo):

    if processo and processo.poll() is None:
        processo.terminate()


#MAIN
def main():

    backend = None
    frontend = None

    try:
        #Backend
        backend = iniciar_backend()

        if not esperar_servidor(
            "http://127.0.0.1:8000/health",
            backend,
            timeout=60
        ):
            encerrar_processo(backend)
            return

        #2 Frontend
        frontend = iniciar_frontend()

        if not esperar_servidor(
            "http://127.0.0.1:3000",
            frontend,
            timeout=60
        ):
            encerrar_processo(frontend)
            encerrar_processo(backend)
            return

        #3 Sistema pronto
        webbrowser.open("http://localhost:3000")

    except Exception:

        encerrar_processo(frontend)
        encerrar_processo(backend)


if __name__ == "__main__":
    main()
import os
import re

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "groups")

# garante que base exista
os.makedirs(BASE_DIR, exist_ok=True)

# nomes === letras, números, underscore e hífen
VALID_NAME = re.compile(r"^[A-Za-z0-9_\-]+$")

def list_groups():
    """Retorna lista de nomes de pastas (grupos)."""
    try:
        return sorted([name for name in os.listdir(BASE_DIR) if os.path.isdir(os.path.join(BASE_DIR, name))])
    except FileNotFoundError:
        return []

def sanitize_group_name(name: str) -> str:
    """Remover espaços, transformar em algo seguro."""
    if not isinstance(name, str):
        raise ValueError("Nome inválido")
    #substituir espaços por underscore e maiúsculas por minúsculas
    candidate = name.strip().replace(" ", "_")
    if not VALID_NAME.match(candidate):
        #this tenta remover chars inválidos
        candidate = re.sub(r"[^A-Za-z0-9_\-]", "", candidate)
    if not candidate:
        raise ValueError("Nome após sanitização inválido")
    return candidate

def create_group(name: str):
    """Cria pasta do grupo, retorna caminho criado."""
    safe = sanitize_group_name(name)
    path = os.path.join(BASE_DIR, safe)
    if os.path.exists(path):
        return False, f"Grupo '{safe}' já existe."
    os.makedirs(os.path.join(path, "pieces"), exist_ok=True)
    #this create um arquivo info.json básico
    info_path = os.path.join(path, "info.json")
    try:
        with open(info_path, "w", encoding="utf-8") as f:
            import json
            json.dump({"group": safe}, f, ensure_ascii=False, indent=2)
    except Exception:
        pass
    return True, safe

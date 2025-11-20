import os
import re
import json

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "groups")

# apenas números, letras, underline e hífen
VALID_NAME = re.compile(r"^[A-Za-z0-9_\-]+$")

def sanitize_piece_name(name: str) -> str:
    """Limpa nomes como PartNumber."""
    name = str(name).strip().replace(" ", "_")
    name = re.sub(r"[^A-Za-z0-9_\-]", "", name)
    if not name:
        raise ValueError("Nome da peça inválido")
    return name

def list_pieces(group: str):
    """Lista pastas de peças dentro do grupo selecionado."""
    group_path = os.path.join(BASE_DIR, group, "pieces")
    if not os.path.isdir(group_path):
        return []

    return sorted([
        p for p in os.listdir(group_path)
        if os.path.isdir(os.path.join(group_path, p))
    ])

def create_piece(group: str, part_number: str, part_name: str, model: str):
    """Cria uma peça dentro do grupo escolhido."""
    safe_group = sanitize_piece_name(group)
    safe_number = sanitize_piece_name(part_number)

    group_path = os.path.join(BASE_DIR, safe_group)
    if not os.path.exists(group_path):
        raise ValueError(f"Grupo '{safe_group}' não existe")

    piece_path = os.path.join(group_path, "pieces", safe_number)

    if os.path.exists(piece_path):
        return False, f"A peça '{safe_number}' já existe no grupo '{safe_group}'"

    # cria pastas padrões
    os.makedirs(piece_path, exist_ok=True)
    os.makedirs(os.path.join(piece_path, "historico"), exist_ok=True)
    os.makedirs(os.path.join(piece_path, "graficos"), exist_ok=True)
    os.makedirs(os.path.join(piece_path, "imagens"), exist_ok=True)
    os.makedirs(os.path.join(piece_path, "txt"), exist_ok=True)

    info_file = os.path.join(piece_path, "info.json")

    with open(info_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "part_number": safe_number,
                "part_name": part_name,
                "model": model,
                "group": safe_group
            },
            f,
            ensure_ascii=False,
            indent=2
        )

    return True, safe_number

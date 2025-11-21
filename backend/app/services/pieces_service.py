import os
import re
import json
import shutil

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
    """Lista peças com suas informações."""
    group_path = os.path.join(BASE_DIR, group, "pieces")
    if not os.path.isdir(group_path):
        return []

    pieces = []

    for folder in os.listdir(group_path):
        piece_path = os.path.join(group_path, folder)
        if os.path.isdir(piece_path):
            info_file = os.path.join(piece_path, "info.json")
            if os.path.exists(info_file):
                with open(info_file, "r", encoding="utf-8") as f:
                    pieces.append(json.load(f))

    return pieces


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


def delete_piece(group: str, part_number: str):
    """Apaga uma peça (a pasta inteira dela)."""

    safe_group = sanitize_piece_name(group)
    safe_number = sanitize_piece_name(part_number)

    piece_path = os.path.join(BASE_DIR, safe_group, "pieces", safe_number)

    if not os.path.exists(piece_path):
        return False, f"Peça '{safe_number}' não encontrada no grupo '{safe_group}'"

    try:
        shutil.rmtree(piece_path)
    except Exception as e:
        return False, f"Erro ao apagar peça: {e}"

    return True, safe_number


def ensure_piece_dirs(group: str, piece: str):
    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    txt_dir = os.path.join(
        BASE_DIR, group_safe, "pieces", piece_safe, "txt"
    )
    os.makedirs(txt_dir, exist_ok=True)

    return txt_dir


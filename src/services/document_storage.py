import os
import uuid
from datetime import datetime
from typing import Tuple

STORAGE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../storage"))


def get_document_storage_path(firm_id: str, client_id: str, filename: str) -> Tuple[str, str]:
    now = datetime.utcnow()
    period_folder = now.strftime("%Y-%m")
    rel_dir = os.path.join(firm_id or "firm_default", client_id or "c1", period_folder)
    target_dir = os.path.join(STORAGE_ROOT, rel_dir)
    os.makedirs(target_dir, exist_ok=True)
    
    ext = os.path.splitext(filename)[1] or ".pdf"
    unique_filename = f"{uuid.uuid4()}{ext}"
    full_path = os.path.join(target_dir, unique_filename)
    return full_path, os.path.join(rel_dir, unique_filename)


def save_file_to_storage(firm_id: str, client_id: str, filename: str, content: bytes) -> Tuple[str, str]:
    full_path, rel_path = get_document_storage_path(firm_id, client_id, filename)
    with open(full_path, "wb") as f:
        f.write(content)
    return full_path, rel_path

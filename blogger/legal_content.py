"""Read the same legal documents rendered by the application."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP_CONTENT = ROOT.parent / 'src/features/auth/content/legal-documents.json'
BUNDLED_CONTENT = ROOT / 'source/legal-documents.json'


def load_legal_content():
    path = APP_CONTENT if APP_CONTENT.is_file() else BUNDLED_CONTENT
    return json.loads(path.read_text(encoding='utf-8'))


def load_pages():
    pages = json.loads((ROOT / 'source/pages.json').read_text(encoding='utf-8'))
    documents = list(load_legal_content()['documents'].values())
    return pages[:1] + documents + pages[1:]

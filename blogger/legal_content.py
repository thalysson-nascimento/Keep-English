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
    pages = pages[:1] + documents + pages[1:]
    routes = json.loads((ROOT / 'source/routes.json').read_text(encoding='utf-8'))
    for page in pages:
        route = routes['pages'].get(page['key'], {})
        page['path'] = route.get('path', '/p/' + page['slug'] + '.html')
        page['routing_titles'] = list(dict.fromkeys([page['title'], route.get('published_title', page['title'])]))
    return pages


def route_condition(page):
    return ' or '.join('data:blog.pageName == "' + title + '"' for title in page['routing_titles'])


def theme_version():
    return (ROOT / 'source/theme-version.txt').read_text(encoding='utf-8').strip()

"""Check generated routes, preview links, document parity and legal safeguards."""
from html.parser import HTMLParser
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from urllib.parse import unquote, urlsplit
from legal_content import load_legal_content, load_pages, route_condition, theme_version

ROOT = Path(__file__).resolve().parent
NS = {'b': 'http://www.google.com/2005/gml/b', 'h': 'http://www.w3.org/1999/xhtml'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.headings, self.sources = [], [], [], []
        self.in_h1 = False
        self.heading = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'img':
            self.sources.append(attrs.get('src', ''))
        if tag == 'h1':
            self.in_h1 = True
            self.heading = ''

    def handle_data(self, data):
        if self.in_h1:
            self.heading += data

    def handle_endtag(self, tag):
        if tag == 'h1':
            self.headings.append(self.heading)
            self.in_h1 = False


def check():
    errors = []
    pages = load_pages()
    if load_legal_content() != json.loads((ROOT / 'source/legal-documents.json').read_text(encoding='utf-8')):
        errors.append('Bundled legal documents differ from the application source; rebuild the Blogger theme.')
    theme = ET.parse(ROOT / f'keep-english-blogger-v{theme_version()}.xml').getroot()
    parsed = {}
    for path in (ROOT / 'preview').rglob('*.html'):
        parser = Page()
        parser.feed(path.read_text(encoding='utf-8'))
        parsed[path.resolve()] = parser
        if len(parser.headings) != 1:
            errors.append(f'{path.name}: expected one h1')
        if len(parser.ids) != len(set(parser.ids)):
            errors.append(f'{path.name}: duplicate ids')
        for source in parser.sources:
            if not source.startswith('data:image/png;base64,'):
                errors.append(f'{path.name}: unexpected image source')
    for path, page in parsed.items():
        for href in page.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target not in parsed:
                errors.append(f'{path.name}: broken local link {href}')
                continue
            if url.fragment and unquote(url.fragment) not in parsed[target].ids:
                errors.append(f'{path.name}: missing anchor {href}')
    for page in pages:
        route = next(node for node in theme.findall('.//b:if', NS) if node.attrib.get('cond') == route_condition(page))
        main = route.find('h:main', NS)
        text = ''.join(main.itertext())
        path = ROOT / 'preview/p' / (page['slug'] + '.html')
        preview = path.read_text(encoding='utf-8')
        if page['intro'] not in text:
            errors.append(f'{page["key"]}: missing introduction')
        if page['kind'] == 'legal':
            legal = load_legal_content()
            if f'Versão {legal["version"]} · {legal["date"]}' not in text:
                errors.append(f'{page["key"]}: legal metadata differs from the application source')
        for title, paragraph in page['sections']:
            if paragraph not in text or paragraph not in preview:
                errors.append(f'{page["key"]}: missing shared paragraph: {title}')
        if page['kind'] in ('legal', 'deletion') and 'Versão para revisão.' in text:
            errors.append(f'{page["key"]}: obsolete review disclosure')
    deletion = parsed[(ROOT / 'preview/p/excluir-conta.html').resolve()]
    if not any(link.startswith('mailto:thalysson.developer@gmail.com?subject=') for link in deletion.links):
        errors.append('Missing account deletion email action')
    report = {'status': 'passed' if not errors else 'failed', 'preview_pages': len(parsed), 'checks': ['One main heading per preview', 'Unique ids per preview', 'Local page and fragment links resolve', 'Shared document paragraphs present in XML and preview', 'Canonical app legal source matches the bundled copy', 'Legal introductions, version and date match the app source', 'No obsolete publication warnings', 'Deletion mail action present'], 'errors': errors, 'browser_visibility': 'not_checked', 'blogger_import': 'not_checked', 'published_pages': 'not_checked'}
    (ROOT / 'reports/validation-content.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    check()

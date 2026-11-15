"""Validate a Blogger XML and optionally inspect a public institutional page."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

NS = {'b': 'http://www.google.com/2005/gml/b', 'html': 'http://www.w3.org/1999/xhtml'}

class PublicPage(HTMLParser):
    def __init__(self, back_class='blogger-back'):
        super().__init__()
        self.back_class = back_class
        self.main_depth = 0
        self.h1_depth = 0
        self.skip = 0
        self.headings, self.back_links, self.text = [], [], []
        self.heading = ''
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.main_depth += 1
        if tag in ('script', 'style'): self.skip += 1
        if self.main_depth and tag == 'h1': self.h1_depth += 1; self.heading = ''
        if self.main_depth and tag == 'a' and self.back_class in attrs.get('class', '').split(): self.back_links.append(attrs.get('href', ''))
    def handle_endtag(self, tag):
        if tag == 'h1' and self.h1_depth: self.headings.append(self.heading.strip()); self.h1_depth -= 1
        if tag in ('script', 'style') and self.skip: self.skip -= 1
        if tag == 'main' and self.main_depth: self.main_depth -= 1
    def handle_data(self, value):
        if self.main_depth and not self.skip:
            self.text.append(value)
            if self.h1_depth: self.heading += value

def validate(theme_path, profile):
    text = theme_path.read_text(encoding='utf-8')
    root = ET.fromstring(text)
    errors, warnings = [], []
    if root.find('.//b:skin', NS) is None: errors.append('Missing b:skin.')
    widgets = root.findall('.//b:widget', NS)
    if len([w for w in widgets if w.attrib.get('type') == 'Blog']) != 1: errors.append('Expected exactly one Blog widget.')
    for section in root.findall('.//b:section', NS):
        if any(child.tag != '{' + NS['b'] + '}widget' for child in section): errors.append('A section contains non-widget children.')
    ids = [node.attrib['id'] for node in root.iter() if 'id' in node.attrib and not node.tag.startswith('{' + NS['b'] + '}')]
    if len(ids) != len(set(ids)): errors.append('Duplicate HTML ids.')
    if re.search(r'file:///|[A-Za-z]:[/\\]Users[/\\]|localhost', text): errors.append('Local machine path or localhost in deliverable.')
    if re.search(r'__[A-Z][A-Z0-9_]*__', text): errors.append('Unresolved generation placeholder.')
    if 'data:blog.url contains' in text: errors.append('Known fragile URL selection; use confirmed exact titles for institutional routes.')
    parents = {child: parent for parent in root.iter() for child in parent}
    widget_nodes = {id(node) for widget in widgets for node in widget.iter()}
    route_results = []
    back_class = profile.get('validation_selectors', {}).get('back_link_class', 'blogger-back')
    for page in profile.get('pages', []):
        if page.get('content_mode') != 'integrated': continue
        title = page['title']
        matches = [node for node in root.findall('.//b:if', NS) if node.attrib.get('cond') == 'data:blog.pageName == "' + title + '"']
        if len(matches) != 1: errors.append('Missing or ambiguous exact-title route: ' + title); continue
        node = matches[0]
        if parents[node].attrib.get('cond') != 'data:blog.pageType == "static_page"': errors.append('Institutional route needs a separate static_page guard: ' + title)
        if id(node) in widget_nodes: errors.append('Integrated institutional route depends on a widget: ' + title)
        languages = {n.attrib['data-content-language'] for n in node.iter() if 'data-content-language' in n.attrib}
        if not set(page.get('languages', [])).issubset(languages): errors.append('Incomplete language blocks: ' + title)
        if not any(back_class in n.attrib.get('class', '').split() for n in node.iter()): errors.append('Missing back link: ' + title)
        route_results.append({'key': page['key'], 'title': title, 'languages': sorted(languages)})
    if not profile.get('pages'): warnings.append('No page profile: only generic XML checks were possible.')
    return {'xml': 'passed' if not errors else 'failed', 'errors': errors, 'warnings': warnings, 'routes': route_results, 'blogger_import': 'not_checked', 'browser_visibility': 'not_checked', 'public_page': 'not_checked'}

def public_check(url, page, back_class='blogger-back'):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password: raise ValueError('Use a public HTTP(S) URL without credentials.')
    if parsed.hostname.lower() in ('localhost', '127.0.0.1', '::1'): raise ValueError('Use the published public page, not localhost.')
    expected_path = '/p/' + page['slug'] + '.html'
    if parsed.path != expected_path: raise ValueError('URL path differs from the configured page: ' + expected_path)
    request = urllib.request.Request(url, headers={'User-Agent': 'BloggerThemeReadOnlyCheck/1.0'})
    with urllib.request.urlopen(request, timeout=25) as response:
        raw = response.read(3_000_001)
        if len(raw) > 3_000_000: raise ValueError('Page is too large for this check.')
        html = raw.decode(response.headers.get_content_charset() or 'utf-8', errors='replace')
        final_url, code = response.url, response.status
    parsed_final = urllib.parse.urlparse(final_url)
    if parsed_final.path != expected_path: raise ValueError('The request redirected away from the expected page.')
    document = PublicPage(back_class=back_class); document.feed(html)
    expected_heading = page.get('heading', page['title'])
    errors = []
    if code != 200: errors.append('Non-200 response.')
    if expected_heading not in document.headings: errors.append('Expected document heading is missing from main content.')
    if len(' '.join(document.text).strip()) < page.get('minimum_text_characters', 100): errors.append('Document body is missing or unexpectedly short.')
    if not any(urllib.parse.urlparse(urllib.parse.urljoin(final_url, href)).path == '/' for href in document.back_links): errors.append('Back link to homepage is missing from main content.')
    return {'status': 'passed' if not errors else 'failed', 'http_status': code, 'url': final_url, 'errors': errors, 'headings': document.headings, 'note': 'HTML presence was checked; browser visibility and Blogger editor acceptance were not checked.'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--theme', required=True, type=Path)
    parser.add_argument('--profile', required=True, type=Path)
    parser.add_argument('--public-url')
    parser.add_argument('--page')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    try:
        profile = json.loads(args.profile.read_text(encoding='utf-8'))
        inv_path = args.profile.parent / 'inventory.json'
        if inv_path.exists() and profile.get('project_key') != json.loads(inv_path.read_text(encoding='utf-8')).get('project_key'): raise ValueError('Inherited project profile: rediscover the destination project first.')
        result = validate(args.theme, profile)
        if args.public_url:
            pages = [p for p in profile.get('pages', []) if p['key'] == args.page]
            if len(pages) != 1: raise ValueError('--page must identify one configured page.')
            result['public_page'] = public_check(args.public_url, pages[0], profile.get('validation_selectors', {}).get('back_link_class', 'blogger-back'))
        failed = bool(result['errors']) or isinstance(result['public_page'], dict) and result['public_page']['status'] != 'passed'
    except (ValueError, OSError, ET.ParseError, urllib.error.URLError) as error:
        result, failed = {'status': 'failed', 'error': str(error)}, True
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(1 if failed else 0)

if __name__ == '__main__': main()

"""Validate rendered SEO metadata, safe structured data and real navigation targets."""
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from legal_content import load_pages
from seo import CONFIG, SITE_URL, metadata, render_head, structured_data


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.metas, self.canonicals, self.json_blocks = {}, [], []
        self.titles, self.title, self.in_title, self.in_json, self.payload = [], '', False, False, ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            key = attrs.get('name', attrs.get('property', ''))
            self.metas.setdefault(key, []).append(attrs.get('content', ''))
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonicals.append(attrs['href'])
        if tag == 'title': self.in_title, self.title = True, ''
        if tag == 'script' and attrs.get('type') == 'application/ld+json': self.in_json, self.payload = True, ''

    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_json: self.payload += data

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False; self.titles.append(self.title)
        if tag == 'script' and self.in_json: self.in_json = False; self.json_blocks.append(json.loads(self.payload))


class SeoTests(unittest.TestCase):
    def test_each_preview_has_one_complete_matching_metadata_set(self):
        paths = [(ROOT / 'preview/index.html', None)] + [(ROOT / 'preview/p' / (page['slug'] + '.html'), page) for page in load_pages()]
        for path, page in paths:
            with self.subTest(path=path.name):
                parser = Head(); parser.feed(path.read_text(encoding='utf-8'))
                expected = metadata(page)
                self.assertEqual(parser.titles, [expected['title']])
                self.assertEqual(parser.canonicals, [expected['url']])
                self.assertEqual(parser.metas['description'], [expected['description']])
                for field in ['title', 'description', 'url']:
                    self.assertEqual(parser.metas['og:' + field], [expected[field]])
                self.assertEqual(parser.metas['twitter:title'], [expected['title']])
                self.assertEqual(parser.metas['twitter:description'], [expected['description']])
                self.assertEqual(parser.json_blocks, [structured_data(expected)])
                self.assertTrue(50 < len(expected['description']) < 180)
                self.assertTrue(expected['url'].startswith(SITE_URL))
                if CONFIG.get('social_image_url'):
                    self.assertEqual(parser.metas['og:image'], [CONFIG['social_image_url']])
                else:
                    self.assertNotIn('og:image', parser.metas)

    def test_schema_matches_visible_kind_without_invented_ratings(self):
        for page in load_pages():
            graph = structured_data(metadata(page))['@graph']
            types = [node['@type'] for node in graph]
            self.assertEqual('Article' in types, page['kind'] == 'article')
            self.assertIn('BreadcrumbList', types)
            self.assertNotIn('aggregateRating', json.dumps(graph))
            self.assertNotIn('offers', json.dumps(graph))

    def test_json_cannot_break_out_of_script_element(self):
        meta = metadata()
        meta['description'] = '</script><script>alert("test")</script> & <test>'
        fragment = render_head(meta).replace('<![CDATA[', '').replace(']]>', '')
        parser = Head(); parser.feed(fragment)
        self.assertEqual(parser.json_blocks[0]['@graph'][2]['description'], meta['description'])
        self.assertNotIn('</script><script>alert', fragment)

    def test_published_links_and_guards_remain_intact(self):
        ns = {'b': 'http://www.google.com/2005/gml/b', 'h': 'http://www.w3.org/1999/xhtml'}
        root = ET.parse(ROOT / 'template.xml').getroot()
        links = [node.get('href') for node in root.findall('.//h:a', ns)]
        for source, target in CONFIG['unpublished_link_targets'].items():
            self.assertNotIn(source, links)
            self.assertIn(target, links)
        conditions = [node.get('cond', '') for node in root.findall('.//b:if', ns)]
        self.assertTrue(any('error_page' in cond and 'searchQuery' in cond for cond in conditions))
        for page in load_pages():
            if page['key'] in ('privacidade', 'termos', 'exclusao'):
                self.assertIn(page['path'], links)


if __name__ == '__main__':
    unittest.main()

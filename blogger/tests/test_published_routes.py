"""Regression for existing Blogger posts used as institutional documents."""
from pathlib import Path
import sys
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from legal_content import load_pages, route_condition

NS = {'b': 'http://www.google.com/2005/gml/b', 'h': 'http://www.w3.org/1999/xhtml'}


class PublishedRouteTests(unittest.TestCase):
    def test_existing_published_posts_render_integrated_documents(self):
        root = ET.parse(ROOT / 'template.xml').getroot()
        parents = {child: parent for parent in root.iter() for child in parent}
        cases = {
            'privacidade': ('Politica de privacidade', '/2026/11/politica-de-privacidade.html'),
            'termos': ('Termos de uso', '/2026/11/termos-de-uso.html'),
            'exclusao': ('Exclusão da conta', '/2026/11/exclusao-da-conta.html'),
        }
        for page in load_pages():
            if page['key'] not in cases:
                continue
            title, path = cases[page['key']]
            with self.subTest(page=title):
                self.assertIn(title, page['routing_titles'])
                self.assertEqual(path, page['path'])
                route = next(node for node in root.findall('.//b:if', NS) if node.get('cond') == route_condition(page))
                self.assertIn('data:blog.pageType == "item"', parents[route].get('cond'))
                self.assertIsNotNone(route.find('h:main/h:h1', NS))
                self.assertTrue(any(link.get('href') == path for link in root.findall('.//h:a', NS)))
                self.assertFalse(any(link.get('href') == '/p/' + page['slug'] + '.html' for link in root.findall('.//h:a', NS)))
                native = next(node for node in root.findall('.//b:widget//b:if', NS) if 'data:blog.pageType != "static_page"' in node.get('cond', ''))
                self.assertIn('!(', native.get('cond'))
                self.assertIn(title, native.get('cond'))


if __name__ == '__main__':
    unittest.main()

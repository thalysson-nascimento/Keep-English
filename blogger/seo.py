"""Server-rendered SEO metadata for Blogger and the local preview."""
import html
import json
from pathlib import Path
from urllib.parse import urljoin, urlparse
from legal_content import route_condition

ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT / 'source/seo.json').read_text(encoding='utf-8'))
SITE_URL = json.loads((ROOT / 'source/routes.json').read_text(encoding='utf-8'))['blog_url']
PAGE_GUARD = 'data:blog.pageType == "static_page" or data:blog.pageType == "item"'


def metadata(page=None):
    return {
        'title': f'{page["title"]} — {CONFIG["site_name"]}' if page else CONFIG['home_title'],
        'description': CONFIG['descriptions'][page['key']] if page else CONFIG['home_description'],
        'url': urljoin(SITE_URL, page['path']) if page else SITE_URL,
        'kind': page['kind'] if page else 'home',
        'name': page['title'] if page else CONFIG['site_name'],
    }


def structured_data(meta):
    organization = {
        '@type': 'Organization', '@id': SITE_URL + '#organization',
        'name': CONFIG['publisher'], 'url': SITE_URL,
        'email': CONFIG['contact_email'],
    }
    website = {
        '@type': 'WebSite', '@id': SITE_URL + '#website',
        'url': SITE_URL, 'name': CONFIG['site_name'], 'inLanguage': 'pt-BR',
        'publisher': {'@id': organization['@id']},
    }
    page = {
        '@type': {'about': 'AboutPage', 'contact': 'ContactPage'}.get(meta['kind'], 'WebPage'),
        '@id': meta['url'] + '#webpage', 'url': meta['url'],
        'name': meta['title'], 'description': meta['description'], 'inLanguage': 'pt-BR',
        'isPartOf': {'@id': website['@id']},
    }
    graph = [organization, website, page]
    if meta['kind'] != 'home':
        breadcrumb = {
            '@type': 'BreadcrumbList', '@id': meta['url'] + '#breadcrumb',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': SITE_URL},
                {'@type': 'ListItem', 'position': 2, 'name': meta['name'], 'item': meta['url']},
            ],
        }
        page['breadcrumb'] = {'@id': breadcrumb['@id']}
        graph.append(breadcrumb)
    if meta['kind'] == 'article':
        article = {
            '@type': 'Article', '@id': meta['url'] + '#article',
            'headline': meta['name'], 'description': meta['description'],
            'inLanguage': 'pt-BR', 'mainEntityOfPage': {'@id': page['@id']},
            'author': {'@id': organization['@id']}, 'publisher': {'@id': organization['@id']},
        }
        page['mainEntity'] = {'@id': article['@id']}
        graph.append(article)
    image = CONFIG.get('social_image_url')
    if image:
        parsed = urlparse(image)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError('Use a public HTTPS URL for the social image.')
        organization['logo'] = image
        page['primaryImageOfPage'] = {'@type': 'ImageObject', 'url': image}
    return {'@context': 'https://schema.org', '@graph': graph}


def render_head(meta):
    esc = lambda value: html.escape(value, quote=True)
    tags = [
        '<title>' + esc(meta['title']) + '</title>',
        '<meta name="description" content="' + esc(meta['description']) + '"/>',
        '<link rel="canonical" href="' + esc(meta['url']) + '"/>',
        '<link rel="icon" type="image/x-icon" href="' + SITE_URL + 'favicon.ico"/>',
        '<link rel="alternate" type="application/atom+xml" title="Keep English — publicações" href="' + SITE_URL + 'feeds/posts/default"/>',
        '<meta name="robots" content="index,follow,max-image-preview:large"/>',
        '<meta property="og:locale" content="pt_BR"/>',
        '<meta property="og:site_name" content="' + esc(CONFIG['site_name']) + '"/>',
        '<meta property="og:type" content="' + ('article' if meta['kind'] == 'article' else 'website') + '"/>',
        '<meta name="twitter:card" content="summary"/>',
    ]
    for prop, value in [('title', meta['title']), ('description', meta['description']), ('url', meta['url'])]:
        tags.append('<meta property="og:' + prop + '" content="' + esc(value) + '"/>')
    for prop, value in [('title', meta['title']), ('description', meta['description'])]:
        tags.append('<meta name="twitter:' + prop + '" content="' + esc(value) + '"/>')
    if CONFIG.get('social_image_url'):
        for attr, name in [('property', 'og:image'), ('name', 'twitter:image')]:
            tags.append('<meta ' + attr + '="' + name + '" content="' + esc(CONFIG['social_image_url']) + '"/>')
        tags.append('<meta property="og:image:alt" content="Logo Keep English"/>')
    payload = json.dumps(structured_data(meta), ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    tags.append('<script type="application/ld+json">' + payload + '</script>')
    return ''.join(tags)


def verification_tag():
    token = CONFIG.get('search_console_verification')
    if not token:
        return ''
    if not isinstance(token, str):
        raise ValueError('Search Console verification must be a text token.')
    return '<meta name="google-site-verification" content="' + html.escape(token, quote=True) + '"/>'


def blogger_head(pages):
    head = '<b:if cond="data:blog.url == data:blog.homepageUrl">' + render_head(metadata())
    for page in pages:
        condition = '(' + PAGE_GUARD + ') and (' + route_condition(page) + ')'
        head += '<b:elseif cond="' + html.escape(condition, quote=True) + '"/>' + render_head(metadata(page))
    # Native Blogger metadata remains responsible for posts and routes not managed by the theme.
    head += '<b:else/><b:include data="blog" name="all-head-content"/><title><data:blog.pageTitle/></title>'
    head += '<b:if cond="!data:blog.metaDescription"><meta name="description" content="' + html.escape(CONFIG['home_description'], quote=True) + '"/></b:if>'
    head += '<b:if cond=\'data:blog.pageType == "error_page" or data:blog.pageType == "archive" or data:blog.searchQuery or data:blog.searchLabel\'><meta name="robots" content="noindex,follow"/></b:if>'
    head += '</b:if>'
    return verification_tag() + head


def preview_head(page=None):
    return verification_tag() + render_head(metadata(page))

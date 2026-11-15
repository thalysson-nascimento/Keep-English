"""Build the Blogger theme and review preview from shared local sources."""
import base64
import hashlib
import html
import importlib.util
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from legal_content import load_legal_content, load_pages, route_condition, theme_version

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
LEGAL_CONTENT = load_legal_content()
VERSION = theme_version()
EMAIL = 'thalysson.developer@gmail.com'
NS = {'b': 'http://www.google.com/2005/gml/b', 'h': 'http://www.w3.org/1999/xhtml'}


def escape(value):
    return html.escape(value, quote=True)


def document(page):
    notice = ''
    heading = page.get('heading', page['title'])
    sections = ''.join(f'<section id="{page["key"]}-{index}"><h2>{escape(title)}</h2><p>{escape(text)}</p></section>' for index, (title, text) in enumerate(page['sections'], 1))
    toc = '<nav class="toc" aria-label="Nesta página"><strong>Nesta página</strong><ol>' + ''.join(f'<li><a href="#{page["key"]}-{index}">{escape(title)}</a></li>' for index, (title, _) in enumerate(page['sections'], 1)) + '</ol></nav>'
    action = ''
    if page['kind'] == 'deletion':
        action = f'<a class="button" href="mailto:{EMAIL}?subject=Exclus%C3%A3o%20de%20conta%20%E2%80%94%20Keep%20English">Solicitar exclusão por e-mail <span aria-hidden="true">↗</span></a><p>Ou envie manualmente para <a href="mailto:{EMAIL}">{EMAIL}</a>. O botão abre seu aplicativo de e-mail; você precisa enviar a mensagem para iniciar o pedido.</p>'
    if page['kind'] == 'contact':
        action = f'<a class="button" href="mailto:{EMAIL}?subject=Suporte%20%E2%80%94%20Keep%20English">Enviar e-mail ao suporte <span aria-hidden="true">↗</span></a>'
    related = '<p>Veja também: <a href="/p/privacidade.html">Privacidade</a> · <a href="/p/termos-de-uso.html">Termos de uso</a> · <a href="/p/excluir-conta.html">Excluir conta</a>.</p>'
    google = '<p><a href="' + escape(LEGAL_CONTENT['googlePrivacy']['href']) + '">' + escape(LEGAL_CONTENT['googlePrivacy']['label']) + '</a>.</p>' if page['key'] == 'privacidade' else ''
    return f'<main id="conteudo" class="document" data-content-language="pt-BR"><a class="blogger-back" href="/">← Voltar ao início</a><p class="eyebrow">Keep English / {"Aprender" if page["kind"] == "article" else "Informações"}</p><h1>{escape(heading)}</h1><p class="meta">Versão {LEGAL_CONTENT["version"]} · {LEGAL_CONTENT["date"]}</p>{notice}<p>{escape(page["intro"])}</p>{action}{toc}{sections}{google}{related}</main>'


def build():
    pages = load_pages()
    # Generated copy makes the installation package self-contained; edit the app source.
    (ROOT / 'source/legal-documents.json').write_text(json.dumps(LEGAL_CONTENT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    css = (ROOT / 'source/styles.css').read_text(encoding='utf-8')
    logo = 'data:image/png;base64,' + base64.b64encode((ROOT / 'assets/keep-english.png').read_bytes()).decode()
    image = f'<img src="{logo}" alt="" width="52" height="52"/>'
    header = f'<a class="skip" href="#conteudo">Pular para o conteúdo</a><header class="header"><div class="wrap header-inner"><a class="brand" href="/" aria-label="Keep English — início">{image}<span>keep english</span></a><nav class="nav" aria-label="Navegação principal"><a href="/#como-funciona">Como funciona</a><a href="/#artigos">Artigos</a><a href="/p/contato.html">Ajuda ↗</a></nav></div></header>'
    footer = f'<footer class="footer"><div class="wrap footer-inner"><div><a class="brand" href="/">keep english</a><p>Uma palavra de cada vez. Um hábito para continuar.</p><p>Desenvolvedor: Datingmatch Studio</p><a class="footer-email" href="mailto:{EMAIL}">{EMAIL}</a></div><nav class="footer-links" aria-label="Informações e suporte"><a href="/p/sobre.html">Sobre</a><a href="/p/privacidade.html">Privacidade</a><a href="/p/termos-de-uso.html">Termos de uso</a><a href="/p/excluir-conta.html">Excluir conta</a><a href="/p/contato.html">Contato</a></nav></div></footer>'
    articles = ''.join(f'<article class="card article-card"><div><span class="tag">Guia de estudo</span></div><h3>{escape(p["title"])}</h3><p>{escape(p["intro"])}</p><a class="text-link" href="/p/{p["slug"]}.html">Ler artigo <span aria-hidden="true">↗</span></a></article>' for p in pages if p['kind'] == 'article')
    home = f'''<main id="conteudo">
<section class="wrap hero"><div><span class="eyebrow">Pequenas descobertas. Novos hábitos.</span><h1>Seu inglês cresce,<br/><em>palavra por palavra.</em></h1><p>Anote palavras, consulte traduções e exemplos e pratique com testes. Acompanhe suas metas e transforme o estudo em um hábito diário.</p><div class="actions"><a class="button" href="#como-funciona">Conheça o Keep English <span aria-hidden="true">↓</span></a><a class="text-link" href="/p/sobre.html">Nossa ideia ↗</a></div></div><div class="hero-art"><div class="word-chip chip-one">habit <small>hábito · substantivo</small></div><img class="hero-logo" src="{logo}" width="250" height="250" alt="Logo Keep English: balão com check, marcador e chama"/><p class="art-caption">Anote. Pratique. Continue.</p><div class="word-chip chip-two">Uma palavra de cada vez. <span aria-hidden="true">✓</span></div></div></section>
<div class="strip"><div class="wrap strip-inner"><span><span class="dot">✓</span> Seu vocabulário pessoal</span><span><span class="dot">✓</span> Prática com suas palavras</span><span><span class="dot">✓</span> Um incentivo para continuar</span></div></div>
<section class="wrap section" id="como-funciona"><div class="section-heading"><div><span class="eyebrow">Do encontro à lembrança</span><h2>Aprender começa com uma palavra.</h2><p>Guarde o que chamou sua atenção. Volte para praticar.</p></div></div><div class="grid"><article class="card"><span class="step">01</span><h3>Anote uma descoberta</h3><p>Encontrou uma palavra nova? Registre em português ou inglês no seu caderno pessoal.</p></article><article class="card"><span class="step">02</span><h3>Entenda o contexto</h3><p>Consulte a tradução e um exemplo em inglês para conectar a palavra a uma situação.</p></article><article class="card"><span class="step">03</span><h3>Volte para praticar</h3><p>Revise com testes e acompanhe a evolução do vocabulário que você está construindo.</p></article></div></section>
<section class="soft-section"><div class="wrap section"><div class="section-heading"><div><span class="eyebrow">Sua rotina, com mais incentivo</span><h2>Um caderno que acompanha você.</h2><p>Ferramentas para organizar as descobertas e manter a prática por perto.</p></div></div><div class="feature-grid"><article class="feature"><h3>Seu próprio vocabulário</h3><p>Reúna palavras, traduções e exemplos que fazem sentido para o seu estudo.</p></article><article class="feature"><h3>Testes para revisar</h3><p>Pratique o conteúdo que você anotou e acompanhe os resultados dos testes.</p></article><article class="feature"><h3>Metas e sequência</h3><p>Defina uma meta de palavras e acompanhe os dias de estudo para incentivar o hábito.</p></article><article class="feature"><h3>Evolução e ranking</h3><p>Observe sua atividade nos gráficos e participe da classificação semanal.</p></article></div></div></section>
<section class="wrap section" id="artigos"><div class="section-heading"><div><span class="eyebrow">Ideias para colocar em prática</span><h2>Seu próximo passo no estudo.</h2><p>Leituras curtas para aproveitar melhor o seu vocabulário.</p></div></div><div class="grid">{articles}</div></section>
<section class="wrap section" id="ajuda"><div class="help"><div><span class="eyebrow">Conte com a gente</span><h2>Ajuda e informações,<br/>sem complicação.</h2><p>Encontre o suporte e saiba mais sobre seus dados, sua conta e as condições de uso.</p></div><nav class="help-links" aria-label="Central de ajuda"><a href="/p/contato.html">Falar com o suporte <span aria-hidden="true">↗</span></a><a href="/p/privacidade.html">Política de privacidade <span aria-hidden="true">↗</span></a><a href="/p/termos-de-uso.html">Termos de uso <span aria-hidden="true">↗</span></a><a href="/p/excluir-conta.html">Excluir conta e dados <span aria-hidden="true">↗</span></a></nav></div></section></main>'''
    known = ' or '.join(route_condition(p) for p in pages)
    routes = ''.join("<b:if cond='" + escape(route_condition(p)) + "'>" + document(p) + '</b:if>' for p in pages)
    blog = '''<b:section id="main" class="main" maxwidgets="1" showaddelement="no"><b:widget id="Blog1" type="Blog" version="1" locked="true" title="Artigos" mobile="yes"><b:includable id="main" var="top"><b:if cond='data:blog.pageType != "static_page"'><b:if cond='data:blog.url != data:blog.homepageUrl'><main id="conteudo" class="document"><a class="blogger-back" href="/">← Voltar ao início</a><h1><data:blog.pageName/></h1><b:loop values="data:posts" var="post"><article class="post-content"><h2><a expr:href="data:post.url"><data:post.title/></a></h2><data:post.body/></article></b:loop><nav class="pager" aria-label="Mais artigos"><b:if cond="data:newerPageUrl"><a expr:href="data:newerPageUrl">← Mais recentes</a></b:if><b:if cond="data:olderPageUrl"><a expr:href="data:olderPageUrl">Anteriores →</a></b:if></nav></main><b:else/><section class="wrap post-list" aria-label="Novidades do blog"><b:loop values="data:posts" var="post"><article class="post-card"><h2><a expr:href="data:post.url"><data:post.title/></a></h2><p><data:post.snippet/></p><a class="text-link" expr:href="data:post.url">Ler publicação ↗</a></article></b:loop><nav class="pager" aria-label="Mais publicações"><b:if cond="data:olderPageUrl"><a expr:href="data:olderPageUrl">Mais publicações →</a></b:if></nav></section></b:if><b:else/>'''
    blog += '<b:if cond=\'!(' + escape(known) + ')\'><main id="conteudo" class="document"><a class="blogger-back" href="/">← Voltar ao início</a><b:loop values="data:posts" var="post"><h1><data:post.title/></h1><div class="post-content"><data:post.body/></div></b:loop></main></b:if></b:if></b:includable></b:widget></b:section>'
    theme = f'''<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:b="http://www.google.com/2005/gml/b" xmlns:data="http://www.google.com/2005/gml/data" xmlns:expr="http://www.google.com/2005/gml/expr" b:version="2" lang="pt-BR" dir="ltr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="theme-color" content="#58cc02"/><meta name="keep-english-theme" content="{VERSION}"/><title><data:blog.pageTitle/></title><b:include data="blog" name="all-head-content"/><b:skin><![CDATA[{css}]]></b:skin></head>
<body>{header}<b:if cond="data:blog.url == data:blog.homepageUrl">{home}</b:if><b:if cond='data:blog.pageType == "static_page" or data:blog.pageType == "item"'>{routes}</b:if>{blog}{footer}</body></html>'''
    # Conditional branches are mutually exclusive, but keep XML ids globally unique too.
    theme = theme.replace(' id="conteudo"', '')
    theme = theme.replace("cond='data:blog.pageType != \"static_page\"'", "cond='data:blog.pageType != &quot;static_page&quot; and !(" + escape(known) + ")'")
    theme = theme.replace('</header>', '</header><div id="conteudo" tabindex="-1"></div>', 1)
    for page in pages:
        theme = theme.replace('href="/p/' + page['slug'] + '.html"', 'href="' + page['path'] + '"')
    theme_path = ROOT / f'keep-english-blogger-v{VERSION}.xml'
    theme_path.write_text(theme, encoding='utf-8')
    (ROOT / 'template.xml').write_text(theme, encoding='utf-8')
    # Extract HTML from the actual XML so the preview and integrated routes cannot drift.
    root = ET.fromstring(theme)
    def plain(node):
        value = ET.tostring(node, encoding='unicode')
        value = re.sub(r'\sxmlns(?::\w+)?="[^"]*"', '', value)
        return re.sub(r'(<\/?)(?:html|ns\d+):', r'\1', value)
    body = root.find('h:body', NS)
    header_html = plain(body.find('h:header', NS))
    skip_html = plain(body.find('h:a', NS))
    footer_html = plain(body.find('h:footer', NS))
    home_node = next(n for n in body.findall('b:if', NS) if n.attrib['cond'] == 'data:blog.url == data:blog.homepageUrl')
    extracted_home = plain(home_node.find('h:main', NS))
    def preview(title, content):
        # Relative links also let the preview work directly from the filesystem.
        result = f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>{escape(title)} — Keep English</title><style>{css}</style></head><body>{skip_html}{header_html}<div id="conteudo" tabindex="-1"></div>{content}{footer_html}</body></html>'
        return result
    def write_preview(path, title, content):
        result = preview(title, content)
        in_page = path.parent.name == 'p'
        for page in pages:
            local = ('' if in_page else 'p/') + page['slug'] + '.html'
            result = result.replace('href="' + page['path'] + '"', 'href="' + local + '"')
        result = result.replace('href="/p/', 'href="' + ('' if in_page else 'p/'))
        result = result.replace('href="/#', 'href="' + ('../index.html#' if in_page else '#'))
        result = result.replace('href="/"', 'href="' + ('../index.html' if in_page else 'index.html') + '"')
        path.write_text(result, encoding='utf-8')
    write_preview(ROOT / 'preview/index.html', 'Início', extracted_home)
    for page in pages:
        condition = route_condition(page)
        node = next(n for n in root.findall('.//b:if', NS) if n.attrib['cond'] == condition)
        content = plain(node.find('h:main', NS))
        write_preview(ROOT / 'preview/p' / (page['slug'] + '.html'), page['title'], content)
        (ROOT / 'pages' / (page['slug'] + '.html')).write_text(content, encoding='utf-8')
    # Discovery uses the true repository root, even though reusable instructions live under .github.
    script_path = REPO / '.github/agents/blogger/scripts/sync_project.py'
    if not script_path.is_file():
        script_path = ROOT / 'tools/sync_project.py'
    spec = importlib.util.spec_from_file_location('blogger_inventory', script_path)
    sync = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(sync)
    sync.SKIP.update({'.next', 'blogger', '_poc', 'dist', 'coverage', '.claude', '.windsurf'})
    inventory = sync.inventory(REPO if (REPO / 'package.json').is_file() else ROOT)
    profile = {'schema_version': 1, 'project_key': inventory['project_key'], 'source_digest_reviewed': inventory['source_digest'], 'identity': {'name': 'Keep English', 'developer_display_name': 'Datingmatch Studio', 'contact_email': EMAIL, 'blog_url': None, 'status': 'user_confirmed'}, 'architecture': {'stack': ['Next.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Better Auth'], 'facts': [{'status': 'observed', 'source': 'src/core/auth/auth.ts', 'fact': 'Email/password authentication; deletion not configured in reviewed source.'}, {'status': 'observed', 'source': 'src/features/words/infrastructure/public-word-lookup.ts', 'fact': 'Server queries Datamuse, LanguageTool, MyMemory and Tatoeba.'}]}, 'brand': {'logo': 'blogger/assets/keep-english.png', 'approval': 'user_supplied'}, 'preferences': {'languages': ['pt-BR'], 'back_link': 'top-left'}, 'output_directory': 'blogger', 'pages': [{**{k: p[k] for k in ('key', 'title', 'slug')}, 'heading': p.get('heading', p['title']), 'content_mode': 'integrated', 'languages': ['pt-BR']} for p in pages], 'validation_selectors': {'back_link_class': 'blogger-back'}, 'validation': {'xml': 'not_checked', 'local_browser': 'not_checked', 'blogger_import': 'not_checked', 'public_pages': {}}, 'open_issues': ['Legal drafts require operational confirmation before publication.', 'In-app account deletion path and deletion handling are not implemented by this theme.', 'Blogger page creation and real URL confirmation required.', 'Embedded PNG acceptance must be verified during Blogger import; a hosted logo URL may be substituted if necessary.']}
    profile['architecture']['facts'][0]['fact'] = 'Email/password authentication with Better Auth user.deleteUser.enabled; Prisma user relations use ON DELETE CASCADE.'
    profile['architecture']['facts'].append({'status': 'user_confirmed', 'source': 'User instructions, 2026-11-15', 'fact': 'Opening advertisement and optional rewarded video to bypass the 30-minute test cooldown are planned; support deletion requests handled within 30 days.'})
    profile['open_issues'] = ['Real AdMob ad unit, server-side verification callback and native app update require external configuration.', 'Blogger page creation, import and published URL checks remain pending.', 'Embedded PNG acceptance must be verified during Blogger import.']
    (ROOT / 'reports/inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf-8')
    (ROOT / 'reports/project.json').write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding='utf-8')
    manifest = '\n'.join(f'| {p["routing_titles"][-1]} | `{p["path"]}` | `pages/{p["slug"]}.html` |' for p in pages)
    (ROOT / 'PAGINAS.md').write_text('# Páginas e postagens do Blogger\n\nOs três documentos legais já estão publicados como postagens e foram mapeados pelos títulos e endereços reais. Não recrie nem renomeie esses três documentos. Para as demais páginas, importar o tema não as cria: publique-as com os títulos indicados. Confira o endereço gerado pelo Blogger; se diferir, ajuste os links em `build.py` e `source/pages.json` e gere novamente.\n\n| Título exato | Endereço esperado | Conteúdo de referência |\n| --- | --- | --- |\n' + manifest + '\n\nOs documentos são integrados ao tema e selecionados pelo título exato. O editor de páginas pode conter uma breve descrição: o corpo público vem do tema. Os arquivos HTML são referências completas para revisão, não devem ser colados junto com outra cópia do documento. Para editar textos legais: altere `src/features/auth/content/legal-documents.json` na raiz do projeto (fonte compartilhada com o app). Para as demais páginas, altere `source/pages.json`. Depois execute `python blogger/build.py` e reinstale o XML. Páginas adicionais com títulos diferentes exibem o corpo nativo.\n', encoding='utf-8')
    for entry, page in zip(profile['pages'], pages):
        entry.update({'path': page['path'], 'routing_titles': page['routing_titles']})
    profile['identity']['blog_url'] = 'https://keepenglishworld.blogspot.com/'
    (ROOT / 'reports/project.json').write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding='utf-8')
    checksum = hashlib.sha256(theme_path.read_bytes()).hexdigest()
    (ROOT / 'reports/theme-sha256.txt').write_text(f'{checksum}  {theme_path.name}\n', encoding='utf-8')
    print(json.dumps({'theme': theme_path.name, 'version': VERSION, 'pages': len(pages), 'sha256': checksum}))


if __name__ == '__main__':
    build()

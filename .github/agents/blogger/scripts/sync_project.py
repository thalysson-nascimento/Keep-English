"""Inventory a repository without reading secrets; mark inherited profiles stale."""
import argparse
import hashlib
import json
import os
from pathlib import Path

SKIP = {'.git', '.codex', '.agents', '.aws', '.vs', 'node_modules', 'Library', 'Temp', 'Logs', 'Signing', 'Builds', 'UserSettings', 'scratch', 'agents', 'instalar', 'preview', 'verificacao', '__pycache__', '.venv', 'venv'}
SOURCE = {'.cs', '.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.asset', '.xml', '.md', '.html', '.css'}
IMAGES = {'.png', '.jpg', '.jpeg', '.webp', '.svg'}
MARKERS = ('ProjectSettings/ProjectVersion.txt', 'Packages/manifest.json', 'package.json', 'pyproject.toml', 'pubspec.yaml', 'Cargo.toml', 'go.mod')
START = '<!-- blogger-agents:start -->'
END = '<!-- blogger-agents:end -->'

def digest(value):
    return hashlib.sha256(value).hexdigest()

def secret_name(path):
    name = path.name.lower()
    return name.startswith('.env') or any(word in name for word in ('credential', 'secret', 'keystore', 'signing', '.local.', 'token', 'password')) or path.suffix.lower() in {'.pem', '.key', '.p12', '.pfx', '.jks'}

def inventory(root):
    sources, documents, brand, truncated = [], [], [], False
    count = 0
    for directory, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in SKIP and not (Path(directory) / d).is_symlink())
        for name in sorted(files):
            count += 1
            if count > 30000:
                truncated = True
                break
            path = Path(directory) / name
            if path.is_symlink() or secret_name(path):
                continue
            relative = path.relative_to(root).as_posix()
            suffix = path.suffix.lower()
            if suffix in IMAGES and any(word in relative.lower() for word in ('logo', 'brand', 'menu_title', 'hero', 'banner', 'reference', 'referencia')):
                if len(brand) < 100:
                    brand.append(relative)
            if suffix == '.md' and len(documents) < 200:
                documents.append(relative)
            if suffix in SOURCE and len(sources) < 1200:
                size = path.stat().st_size
                if size <= 4_000_000:
                    sources.append({'path': relative, 'sha256': digest(path.read_bytes())})
        if truncated:
            break
    markers = [{'path': name, 'sha256': digest((root / name).read_bytes())} for name in MARKERS if (root / name).is_file()]
    stack = []
    if (root / 'ProjectSettings/ProjectVersion.txt').is_file(): stack.append('Unity')
    if (root / 'package.json').is_file(): stack.append('JavaScript/TypeScript (inspect package.json)')
    if (root / 'pubspec.yaml').is_file(): stack.append('Dart/Flutter (inspect pubspec.yaml)')
    if (root / 'pyproject.toml').is_file(): stack.append('Python')
    return {'schema_version': 1, 'project_key': digest(str(root).casefold().encode())[:24], 'source_digest': digest(json.dumps(sources, sort_keys=True).encode()), 'stack_candidates': stack, 'markers': markers, 'source_files': sources, 'architecture_candidates': documents, 'brand_candidates': brand, 'scan_truncated': truncated or len(sources) == 1200, 'notice': 'Candidates are evidence locations, not confirmed features or approved brand assets.'}

def install_router(root):
    path = root / 'AGENTS.md'
    original = path.read_text(encoding='utf-8') if path.exists() else '# Instruções do projeto\n'
    block = START + '\n## Blogger\nPara construir, corrigir ou adaptar Blogger, leia `agents/blogger/AGENTS.md` e siga o fluxo do projeto atual. Estas instruções não se aplicam a tarefas não relacionadas.\n' + END
    if START in original:
        if END not in original: raise ValueError('Incomplete existing Blogger routing block; review manually.')
        prefix, remaining = original.split(START, 1)
        _, suffix = remaining.split(END, 1)
        text = prefix + block + suffix
    elif 'agents/blogger/AGENTS.md' in original:
        return
    else:
        text = original.rstrip() + '\n\n' + block + '\n'
    path.write_text(text, encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--install-router', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir(): parser.error('Project root must be an existing directory.')
    state = root / 'agents/blogger/state'
    state.mkdir(parents=True, exist_ok=True)
    current = inventory(root)
    profile_path = state / 'project.json'
    profile = json.loads(profile_path.read_text(encoding='utf-8')) if profile_path.exists() else {}
    inherited = bool(profile) and profile.get('project_key') != current['project_key']
    current['profile_status'] = 'inherited_do_not_reuse' if inherited else 'missing' if not profile else 'review_source_changes' if profile.get('source_digest_reviewed') != current['source_digest'] else 'current'
    (state / 'inventory.json').write_text(json.dumps(current, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if args.install_router: install_router(root)
    print(json.dumps({key: current[key] for key in ('project_key', 'source_digest', 'profile_status', 'scan_truncated')}, ensure_ascii=False))

if __name__ == '__main__': main()

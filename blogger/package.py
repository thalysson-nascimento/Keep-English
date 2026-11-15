"""Package generated theme, preview, editable sources and review documentation."""
from pathlib import Path
import zipfile
from legal_content import theme_version

root = Path(__file__).resolve().parent
version = theme_version()
target = root / f'keep-english-blogger-v{version}.zip'
files = [path for path in root.rglob('*') if path.is_file() and path.suffix != '.zip' and '__pycache__' not in path.parts and (not path.name.startswith('keep-english-blogger-v') or path.name == f'keep-english-blogger-v{version}.xml')]
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, Path('keep-english-blogger') / path.relative_to(root))
    for name in ('sync_project.py', 'validate_theme.py'):
        tool = root.parent / '.github/agents/blogger/scripts' / name
        if tool.is_file():
            archive.write(tool, Path('keep-english-blogger/tools') / name)
with zipfile.ZipFile(target) as archive:
    if archive.testzip() is not None:
        raise SystemExit('Archive verification failed')
print(f'{target.name}: {len(files)} files, verified')

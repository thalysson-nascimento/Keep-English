"""Package generated theme, preview, editable sources and review documentation."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent
target = root / 'keep-english-blogger-v1.1.0.zip'
files = [path for path in root.rglob('*') if path.is_file() and path.suffix != '.zip' and '__pycache__' not in path.parts and path.name != 'keep-english-blogger-v1.0.0.xml']
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, Path('keep-english-blogger') / path.relative_to(root))
with zipfile.ZipFile(target) as archive:
    if archive.testzip() is not None:
        raise SystemExit('Archive verification failed')
print(f'{target.name}: {len(files)} files, verified')

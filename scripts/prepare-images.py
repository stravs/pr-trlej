"""Create local responsive WebP copies without changing original reference photos.
Run from the Izba root with .venv/bin/python; requires Pillow.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/images/optimized'
DEST.mkdir(exist_ok=True)
manifest = {}
for source in sorted((ROOT / 'public/images').glob('*.jpg')):
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    width, height = image.size
    variants = []
    for size in sorted({min(width, target) for target in (480, 960, 1600)}):
        resized = image.resize((size, round(height * size / width)), Image.Resampling.LANCZOS)
        name = f'{source.stem}-{size}.webp'
        resized.save(DEST / name, 'WEBP', quality=80)
        variants.append({'src': '/images/optimized/' + name, 'width': size})
    manifest[source.name] = {'width': width, 'height': height, 'variants': variants}
(ROOT / 'src/data/images.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Prepared {len(manifest)} local photos. Originals unchanged.')

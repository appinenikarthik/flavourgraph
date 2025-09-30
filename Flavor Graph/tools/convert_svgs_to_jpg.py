from pathlib import Path
from cairosvg import svg2png
from PIL import Image

base = Path(r"C:\Users\gowth\OneDrive\Desktop\Flavor Graph\static\recipes")
svg_files = sorted(base.glob('*.svg'))
print('Found', len(svg_files), 'SVG files in', base)
for svg in svg_files:
    png_path = svg.with_suffix('.png')
    jpg_path = svg.with_suffix('.jpg')
    try:
        print('Converting', svg.name)
        svg2png(url=str(svg), write_to=str(png_path), output_width=1200, output_height=800)
        im = Image.open(png_path).convert('RGB')
        im.save(jpg_path, 'JPEG', quality=85)
        print('  -> Created', jpg_path.name)
        png_path.unlink(missing_ok=True)
    except Exception as e:
        print('  Failed', svg.name, '->', e)
print('Done')

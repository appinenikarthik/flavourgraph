import traceback
from pathlib import Path
from datetime import datetime
log = Path(__file__).with_suffix('.log')
with log.open('a', encoding='utf-8') as f:
    f.write('\n----- convert_debug run at ' + datetime.now().isoformat() + '\n')
    try:
        from cairosvg import svg2png
        from PIL import Image
        f.write('Imported cairosvg and PIL\n')
    except Exception as e:
        f.write('Import failed: ' + repr(e) + '\n')
        f.write(traceback.format_exc())
        raise
    base = Path(r"C:\Users\gowth\OneDrive\Desktop\Flavor Graph\static\recipes")
    f.write('Base path: ' + str(base) + '\n')
    svg_files = sorted(base.glob('*.svg'))
    f.write('Found {} svg files\n'.format(len(svg_files)))
    for svg in svg_files:
        try:
            f.write('Processing: ' + str(svg) + '\n')
            png_path = svg.with_suffix('.png')
            jpg_path = svg.with_suffix('.jpg')
            svg2png(url=str(svg), write_to=str(png_path), output_width=1200, output_height=800)
            f.write('  svg2png wrote ' + str(png_path) + ' size=' + str(png_path.stat().st_size) + '\n')
            im = Image.open(png_path).convert('RGB')
            im.save(jpg_path, 'JPEG', quality=85)
            f.write('  saved jpg ' + str(jpg_path) + ' size=' + str(jpg_path.stat().st_size) + '\n')
            try:
                png_path.unlink()
                f.write('  removed temp png\n')
            except Exception as e:
                f.write('  failed to remove temp png: ' + repr(e) + '\n')
        except Exception as e:
            f.write('  Failed processing ' + svg.name + ': ' + repr(e) + '\n')
            f.write(traceback.format_exc())
    f.write('Done run\n')
print('convert_debug finished, log at', log)

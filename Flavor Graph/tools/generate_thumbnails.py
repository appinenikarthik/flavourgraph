from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

base = Path(r"C:\Users\gowth\OneDrive\Desktop\Flavor Graph\static\recipes")
base.mkdir(parents=True, exist_ok=True)

items = {
    'garlic_pasta': 'Garlic Olive Oil Pasta',
    'caprese_salad': 'Caprese Salad',
    'veggie_omelette': 'Veggie Omelette',
    'peanut_stir_fry': 'Peanut Stir Fry'
}

w, h = 1200, 800

def draw_stylized(title, out_path, main_color, accent_color):
    img = Image.new('RGB', (w, h), color=main_color)
    draw = ImageDraw.Draw(img)
    # soft radial gradient
    for i in range(200):
        bbox = [w//2 - i*6, h//2 - i*4, w//2 + i*6, h//2 + i*4]
        alpha = int(30 * (1 - i/200))
        draw.ellipse(bbox, fill=(int(accent_color[0]* (1 - i/200)), int(accent_color[1]* (1 - i/200)), int(accent_color[2]* (1 - i/200))))
    # decorative rounded rectangles
    for j in range(6):
        xy = [50 + j*170, h - 180 - (j%3)*10, 200 + j*170, h - 40 - (j%3)*10]
        draw.rounded_rectangle(xy, radius=18, fill=(255,255,255,10))
    # blurred overlay to simulate photo
    overlay = img.copy().filter(ImageFilter.GaussianBlur(radius=8))
    img = Image.blend(img, overlay, alpha=0.35)
    draw = ImageDraw.Draw(img)
    # title text
    try:
        font = ImageFont.truetype('arial.ttf', 56)
        font_small = ImageFont.truetype('arial.ttf', 28)
    except Exception:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
    title_box_w = w - 120
    # draw a semi-transparent banner
    banner_h = 120
    banner_y = h - banner_h - 40
    banner = Image.new('RGBA', (title_box_w, banner_h), (0,0,0,140))
    img.paste(banner, (60, banner_y), banner)
    draw.text((80, banner_y + 20), title, font=font, fill=(255,255,255))
    draw.text((80, banner_y + 70), 'Try with: fresh ingredients • quick', font=font_small, fill=(230,230,230))
    img.save(out_path, 'JPEG', quality=88)
    print('Wrote', out_path)

colors = [((220,180,120),(255,240,200)), ((200,60,60),(255,200,200)), ((80,140,40),(200,255,200)), ((200,140,60),(255,230,200))]
for (id_, title), col in zip(items.items(), colors):
    out = base / f'{id_}.jpg'
    draw_stylized(title, out, col[0], col[1])

print('Done')

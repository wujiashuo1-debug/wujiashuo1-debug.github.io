"""Optional asset regeneration; the generated PNG is committed, no build dependency."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
image = Image.new('RGB', (1200, 630), '#e5e4e0')
draw = ImageDraw.Draw(image)
font_path = str(root / 'public/assets/fonts/space-grotesk.ttf')
font = lambda size: ImageFont.truetype(font_path, size)
draw.line((50, 78, 1150, 78), fill='#bfbebe', width=1)
draw.text((50, 36), 'JW / PERSONAL PORTFOLIO', font=font(17), fill='#1d1d1d')
draw.text((50, 117), 'JIASHUO WU.', font=font(132), fill='#1d1d1d')
draw.text((54, 301), 'Connecting dots.', font=font(54), fill='#1d1d1d')
draw.text((54, 366), 'Building real things.', font=font(54), fill='#1d1d1d')
draw.text((54, 502), 'AI / TECHNOLOGY / COMMERCE / CONTENT', font=font(17), fill='#61635d')
for radius in (123, 91):
    draw.ellipse((925-radius, 409-radius, 925+radius, 409+radius), outline='#a4a69d', width=1)
draw.line((755,409,1095,409),fill='#a4a69d')
draw.line((925,250,925,563),fill='#a4a69d')
draw.ellipse((894,378,956,440),fill='#1d1d1d')
draw.line((909,409,941,409),fill='#f4f3ef',width=2)
draw.line((925,393,925,425),fill='#f4f3ef',width=2)
draw.line((50,580,1150,580),fill='#bfbebe')
image.save(root / 'public/assets/og.png', optimize=True)

#!/usr/bin/env python3
"""Gera os ícones do Biscoitô da Sorte (192, 512 e maskable)."""
from PIL import Image, ImageDraw
import random

CREAM = (255, 246, 233, 255)      # fundo
DOUGH = (238, 184, 114, 255)      # massa do biscoito
DOUGH_DARK = (214, 152, 82, 255)  # sombra da massa
CHIP = (110, 70, 40, 255)         # gotas de chocolate
BROWN = (107, 63, 32, 255)

def cookie(draw, cx, cy, r, chips=7):
    """Desenha um biscoito redondo com gotas de chocolate."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=DOUGH, outline=BROWN, width=max(2, int(r // 24)))
    draw.ellipse([cx - r, cy - r, cx + r * 0.55, cy + r * 0.55], fill=DOUGH)
    rng = random.Random(7)
    for _ in range(chips):
        ang = rng.uniform(0, 6.283)
        dist = rng.uniform(0.15, 0.72) * r
        x = cx + dist * (0.7 + 0.6 * abs(ang - 3.14) / 3.14)
        y = cy + dist * (0.8 if ang > 3.14 else 0.4) * 0.9
        cr = max(3, r // 11)
        draw.ellipse([x - cr, y - cr, x + cr, y + cr], fill=CHIP)

def make(size, maskable=False):
    name = "maskable" if maskable else "icon"
    img = Image.new("RGBA", (size, size), CREAM)
    d = ImageDraw.Draw(img)
    if maskable:
        # fundo preenche tudo (safe zone de 80%)
        d.rectangle([0, 0, size, size], fill=DOUGH)
        r = size * 0.30
        cookie(d, size / 2, size / 2, r, chips=8)
    else:
        r = size * 0.36
        cookie(d, size / 2, size / 2, r, chips=7)
    img.save(f"{name}-{size}.png")

make(192)
make(512)
make(512, maskable=True)
print("ícones gerados!")

import * as THREE from 'three';

export function makeCanvasTexture(draw, w = 1024, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

// Generic glowing card texture used by projects & experience panels
export function makeCardTexture({ title, tag, body, link, w = 1024, h = 640 }) {
  return makeCanvasTexture((ctx, W, H) => {
    ctx.fillStyle = 'rgba(8, 10, 22, 0.92)';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(79, 195, 247, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, W - 12, H - 12);

    let y = 96;
    ctx.fillStyle = '#e8eaf6';
    ctx.font = '600 58px "Space Grotesk", sans-serif';
    y = wrapText(ctx, title, 56, y, W - 112, 64);

    if (tag) {
      ctx.fillStyle = '#4fc3f7';
      ctx.font = '400 26px "Space Grotesk", sans-serif';
      ctx.fillText(tag.toUpperCase(), 56, y + 8);
      y += 56;
    }

    if (body) {
      ctx.fillStyle = '#9fb3c8';
      ctx.font = '300 30px "Space Grotesk", sans-serif';
      y = wrapText(ctx, body, 56, y + 16, W - 112, 42);
    }

    if (link) {
      ctx.fillStyle = '#4fc3f7';
      ctx.font = '500 28px "Space Grotesk", sans-serif';
      ctx.fillText('OPEN ON GITHUB  ↗', 56, H - 48);
    }
  }, w, h);
}

export function makeLabelSprite(text, { fontSize = 56, color = '#e8eaf6', scale = 1.6 } = {}) {
  const tex = makeCanvasTexture((ctx, W, H) => {
    ctx.fillStyle = 'rgba(8, 10, 22, 0.75)';
    const tw = ctx.measureText(text).width;
    ctx.font = `500 ${fontSize}px "Space Grotesk", sans-serif`;
    const w2 = ctx.measureText(text).width + 60;
    ctx.fillRect((W - w2) / 2, H / 2 - fontSize * 0.8, w2, fontSize * 1.6);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);
  }, 512, 128);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scale, scale * 0.25, 1);
  return sprite;
}

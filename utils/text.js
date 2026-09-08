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
    ctx.font = `500 ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = 'rgba(8, 10, 22, 0.75)';
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

const BRAND_PATHS = {
  github: 'M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.36-3.9-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.28 5.68.42.36.79 1.06.79 2.14v3.25c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z',
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.99h3.42v1.57h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.42a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.03H3.54V8.99H7.1v11.46Z'
};

export function makeContactIconSprite(type) {
  const tex = makeCanvasTexture((ctx, W, H) => {
    ctx.fillStyle = '#071019';
    if (BRAND_PATHS[type]) {
      ctx.save();
      ctx.translate(56, 56);
      ctx.scale(6, 6);
      ctx.fill(new Path2D(BRAND_PATHS[type]));
      ctx.restore();
      return;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 112px "Space Grotesk", sans-serif';
    ctx.fillText(type === 'email' ? '@' : '↗', W / 2, H / 2 + 2);
  }, 256, 256);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.68, 0.68, 1);
  return sprite;
}

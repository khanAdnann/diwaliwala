import { CARD_BACKGROUNDS } from '../config/festivalConfig';

/**
 * Helper: Wraps text cleanly across multiple lines inside an HTML5 Canvas
 */
export function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n += 1) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    lines.push(line.trim());
  }

  const totalHeight = lines.length * lineHeight;
  let currentY = y - totalHeight / 2 + lineHeight / 2;

  lines.forEach((l) => {
    ctx.fillText(l, x, currentY);
    currentY += lineHeight;
  });

  return currentY;
}

/**
 * Helper: Draws an ornate glowing clay Diya on a 2D canvas context
 */
export function drawCanvasDiya(ctx, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Flame Aura
  const aura = ctx.createRadialGradient(0, -24, 2, 0, -24, 38);
  aura.addColorStop(0, 'rgba(255, 244, 220, 0.95)');
  aura.addColorStop(0.45, 'rgba(255, 215, 0, 0.5)');
  aura.addColorStop(1, 'rgba(255, 140, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -24, 38, 0, Math.PI * 2);
  ctx.fill();

  // Outer Flame
  const flameGrad = ctx.createLinearGradient(0, -44, 0, -4);
  flameGrad.addColorStop(0, '#FFF4DC');
  flameGrad.addColorStop(0.55, '#FFD700');
  flameGrad.addColorStop(1, '#FF8C00');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.bezierCurveTo(-15, -24, -14, -6, 0, -4);
  ctx.bezierCurveTo(14, -6, 15, -24, 0, -44);
  ctx.fill();

  // Inner Bright Core
  ctx.fillStyle = '#FFF4DC';
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.bezierCurveTo(-7, -20, -7, -9, 0, -8);
  ctx.bezierCurveTo(7, -9, 7, -20, 0, -32);
  ctx.fill();

  // Clay Bowl
  const bowlGrad = ctx.createLinearGradient(-38, 0, 38, 28);
  bowlGrad.addColorStop(0, '#FFD700');
  bowlGrad.addColorStop(0.4, '#D97706');
  bowlGrad.addColorStop(1, '#7C2D12');
  ctx.fillStyle = bowlGrad;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.moveTo(-38, -4);
  ctx.quadraticCurveTo(0, 6, 38, -4);
  ctx.bezierCurveTo(32, 22, 16, 28, 0, 28);
  ctx.bezierCurveTo(-16, 28, -32, 22, -38, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Decorative Dots
  ctx.fillStyle = '#FFF4DC';
  [-16, -8, 0, 8, 16].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(dx, 9, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Helper: Draws a geometric mandala/rangoli watermark on a 2D canvas
 */
export function drawCanvasMandala(ctx, cx, cy, radius, color = '#FFD700', alpha = 0.16) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;

  // Concentric rings
  [1, 0.82, 0.62, 0.38, 0.18].forEach((ratio) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius * ratio, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 16 Lotus Petals
  for (let i = 0; i < 16; i += 1) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 16);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.38);
    ctx.quadraticCurveTo(radius * 0.18, -radius * 0.7, 0, -radius * 0.98);
    ctx.quadraticCurveTo(-radius * 0.18, -radius * 0.7, 0, -radius * 0.38);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * 1. DIWALI WISH GENERATOR CANVAS RENDERER (1080 x 1080 Square HD)
 */
export function renderGreetingCardCanvas(canvas, options) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = (canvas.width = 1080);
  const height = (canvas.height = 1080);

  const {
    senderName = 'Your Friend',
    receiverName = '',
    greetingText = 'May this Diwali bring happiness, prosperity and endless blessings to your life!',
    language = 'en',
    bgTheme = 'royal-purple',
    textColor = '#FFF4DC',
    goldenEffects = true,
    templateTitle = 'Shubh Deepavali',
  } = options;

  const theme = CARD_BACKGROUNDS.find((b) => b.id === bgTheme) || CARD_BACKGROUNDS[0];

  // 1. Rich Radial Gradient Background
  const bgGrad = ctx.createRadialGradient(width / 2, height * 0.35, 60, width / 2, height / 2, width * 0.85);
  bgGrad.addColorStop(0, theme.secondary);
  bgGrad.addColorStop(0.55, theme.primary);
  bgGrad.addColorStop(1, theme.tertiary);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Background Sacred Mandalas
  drawCanvasMandala(ctx, width / 2, height / 2, 410, theme.border, 0.11);
  drawCanvasMandala(ctx, 110, 110, 160, theme.border, 0.18);
  drawCanvasMandala(ctx, width - 110, 110, 160, theme.border, 0.18);
  drawCanvasMandala(ctx, 110, height - 110, 160, theme.border, 0.18);
  drawCanvasMandala(ctx, width - 110, height - 110, 160, theme.border, 0.18);

  // 3. Golden Sparkle Particles Effect
  if (goldenEffects) {
    for (let i = 0; i < 65; i += 1) {
      const px = ((i * 173 + 97) % (width - 140)) + 70;
      const py = ((i * 251 + 61) % (height - 140)) + 70;
      const r = (i % 3) + 1.5;
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FFF4DC';
      ctx.globalAlpha = 0.28 + (i % 5) * 0.12;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 4. Double Ornate Royal Frame Border
  ctx.save();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
  ctx.shadowBlur = 18;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  ctx.strokeStyle = 'rgba(255, 244, 220, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, width - 128, height - 128);
  ctx.restore();

  // 5. Header Badge ("SHUBH DEEPAVALI")
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(255, 140, 0, 0.7)';
  ctx.shadowBlur = 16;
  ctx.font = language === 'hi' ? '700 44px "Noto Sans Devanagari", serif' : '700 36px "Cinzel Decorative", serif';
  ctx.fillText(language === 'hi' ? '✨ शुभ दीपावली ✨' : '✨ SHUBH DEEPAVALI ✨', width / 2, 160);

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 244, 220, 0.75)';
  ctx.fillText(templateTitle.toUpperCase(), width / 2, 205);
  ctx.restore();

  // 6. Receiver Greeting Salutation (if provided)
  if (receiverName && receiverName.trim()) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.font =
      language === 'hi'
        ? '600 38px "Noto Sans Devanagari", sans-serif'
        : 'italic 600 40px "Playfair Display", serif';
    const salutation =
      language === 'hi' ? `प्रिय ${receiverName.trim()} जी,` : `Dearest ${receiverName.trim()},`;
    ctx.fillText(salutation, width / 2, 305);
    ctx.restore();
  }

  // 7. Main Greeting Body Text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor || '#FFF4DC';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 14;
  ctx.font =
    language === 'hi'
      ? '600 46px "Noto Sans Devanagari", sans-serif'
      : '600 44px "Playfair Display", serif';
  drawWrappedText(ctx, greetingText, width / 2, 520, width - 240, 66);
  ctx.restore();

  // 8. Decorative Divider Line
  ctx.save();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 160, 720);
  ctx.lineTo(width / 2 + 160, 720);
  ctx.stroke();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(width / 2, 720, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 9. Sender Name Signature
  const cleanSender = senderName && senderName.trim() ? senderName.trim() : 'Your Loved One';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 244, 220, 0.8)';
  ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    language === 'hi' ? 'स्नेह और शुभकामनाओं सहित,' : 'With Warm Wishes & Blessings,',
    width / 2,
    775
  );

  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.55)';
  ctx.shadowBlur = 18;
  ctx.font =
    language === 'hi'
      ? '700 46px "Noto Sans Devanagari", serif'
      : '700 48px "Cinzel Decorative", "Playfair Display", serif';
  ctx.fillText(cleanSender, width / 2, 838);
  ctx.restore();

  // 10. Three Glowing Ceremonial Diyas at Base
  drawCanvasDiya(ctx, width / 2 - 220, 935, 1.05);
  drawCanvasDiya(ctx, width / 2, 925, 1.3);
  drawCanvasDiya(ctx, width / 2 + 220, 935, 1.05);

  // 11. Subtle Watermark
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 244, 220, 0.45)';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Created with DiwaliWala 🪔', width / 2, height - 22);
  ctx.restore();
}

/**
 * 2. NAME IN LIGHTS CANVAS RENDERER (Instagram Story 1080x1350 or Landscape 1280x720)
 */
export function renderNameInLightsCanvas(canvas, options, animPhase = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const {
    userName = 'Adnan',
    fontStyle = 'cinzel',
    bgTheme = 'royal-purple',
    glowColor = '#FFD700',
    aspectRatio = 'story', // 'story' (1080x1350) | 'landscape' (1280x720)
    customPrefix = 'Happy Diwali',
  } = options;

  const width = (canvas.width = aspectRatio === 'story' ? 1080 : 1280);
  const height = (canvas.height = aspectRatio === 'story' ? 1350 : 720);

  const theme = CARD_BACKGROUNDS.find((b) => b.id === bgTheme) || CARD_BACKGROUNDS[0];

  // 1. Night Sky & Palace Gradient
  const skyGrad = ctx.createRadialGradient(width / 2, height * 0.4, 40, width / 2, height / 2, Math.max(width, height) * 0.75);
  skyGrad.addColorStop(0, theme.secondary);
  skyGrad.addColorStop(0.55, theme.primary);
  skyGrad.addColorStop(1, '#06030C');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Center & Basal Rangoli Mandala
  drawCanvasMandala(ctx, width / 2, height / 2, Math.min(width, height) * 0.38, glowColor, 0.14);
  drawCanvasMandala(ctx, width / 2, height, Math.min(width, height) * 0.44, '#FF8C00', 0.22);

  // 3. Top Hanging Fairy Lights Garland (Toran of Lights)
  const stringCount = 6;
  const segmentWidth = width / stringCount;
  ctx.save();
  for (let i = 0; i < stringCount; i += 1) {
    const startX = i * segmentWidth;
    const endX = (i + 1) * segmentWidth;
    const midX = (startX + endX) / 2;

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, 36);
    ctx.quadraticCurveTo(midX, 135, endX, 36);
    ctx.stroke();

    // Bulbs along the garland
    for (let t = 0.15; t <= 0.85; t += 0.175) {
      const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
      const by = (1 - t) * (1 - t) * 36 + 2 * (1 - t) * t * 135 + t * t * 36;
      const pulse = Math.sin(animPhase + i + t * 10) * 0.25 + 0.75;

      ctx.save();
      ctx.fillStyle = '#FFF4DC';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 22 * pulse;
      ctx.beginPath();
      ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();

  // 4. Sparkling Starlight Field
  for (let s = 0; s < 85; s += 1) {
    const sx = ((s * 197 + 43) % (width - 100)) + 50;
    const sy = ((s * 283 + 91) % (height - 160)) + 80;
    const twinkle = Math.sin(animPhase * 1.5 + s) * 0.35 + 0.65;
    const radius = ((s % 3) + 1.2) * twinkle;

    ctx.save();
    ctx.fillStyle = s % 3 === 0 ? glowColor : '#FFF4DC';
    ctx.globalAlpha = 0.3 + (s % 4) * 0.15;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    // 4-point star flare on select stars
    if (s % 9 === 0) {
      ctx.strokeStyle = '#FFF4DC';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 10 * twinkle, sy);
      ctx.lineTo(sx + 10 * twinkle, sy);
      ctx.moveTo(sx, sy - 10 * twinkle);
      ctx.lineTo(sx, sy + 10 * twinkle);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. Font Family Resolution
  const fontMap = {
    cinzel: '"Cinzel Decorative", serif',
    script: '"Great Vibes", cursive',
    playfair: '"Playfair Display", serif',
    hindi: '"Rozha One", "Noto Sans Devanagari", serif',
  };
  const chosenFont = fontMap[fontStyle] || fontMap.cinzel;

  // 6. Glowing Prefix ("Happy Diwali")
  const centerY = height * 0.46;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFF4DC';
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 28;
  ctx.font = `700 ${aspectRatio === 'story' ? 68 : 56}px ${chosenFont}`;
  ctx.fillText(customPrefix || 'Happy Diwali', width / 2, centerY - (aspectRatio === 'story' ? 95 : 75));
  ctx.restore();

  // 7. Magical Multi-Pass Neon/Gold Name in Lights
  const displayName = `${(userName || 'Adnan').trim()}!`;
  const baseFontSize =
    displayName.length > 14
      ? aspectRatio === 'story'
        ? 82
        : 74
      : aspectRatio === 'story'
      ? 116
      : 98;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `900 ${baseFontSize}px ${chosenFont}`;

  // Outer Halo Pass
  ctx.shadowColor = '#FF8C00';
  ctx.shadowBlur = 65;
  ctx.fillStyle = glowColor;
  ctx.fillText(displayName, width / 2, centerY + 35);

  // Mid Golden Glow Pass
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 32;
  ctx.fillStyle = glowColor;
  ctx.fillText(displayName, width / 2, centerY + 35);

  // Crisp Inner Gold-Cream Gradient Fill
  const textGrad = ctx.createLinearGradient(width / 2 - 250, centerY - 60, width / 2 + 250, centerY + 50);
  textGrad.addColorStop(0, '#FFF4DC');
  textGrad.addColorStop(0.45, glowColor);
  textGrad.addColorStop(0.8, '#FF8C00');
  textGrad.addColorStop(1, '#FFF4DC');
  ctx.fillStyle = textGrad;
  ctx.fillText(displayName, width / 2, centerY + 35);

  // Fine bright highlight stroke
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 244, 220, 0.85)';
  ctx.strokeText(displayName, width / 2, centerY + 35);
  ctx.restore();

  // 8. Subtitle Blessing
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 244, 220, 0.9)';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('✨ May your life shine brighter than a thousand diyas ✨', width / 2, centerY + 135);
  ctx.restore();

  // 9. Diyas on Both Sides & Center Base
  const diyaY = height - (aspectRatio === 'story' ? 190 : 115);
  drawCanvasDiya(ctx, width * 0.2, diyaY, aspectRatio === 'story' ? 1.25 : 1.05);
  drawCanvasDiya(ctx, width * 0.5, diyaY - 15, aspectRatio === 'story' ? 1.55 : 1.3);
  drawCanvasDiya(ctx, width * 0.8, diyaY, aspectRatio === 'story' ? 1.25 : 1.05);

  // 10. Ornate Border & Watermark
  ctx.save();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);
  ctx.fillStyle = 'rgba(255, 244, 220, 0.55)';
  ctx.textAlign = 'center';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DiwaliWala 🪔 • Name in Lights', width / 2, height - 52);
  ctx.restore();
}

/**
 * 3. PHOTO FRAME MAKER CANVAS RENDERER (1080 x 1080 HD Portrait Composition)
 */
export function renderPhotoFrameCanvas(canvas, options) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = (canvas.width = 1080);
  const height = (canvas.height = 1080);

  const {
    imageElement = null,
    frameId = 'frame-royal-arch',
    zoom = 1,
    offsetX = 0,
    offsetY = 0,
    rotation = 0,
    showFestiveBorder = true,
    showCornerDiyas = true,
    greetingText = 'Shubh Deepavali 🪔',
    subText = 'Warm Wishes & Prosperity',
  } = options;

  // Frame template definitions (6 distinct luxury templates)
  const frameConfigs = {
    'frame-royal-arch': {
      bgPrimary: '#160B2D',
      bgSecondary: '#29104A',
      accent: '#FFD700',
      trim: '#FF8C00',
      clipShape: 'arch',
    },
    'frame-mandala-gold': {
      bgPrimary: '#3A081E',
      bgSecondary: '#6B0F2B',
      accent: '#FFD700',
      trim: '#FFF4DC',
      clipShape: 'circle',
    },
    'frame-marigold-toran': {
      bgPrimary: '#2E1105',
      bgSecondary: '#6D2308',
      accent: '#FFA500',
      trim: '#FFD700',
      clipShape: 'rounded-rect',
    },
    'frame-lotus-diya': {
      bgPrimary: '#08183A',
      bgSecondary: '#162F65',
      accent: '#FFD700',
      trim: '#FF8C00',
      clipShape: 'octagon',
    },
    'frame-imperial-zari': {
      bgPrimary: '#062822',
      bgSecondary: '#0E4B3E',
      accent: '#FFD700',
      trim: '#FFF4DC',
      clipShape: 'rounded-rect',
    },
    'frame-shubh-labh': {
      bgPrimary: '#240935',
      bgSecondary: '#4A1259',
      accent: '#FFD700',
      trim: '#FF8C00',
      clipShape: 'circle',
    },
  };

  const cfg = frameConfigs[frameId] || frameConfigs['frame-royal-arch'];

  // 1. Base Royal Matting Background
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.8);
  bgGrad.addColorStop(0, cfg.bgSecondary);
  bgGrad.addColorStop(1, cfg.bgPrimary);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ornamental mandalas on frame matting
  drawCanvasMandala(ctx, 130, 130, 170, cfg.accent, 0.2);
  drawCanvasMandala(ctx, width - 130, 130, 170, cfg.accent, 0.2);
  drawCanvasMandala(ctx, 130, height - 130, 170, cfg.accent, 0.2);
  drawCanvasMandala(ctx, width - 130, height - 130, 170, cfg.accent, 0.2);

  // Helper to create the clipping path for the photo viewport
  const definePhotoAperture = () => {
    ctx.beginPath();
    if (cfg.clipShape === 'circle') {
      ctx.arc(width / 2, 495, 345, 0, Math.PI * 2);
    } else if (cfg.clipShape === 'arch') {
      ctx.moveTo(185, 830);
      ctx.lineTo(185, 380);
      ctx.quadraticCurveTo(185, 145, width / 2, 145);
      ctx.quadraticCurveTo(width - 185, 145, width - 185, 380);
      ctx.lineTo(width - 185, 830);
      ctx.closePath();
    } else if (cfg.clipShape === 'octagon') {
      const cx = width / 2;
      const cy = 495;
      const r = 355;
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8 + Math.PI / 8;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      // Rounded rectangle
      const rx = 175;
      const ry = 155;
      const rw = width - 350;
      const rh = 680;
      const rad = 42;
      ctx.moveTo(rx + rad, ry);
      ctx.lineTo(rx + rw - rad, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
      ctx.lineTo(rx + rw, ry + rh - rad);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
      ctx.lineTo(rx + rad, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
      ctx.lineTo(rx, ry + rad);
      ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
      ctx.closePath();
    }
  };

  // 2. Render Uploaded Photo (or Festive Portrait Placeholder) Inside Clipped Aperture
  ctx.save();
  definePhotoAperture();
  ctx.clip();

  if (imageElement) {
    ctx.save();
    ctx.translate(width / 2 + offsetX, 495 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgW = imageElement.naturalWidth || imageElement.width || 800;
    const imgH = imageElement.naturalHeight || imageElement.height || 800;
    const baseScale = Math.max(720 / imgW, 720 / imgH);
    const drawW = imgW * baseScale;
    const drawH = imgH * baseScale;

    ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Rich Festive Placeholder Illustration when no photo is uploaded yet
    const innerGrad = ctx.createRadialGradient(width / 2, 495, 20, width / 2, 495, 380);
    innerGrad.addColorStop(0, '#42166B');
    innerGrad.addColorStop(1, '#120726');
    ctx.fillStyle = innerGrad;
    ctx.fillRect(0, 0, width, height);

    drawCanvasMandala(ctx, width / 2, 495, 260, '#FFD700', 0.25);
    drawCanvasDiya(ctx, width / 2, 480, 2.2);

    ctx.fillStyle = '#FFF4DC';
    ctx.textAlign = 'center';
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Upload Your Photo to Customize Frame', width / 2, 650);
  }
  ctx.restore();

  // 3. Draw Ornate Frame Aperture Stroke
  ctx.save();
  definePhotoAperture();
  ctx.strokeStyle = cfg.accent;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(255, 215, 0, 0.55)';
  ctx.shadowBlur = 22;
  ctx.stroke();

  ctx.strokeStyle = cfg.trim;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 4. Frame-Specific Decorative Overlays (Marigold Toran / Shubh Labh / Jewels)
  if (frameId === 'frame-marigold-toran' || frameId === 'frame-royal-arch') {
    ctx.save();
    for (let x = 140; x <= width - 140; x += 55) {
      ctx.fillStyle = x % 110 === 0 ? '#FF8C00' : '#FFD700';
      ctx.beginPath();
      ctx.arc(x, 120, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF4DC';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (frameId === 'frame-shubh-labh') {
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.font = '700 34px "Noto Sans Devanagari", serif';
    ctx.textAlign = 'left';
    ctx.fillText('शुभ', 85, 220);
    ctx.textAlign = 'right';
    ctx.fillText('लाभ', width - 85, 220);
    ctx.restore();
  }

  // 5. Optional Outer Festive Border
  if (showFestiveBorder) {
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.strokeStyle = 'rgba(255, 244, 220, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, width - 104, height - 104);
    ctx.restore();
  }

  // 6. Greeting Banner & Subtitle at Bottom
  ctx.save();
  ctx.fillStyle = 'rgba(13, 6, 24, 0.85)';
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(180, 865, width - 360, 135, 28)
    : ctx.rect(180, 865, width - 360, 135);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
  ctx.shadowBlur = 14;
  ctx.font = '700 44px "Cinzel Decorative", "Noto Sans Devanagari", serif';
  ctx.fillText(greetingText || 'Shubh Deepavali 🪔', width / 2, 928);

  ctx.fillStyle = '#FFF4DC';
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subText || 'Warm Wishes & Endless Prosperity', width / 2, 974);
  ctx.restore();

  // 7. Optional Decorative Corner Diyas
  if (showCornerDiyas) {
    drawCanvasDiya(ctx, 118, 935, 1.15);
    drawCanvasDiya(ctx, width - 118, 935, 1.15);
  }
}


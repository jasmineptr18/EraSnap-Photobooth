import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Camera, ArrowRight, Sparkles, Heart, Check, Download,
  ChevronLeft, RotateCcw, X, Wand2, Sticker, Trash2, Sliders, Mail, QrCode
} from 'lucide-react';
import './style.css';

const N8N_WEBHOOK_URL = 'https://flashing-governments-mounts-must.trycloudflare.com/webhook/erasnap-photobooth';

const FRAMES = [
  ['debut', 'Debut · Country Bloom', 'Mint · vintage country', '✿', '#B8D5C2', '#496A58', '#F4F0E3'],
  ['fearless', 'Fearless · Golden Hour', 'Gold · fairytale glow', '✦', '#E5C56F', '#7B5727', '#FFF4D4'],
  ['speak-now', 'Speak Now · Enchanted', 'Lavender · storybook', '✧', '#B9A3E8', '#594778', '#F2EAFF'],
  ['red', 'Red · Autumn Letter', 'Red · handwritten nostalgia', '♥', '#B8494B', '#6D292E', '#F5E4D9'],
  ['1989', '1989 · Polaroid Summer', 'Sky blue · analog pop', '✈', '#83B9E8', '#27527B', '#EAF5FF'],
  ['reputation', 'Reputation · Night Lights', 'Black · silver stardust', '★', '#414149', '#E2E0E8', '#F1F0F2'],
  ['lover', 'Lover · Pastel Daydream', 'Pink · dreamy romance', '♡', '#F2A9C2', '#A54D70', '#FFF0F5'],
  ['folklore', 'folklore · Cabin Story', 'Ivory · quiet woods', '❧', '#B6B29E', '#555443', '#F3F0E7'],
  ['evermore', 'evermore · Amber Leaves', 'Rust · autumn folklore', '❋', '#B9764E', '#70462E', '#F8E7D5'],
  ['midnights', 'Midnights · Midnight Sky', 'Navy · celestial shimmer', '☾', '#4B4D83', '#292947', '#E9E8FF'],
  ['ttpd', 'TTPD · Typewriter Poetry', 'Cream · ink & parchment', '✒', '#D7CBB7', '#5A4E43', '#F5F0E7'],
  ['1989-vault', '1989 · Blue Hour', 'Cobalt · dreamy skies', '☁', '#5794CD', '#234B76', '#E4F2FF'],
  ['red-tv', 'Red · Burnt Polaroid', 'Brick · scrapbook red', '♦', '#C76A55', '#713B34', '#F9E8D9'],
  ['speak-now-tv', 'Speak Now · Violet Haze', 'Plum · enchanted night', '✹', '#8B70B1', '#49345F', '#F0E8FA'],
  ['fearless-tv', 'Fearless · Champagne Spark', 'Champagne · golden sparkle', '✧', '#D3B77A', '#725A2B', '#FFF5D9']
];

const FILTERS = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'soft-glow', name: 'Soft Glow', css: 'brightness(1.08) contrast(0.95) saturate(1.12)' },
  { id: 'vintage', name: 'Vintage 89', css: 'sepia(0.28) contrast(1.06) brightness(1.03) saturate(0.9)' },
  { id: 'golden', name: 'Golden Hour', css: 'sepia(0.22) saturate(1.35) brightness(1.06) hue-rotate(-8deg)' },
  { id: 'dreamy', name: 'Dreamy Pink', css: 'brightness(1.07) saturate(1.2) hue-rotate(335deg) contrast(0.96)' },
  { id: 'film-bw', name: 'Reputation B&W', css: 'grayscale(1) contrast(1.2) brightness(1.02)' },
  { id: 'cool-mist', name: 'Midnight Cool', css: 'saturate(0.85) contrast(1.08) brightness(0.98) hue-rotate(12deg)' },
  { id: 'warm-sepia', name: 'Folklore Sepia', css: 'sepia(0.45) contrast(1.04) brightness(1.02)' }
];

const STICKERS = [
  '✿', '✦', '✧', '♥', '♡', '★', '☾', '☁', '✈', '✒',
  '🎀', '🦋', '✨', '🌸', '🍓', '💿', '🪩', '💌', '🧸', '👑',
  '🫶', '💋', '🌷', '⭐', '🎶', '📸', '🍒', '🫧'
];

const frameFor = id => FRAMES.find(frame => frame[0] === id) || FRAMES[4];

const FRAME_LAYOUTS = {
  debut: 'grid', fearless: 'vertical', 'speak-now': 'polaroid', red: 'title',
  '1989': 'postcard', reputation: 'film', lover: 'polaroid', folklore: 'grid',
  evermore: 'vertical', midnights: 'grid', ttpd: 'editorial',
  '1989-vault': 'postcard', 'red-tv': 'title', 'speak-now-tv': 'polaroid', 'fearless-tv': 'vertical'
};
const frameLayout = id => FRAME_LAYOUTS[id] || 'vertical';

const FRAME_ORIENTATIONS = {
  debut: 'horizontal', fearless: 'vertical', 'speak-now': 'vertical', red: 'vertical',
  '1989': 'vertical', reputation: 'horizontal', lover: 'vertical', folklore: 'vertical',
  evermore: 'horizontal', midnights: 'horizontal', ttpd: 'vertical',
  '1989-vault': 'vertical', 'red-tv': 'vertical', 'speak-now-tv': 'vertical', 'fearless-tv': 'horizontal'
};
const frameOrientation = id => FRAME_ORIENTATIONS[id] || 'vertical';

const FRAME_PHOTO_COUNTS = {
  debut: 4, fearless: 3, 'speak-now': 4, red: 4, '1989': 4, reputation: 4,
  lover: 3, folklore: 6, evermore: 3, midnights: 4, ttpd: 4,
  '1989-vault': 4, 'red-tv': 4, 'speak-now-tv': 3, 'fearless-tv': 3
};
const framePhotoCount = id => FRAME_PHOTO_COUNTS[id] || 4;
const orientationClass = id => `orientation-${frameOrientation(id)}`;
const hasTitlePanel = id => ['title', 'postcard', 'editorial'].includes(frameLayout(id));
const slotLayoutClass = id => `layout-${frameLayout(id)}`;
const filterFor = id => FILTERS.find(f => f.id === id) || FILTERS[0];

function PhotoStripPreview({ photos, theme, filterCss = 'none', stickers = [], selectedStickerId, onSelectSticker, onMoveSticker }) {
  const frame = frameFor(theme);
  const layout = frameLayout(theme);
  const titlePanel = hasTitlePanel(theme);
  const horizontal = frameOrientation(theme) === 'horizontal';
  const photoCount = framePhotoCount(theme);
  const sheetRef = useRef(null);
  const draggingRef = useRef(null);

  const handlePointerDown = (e, sticker) => {
    e.stopPropagation();
    if (onSelectSticker) onSelectSticker(sticker.id);
    if (!sheetRef.current || !onMoveSticker) return;
    const rect = sheetRef.current.getBoundingClientRect();
    draggingRef.current = {
      id: sticker.id,
      rect,
      offsetX: e.clientX - (rect.left + (sticker.x / 100) * rect.width),
      offsetY: e.clientY - (rect.top + (sticker.y / 100) * rect.height)
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!draggingRef.current || !onMoveSticker) return;
      const { id, rect, offsetX, offsetY } = draggingRef.current;
      const rawX = ((e.clientX - offsetX - rect.left) / rect.width) * 100;
      const rawY = ((e.clientY - offsetY - rect.top) / rect.height) * 100;
      const x = Math.max(4, Math.min(96, rawX));
      const y = Math.max(3, Math.min(97, rawY));
      onMoveSticker(id, x, y);
    };
    const handlePointerUp = () => {
      draggingRef.current = null;
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onMoveSticker]);

  const shot = i => (
    <div className={'preview-shot photo-' + i} key={i}>
      <img src={photos[i]?.url} alt={'Foto pose ' + (i + 1)} style={{ filter: filterCss }} />
      <i>{frame[3]}</i>
    </div>
  );

  return (
    <div
      ref={sheetRef}
      onClick={() => onSelectSticker && onSelectSticker(null)}
      className={'preview-sheet design-' + theme + ' ' + orientationClass(theme)}
      style={{ '--design-bg': frame[4], '--design-ink': frame[5], '--design-paper': frame[6], '--photo-count': photoCount }}
    >
      {[0, 1].map(strip => (
        <article className={'preview-strip ' + slotLayoutClass(theme) + ' ' + orientationClass(theme) + ' design-strip-' + theme} key={strip}>
          <header>
            <small>ERA SNAP · {String(strip + 1).padStart(2, '0')}</small>
            <strong>{frame[1].split(' · ')[0]}</strong>
            <span>{frame[3]} · {frame[3]} · {frame[3]}</span>
          </header>
          <div className={'preview-photo-layout ' + slotLayoutClass(theme) + ' ' + orientationClass(theme)}>
            {titlePanel ? (
              <>
                {shot(0)}
                {shot(1)}
                <div className={'preview-era-plaque plaque-' + theme}>
                  <small>{theme === '1989' ? 'POSTCARD FROM YOUR ERA' : theme === '1989-vault' ? 'FROM THE VAULT · 1989' : theme === 'red' ? 'A MEMORY IN RED' : theme === 'red-tv' ? 'ALL TOO WELL · THE RED ERA' : 'THE TORTURED POETS DEPARTMENT'}</small>
                  <strong>{theme === '1989' || theme === '1989-vault' ? '1989' : theme === 'red' || theme === 'red-tv' ? 'RED' : 'TTPD'}</strong>
                  <i>{theme === '1989-vault' ? 'VAULT TRACKS · YOUR VERSION' : theme === '1989' ? 'TAYLOR’S VERSION' : theme === 'red-tv' ? 'TAYLOR’S VERSION · 10 MINUTE VERSION' : theme === 'red' ? 'KEEP THE MOMENT' : 'VOL. 13 · YOUR VERSION'}</i>
                </div>
                {shot(2)}
                {shot(3)}
              </>
            ) : (
              <>
                {Array.from({ length: photoCount }, (_, i) => i).map(shot)}
                {!horizontal && (layout === 'grid' || layout === 'film') && (
                  <div className="preview-collage-caption">
                    <small>{frame[1].split(' · ')[0].toUpperCase()} · PHOTO DIARY</small>
                    <strong>YOUR VERSION</strong>
                  </div>
                )}
              </>
            )}
          </div>
          <footer>YOUR VERSION · {frame[0].toUpperCase()}</footer>
        </article>
      ))}

      {stickers.map(s => (
        <div
          key={s.id}
          onPointerDown={e => handlePointerDown(e, s)}
          onClick={e => e.stopPropagation()}
          className={'placed-sticker ' + (selectedStickerId === s.id ? 'selected' : '')}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`
          }}
        >
          {s.emoji}
        </div>
      ))}
    </div>
  );
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

async function renderFinalStripDataUrl({ photos, theme, filterCss, stickers }) {
  const frame = frameFor(theme);
  const bg = frame[4];
  const ink = frame[5];
  const paper = frame[6];
  const layout = frameLayout(theme);
  const titlePanel = hasTitlePanel(theme);
  const photoCount = framePhotoCount(theme);

  const horizontal = frameOrientation(theme) === 'horizontal';
  const W = horizontal ? 1790 : 1100;
  const H = horizontal ? 1100 : (layout === 'grid' || layout === 'film') ? 1320 : 1790;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Outer paper background
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // Dashed inner border
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.restore();

  const loadedPhotos = await Promise.all(photos.map(p => loadImage(p.url)));
  const stripX = horizontal ? [32, 32] : [32, 568];
  const stripY = horizontal ? [28, 568] : [28, 28];
  const stripW = horizontal ? W - 64 : 500;
  const stripH = horizontal ? 504 : H - 56;

  const drawRoundRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const drawAlbumArtwork = (themeId, x, y, w, h, color) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.24;
    ctx.lineWidth = 3;
    if (themeId === 'debut') {
      ctx.setLineDash([5, 9]); ctx.strokeRect(x + 18, y + 18, w - 36, h - 36); ctx.setLineDash([]);
      for (let i = 0; i < 8; i++) { const px = x + 30 + (i % 4) * ((w - 60) / 3); const py = y + 30 + Math.floor(i / 4) * (h - 60); ctx.font = '24px serif'; ctx.fillText('✿', px, py + 8); }
    } else if (themeId === 'fearless' || themeId === 'fearless-tv') {
      ctx.globalAlpha = 0.48; ctx.lineWidth = 5; ctx.strokeRect(x + 13, y + 13, w - 26, h - 26); ctx.lineWidth = 1.5; ctx.strokeRect(x + 24, y + 24, w - 48, h - 48);
      ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.fillText(themeId === 'fearless' ? '✦  ✧  ✦' : '✧  ♡  ✧', x + w / 2, y + h - 24);
    } else if (themeId === 'speak-now' || themeId === 'speak-now-tv') {
      ctx.globalAlpha = 0.28; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + w / 2, y + 22, w * 0.36, Math.PI, 0); ctx.stroke();
      ctx.font = '25px serif'; ctx.textAlign = 'center'; ctx.fillText(themeId === 'speak-now' ? '✧  ✧  ✧' : '❀  ✧  ❀', x + w / 2, y + h - 20);
    } else if (themeId === 'red' || themeId === 'red-tv') {
      ctx.globalAlpha = 0.32; ctx.lineWidth = 5; ctx.strokeRect(x + 18, y + 18, w - 36, h - 36); ctx.font = '26px serif'; ctx.textAlign = 'left'; ctx.fillText(themeId === 'red' ? '♥' : '♦', x + 28, y + 58); ctx.textAlign = 'right'; ctx.fillText(themeId === 'red' ? '♥' : '♦', x + w - 28, y + h - 28);
    } else if (themeId === '1989' || themeId === '1989-vault') {
      ctx.globalAlpha = 0.22; ctx.lineWidth = 2; for (let gx = x + 20; gx < x + w; gx += 34) { ctx.beginPath(); ctx.moveTo(gx, y + 12); ctx.lineTo(gx, y + h - 12); ctx.stroke(); }
      for (let gy = y + 20; gy < y + h; gy += 34) { ctx.beginPath(); ctx.moveTo(x + 12, gy); ctx.lineTo(x + w - 12, gy); ctx.stroke(); }
      ctx.globalAlpha = 0.45; ctx.font = '22px serif'; ctx.textAlign = 'right'; ctx.fillText(themeId === '1989' ? '✈' : '✉', x + w - 22, y + 42);
    } else if (themeId === 'reputation') {
      ctx.globalAlpha = 0.55; ctx.lineWidth = 8; for (let yy = y + 18; yy < y + h - 18; yy += 48) { ctx.fillRect(x + 8, yy, 14, 22); ctx.fillRect(x + w - 22, yy, 14, 22); }
    } else if (themeId === 'lover') {
      ctx.globalAlpha = 0.35; ctx.lineWidth = 3; ctx.strokeRect(x + 16, y + 16, w - 32, h - 32); ctx.font = '26px serif'; ctx.textAlign = 'center'; ctx.fillText('♡  ♡  ♡', x + w / 2, y + h - 22);
    } else if (themeId === 'folklore') {
      ctx.globalAlpha = 0.22; ctx.lineWidth = 2; for (let yy = y + 150; yy < y + h - 30; yy += 28) { ctx.beginPath(); ctx.moveTo(x + 18, yy); ctx.lineTo(x + w - 18, yy); ctx.stroke(); }
      ctx.font = '26px serif'; ctx.textAlign = 'left'; ctx.fillText('❧', x + 22, y + 42); ctx.textAlign = 'right'; ctx.fillText('❧', x + w - 22, y + h - 20);
    } else if (themeId === 'evermore') {
      ctx.globalAlpha = 0.32; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { const bx = x + 25 + k * ((w - 50) / 3); ctx.beginPath(); ctx.moveTo(bx, y + 140); ctx.quadraticCurveTo(bx - 22, y + h / 2, bx + 4, y + h - 130); ctx.stroke(); ctx.font = '22px serif'; ctx.fillText('❧', bx + 4, y + 260); }
    } else if (themeId === 'midnights') {
      ctx.globalAlpha = 0.55; ctx.font = '22px serif'; for (let k = 0; k < 14; k++) { const sx = x + 28 + ((k * 67) % (w - 56)); const sy = y + 34 + ((k * 113) % (h - 68)); ctx.fillText(k % 3 === 0 ? '✦' : '·', sx, sy); }
    } else if (themeId === 'ttpd') {
      ctx.globalAlpha = 0.25; ctx.lineWidth = 1.5; for (let yy = y + 135; yy < y + h - 24; yy += 26) { ctx.beginPath(); ctx.moveTo(x + 18, yy); ctx.lineTo(x + w - 18, yy); ctx.stroke(); }
      ctx.globalAlpha = 0.5; ctx.font = '19px serif'; ctx.textAlign = 'right'; ctx.fillText('✒', x + w - 22, y + 42);
    }
    ctx.restore();
  };

  for (let s = 0; s < 2; s++) {
    const sx = stripX[s];
    const sy = stripY[s];
    ctx.save();
    drawRoundRect(sx, sy, stripW, stripH, 20);
    ctx.fillStyle = layout === 'film' ? '#202026' : bg;
    ctx.fill();
    drawAlbumArtwork(theme, sx, sy, stripW, stripH, ink);

    if (theme === '1989-vault') {
      ctx.save();
      ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.setLineDash([10, 8]);
      ctx.strokeRect(sx + 30, sy + 30, stripW - 60, stripH - 60);
      ctx.setLineDash([]); ctx.fillStyle = ink; ctx.globalAlpha = 0.9;
      ctx.font = '700 20px "DM Sans", sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('FROM THE VAULT', sx + stripW - 38, sy + 78);
      ctx.restore();
    } else if (theme === 'red-tv') {
      ctx.save();
      ctx.fillStyle = '#F9E8D9'; ctx.fillRect(sx + 10, sy + 10, stripW - 20, 82);
      ctx.strokeStyle = '#713B34'; ctx.lineWidth = 3; ctx.strokeRect(sx + 10, sy + 10, stripW - 20, 82);
      ctx.fillStyle = '#713B34'; ctx.textAlign = 'center';
      ctx.font = '800 22px "DM Sans", sans-serif';
      ctx.fillText('ALL TOO WELL · TAYLOR’S VERSION', sx + stripW / 2, sy + 43);
      ctx.font = '600 13px "DM Sans", sans-serif';
      ctx.fillText('THE RED ERA · A MEMORY IN MOTION', sx + stripW / 2, sy + 69);
      ctx.restore();
    } else if (theme === 'speak-now-tv') {
      ctx.save();
      ctx.strokeStyle = '#49345F'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(sx + stripW / 2, sy + 32, Math.min(stripW * 0.38, 190), Math.PI, 0); ctx.stroke();
      ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.fillStyle = ink;
      ctx.fillText('✧  ❀  ✧  ❀  ✧', sx + stripW / 2, sy + stripH - 54);
      ctx.restore();
    } else if (theme === 'fearless-tv') {
      ctx.save();
      ctx.strokeStyle = '#A9853D'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx + 28, sy + 105); ctx.lineTo(sx + stripW - 28, sy + 105); ctx.stroke();
      ctx.fillStyle = '#725A2B'; ctx.font = '700 13px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('✧  THE FEARLESS EDITION  ✧', sx + stripW / 2, sy + 101);
      ctx.restore();
    }

    if (layout === 'postcard') {
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.58; ctx.lineWidth = 3;
      ctx.strokeRect(sx + 12, sy + 12, stripW - 24, stripH - 24);
      ctx.setLineDash([7, 8]); ctx.strokeRect(sx + 23, sy + 23, stripW - 46, stripH - 46);
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    } else if (layout === 'film') {
      ctx.fillStyle = '#E7E4DF';
      for (let y = sy + 18; y < sy + stripH - 18; y += 52) {
        ctx.fillRect(sx + 7, y, 12, 24);
        ctx.fillRect(sx + stripW - 19, y, 12, 24);
      }
    } else if (layout === 'editorial') {
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.globalAlpha = 0.35;
      for (let y = sy + 130; y < sy + stripH - 50; y += 34) {
        ctx.beginPath(); ctx.moveTo(sx + 14, y); ctx.lineTo(sx + stripW - 14, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.font = '800 16px "DM Sans", sans-serif';
    ctx.fillText(`ERA SNAP · 0${s + 1}`, sx + stripW / 2, sy + (horizontal ? 25 : 42));

    ctx.font = '700 34px "Playfair Display", Georgia, serif';
    ctx.fillText(frame[1].split(' · ')[0], sx + stripW / 2, sy + (horizontal ? 60 : 82));

    ctx.font = '600 18px sans-serif';
    ctx.fillText(`${frame[3]}  ·  ${frame[3]}  ·  ${frame[3]}`, sx + stripW / 2, sy + (horizontal ? 91 : 112));

    const photoBoxX = sx + 22;
    const photoBoxW = stripW - 44;
    const slots = horizontal
      ? (() => {
          const gap = 14;
          const slotW = (photoBoxW - gap * (photoCount - 1)) / photoCount;
          const slotH = slotW / 1.62;
          const top = sy + 110 + (360 - slotH) / 2;
          return Array.from({ length: photoCount }, (_, i) => ({
            x: photoBoxX + i * (slotW + gap), top, w: slotW, h: slotH
          }));
        })()
      : layout === 'grid' || layout === 'film'
        ? (() => {
            const columns = 2;
            const rows = Math.ceil(photoCount / columns);
            const gapX = 18;
            const gapY = rows === 3 ? 18 : 30;
            const slotW = (photoBoxW - gapX) / columns;
            const slotH = rows === 3 ? 235 : 350;
            const topStart = rows === 3 ? sy + 130 : sy + 190;
            return Array.from({ length: photoCount }, (_, i) => ({
              x: photoBoxX + (i % columns) * (slotW + gapX),
              top: topStart + Math.floor(i / columns) * (slotH + gapY),
              w: slotW, h: slotH
            }));
          })()
        : titlePanel
          ? [
              { x: photoBoxX, top: sy + 136, w: photoBoxW, h: 274 },
              { x: photoBoxX, top: sy + 428, w: photoBoxW, h: 274 },
              { x: photoBoxX, top: sy + 986, w: photoBoxW, h: 274 },
              { x: photoBoxX, top: sy + 1278, w: photoBoxW, h: 274 }
            ]
          : (() => {
              const slotH = photoCount === 3 ? 430 : 332;
              const gap = photoCount === 3 ? 34 : 24;
              const topStart = photoCount === 3 ? sy + 150 : sy + 136;
              return Array.from({ length: photoCount }, (_, i) => ({
                x: photoBoxX, top: topStart + i * (slotH + gap), w: photoBoxW, h: slotH
              }));
            })();

    slots.forEach((slot, idx) => {
      ctx.save();
      ctx.fillStyle = paper;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4;
      const r = ['lover', 'speak-now', 'speak-now-tv', 'debut'].includes(theme) ? 26 : layout === 'polaroid' ? 12 : 3;
      const slotX = slot.x;
      const slotW = slot.w;
      drawRoundRect(slotX, slot.top, slotW, slot.h, r);
      ctx.fill();
      if (theme === 'fearless' || theme === 'fearless-tv' || theme === 'speak-now-tv') {
        ctx.lineWidth = 7; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = ink;
        drawRoundRect(slotX + 7, slot.top + 7, slotW - 14, slot.h - 14, Math.max(0, r - 5)); ctx.stroke();
      } else if (theme === 'red' || theme === 'red-tv') {
        ctx.setLineDash(theme === 'red' ? [9, 6] : [2, 5]); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
      } else if (theme === 'lover') {
        ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#FFFFFF';
        drawRoundRect(slotX + 5, slot.top + 5, slotW - 10, slot.h - 10, Math.max(0, r - 3)); ctx.stroke();
      } else {
        ctx.lineWidth = theme === '1989' ? 7 : theme === 'reputation' ? 5 : 3; ctx.stroke();
      }

      const pad = layout === 'polaroid' ? 14 : 10;
      const ix = slotX + pad;
      const iy = slot.top + pad;
      const iw = slotW - pad * 2;
      const ih = slot.h - pad * 2;

      ctx.save();
      drawRoundRect(ix, iy, iw, ih, Math.max(0, r - 4));
      ctx.clip();
      const photoEffects = [filterCss && filterCss !== 'none' ? filterCss : '', layout === 'film' ? 'grayscale(1) contrast(1.16)' : layout === 'editorial' ? 'sepia(.18)' : ''].filter(Boolean);
      ctx.filter = photoEffects.join(' ') || 'none';

      const img = loadedPhotos[idx];
      const imgRatio = img.width / img.height;
      const boxRatio = iw / ih;
      let drawW = iw, drawH = ih, offsetX = 0, offsetY = 0;
      if (imgRatio > boxRatio) {
        drawW = ih * imgRatio;
        offsetX = -(drawW - iw) / 2;
      } else {
        drawH = iw / imgRatio;
        offsetY = -(drawH - ih) / 2;
      }
      ctx.drawImage(img, ix + offsetX, iy + offsetY, drawW, drawH);
      ctx.restore();

      ctx.fillStyle = paper;
      ctx.fillRect(ix + iw - 34, iy + ih - 30, 30, 26);
      ctx.fillStyle = ink;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frame[3], ix + iw - 19, iy + ih - 11);
      ctx.restore();
    });

    if (!horizontal && (layout === 'grid' || layout === 'film')) {
      const pTop = sy + (photoCount > 4 ? 920 : 980);
      const pH = photoCount > 4 ? 150 : 190;
      ctx.save();
      ctx.fillStyle = paper; ctx.strokeStyle = ink; ctx.lineWidth = 3;
      ctx.fillRect(photoBoxX, pTop, photoBoxW, pH); ctx.strokeRect(photoBoxX, pTop, photoBoxW, pH);
      ctx.fillStyle = ink; ctx.textAlign = 'center';
      ctx.font = '800 17px "DM Sans", sans-serif';
      ctx.fillText(`${frame[1].split(' · ')[0].toUpperCase()} · PHOTO DIARY`, sx + stripW / 2, pTop + 65);
      ctx.font = '700 38px "Playfair Display", Georgia, serif';
      ctx.fillText('YOUR VERSION', sx + stripW / 2, pTop + 125);
      ctx.restore();
    }

    if (!horizontal && titlePanel) {
      const pTop = sy + 722;
      const pH = 244;
      ctx.save();
      ctx.fillStyle = paper;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4;
      ctx.fillRect(photoBoxX, pTop, photoBoxW, pH);
      ctx.strokeRect(photoBoxX, pTop, photoBoxW, pH);

      ctx.fillStyle = ink;
      ctx.textAlign = 'center';
      ctx.font = '800 15px "DM Sans", sans-serif';
      ctx.fillText(
        theme === '1989' ? 'POSTCARD FROM YOUR ERA' : theme === '1989-vault' ? 'FROM THE VAULT · 1989' : theme === 'red' ? 'A MEMORY IN RED' : theme === 'red-tv' ? 'ALL TOO WELL · THE RED ERA' : 'THE TORTURED POETS DEPARTMENT',
        sx + stripW / 2,
        pTop + 48
      );
      ctx.font = theme === 'ttpd' ? '700 32px "Playfair Display", Georgia, serif' : '700 68px "Playfair Display", Georgia, serif';
      ctx.fillText(
        theme === '1989' || theme === '1989-vault' ? '1989' : theme === 'red' || theme === 'red-tv' ? 'RED' : 'TTPD',
        sx + stripW / 2,
        pTop + 145
      );
      ctx.font = '700 15px "DM Sans", sans-serif';
      ctx.fillText(
        theme === '1989-vault' ? 'VAULT TRACKS · YOUR VERSION' : theme === '1989' ? 'TAYLOR’S VERSION' : theme === 'red-tv' ? 'TAYLOR’S VERSION · 10 MINUTE VERSION' : theme === 'red' ? 'KEEP THE MOMENT' : 'VOL. 13 · YOUR VERSION',
        sx + stripW / 2,
        pTop + 202
      );
      ctx.restore();
    }

    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.font = '800 17px "DM Sans", sans-serif';
    ctx.fillText(`YOUR VERSION · ${frame[0].toUpperCase()}`, sx + stripW / 2, sy + stripH - (horizontal ? 18 : 34));
    ctx.restore();
  }

  stickers.forEach(st => {
    const px = (st.x / 100) * W;
    const py = (st.y / 100) * H;
    const fontSize = Math.round(st.size * (W / (horizontal ? 650 : 430)));
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((st.rotate * Math.PI) / 180);
    ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.emoji, 0, 0);
    ctx.restore();
  });

  return canvas.toDataURL('image/jpeg', 0.90);
}

function App() {
  const [theme, setTheme] = useState('1989');
  const [page, setPage] = useState('home'); // 'home' | 'camera' | 'edit' | 'done'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [replaceAt, setReplaceAt] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [stickers, setStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [finalImageUrl, setFinalImageUrl] = useState('');

  // State untuk Email Delivery & QR Code
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (page !== 'camera') {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraActive(false);
      return;
    }
    let cancelled = false;
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (cancelled) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = s;
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch {
        setError('Kamera tidak dapat diakses. Pastikan izin kamera di browser sudah diaktifkan.');
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraActive(false);
    };
  }, [page]);

  useEffect(() => {
    if (videoRef.current && streamRef.current && page === 'camera') {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [page, cameraActive]);

  const startCameraDirect = (chosenTheme) => {
    if (chosenTheme) setTheme(chosenTheme);
    setError('');
    setPage('camera');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectEditorFrame = (nextTheme) => {
    setTheme(nextTheme);
    const required = framePhotoCount(nextTheme);
    if (photos.length > required) {
      photos.slice(required).forEach(photo => URL.revokeObjectURL(photo.url));
      setPhotos(photos.slice(0, required));
    } else if (photos.length < required) {
      setReplaceAt(null);
      setPage('camera');
    }
  };

  const capture = async () => {
    if (!videoRef.current || !cameraActive || countdown !== null || busy) return;
    setBusy(true);
    setError('');
    try {
      for (let t = 3; t >= 1; t--) {
        setCountdown(t);
        await sleep(800);
      }
      setCountdown('♥');
      await sleep(250);

      const v = videoRef.current;
      const sourceWidth = v.videoWidth || v.clientWidth;
      const sourceHeight = v.videoHeight || v.clientHeight;
      if (!sourceWidth || !sourceHeight) {
        throw new Error('Kamera belum siap. Coba tunggu sebentar lalu ambil foto lagi.');
      }
      const maxCaptureSize = 1600;
      const scale = Math.min(1, maxCaptureSize / Math.max(sourceWidth, sourceHeight));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(sourceWidth * scale));
      c.height = Math.max(1, Math.round(sourceHeight * scale));
      const ctx = c.getContext('2d');
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, 0, 0, c.width, c.height);

      const blob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('Gagal mengambil gambar');
      const preview = URL.createObjectURL(blob);

      setPhotos(p => {
        const next = [...p];
        if (replaceAt !== null) {
          if (next[replaceAt]) URL.revokeObjectURL(next[replaceAt].url);
          next[replaceAt] = { blob, url: preview };
        } else {
          next.push({ blob, url: preview });
        }
        return next;
      });

      if (replaceAt !== null) {
        setReplaceAt(null);
        setPage('edit');
      } else if (photos.length + 1 >= framePhotoCount(theme)) {
        setPage('edit');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setCountdown(null);
    }
  };

  const redoSingle = (i) => {
    setReplaceAt(i);
    setPage('camera');
  };

  const retakeAll = () => {
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setReplaceAt(null);
    setStickers([]);
    setSelectedStickerId(null);
    setSelectedFilter('none');
    setPage('camera');
  };

  const addSticker = (emoji) => {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const offset = (stickers.length % 5) * 4;
    const newSticker = {
      id,
      emoji,
      x: 45 + offset,
      y: 45 + offset,
      size: 28,
      rotate: 0
    };
    setStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(id);
  };

  const moveSticker = (id, x, y) => {
    setStickers(prev => prev.map(s => (s.id === id ? { ...s, x, y } : s)));
  };

  const updateSelectedSticker = (patch) => {
    if (!selectedStickerId) return;
    setStickers(prev => prev.map(s => (s.id === selectedStickerId ? { ...s, ...patch } : s)));
  };

  const removeSelectedSticker = () => {
    if (!selectedStickerId) return;
    setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  const finishAndRender = async () => {
    if (photos.length !== framePhotoCount(theme)) return;
    setBusy(true);
    setError('');
    setQrCodeUrl('');
    setDriveLink('');
    setEmailSentSuccess(false);
    try {
      const dataUrl = await renderFinalStripDataUrl({
        photos,
        theme,
        filterCss: filterFor(selectedFilter).css,
        stickers
      });
      setFinalImageUrl(dataUrl);
      setPage('done');
    } catch {
      setError('Gagal memproses hasil photostrip.');
    } finally {
      setBusy(false);
    }
  };

  const sendToEmailAndGetQr = async (e) => {
    e.preventDefault();
    if (!email.trim() || !finalImageUrl || sendingEmail) return;
    setSendingEmail(true);
    setError('');
    try {
      const base64Data = finalImageUrl.split(',')[1];
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          theme,
          imageBase64: base64Data
        })
      });
      if (!res.ok) {
        throw new Error(`Gagal mengirim ke server n8n (HTTP ${res.status})`);
      }
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error('Respons server n8n bukan JSON yang valid.');
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Respons server n8n memiliki format yang tidak valid.');
      }
      if (data.success === false || data.error) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Server n8n gagal mengirim foto ke Gmail.'
        );
      }

      const finalDriveUrl =
        (typeof data.driveUrl === 'string' && data.driveUrl) ||
        (typeof data.webViewLink === 'string' && data.webViewLink) ||
        '';
      const generatedQr =
        (typeof data.qrUrl === 'string' && data.qrUrl) ||
        (finalDriveUrl
          ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(finalDriveUrl)}`
          : '');

      setDriveLink(finalDriveUrl);
      setQrCodeUrl(generatedQr);
      setEmailSentSuccess(true);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengirim ke Gmail. Pastikan Cloudflare Tunnel & n8n aktif.');
    } finally {
      setSendingEmail(false);
    }
  };

  const downloadFinal = () => {
    if (!finalImageUrl) return;
    const a = document.createElement('a');
    a.href = finalImageUrl;
    a.download = `era-snap-${theme}-${Date.now()}.jpg`;
    a.click();
  };

  const resetAll = () => {
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setReplaceAt(null);
    setStickers([]);
    setSelectedStickerId(null);
    setSelectedFilter('none');
    setFinalImageUrl('');
    setEmail('');
    setQrCodeUrl('');
    setDriveLink('');
    setEmailSentSuccess(false);
    setError('');
    setPage('home');
  };

  const stepIndex = ['home', 'camera', 'edit', 'done'].indexOf(page);
  const activeSticker = stickers.find(s => s.id === selectedStickerId);

  return (
    <div className={'app era-' + theme}>
      <header className="nav wrap">
        <button className="wordmark" onClick={resetAll}>
          <span className="brandflower">✿</span> Era <span>Snap</span>
          <small>PHOTOBOOTH</small>
        </button>
        <nav>
          <a href="#how" onClick={e => { if (page !== 'home') { e.preventDefault(); resetAll(); } }}>Cara Kerja</a>
          <a href="#themes" onClick={e => { if (page !== 'home') { e.preventDefault(); resetAll(); } }}>Pilih Frame</a>
          <button className="nav-event" onClick={() => startCameraDirect()}>
            Start Camera <Camera size={15} />
          </button>
        </nav>
      </header>

      {page !== 'home' && (
        <div className="wizard wrap">
          <button
            className="back-btn"
            onClick={() => {
              if (page === 'camera') resetAll();
              else if (page === 'edit') setPage('camera');
              else if (page === 'done') setPage('edit');
            }}
          >
            <ChevronLeft size={17} />
            {page === 'camera' ? 'Beranda' : page === 'edit' ? 'Kamera' : 'Kembali Edit'}
          </button>
          <div className="steps">
            {['Pilih Era', 'Selfie', 'Frame & Edit', 'Simpan & QR'].map((label, i) => (
              <span key={label} className={stepIndex >= i ? 'active' : ''}>
                <b>{i + 1}</b>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {page === 'home' && (
        <main>
          <section className="hero wrap">
            <div className="hero-text">
              <span className="eyebrow">
                <span className="red-dot" /> ERA SNAP · FREE INSTANT PHOTOBOOTH
              </span>
              <h1>
                Pilih era Taylor Swift,<br />
                <em>versimu sendiri.</em>
                <span className="sparkle-inline">✳</span>
              </h1>
              <p>
                Langsung buka kamera, ambil 3–6 pose sesuai desain frame, pilih 15 era album favoritmu, lalu kirim ke Gmail &amp; dapatkan QR Code!
              </p>
              <div className="hero-cta">
                <button className="btn primary" onClick={() => startCameraDirect()}>
                  Start Photobooth <Camera size={18} />
                </button>
                <a className="btn outline" href="#themes">
                  Lihat 15 Frame <Sparkles size={16} />
                </a>
              </div>
              <div className="social-proof">
                <div className="mini-stars">★★★★★</div>
                <span>gratis tanpa payment · kirim Gmail &amp; QR Code instan</span>
              </div>
            </div>
            <div className="hero-backdrop-art" aria-hidden="true" />
          </section>

          <section className="features wrap" id="how">
            {[
              [<Camera size={23} />, '1. Klik Start & Selfie', 'Jumlah pose menyesuaikan desain frame, dan setiap foto bisa di-retake'],
              [<Sparkles size={23} />, '2. Pilih Frame Era', '15 template photostrip estetik siap dipilih kapan saja'],
              [<QrCode size={23} />, '3. Kirim Gmail & Scan QR', 'Masukkan alamat Gmailmu untuk menerima softfile & QR Code download']
            ].map(([icon, title, description]) => (
              <div className="feature" key={title}>
                <div className="feature-icon">{icon}</div>
                <div>
                  <b>{title}</b>
                  <span>{description}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="choose wrap" id="themes">
            <div className="section-kicker">♡ THE ERAS FRAME COLLECTION</div>
            <h2>Pilih <em>era</em> favoritmu.</h2>
            <p>Klik salah satu frame di bawah untuk langsung mulai foto, atau ganti frame nanti setelah selfie.</p>
            <div className="frame-grid">
              {FRAMES.map(([id, name, mood, icon, bg, ink, paper], i) => (
                <button
                  key={id}
                  style={{ '--frame-bg': bg, '--frame-ink': ink, '--frame-paper': paper }}
                  className={'frame-card ' + (theme === id ? 'selected' : '')}
                  onClick={() => setTheme(id)}
                  aria-pressed={theme === id}
                >
                  <div className={'frame-art art-' + id + ' ' + orientationClass(id)}>
                    <div className={'mini-strip ' + slotLayoutClass(id) + ' ' + orientationClass(id)}>
                      <div className="mini-titlebar">
                        <span>{icon}</span>
                        <b>{name.split(' · ')[0]}</b>
                      </div>
                      <div className={'mini-pics ' + slotLayoutClass(id) + ' ' + orientationClass(id)}
                        style={{ '--photo-count': framePhotoCount(id) }}>
                        {hasTitlePanel(id) ? (
                          <>
                            {[0, 1].map(pose => (
                              <div key={pose} className={'mini-pic mini-pic-' + pose}>
                                <i>{icon}</i>
                              </div>
                            ))}
                            <div className={'mini-plaque mini-plaque-' + id}>
                              {id === '1989' || id === '1989-vault' ? '1989' : id === 'red' || id === 'red-tv' ? 'RED' : 'TTPD'}
                            </div>
                            {[2, 3].map(pose => (
                              <div key={pose} className={'mini-pic mini-pic-' + pose}>
                                <i>{icon}</i>
                              </div>
                            ))}
                          </>
                        ) : (
                          Array.from({ length: framePhotoCount(id) }, (_, pose) => pose).map(pose => (
                            <div key={pose} className={'mini-pic mini-pic-' + pose}>
                              <i>{icon}</i>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mini-caption">YOUR VERSION · 2026</div>
                    </div>
                    <span className="frame-art-mark">{icon}</span>
                    <span className="frame-art-index">FRAME {String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="frame-copy">
                    <span>{String(i + 1).padStart(2, '0')} / {mood.split(' · ')[0].toUpperCase()}</span>
                    <h3>{name}</h3>
                    <p>{framePhotoCount(id)} foto · {mood}</p>
                  </div>
                  <span className="frame-check">{theme === id ? <Check size={17} /> : <ArrowRight size={17} />}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              <button className="btn primary" onClick={() => startCameraDirect(theme)}>
                Mulai Foto dengan {frameFor(theme)[1].split(' · ')[0]} <ArrowRight size={18} />
              </button>
            </div>
          </section>
        </main>
      )}

      {page === 'camera' && (
        <main className="camera-layout wrap">
          <div>
            <span className="section-kicker">STEP 01 · SELFIE TIME</span>
            <h2>Say <em>cheese!</em></h2>
            <p>
              {replaceAt !== null
                ? `Mengulang foto ke-${replaceAt + 1}. Siap pose dalam 3 detik!`
                : `Ambil ${framePhotoCount(theme)} pose terbaikmu. Kamera akan menghitung mundur 3 detik setiap kali klik tombol foto.`}
            </p>
            <div className="shot-dots">
              {Array.from({ length: framePhotoCount(theme) }, (_, i) => i).map(i => (
                <span key={i} className={photos[i] ? 'filled' : ''}>
                  {photos[i] ? <Check size={13} /> : i + 1}
                </span>
              ))}
            </div>
            <div className="camera-screen">
              <video ref={videoRef} autoPlay playsInline muted className="live-video" />
              {!cameraActive && <div className="camera-overlay">Menghubungkan kamera…</div>}
              {countdown !== null && <div className="camera-overlay countdown">{countdown}</div>}
              <span className="camera-mark">✦ ERA SNAP CAM · {frameFor(theme)[1].split(' · ')[0].toUpperCase()}</span>
            </div>
            <div className="camera-controls">
              <button onClick={capture} disabled={!cameraActive || busy} className="btn primary">
                <Camera size={19} />
                {replaceAt !== null
                  ? `Ambil Ulang Foto ${replaceAt + 1}`
                  : `Ambil Foto ${Math.min(photos.length + 1, framePhotoCount(theme))} / ${framePhotoCount(theme)}`}
              </button>
              {photos.length === framePhotoCount(theme) && replaceAt === null && (
                <button onClick={() => setPage('edit')} className="btn outline" style={{ marginLeft: 12 }}>
                  Lanjut Pilih Frame &amp; Edit <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>

          <aside className={'film-preview design-' + theme}>
            <h3>Your shots <span>♡</span></h3>
            <div className="film-frames" style={{ '--film-columns': framePhotoCount(theme) === 6 ? 3 : framePhotoCount(theme) }}>
              {Array.from({ length: framePhotoCount(theme) }, (_, i) => i).map(i => (
                <div key={i} className={'film-frame ' + (photos[i] ? 'taken' : 'empty')}>
                  {photos[i] ? (
                    <>
                      <img src={photos[i].url} alt={`Pose ${i + 1}`} />
                      <button title="Retake foto ini" className="redo" onClick={() => redoSingle(i)}>
                        <RotateCcw size={15} />
                      </button>
                    </>
                  ) : (
                    <span>POSE {i + 1}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="film-footer">Era Snap · {frameFor(theme)[1]} <span>✦</span></div>
            {photos.length > 0 && (
              <div className="retake-note">
                <button className="btn bare" style={{ padding: '6px 12px', fontSize: 12 }} onClick={retakeAll}>
                  <RotateCcw size={14} /> Ulangi Semua Foto
                </button>
              </div>
            )}
          </aside>
        </main>
      )}

      {page === 'edit' && (
        <main className="editor-layout wrap">
          <div className="editor-stage">
            <span className="section-kicker">STEP 02 · CUSTOMIZE YOUR STRIP</span>
            <h2>Pilih frame &amp; <em>edit!</em></h2>
            <p>Pilih desain frame, atur filter warna, dan tempelkan stiker (klik &amp; geser stiker di atas photostrip).</p>

            <div className="editor-canvas-wrap">
              <PhotoStripPreview
                photos={photos}
                theme={theme}
                filterCss={filterFor(selectedFilter).css}
                stickers={stickers}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onMoveSticker={moveSticker}
              />
            </div>

            <div className="retake-bar">
              <span>Ingin foto ulang?</span>
              <div className="retake-pills">
                {Array.from({ length: framePhotoCount(theme) }, (_, i) => i).map(i => (
                  <button key={i} className="pill-btn" onClick={() => redoSingle(i)}>
                    <RotateCcw size={13} /> Retake {i + 1}
                  </button>
                ))}
                <button className="pill-btn danger" onClick={retakeAll}>
                  Ulang Semua
                </button>
              </div>
            </div>
          </div>

          <aside className="editor-sidebar">
            <div className="tool-box">
              <div className="tool-title">
                <Sparkles size={16} /> <b>1. Pilih Frame Era</b>
              </div>
              <div className="mini-frame-selector">
                {FRAMES.map(([id, name, , icon, bg, ink, paper]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectEditorFrame(id)}
                    className={'mini-frame-chip ' + (theme === id ? 'active' : '')}
                    style={{ '--chip-bg': bg, '--chip-ink': ink, '--chip-paper': paper }}
                  >
                    <span className="chip-dot">{icon}</span>
                    <span>{name.split(' · ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-box">
              <div className="tool-title">
                <Sliders size={16} /> <b>2. Filter Foto</b>
              </div>
              <div className="filter-grid">
                {FILTERS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={'filter-chip ' + (selectedFilter === f.id ? 'active' : '')}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-box">
              <div className="tool-title">
                <Sticker size={16} /> <b>3. Tambah Stiker</b>
              </div>
              <div className="sticker-palette">
                {STICKERS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="sticker-btn"
                    onClick={() => addSticker(emoji)}
                    title="Klik untuk menambahkan stiker"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {activeSticker && (
                <div className="sticker-controls">
                  <div className="sticker-ctrl-row">
                    <span>Ukuran: <b>{activeSticker.size}px</b></span>
                    <input
                      type="range"
                      min="18"
                      max="64"
                      value={activeSticker.size}
                      onChange={e => updateSelectedSticker({ size: Number(e.target.value) })}
                    />
                  </div>
                  <div className="sticker-ctrl-row">
                    <span>Rotasi: <b>{activeSticker.rotate}°</b></span>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={activeSticker.rotate}
                      onChange={e => updateSelectedSticker({ rotate: Number(e.target.value) })}
                    />
                  </div>
                  <button type="button" className="pill-btn danger wide-center" onClick={removeSelectedSticker}>
                    <Trash2 size={14} /> Hapus Stiker Ini
                  </button>
                </div>
              )}
              {stickers.length > 0 && !activeSticker && (
                <small className="fine-print">Klik stiker pada strip untuk geser, ubah ukuran, atau hapus.</small>
              )}
            </div>

            <button className="btn primary wide" disabled={busy} onClick={finishAndRender}>
              {busy ? 'Menyusun Photostrip…' : 'Selesai & Lihat Hasil'} <ArrowRight size={18} />
            </button>
          </aside>
        </main>
      )}

      {page === 'done' && (
        <main className="wizard-main wrap">
          <div className="panel center-panel">
            <div className="success-bloom">✿</div>
            <span className="section-kicker">YAY, IT'S ALL YOURS!</span>
            <h2>Forever starts <em>here.</em></h2>
            <p>Photostrip kamu sudah jadi! Masukkan alamat Gmailmu untuk menerima softfile &amp; memunculkan QR Code unduhan.</p>

            {finalImageUrl && (
              <div className="final-strip-box">
                <img src={finalImageUrl} alt="Hasil Photostrip Era Snap" />
              </div>
            )}

            {!emailSentSuccess ? (
              <form
                onSubmit={sendToEmailAndGetQr}
                style={{
                  marginTop: 22,
                  padding: 18,
                  background: '#FAF7FF',
                  borderRadius: 18,
                  border: '1px solid #E6DCF2',
                  textAlign: 'left'
                }}
              >
                <label style={{ marginBottom: 10 }}>
                  Alamat Gmail Tujuan
                  <input
                    type="email"
                    required
                    placeholder="contoh: kamu@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={sendingEmail}
                  />
                </label>
                <button type="submit" className="btn primary wide" disabled={sendingEmail}>
                  <Mail size={17} />
                  {sendingEmail ? 'Mengirim ke Gmail & Membuat QR…' : 'Kirim ke Gmail & Tampilkan QR Code'}
                </button>
              </form>
            ) : (
              <div
                style={{
                  marginTop: 22,
                  padding: 20,
                  background: '#FAF7FF',
                  borderRadius: 18,
                  border: '1px solid #DCD0F0'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3B977D', fontWeight: 800, fontSize: 12, marginBottom: 8 }}>
                  <Check size={15} /> Terkirim ke {email}
                </div>

                {qrCodeUrl ? (
                  <>
                    <p style={{ fontSize: 12, margin: '4px 0 12px', color: '#645C73' }}>
                      Scan QR Code di bawah ini dengan kamera HP untuk mengunduh foto dari Google Drive:
                    </p>
                    <img
                      src={qrCodeUrl}
                      alt="QR Code Download Era Snap"
                      style={{
                        width: 190,
                        height: 190,
                        borderRadius: 14,
                        border: '5px solid #fff',
                        boxShadow: '0 8px 20px #2D1F471A',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </>
                ) : (
                  <p style={{ fontSize: 12, margin: '6px 0', color: '#645C73' }}>
                    Foto sudah diproses dan dikirim ke inbox Gmail kamu!
                  </p>
                )}

                {driveLink && (
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)', textDecoration: 'underline' }}
                    >
                      Buka Link Google Drive Langsung ↗
                    </a>
                  </div>
                )}
              </div>
            )}

            <button className="btn outline wide" onClick={downloadFinal}>
              <Download size={18} /> Download Langsung ke Perangkat
            </button>
            <button className="btn outline wide" onClick={() => setPage('edit')}>
              <Wand2 size={16} /> Edit Frame / Filter / Stiker Lagi
            </button>
            <button className="btn bare" onClick={resetAll}>
              Foto Ulang dari Awal <Heart size={16} />
            </button>
          </div>
        </main>
      )}

      {error && (
        <div className="toast" role="alert">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Tutup">
            <X size={17} />
          </button>
        </div>
      )}

      <footer>
        <div className="wrap footer-inner">
          <div>
            <div className="footer-logo">✦ Era <span>Snap</span></div>
            <p>tiny memories, infinite feelings.</p>
          </div>
          <div>
            Made with ♡ for every version of you.<br />
            <small>© 2026 Era Snap · Instant Web Photobooth</small>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
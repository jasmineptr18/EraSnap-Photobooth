import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Camera, ArrowRight, Sparkles, Heart, Check, Download,
  ChevronLeft, RotateCcw, X, Wand2, Sticker, Trash2, Sliders
} from 'lucide-react';
import './style.css';

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
const filterFor = id => FILTERS.find(f => f.id === id) || FILTERS[0];

function PhotoStripPreview({ photos, theme, filterCss = 'none', stickers = [], selectedStickerId, onSelectSticker, onMoveSticker }) {
  const frame = frameFor(theme);
  const hasTitlePanel = ['1989', 'red', 'ttpd'].includes(theme);
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
      className={'preview-sheet design-' + theme}
      style={{ '--design-bg': frame[4], '--design-ink': frame[5], '--design-paper': frame[6] }}
    >
      {[0, 1].map(strip => (
        <article className="preview-strip" key={strip}>
          <header>
            <small>ERA SNAP · {String(strip + 1).padStart(2, '0')}</small>
            <strong>{frame[1].split(' · ')[0]}</strong>
            <span>{frame[3]} · {frame[3]} · {frame[3]}</span>
          </header>
          {hasTitlePanel ? (
            <>
              {shot(0)}
              {shot(1)}
              <div className={'preview-era-plaque plaque-' + theme}>
                <small>{theme === '1989' ? 'POSTCARD FROM YOUR ERA' : theme === 'red' ? 'A MEMORY IN RED' : 'A PAGE FROM YOUR STORY'}</small>
                <strong>{theme === '1989' ? '1989' : theme === 'red' ? 'RED' : 'THE POETRY DEPT.'}</strong>
                <i>{theme === '1989' ? 'YOUR VERSION' : theme === 'red' ? 'KEEP THE MOMENT' : 'VOL. 13 · YOUR VERSION'}</i>
              </div>
              {shot(2)}
              {shot(3)}
            </>
          ) : (
            [0, 1, 2, 3].map(shot)
          )}
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
  const hasTitlePanel = ['1989', 'red', 'ttpd'].includes(theme);

  const W = 1100;
  const H = 1790;
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
  const stripX = [32, 568];
  const stripW = 500;
  const stripTop = 28;
  const stripH = 1734;

  const drawRoundRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  for (let s = 0; s < 2; s++) {
    const sx = stripX[s];
    ctx.save();
    drawRoundRect(sx, stripTop, stripW, stripH, 20);
    ctx.fillStyle = bg;
    ctx.fill();

    // Header
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.font = '800 16px "DM Sans", sans-serif';
    ctx.fillText(`ERA SNAP · 0${s + 1}`, sx + stripW / 2, stripTop + 42);

    ctx.font = '700 34px "Playfair Display", Georgia, serif';
    ctx.fillText(frame[1].split(' · ')[0], sx + stripW / 2, stripTop + 82);

    ctx.font = '600 18px sans-serif';
    ctx.fillText(`${frame[3]}  ·  ${frame[3]}  ·  ${frame[3]}`, sx + stripW / 2, stripTop + 112);

    const slots = hasTitlePanel
      ? [
          { top: stripTop + 136, h: 274 },
          { top: stripTop + 428, h: 274 },
          { top: stripTop + 986, h: 274 },
          { top: stripTop + 1278, h: 274 }
        ]
      : [0, 1, 2, 3].map(i => ({ top: stripTop + 136 + i * 356, h: 332 }));

    const photoBoxX = sx + 22;
    const photoBoxW = stripW - 44;

    slots.forEach((slot, idx) => {
      // Polaroid / frame card behind photo
      ctx.save();
      ctx.fillStyle = paper;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4;
      const r = ['lover', 'speak-now', 'speak-now-tv', 'debut'].includes(theme) ? 18 : 4;
      drawRoundRect(photoBoxX, slot.top, photoBoxW, slot.h, r);
      ctx.fill();
      ctx.stroke();

      // Clip inner image
      const pad = 10;
      const ix = photoBoxX + pad;
      const iy = slot.top + pad;
      const iw = photoBoxW - pad * 2;
      const ih = slot.h - pad * 2;

      ctx.save();
      drawRoundRect(ix, iy, iw, ih, Math.max(0, r - 4));
      ctx.clip();
      ctx.filter = filterCss || 'none';

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

      // Corner motif badge
      ctx.fillStyle = paper;
      ctx.fillRect(ix + iw - 34, iy + ih - 30, 30, 26);
      ctx.fillStyle = ink;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frame[3], ix + iw - 19, iy + ih - 11);
      ctx.restore();
    });

    if (hasTitlePanel) {
      const pTop = stripTop + 722;
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
        theme === '1989' ? 'POSTCARD FROM YOUR ERA' : theme === 'red' ? 'A MEMORY IN RED' : 'A PAGE FROM YOUR STORY',
        sx + stripW / 2,
        pTop + 48
      );
      ctx.font = theme === 'ttpd' ? '700 32px "Playfair Display", Georgia, serif' : '700 68px "Playfair Display", Georgia, serif';
      ctx.fillText(
        theme === '1989' ? '1989' : theme === 'red' ? 'RED' : 'THE POETRY DEPT.',
        sx + stripW / 2,
        pTop + 145
      );
      ctx.font = '700 15px "DM Sans", sans-serif';
      ctx.fillText(
        theme === '1989' ? 'YOUR VERSION' : theme === 'red' ? 'KEEP THE MOMENT' : 'VOL. 13 · YOUR VERSION',
        sx + stripW / 2,
        pTop + 202
      );
      ctx.restore();
    }

    // Footer
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.font = '800 17px "DM Sans", sans-serif';
    ctx.fillText(`YOUR VERSION · ${frame[0].toUpperCase()}`, sx + stripW / 2, stripTop + stripH - 34);
    ctx.restore();
  }

  // Render user stickers proportionally onto final strip
  stickers.forEach(st => {
    const px = (st.x / 100) * W;
    const py = (st.y / 100) * H;
    const fontSize = Math.round(st.size * (W / 430));
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((st.rotate * Math.PI) / 180);
    ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.emoji, 0, 0);
    ctx.restore();
  });

  return canvas.toDataURL('image/jpeg', 0.94);
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
      const c = document.createElement('canvas');
      c.width = 900;
      c.height = 630;
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
      } else if (photos.length + 1 >= 4) {
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
    if (photos.length !== 4) return;
    setBusy(true);
    setError('');
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
            {['Pilih Era', 'Selfie', 'Frame & Edit', 'Simpan'].map((label, i) => (
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
                Langsung buka kamera, ambil 4 selfie seru, pilih 15 desain frame era album favoritmu, lalu percantik dengan filter dan stiker lucu!
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
                <span>langsung foto · tanpa isi data · gratis unduh</span>
              </div>
            </div>
            <div className="hero-backdrop-art" aria-hidden="true" />
          </section>

          <section className="features wrap" id="how">
            {[
              [<Camera size={23} />, '1. Klik Start & Selfie', 'Langsung buka kamera untuk 4 pose spesial & bisa retake'],
              [<Sparkles size={23} />, '2. Pilih Frame Era', '15 template photostrip estetik siap dipilih kapan saja'],
              [<Wand2 size={23} />, '3. Filter, Stiker & Unduh', 'Edit hasil fotomu dengan filter & stiker lalu simpan langsung']
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
                  <div className={'frame-art art-' + id}>
                    <div className="mini-strip">
                      <div className="mini-titlebar">
                        <span>{icon}</span>
                        <b>{name.split(' · ')[0]}</b>
                      </div>
                      <div className="mini-pics">
                        {['1989', 'red', 'ttpd'].includes(id) ? (
                          <>
                            {[0, 1].map(pose => (
                              <div key={pose} className={'mini-pic mini-pic-' + pose}>
                                <i>{icon}</i>
                              </div>
                            ))}
                            <div className={'mini-plaque mini-plaque-' + id}>
                              {id === '1989' ? '1989' : id === 'red' ? 'RED' : 'THE POETRY DEPT.'}
                            </div>
                            {[2, 3].map(pose => (
                              <div key={pose} className={'mini-pic mini-pic-' + pose}>
                                <i>{icon}</i>
                              </div>
                            ))}
                          </>
                        ) : (
                          [0, 1, 2, 3].map(pose => (
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
                    <p>{mood}</p>
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
                : 'Ambil 4 pose terbaikmu. Kamera akan menghitung mundur 3 detik setiap kali klik tombol foto.'}
            </p>
            <div className="shot-dots">
              {[0, 1, 2, 3].map(i => (
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
                  : `Ambil Foto ${Math.min(photos.length + 1, 4)} / 4`}
              </button>
              {photos.length === 4 && replaceAt === null && (
                <button onClick={() => setPage('edit')} className="btn outline" style={{ marginLeft: 12 }}>
                  Lanjut Pilih Frame & Edit <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>

          <aside className={'film-preview design-' + theme}>
            <h3>Your shots <span>♡</span></h3>
            <div className="film-frames">
              {[0, 1, 2, 3].map(i => (
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
            <h2>Pilih frame & <em>edit!</em></h2>
            <p>Pilih desain frame, atur filter warna, dan tempelkan stiker (klik & geser stiker di atas photostrip).</p>

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
                {[0, 1, 2, 3].map(i => (
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
            {/* 1. Pilih Frame */}
            <div className="tool-box">
              <div className="tool-title">
                <Sparkles size={16} /> <b>1. Pilih Frame Era</b>
              </div>
              <div className="mini-frame-selector">
                {FRAMES.map(([id, name, , icon, bg, ink, paper]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    className={'mini-frame-chip ' + (theme === id ? 'active' : '')}
                    style={{ '--chip-bg': bg, '--chip-ink': ink, '--chip-paper': paper }}
                  >
                    <span className="chip-dot">{icon}</span>
                    <span>{name.split(' · ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pilih Filter */}
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

            {/* 3. Tambah Stiker */}
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
            <p>Photostrip kamu sudah jadi! Simpan hasilnya ke perangkatmu atau kembali edit jika masih ingin mengubah frame/stiker.</p>

            {finalImageUrl && (
              <div className="final-strip-box">
                <img src={finalImageUrl} alt="Hasil Photostrip Era Snap" />
              </div>
            )}

            <button className="btn primary wide" onClick={downloadFinal}>
              <Download size={18} /> Download 2 Strip Foto
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

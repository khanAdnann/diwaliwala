import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  ZoomIn,
  RotateCw,
  Move,
  Download,
  Share2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Cloud,
  Image as ImageIcon,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { renderPhotoFrameCanvas } from '../utils/canvasRenderer';
import { downloadDataUrlAsPng, shareViaWhatsApp } from '../utils/shareUtils';
import {
  trackAnalyticsEvent,
  uploadFestiveCreationOptIn,
  sanitizeUserText,
} from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const SIX_FRAME_TEMPLATES = [
  {
    id: 'frame-royal-arch',
    name: 'Royal Jharokha Arch',
    subtitle: 'Palace Arch & Marigold Toran',
    badge: 'Arch Cutout',
    previewBg: 'from-[#29104A] to-[#160B2D]',
  },
  {
    id: 'frame-mandala-gold',
    name: 'Udaipur Mandala Circle',
    badge: 'Circular Cutout',
    subtitle: 'Crimson Velvet & Gold Zari',
    previewBg: 'from-[#6B0F2B] to-[#3A081E]',
  },
  {
    id: 'frame-marigold-toran',
    name: 'Temple Marigold Garland',
    badge: 'Portrait Cutout',
    subtitle: 'Saffron Blossoms & Diyas',
    previewBg: 'from-[#7C2D12] to-[#2E1105]',
  },
  {
    id: 'frame-lotus-diya',
    name: 'Celestial Octagon Jewel',
    badge: 'Octagon Cutout',
    subtitle: 'Midnight Indigo & Gold Trim',
    previewBg: 'from-[#1E3A8A] to-[#08183A]',
  },
  {
    id: 'frame-imperial-zari',
    name: 'Jaipur Emerald Zari',
    badge: 'Portrait Cutout',
    subtitle: 'Royal Panna & Kundan Border',
    previewBg: 'from-[#0E4B3E] to-[#062822]',
  },
  {
    id: 'frame-shubh-labh',
    name: 'Shubh Labh Heritage',
    badge: 'Circular Cutout',
    subtitle: 'Auspicious Hindi Calligraphy',
    previewBg: 'from-[#4A1259] to-[#240935]',
  },
];

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB limit

export default function PhotoFrameMaker() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const [imageElement, setImageElement] = useState(null);
  const [imageName, setImageName] = useState('');
  const [frameId, setFrameId] = useState(SIX_FRAME_TEMPLATES[0].id);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [showFestiveBorder, setShowFestiveBorder] = useState(true);
  const [showCornerDiyas, setShowCornerDiyas] = useState(true);
  const [greetingText, setGreetingText] = useState('Shubh Deepavali 🪔');
  const [subText, setSubText] = useState('Warm Wishes & Endless Prosperity');
  const [uploadingCloud, setUploadingCloud] = useState(false);
  const [cloudShareUrl, setCloudShareUrl] = useState(null);

  useEffect(() => {
    trackAnalyticsEvent('page_view_photo_frames', '/photo-frames');
  }, []);

  // Re-render photo frame composition whenever state changes
  const redrawComposition = useCallback(() => {
    if (!canvasRef.current) return;
    renderPhotoFrameCanvas(canvasRef.current, {
      imageElement,
      frameId,
      zoom,
      offsetX: offset.x,
      offsetY: offset.y,
      rotation,
      showFestiveBorder,
      showCornerDiyas,
      greetingText: sanitizeUserText(greetingText, 45),
      subText: sanitizeUserText(subText, 65),
    });
  }, [
    imageElement,
    frameId,
    zoom,
    offset,
    rotation,
    showFestiveBorder,
    showCornerDiyas,
    greetingText,
    subText,
  ]);

  useEffect(() => {
    redrawComposition();
  }, [redrawComposition]);

  // Strict Client-Side Image File Validation & Loading
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      addToast({
        title: 'Unsupported Image Format',
        message: 'Please upload a valid JPG, PNG, or WEBP photo.',
        type: 'error',
      });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      addToast({
        title: 'File Too Large (Max 8MB)',
        message: `Selected file is ${(file.size / (1024 * 1024)).toFixed(
          1
        )}MB. Please choose an image under 8MB.`,
        type: 'error',
      });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      addToast({
        title: 'Read Error',
        message: 'Could not read the selected image file. Please try another photo.',
        type: 'error',
      });
    };
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        setImageName(file.name);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
        setCloudShareUrl(null);
        trackAnalyticsEvent('photo_frame_local_upload', '/photo-frames');
        addToast({
          title: 'Photo Loaded Privately! 🛡️',
          message: 'Drag on the canvas to position your photo and use the sliders to zoom or crop.',
          type: 'success',
        });
      };
      img.onerror = () => {
        addToast({
          title: 'Corrupted Image',
          message: 'The selected image file could not be decoded.',
          type: 'error',
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Generate an instant sample festive portrait so users can test without uploading a personal file
  const handleLoadSamplePortrait = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 800;
    offscreen.height = 800;
    const octx = offscreen.getContext('2d');

    const grad = octx.createRadialGradient(400, 350, 40, 400, 400, 520);
    grad.addColorStop(0, '#F59E0B');
    grad.addColorStop(0.5, '#9A3412');
    grad.addColorStop(1, '#1E1B4B');
    octx.fillStyle = grad;
    octx.fillRect(0, 0, 800, 800);

    // Sunburst rays
    octx.strokeStyle = 'rgba(255, 244, 220, 0.22)';
    octx.lineWidth = 4;
    for (let i = 0; i < 24; i += 1) {
      const angle = (Math.PI * 2 * i) / 24;
      octx.beginPath();
      octx.moveTo(400, 360);
      octx.lineTo(400 + Math.cos(angle) * 600, 360 + Math.sin(angle) * 600);
      octx.stroke();
    }

    // Silhouette festive family celebration illustration
    octx.fillStyle = '#FFF4DC';
    octx.font = '700 46px "Cinzel Decorative", serif';
    octx.textAlign = 'center';
    octx.fillText('✨ Festive Family Portrait ✨', 400, 330);
    octx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    octx.fillStyle = '#FFD700';
    octx.fillText('Drag, Zoom & Rotate Me Inside Any Frame!', 400, 390);

    const sampleImg = new Image();
    sampleImg.onload = () => {
      setImageElement(sampleImg);
      setImageName('sample-festive-portrait.png');
      setZoom(1.05);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      addToast({
        title: 'Sample Portrait Loaded! ✨',
        message: 'Try dragging the canvas or switching between all 6 Diwali frames.',
        type: 'festive',
      });
    };
    sampleImg.src = offscreen.toDataURL('image/png');
  };

  // Pointer Drag Handlers on Canvas
  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: Math.max(-360, Math.min(360, clientX - dragStart.x)),
      y: Math.max(-360, Math.min(360, clientY - dragStart.y)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetTransform = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleDownloadFramedPhoto = () => {
    if (!canvasRef.current) return;
    redrawComposition();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    downloadDataUrlAsPng(dataUrl, `diwaliwala-framed-photo-${Date.now()}.png`);
    trackAnalyticsEvent('download_photo_frame', '/photo-frames');

    confetti({
      particleCount: 65,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF8C00', '#FFF4DC'],
    });

    addToast({
      title: 'Framed Photo Downloaded! 🖼️',
      message: 'Your 1080×1080 HD Diwali framed composition has been saved.',
      type: 'festive',
    });
  };

  const handleOptInCloudSave = async () => {
    if (!canvasRef.current) return;
    setUploadingCloud(true);
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'));
      const url = await uploadFestiveCreationOptIn(blob, 'diwali-frame');
      setCloudShareUrl(url);
      addToast({
        title: 'Saved to Cloud Storage! ☁️',
        message: 'Public shareable image link created via Supabase Storage.',
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Cloud Storage Info',
        message: err.message,
        type: 'info',
      });
    } finally {
      setUploadingCloud(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEOHead
        title="Diwali Photo Frame Maker — 6 Royal Frames with Drag, Zoom & Crop"
        description="Upload your photo and frame it with 6 royal Diwali photo frames, marigold garlands, glowing diyas, and custom greetings. 100% client-side privacy."
        path="/photo-frames"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] mb-3">
          <Camera className="w-3.5 h-3.5" />
          <span>100% Client-Side Private Photo Studio</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black gold-gradient-text gold-glow-text">
          Royal Diwali Photo Frame Maker 🖼️
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#FFF4DC]/80">
          Upload your photo, choose from 6 ornate Indian festive frames, drag to position, zoom &amp;
          crop, and download your HD composition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Editor Controls (7 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 glass-card ornate-border rounded-3xl p-6 sm:p-8 space-y-6"
        >
          {/* Privacy Assurance Banner */}
          <div className="p-3.5 rounded-2xl bg-[#0D0618]/85 border border-[#FFD700]/35 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
            <p className="text-xs text-[#FFF4DC]/85 leading-relaxed">
              <strong className="text-[#FFD700]">Privacy First:</strong> Your photos are processed
              100% locally inside your browser. Private photos are never uploaded to Supabase unless
              you explicitly click &ldquo;Opt-In Cloud Link&rdquo;.
            </p>
          </div>

          {/* 1. Upload User Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2.5">
              1. Upload Your Photo (JPG, PNG, WEBP • Max 8MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3.5 px-5 rounded-2xl btn-royal-gold text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{imageName ? `Change Photo (${imageName.slice(0, 18)})` : 'Choose Photo From Device'}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSamplePortrait}
                className="py-3.5 px-5 rounded-2xl btn-festive-outline text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-[#FFD700]" />
                <span>Use Sample Portrait</span>
              </button>
            </div>
          </div>

          {/* 2. Choose from 6 Diwali Frame Templates */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2.5">
              2. Select Royal Diwali Frame (6 Templates)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SIX_FRAME_TEMPLATES.map((tpl) => {
                const isSelected = frameId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFrameId(tpl.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all bg-gradient-to-br ${tpl.previewBg} ${
                      isSelected
                        ? 'border-[#FFD700] ring-2 ring-[#FFD700]/55 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                        : 'border-[#FFD700]/25 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-[#FFD700] mb-1.5">
                      {tpl.badge}
                    </span>
                    <p className="text-xs font-bold text-[#FFF4DC]">{tpl.name}</p>
                    <p className="text-[11px] text-[#FFF4DC]/70 mt-0.5">{tpl.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Zoom, Rotate & Pan Controls */}
          <div className="p-4 rounded-2xl bg-[#0D0618]/70 border border-[#FFD700]/25 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                <Move className="w-4 h-4" />
                <span>3. Zoom, Crop &amp; Position</span>
              </span>
              <button
                type="button"
                onClick={handleResetTransform}
                className="text-xs text-[#FFF4DC]/75 hover:text-[#FFD700] flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Position</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-[#FFF4DC]/85 mb-1">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#FFD700]" /> Zoom Scale
                  </span>
                  <span className="text-[#FFD700] font-bold">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  aria-label="Photo Zoom Scale"
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#FFF4DC]/85 mb-1">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-[#FFD700]" /> Rotation Angle
                  </span>
                  <span className="text-[#FFD700] font-bold">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  aria-label="Photo Rotation Angle"
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#FFF4DC]/65">
              💡 Tip: Drag directly on the preview canvas on the right to pan your photo inside the
              frame!
            </p>
          </div>

          {/* 4. Festive Borders, Diyas & Custom Greeting Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="frame-greeting-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-1.5"
              >
                4. Frame Greeting Headline
              </label>
              <input
                id="frame-greeting-input"
                type="text"
                maxLength={36}
                value={greetingText}
                onChange={(e) => setGreetingText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/40 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label
                htmlFor="frame-subtext-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-1.5"
              >
                5. Subtitle Blessing
              </label>
              <input
                id="frame-subtext-input"
                type="text"
                maxLength={50}
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/40 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          {/* Toggles for Festive Border & Decorative Diyas */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowFestiveBorder((p) => !p)}
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                showFestiveBorder
                  ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#0D0618]/70 border-[#FFD700]/25 text-[#FFF4DC]/65'
              }`}
            >
              {showFestiveBorder ? '✓ Golden Zari Border On' : '+ Add Golden Zari Border'}
            </button>

            <button
              type="button"
              onClick={() => setShowCornerDiyas((p) => !p)}
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                showCornerDiyas
                  ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#0D0618]/70 border-[#FFD700]/25 text-[#FFF4DC]/65'
              }`}
            >
              {showCornerDiyas ? '✓ Corner Diyas On 🪔' : '+ Add Corner Diyas'}
            </button>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Interactive Canvas Preview & Download (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 lg:sticky lg:top-24"
        >
          <div className="glass-card ornate-border rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Frame Canvas (Drag to Pan)</span>
              </span>
              <span className="text-[11px] text-[#FFF4DC]/65">1080 × 1080 PNG</span>
            </div>

            <div
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className={`relative rounded-2xl overflow-hidden border-2 border-[#FFD700]/55 bg-[#0D0618] aspect-square select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block pointer-events-none"
                aria-label="Diwali Framed Photo Canvas"
              />
            </div>

            {/* Export & Share Buttons */}
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleDownloadFramedPhoto}
                className="w-full py-3.5 px-5 rounded-2xl btn-royal-gold text-sm sm:text-base flex items-center justify-center gap-2.5"
              >
                <Download className="w-5 h-5" />
                <span>Download Framed Photo (PNG)</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    trackAnalyticsEvent('whatsapp_share_frame', '/photo-frames');
                    shareViaWhatsApp(
                      `🪔✨ *${greetingText}* — ${subText}${
                        cloudShareUrl ? `\n🖼️ View my framed photo: ${cloudShareUrl}` : ''
                      }\n\n🌟 Create your own Diwali Photo Frame on DiwaliWala: https://diwaliwala.vercel.app/photo-frames`
                    );
                  }}
                  className="py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-[#FFF4DC] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 text-[#25D366]" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  disabled={uploadingCloud}
                  onClick={handleOptInCloudSave}
                  className="py-3 px-4 rounded-xl btn-festive-outline text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  title="Optional: Upload final composition to Supabase Storage"
                >
                  <Cloud className="w-4 h-4 text-[#FFD700]" />
                  <span>{uploadingCloud ? 'Uploading...' : 'Opt-In Cloud Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


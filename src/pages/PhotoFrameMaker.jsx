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
import { soundManager } from '../utils/soundEngine';

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
        soundManager.playDiyaLightSound();
        trackAnalyticsEvent('photo_frame_local_upload', '/photo-frames');
        addToast({
          title: 'Photo Loaded Privately! 🛡️',
          message: 'Drag on the frame preview to position your photo and use sliders below to zoom.',
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

    octx.strokeStyle = 'rgba(255, 244, 220, 0.22)';
    octx.lineWidth = 4;
    for (let i = 0; i < 24; i += 1) {
      const angle = (Math.PI * 2 * i) / 24;
      octx.beginPath();
      octx.moveTo(400, 360);
      octx.lineTo(400 + Math.cos(angle) * 600, 360 + Math.sin(angle) * 600);
      octx.stroke();
    }

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
      soundManager.playDiyaLightSound();
      addToast({
        title: 'Sample Portrait Loaded! ✨',
        message: 'Try dragging the preview or switching between all 6 Diwali frames.',
        type: 'festive',
      });
    };
    sampleImg.src = offscreen.toDataURL('image/png');
  };

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
    soundManager.playCelebrationChime();
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
    <div className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <SEOHead
        title="Diwali Photo Frame Maker — 6 Royal Frames with Drag, Zoom & Crop"
        description="Upload your photo and frame it with 6 royal Diwali photo frames, marigold garlands, glowing diyas, and custom greetings. 100% client-side privacy."
        path="/photo-frames"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 px-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-3">
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span>100% Client-Side Private Photo Studio</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black gold-gradient-text gold-glow-text leading-tight">
          Royal Diwali Photo Frame Maker 🖼️
        </h1>
        <p className="mt-2.5 text-xs sm:text-base text-[#FFF4DC]/80">
          Upload your photo, choose from 6 ornate Indian festive frames, drag to position, zoom &amp;
          crop, and download your HD composition.
        </p>
      </div>

      {/* Responsive Two-Column Layout:
          - Mobile/Tablet (<1024px): Single column, Photo Frame Preview FIRST (order-1), Editing Controls SECOND (order-2)
          - Desktop (>=1024px): Two columns, Editing Controls LEFT 40% (lg:w-[42%] lg:order-1), Frame Preview RIGHT 60% (lg:w-[58%] lg:order-2)
      */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start w-full">
        {/* PREVIEW SECTION: Order 1 on Mobile, Order 2 (Right 60%) on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 lg:order-2 w-full lg:w-[58%] lg:sticky lg:top-24"
        >
          <div className="glass-card ornate-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-xl mx-auto lg:max-w-none">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5 truncate">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="truncate">Live Frame Preview (Drag Photo)</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#FFF4DC]/65 shrink-0">
                1080×1080 HD
              </span>
            </div>

            {/* Centered Square Frame Container - Never overflows horizontally */}
            <div
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className={`relative w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[520px] mx-auto rounded-2xl overflow-hidden border-2 border-[#FFD700]/55 bg-[#0D0618] aspect-square select-none touch-none shadow-[0_0_35px_rgba(0,0,0,0.75)] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block pointer-events-none"
                aria-label="Diwali Framed Photo Canvas"
              />
            </div>

            {/* Quick Mobile Upload Bar right below preview so users can immediately upload */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2.5 lg:hidden">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl btn-royal-gold text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span>{imageName ? 'Change Photo' : 'Upload Your Photo'}</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSamplePortrait}
                className="w-full py-2.5 px-4 rounded-xl btn-festive-outline text-xs flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Try Sample Portrait</span>
              </button>
            </div>

            {/* Export & Share Buttons */}
            <div className="mt-4 sm:mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadFramedPhoto}
                className="w-full py-3.5 px-5 rounded-xl sm:rounded-2xl btn-royal-gold text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span>Download Framed Photo (PNG)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-[#FFF4DC] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  disabled={uploadingCloud}
                  onClick={handleOptInCloudSave}
                  className="w-full py-3 px-4 rounded-xl btn-festive-outline text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  title="Optional: Upload final composition to Supabase Storage"
                >
                  <Cloud className="w-4 h-4 text-[#FFD700] shrink-0" />
                  <span>{uploadingCloud ? 'Uploading...' : 'Opt-In Cloud Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* EDITING CONTROLS SECTION: Order 2 on Mobile (Below Frame), Order 1 (Left 40%) on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-2 lg:order-1 w-full lg:w-[42%] glass-card ornate-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 max-w-xl mx-auto lg:max-w-none"
        >
          {/* Privacy Assurance Banner */}
          <div className="p-3 rounded-xl bg-[#0D0618]/85 border border-[#FFD700]/35 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-[#FFF4DC]/85 leading-relaxed">
              <strong className="text-[#FFD700]">Privacy First:</strong> Your photos are processed
              100% locally inside your browser and never uploaded unless you click Opt-In Cloud Link.
            </p>
          </div>

          {/* 1. Upload User Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
              1. Upload Your Photo (JPG, PNG, WEBP)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl btn-royal-gold text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {imageName ? `Change (${imageName.slice(0, 14)})` : 'Choose Photo'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLoadSamplePortrait}
                className="w-full sm:w-auto py-3 px-4 rounded-xl btn-festive-outline text-xs flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Sample Portrait</span>
              </button>
            </div>
          </div>

          {/* 2. Choose from 6 Diwali Frame Templates */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
              2. Select Diwali Frame (6 Templates)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {SIX_FRAME_TEMPLATES.map((tpl) => {
                const isSelected = frameId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setFrameId(tpl.id);
                      soundManager.playDiyaLightSound();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all bg-gradient-to-br ${tpl.previewBg} ${
                      isSelected
                        ? 'border-[#FFD700] ring-2 ring-[#FFD700]/55 shadow-[0_0_16px_rgba(255,215,0,0.3)]'
                        : 'border-[#FFD700]/25 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-[#FFD700] mb-1">
                      {tpl.badge}
                    </span>
                    <p className="text-xs font-bold text-[#FFF4DC] leading-snug">{tpl.name}</p>
                    <p className="text-[10px] text-[#FFF4DC]/70 mt-0.5 line-clamp-1">{tpl.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Zoom, Rotate & Pan Controls */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0D0618]/75 border border-[#FFD700]/25 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                <Move className="w-4 h-4 shrink-0" />
                <span>3. Zoom &amp; Rotate</span>
              </span>
              <button
                type="button"
                onClick={handleResetTransform}
                className="text-xs text-[#FFF4DC]/75 hover:text-[#FFD700] flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-3">
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
                  className="w-full h-2 accent-[#FFD700] cursor-pointer"
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
                  className="w-full h-2 accent-[#FFD700] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. Festive Borders, Diyas & Custom Greeting Text */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="frame-greeting-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-1"
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
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-1"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setShowFestiveBorder((p) => !p)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                showFestiveBorder
                  ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#0D0618]/70 border-[#FFD700]/25 text-[#FFF4DC]/65'
              }`}
            >
              {showFestiveBorder ? '✓ Golden Border On' : '+ Add Golden Border'}
            </button>

            <button
              type="button"
              onClick={() => setShowCornerDiyas((p) => !p)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                showCornerDiyas
                  ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#0D0618]/70 border-[#FFD700]/25 text-[#FFF4DC]/65'
              }`}
            >
              {showCornerDiyas ? '✓ Corner Diyas On 🪔' : '+ Add Corner Diyas'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

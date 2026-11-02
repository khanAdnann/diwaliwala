import React, { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/soundEngine';

const YOUTUBE_VIDEO_ID = 'bRo49SIR7mE';

export default function BackgroundMusicPlayer() {
  const playerRef = useRef(null);
  const containerId = 'diwali-yt-bg-player';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(85);
  const userPausedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const tryAutoPlay = (player) => {
      if (!player || userPausedRef.current) return;
      try {
        player.unMute?.();
        player.setVolume?.(85);
        player.playVideo?.();
      } catch {
        // Fallback if browser requires muted start first
      }
    };

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            setIsReady(true);
            soundManager.registerYouTubePlayer(event.target);
            tryAutoPlay(event.target);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === 1) {
              setIsPlaying(true);
              soundManager.setMusicStateFromYouTube(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
              soundManager.setMusicStateFromYouTube(false);
            } else if (event.data === 0) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        initPlayer();
      };
    }

    // Ensure music starts immediately on first user arrival / gesture if browser blocked initial unmuted autoplay
    const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'scroll'];

    const removeUnlockListeners = () => {
      unlockEvents.forEach((evt) => window.removeEventListener(evt, handleFirstArrivalUnlock));
    };

    function handleFirstArrivalUnlock() {
      if (userPausedRef.current) {
        removeUnlockListeners();
        return;
      }
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          const state = playerRef.current.getPlayerState?.();
          playerRef.current.unMute?.();
          playerRef.current.setVolume?.(volume);
          if (state !== 1) {
            playerRef.current.playVideo();
          } else {
            removeUnlockListeners();
          }
        } catch {
          // Ignore
        }
      }
    }

    unlockEvents.forEach((evt) =>
      window.addEventListener(evt, handleFirstArrivalUnlock, { passive: true })
    );

    const unsub = soundManager.subscribe(({ musicEnabled }) => {
      setIsPlaying(musicEnabled);
    });

    return () => {
      isMounted = false;
      unsub();
      removeUnlockListeners();
    };
  }, [volume]);

  const handleTogglePlay = () => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') {
      soundManager.toggleMusic();
      return;
    }

    const state = playerRef.current.getPlayerState();
    if (state === 1) {
      userPausedRef.current = true;
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      soundManager.setMusicStateFromYouTube(false);
    } else {
      userPausedRef.current = false;
      playerRef.current.unMute?.();
      playerRef.current.setVolume?.(volume);
      playerRef.current.playVideo();
      setIsPlaying(true);
      soundManager.setMusicStateFromYouTube(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(newVol);
      if (newVol > 0) {
        playerRef.current.unMute?.();
      }
    }
  };

  return (
    <>
      {/* Strictly Invisible Audio-Only YouTube Container */}
      <div
        aria-hidden="true"
        className="w-0 h-0 opacity-0 pointer-events-none fixed -left-[9999px] -top-[9999px] overflow-hidden"
      >
        <div id={containerId} />
      </div>

      {/* Responsive Audio-Only Pill Control (Bottom-Left) */}
      <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-[80] max-w-[calc(100vw-1.5rem)]">
        <div className="glass-card rounded-full px-3 py-1.5 sm:px-3.5 sm:py-2 border border-[#FFD700]/55 shadow-[0_0_25px_rgba(255,215,0,0.28)] flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] shadow-[0_0_16px_#FFD700]'
                : 'bg-[#29104A] text-[#FFD700] border border-[#FFD700]/40 hover:border-[#FFD700]'
            }`}
            title={isPlaying ? 'Pause Diwali DJ Song' : 'Play Diwali DJ Song'}
            aria-label={isPlaying ? 'Pause Diwali DJ Song' : 'Play Diwali DJ Song'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
          </button>

          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <Music className={`w-3.5 h-3.5 text-[#FFD700] shrink-0 ${isPlaying ? 'animate-bounce' : ''}`} />
              <span className="text-[11px] sm:text-xs font-bold text-[#FFD700] truncate">
                Diwali DJ Song 2026
              </span>
            </div>
            <span className="block text-[9px] sm:text-[10px] text-[#FFF4DC]/75 truncate">
              {isPlaying
                ? '🎧 Playing Background Music'
                : isReady
                ? 'Tap Anywhere to Start Music'
                : 'Starting Festive Music...'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-1 border-l border-[#FFD700]/25">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#FFF4DC]/50" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#FFD700]" />
            )}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Background Music Volume"
              className="w-16 accent-[#FFD700] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
}

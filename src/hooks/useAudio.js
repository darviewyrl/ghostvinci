import { useState, useEffect, useRef } from 'react';

// Public royalty-free audio URLs (mapping additional effects to local assets as fallback)
const BGM_URL = '/audio/bgm.mp3';
const SFX_URLS = {
  draw: '/audio/draw.mp3',      // paper/card slide
  flip: '/audio/flip.mp3',      // wooden block click
  correct: '/audio/correct.wav',    // positive chime
  wrong: '/audio/wrong.wav',      // low thud/wood knock
  victory: '/audio/victory.wav',    // brass/fanfare
  defeat: '/audio/defeat.wav',       // failure signal
  popup: '/audio/draw.wav',       // Turn banner / popup click
  transition: '/audio/flip.wav'   // Page transition whoosh
};

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('ghostvinci_mute');
    return saved ? JSON.parse(saved) : false;
  });

  const [bgmVolume, setBgmVolumeState] = useState(() => {
    const saved = localStorage.getItem('ghostvinci_bgm_vol');
    return saved !== null ? parseFloat(saved) : 0.3; // Lowered default volume
  });

  const [sfxVolume, setSfxVolumeState] = useState(() => {
    const saved = localStorage.getItem('ghostvinci_sfx_vol');
    return saved !== null ? parseFloat(saved) : 0.4; // Lowered default volume
  });

  const bgmRef = useRef(null);
  const sfxRefs = useRef({});
  const audioUnlockedRef = useRef(false);
  const bgmAttemptedRef = useRef(false);
  const pendingBgmRetryRef = useRef(false);
  const warningMarksRef = useRef(new Set());
  const hoverCooldownRef = useRef(0);
  const bgmSaveTimeoutRef = useRef(null);
  const sfxSaveTimeoutRef = useRef(null);

  // Web Audio API synthesizer for clean, zero-latency custom UI sounds
  const playSynthSFX = (type, vol) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.connect(ctx.destination);

      if (type === 'hover') {
        // Subtle thud/rustle for card hovering
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);

        gainNode.gain.setValueAtTime(vol * 0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'warning') {
        // Tense double heartbeat
        const playBeat = (delay) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(50, ctx.currentTime + delay);

          const beatGain = ctx.createGain();
          beatGain.gain.setValueAtTime(0, ctx.currentTime + delay);
          beatGain.gain.linearRampToValueAtTime(vol * 0.45, ctx.currentTime + delay + 0.02);
          beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);

          osc.connect(beatGain);
          beatGain.connect(ctx.destination);

          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.16);
        };
        playBeat(0);
        playBeat(0.18);
      } else if (type === 'toggle' || type === 'click') {
        // Crisp UI mechanical click
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.02);

        gainNode.gain.setValueAtTime(vol * 0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn('Web Audio synthesis failed:', e);
    }
  };

  // Initialize Audio elements
  useEffect(() => {
    // Initialize BGM
    const bgm = new Audio(BGM_URL);
    bgm.loop = true;
    bgm.volume = bgmVolume;
    bgm.muted = isMuted;
    bgmRef.current = bgm;

    // Preload SFX
    Object.entries(SFX_URLS).forEach(([key, url]) => {
      const sfx = new Audio(url);
      sfx.volume = sfxVolume;
      sfx.muted = isMuted;
      sfxRefs.current[key] = sfx;
    });

    // Cleanup on unmount
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      sfxRefs.current = {};
      if (bgmSaveTimeoutRef.current) clearTimeout(bgmSaveTimeoutRef.current);
      if (sfxSaveTimeoutRef.current) clearTimeout(sfxSaveTimeoutRef.current);
    };
  }, []);

  // Update BGM mute status when state changes
  useEffect(() => {
    localStorage.setItem('ghostvinci_mute', JSON.stringify(isMuted));
    if (bgmRef.current) {
      bgmRef.current.muted = isMuted;
    }
    Object.values(sfxRefs.current).forEach(sfx => {
      sfx.muted = isMuted;
    });
  }, [isMuted]);

  // Setters
  const setBGMVolume = (vol, persistState = true) => {
    if (bgmRef.current) {
      bgmRef.current.volume = vol;
    }
    if (persistState) {
      setBgmVolumeState(vol);
      if (bgmSaveTimeoutRef.current) clearTimeout(bgmSaveTimeoutRef.current);
      bgmSaveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('ghostvinci_bgm_vol', vol.toString());
      }, 400);
    }
  };

  const setSFXVolume = (vol, persistState = true) => {
    Object.values(sfxRefs.current).forEach(sfx => {
      sfx.volume = vol;
    });
    if (persistState) {
      setSfxVolumeState(vol);
      if (sfxSaveTimeoutRef.current) clearTimeout(sfxSaveTimeoutRef.current);
      sfxSaveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('ghostvinci_sfx_vol', vol.toString());
      }, 400);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const resetWarningMarks = () => {
    warningMarksRef.current.clear();
  };

  const shouldPlayWarning = (time) => !warningMarksRef.current.has(time);

  const playBGM = async ({ forceRetry = false } = {}) => {
    if (!bgmRef.current || isMuted) return;
    if (bgmAttemptedRef.current && !forceRetry) return;

    bgmAttemptedRef.current = true;
    pendingBgmRetryRef.current = !audioUnlockedRef.current;

    try {
      await bgmRef.current.play();
      pendingBgmRetryRef.current = false;
    } catch {
      if (!audioUnlockedRef.current) {
        // Autoplay policy prevented music, retry once the user interacts.
        console.log('Audio autoplay blocked. BGM will play upon interaction.');
      }
    }
  };

  const unlockAudio = async () => {
    if (!audioUnlockedRef.current) {
      audioUnlockedRef.current = true;
    }

    if (pendingBgmRetryRef.current) {
      bgmAttemptedRef.current = false;
      try {
        await playBGM({ forceRetry: true });
      } catch {
        // Keep unlock best-effort so UI interactions never lose their SFX.
      }
    }
  };

  const stopBGM = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    bgmAttemptedRef.current = false;
    pendingBgmRetryRef.current = false;
    resetWarningMarks();
  };

  const playSFX = async (type, detail) => {
    if (isMuted) return;

    if (type === 'hover') {
      const now = Date.now();
      if (now - hoverCooldownRef.current < 120) return;
      hoverCooldownRef.current = now;
    }

    if (type === 'warning' && typeof detail === 'number') {
      if (!shouldPlayWarning(detail)) return;
      warningMarksRef.current.add(detail);
    }

    if (['click', 'flip', 'toggle', 'transition'].includes(type)) {
      void unlockAudio();
    }

    // Trigger synthetic sounds using Web Audio API
    if (['hover', 'warning', 'toggle', 'click'].includes(type)) {
      playSynthSFX(type, sfxVolume);
      return;
    }

    const sfxTemplate = sfxRefs.current[type];
    if (sfxTemplate) {
      try {
        // Clone node to allow concurrent playing of the same sound
        const sfx = sfxTemplate.cloneNode();
        sfx.volume = sfxVolume;
        sfx.muted = isMuted;

        // Apply pitch/playback rate variation for interaction sounds
        if (['flip', 'draw'].includes(type)) {
          sfx.playbackRate = 0.92 + Math.random() * 0.16; // 0.92 to 1.08 range
        }

        sfx.play().catch(() => {
          // Silently catch autoplay block errors
        });
      } catch (err) {
        // Fallback if clone fails
        sfxTemplate.currentTime = 0;
        sfxTemplate.play().catch(() => {});
      }
    }
  };

  return {
    isMuted,
    toggleMute,
    playBGM,
    stopBGM,
    playSFX,
    unlockAudio,
    bgmVolume,
    sfxVolume,
    setBGMVolume,
    setSFXVolume,
  };
};

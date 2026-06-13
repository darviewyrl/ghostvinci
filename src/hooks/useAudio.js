import { useState, useEffect, useRef } from 'react';

// Public royalty-free audio URLs
const BGM_URL = '/audio/bgm.mp3';
const SFX_URLS = {
  draw: '/audio/draw.mp3',      // paper/card slide
  flip: '/audio/flip.mp3',      // wooden block click
  correct: '/audio/correct.wav',    // positive chime
  wrong: '/audio/wrong.wav',      // low thud/wood knock
  victory: '/audio/victory.wav',    // brass/fanfare
  defeat: '/audio/defeat.wav'       // failure signal
};

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('davinci_mute');
    return saved ? JSON.parse(saved) : false;
  });

  const [bgmVolume, setBgmVolumeState] = useState(() => {
    const saved = localStorage.getItem('davinci_bgm_vol');
    return saved !== null ? parseFloat(saved) : 0.15;
  });

  const [sfxVolume, setSfxVolumeState] = useState(() => {
    const saved = localStorage.getItem('davinci_sfx_vol');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const bgmRef = useRef(null);
  const sfxRefs = useRef({});

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
    };
  }, []);

  // Update BGM mute status when state changes
  useEffect(() => {
    localStorage.setItem('davinci_mute', JSON.stringify(isMuted));
    if (bgmRef.current) {
      bgmRef.current.muted = isMuted;
    }
    Object.values(sfxRefs.current).forEach(sfx => {
      sfx.muted = isMuted;
    });
  }, [isMuted]);

  // Setters
  const setBGMVolume = (vol) => {
    setBgmVolumeState(vol);
    localStorage.setItem('davinci_bgm_vol', vol.toString());
    if (bgmRef.current) {
      bgmRef.current.volume = vol;
    }
  };

  const setSFXVolume = (vol) => {
    setSfxVolumeState(vol);
    localStorage.setItem('davinci_sfx_vol', vol.toString());
    Object.values(sfxRefs.current).forEach(sfx => {
      sfx.volume = vol;
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const playBGM = () => {
    if (bgmRef.current) {
      bgmRef.current.play().catch(() => {
        // Autoplay policy prevented music, will retry on user click
        console.log('Audio autoplay blocked. BGM will play upon interaction.');
      });
    }
  };

  const stopBGM = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  };

  const playSFX = (type) => {
    const sfx = sfxRefs.current[type];
    if (sfx) {
      // Reset to beginning to allow rapid triggers
      sfx.currentTime = 0;
      sfx.play().catch(() => {
        // Silently catch autoplay block errors
      });
    }
  };

  return {
    isMuted,
    toggleMute,
    playBGM,
    stopBGM,
    playSFX,
    bgmVolume,
    sfxVolume,
    setBGMVolume,
    setSFXVolume,
  };
};

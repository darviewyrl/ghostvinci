import { useState, useEffect, useRef } from 'react';

// Public royalty-free audio URLs
const BGM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3';
const SFX_URLS = {
  draw: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',      // paper/card slide
  flip: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',      // wooden block click
  correct: 'https://assets.mixkit.co/active_storage/sfx/911/911-84.wav',    // positive chime
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2503/2503-84.wav',      // low thud/wood knock
  victory: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav'    // brass/fanfare
};

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('davinci_mute');
    return saved ? JSON.parse(saved) : false;
  });

  const bgmRef = useRef(null);
  const sfxRefs = useRef({});

  // Initialize Audio elements
  useEffect(() => {
    // Initialize BGM
    const bgm = new Audio(BGM_URL);
    bgm.loop = true;
    bgm.volume = 0.08; // quiet background music
    bgmRef.current = bgm;

    // Preload SFX
    Object.entries(SFX_URLS).forEach(([key, url]) => {
      const sfx = new Audio(url);
      sfx.volume = key === 'victory' ? 0.25 : 0.4; // set appropriate volumes
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
    playSFX
  };
};

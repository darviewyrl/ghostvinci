import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudio } from './useAudio';

const OriginalAudio = globalThis.Audio;
const OriginalAudioContext = globalThis.AudioContext;
const OriginalWebkitAudioContext = globalThis.webkitAudioContext;

const createAudioMock = (overrides = {}) => ({
  loop: false,
  volume: 1,
  muted: false,
  currentTime: 0,
  pause: vi.fn(),
  play: vi.fn(() => Promise.resolve()),
  cloneNode: vi.fn(function cloneNode() {
    return { ...this, play: vi.fn(() => Promise.resolve()) };
  }),
  ...overrides,
});

describe('useAudio', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.Audio = OriginalAudio;
    globalThis.AudioContext = OriginalAudioContext;
    globalThis.webkitAudioContext = OriginalWebkitAudioContext;
    vi.unstubAllGlobals();
  });

  it('does not repeatedly attempt BGM playback before audio is unlocked', async () => {
    const play = vi.fn(() => Promise.reject(new Error('blocked')));

    globalThis.Audio = vi.fn(() => createAudioMock({ play }));

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playBGM();
      await result.current.playBGM();
    });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('retries BGM after audio is explicitly unlocked', async () => {
    const play = vi
      .fn()
      .mockRejectedValueOnce(new Error('blocked'))
      .mockResolvedValueOnce();

    globalThis.Audio = vi.fn(() => createAudioMock({ play }));

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playBGM();
      await result.current.unlockAudio();
    });

    expect(play).toHaveBeenCalledTimes(2);
  });

  it('only plays warning heartbeat once per threshold bucket until the round audio resets', async () => {
    globalThis.Audio = vi.fn(() => createAudioMock());
    const createGain = () => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    });
    const createOscillator = () => ({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    });
    const audioContextFactory = vi.fn(() => ({
      currentTime: 0,
      destination: {},
      createGain,
      createOscillator,
    }));
    globalThis.AudioContext = audioContextFactory;

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playSFX('warning', 5);
      await result.current.playSFX('warning', 5);
    });

    expect(audioContextFactory).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.stopBGM();
      await result.current.playSFX('warning', 5);
    });

    expect(audioContextFactory).toHaveBeenCalledTimes(2);
  });

  it('does not clear warning buckets when interaction sfx implicitly unlock audio', async () => {
    const flipClonePlay = vi.fn(() => Promise.resolve());
    const flipTemplate = createAudioMock({
      cloneNode: vi.fn(() => ({
        volume: 1,
        muted: false,
        playbackRate: 1,
        play: flipClonePlay,
      })),
    });
    const defaultAudio = createAudioMock();
    const createGain = () => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    });
    const createOscillator = () => ({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    });
    const audioContextFactory = vi.fn(() => ({
      currentTime: 0,
      destination: {},
      createGain,
      createOscillator,
    }));

    globalThis.Audio = vi.fn((url) => {
      if (url === '/audio/flip.mp3') return flipTemplate;
      return defaultAudio;
    });
    globalThis.AudioContext = audioContextFactory;

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playSFX('warning', 5);
      await result.current.playSFX('flip');
      await result.current.playSFX('warning', 5);
    });

    expect(audioContextFactory).toHaveBeenCalledTimes(1);
    expect(flipTemplate.cloneNode).toHaveBeenCalledTimes(1);
    expect(flipClonePlay).toHaveBeenCalledTimes(1);
  });

  it('debounces hover playback to avoid rapid repeated synth triggers', async () => {
    const createGain = () => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    });
    const createOscillator = () => ({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    });
    const audioContextFactory = vi.fn(() => ({
      currentTime: 0,
      destination: {},
      createGain,
      createOscillator,
    }));

    globalThis.Audio = vi.fn(() => createAudioMock());
    globalThis.AudioContext = audioContextFactory;

    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1050).mockReturnValueOnce(1201);

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playSFX('hover');
      await result.current.playSFX('hover');
      await result.current.playSFX('hover');
    });

    expect(audioContextFactory).toHaveBeenCalledTimes(2);
  });

  it('uses distinct popup and transition audio assets', () => {
    const audioSpy = vi.fn(() => createAudioMock());
    globalThis.Audio = audioSpy;

    renderHook(() => useAudio());

    const assetUrls = audioSpy.mock.calls.map(([url]) => url);
    expect(assetUrls).toContain('/audio/draw.wav');
    expect(assetUrls).toContain('/audio/flip.wav');
  });

  it('still plays interaction sfx when unlock triggers a failed bgm retry', async () => {
    const bgm = createAudioMock({
      play: vi.fn(() => Promise.reject(new Error('blocked again'))),
    });
    const flipClonePlay = vi.fn(() => Promise.resolve());
    const flipTemplate = createAudioMock({
      cloneNode: vi.fn(() => ({
        volume: 1,
        muted: false,
        playbackRate: 1,
        play: flipClonePlay,
      })),
    });
    const defaultAudio = createAudioMock();

    globalThis.Audio = vi.fn((url) => {
      if (url === '/audio/bgm.mp3') return bgm;
      if (url === '/audio/flip.mp3') return flipTemplate;
      return defaultAudio;
    });

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playBGM();
      await result.current.playSFX('flip');
    });

    expect(bgm.play).toHaveBeenCalledTimes(2);
    expect(flipTemplate.cloneNode).toHaveBeenCalledTimes(1);
    expect(flipClonePlay).toHaveBeenCalledTimes(1);
  });
});

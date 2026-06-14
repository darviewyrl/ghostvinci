import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SetupScreen from './SetupScreen';

const renderSetupScreen = (props = {}) => {
  const defaultProps = {
    aiDifficulty: 'easy',
    cardRemovalCount: 0,
    onConfigChange: vi.fn(),
    onStartGame: vi.fn(),
    playSFX: vi.fn(),
    onOpenSettings: vi.fn(),
    scores: { player: 0, ai: 0 },
    onResetScores: vi.fn(),
  };

  const result = render(<SetupScreen {...defaultProps} {...props} />);

  return {
    ...result,
    props: { ...defaultProps, ...props },
  };
};

describe('SetupScreen', () => {
  afterEach(() => {
    cleanup();
  });

  it('changes difficulty through the visible option and sends the expected config payload', () => {
    const onConfigChange = vi.fn();

    renderSetupScreen({
      aiDifficulty: 'easy',
      cardRemovalCount: 2,
      onConfigChange,
    });

    expect(screen.getByRole('button', { name: 'ง่าย' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'อันตราย' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'อันตราย' }));

    expect(onConfigChange).toHaveBeenCalledWith({
      aiDifficulty: 'hard',
      cardRemovalCount: 2,
    });
  });

  it('changes card removal count through the visible option and sends the expected config payload', () => {
    const onConfigChange = vi.fn();

    renderSetupScreen({
      aiDifficulty: 'medium',
      cardRemovalCount: 0,
      onConfigChange,
    });

    expect(screen.getByRole('button', { name: '0 ใบ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '6 ใบ' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: '6 ใบ' }));

    expect(onConfigChange).toHaveBeenCalledWith({
      aiDifficulty: 'medium',
      cardRemovalCount: 6,
    });
  });

  it('opens settings from the top bar action', () => {
    const onOpenSettings = vi.fn();

    renderSetupScreen({ onOpenSettings });

    fireEvent.click(screen.getByRole('button', { name: 'ตั้งค่าเสียง' }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('starts the game from the primary ritual action', () => {
    const onStartGame = vi.fn();

    renderSetupScreen({ onStartGame });

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่พิธีกรรม' }));

    expect(onStartGame).toHaveBeenCalledTimes(1);
  });
});

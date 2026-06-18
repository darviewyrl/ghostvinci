import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const createDefaultProps = () => ({
  aiDifficulty: 'easy',
  cardRemovalCount: 0,
  onConfigChange: vi.fn(),
  onStartGame: vi.fn(),
  playSFX: vi.fn(),
  onOpenSettings: vi.fn(),
  scores: { player: 0, ai: 0 },
  onResetScores: vi.fn(),
});

const loadSetupScreen = async ({ lobbyShellMock } = {}) => {
  vi.resetModules();

  if (lobbyShellMock) {
    vi.doMock('./lobby/LobbyShell', () => ({
      default: lobbyShellMock,
    }));
  } else {
    vi.doUnmock('./lobby/LobbyShell');
  }

  const module = await import('./SetupScreen');
  return module.default;
};

const renderSetupScreen = async (props = {}) => {
  const SetupScreen = await loadSetupScreen();
  const mergedProps = { ...createDefaultProps(), ...props };
  const result = render(<SetupScreen {...mergedProps} />);

  return {
    ...result,
    props: mergedProps,
    SetupScreen,
  };
};

describe('SetupScreen', () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock('./lobby/LobbyShell');
  });

  it('passes the lobby contract through to LobbyShell', async () => {
    const lobbyShellSpy = vi.fn(() => <div data-testid="setup-screen-wrapper-probe" />);
    const SetupScreen = await loadSetupScreen({ lobbyShellMock: lobbyShellSpy });
    const props = createDefaultProps();

    render(<SetupScreen {...props} />);

    expect(screen.getByTestId('setup-screen-wrapper-probe')).toBeInTheDocument();
    expect(lobbyShellSpy).toHaveBeenCalledTimes(1);
    expect(lobbyShellSpy.mock.calls[0][0]).toMatchObject(props);
  });

  it('changes difficulty through the visible option and sends the expected config payload', async () => {
    const onConfigChange = vi.fn();

    await renderSetupScreen({
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

  it('shows the current mode as single player', async () => {
    await renderSetupScreen();

    expect(screen.queryByText('โหมดการเล่น')).not.toBeInTheDocument();
    expect(screen.queryByText(/Single Player/i)).not.toBeInTheDocument();
  });

  it('changes card removal count through the visible option and sends the expected config payload', async () => {
    const onConfigChange = vi.fn();

    await renderSetupScreen({
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

  it('opens settings from the top bar action', async () => {
    const onOpenSettings = vi.fn();

    await renderSetupScreen({ onOpenSettings });

    fireEvent.click(screen.getByRole('button', { name: 'ตั้งค่าเสียง' }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('allows the settings action to be pressed when onOpenSettings is omitted', async () => {
    const playSFX = vi.fn();

    await renderSetupScreen({ onOpenSettings: undefined, playSFX });

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'ตั้งค่าเสียง' }));
    }).not.toThrow();
    expect(playSFX).toHaveBeenCalledWith('flip');
  });

  it('starts the game from the primary ritual action', async () => {
    const onStartGame = vi.fn();

    await renderSetupScreen({ onStartGame });

    fireEvent.click(screen.getByRole('button', { name: 'เริ่มพิธีกรรม' }));

    expect(onStartGame).toHaveBeenCalledTimes(1);
  });

  it('opens and closes the daily mission modal from the daily mission action', async () => {
    await renderSetupScreen({
      dailyQuest: {
        title: 'ชนะเกม 3 ครั้ง',
        progress: 2,
        target: 3,
        claimed: false,
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /ภารกิจประจำวัน/ }));

    const dialog = screen.getByRole('dialog', { name: 'ภารกิจประจำวัน' });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('ความคืบหน้า')).toBeInTheDocument();
    expect(within(dialog).getByText('2 / 3')).toBeInTheDocument();
    expect(within(dialog).getByText('รางวัล')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ปิดภารกิจประจำวัน' }));

    expect(screen.queryByRole('dialog', { name: 'ภารกิจประจำวัน' })).not.toBeInTheDocument();
  });

  it('scrolls smoothly from the guide button to the guide section', async () => {
    const scrollTo = vi.fn();
    const originalScrollTo = window.scrollTo;
    window.scrollTo = scrollTo;

    try {
      await renderSetupScreen();

      fireEvent.click(screen.getByRole('button', { name: 'คู่มือการเล่น' }));

      expect(screen.getByRole('heading', { name: 'คู่มือการเล่น' })).toBeInTheDocument();
      expect(scrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' });
    } finally {
      window.scrollTo = originalScrollTo;
    }
  });

  it('renders the Joker guide card from the real img/joker.png asset', async () => {
    await renderSetupScreen();

    const joker = screen.getByRole('img', { name: 'ไพ่ Joker' });

    expect(joker).toHaveAttribute('src', '/img/joker.png');
  });

  it('uses the same red active icon color for every difficulty option', async () => {
    const { rerender, props, SetupScreen } = await renderSetupScreen({ aiDifficulty: 'easy' });

    expect(screen.getByRole('button', { name: 'ง่าย' }).querySelector('svg')).toHaveStyle({ color: '#ff4d4d' });

    rerender(<SetupScreen {...props} aiDifficulty="medium" />);
    expect(screen.getByRole('button', { name: 'ปานกลาง' }).querySelector('svg')).toHaveStyle({ color: '#ff4d4d' });

    rerender(<SetupScreen {...props} aiDifficulty="hard" />);
    expect(screen.getByRole('button', { name: 'อันตราย' }).querySelector('svg')).toHaveStyle({ color: '#ff4d4d' });
  });

  it('keeps reusable lobby-panel surfaces in the right control stack', async () => {
    await renderSetupScreen();

    const controlPanel = screen.getByTestId('lobby-control-panel');

    expect(controlPanel).toHaveClass('relative');
    expect(controlPanel.querySelectorAll('.lobby-panel')).toHaveLength(2);
  });

  it('renders the stage brand block and decorative floating card cluster', async () => {
    await renderSetupScreen();

    expect(screen.getByRole('heading', { name: 'Ghostvinci' })).toBeInTheDocument();
    expect(screen.getByTestId('floating-card-cluster')).toBeInTheDocument();
  });

  it('keeps the full-bleed lobby shell and desktop grid class', async () => {
    await renderSetupScreen();

    const lobbyShell = screen.getByTestId('lobby-shell');
    const main = lobbyShell.querySelector('main');

    expect(lobbyShell).toHaveClass('lobby-shell-bg');
    expect(main?.className).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(292px,29vw)]');
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

    expect(screen.getByRole('button', { name: 'เธเนเธฒเธข' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'เธญเธฑเธเธ•เธฃเธฒเธข' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'เธญเธฑเธเธ•เธฃเธฒเธข' }));

    expect(onConfigChange).toHaveBeenCalledWith({
      aiDifficulty: 'hard',
      cardRemovalCount: 2,
    });
  });

  it('shows the current mode as single player', async () => {
    await renderSetupScreen();

    expect(screen.getByText('Single Player', { selector: 'span.text-sm' })).toBeInTheDocument();
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

  it('keeps the reusable lobby-panel styling hook on the control panel', async () => {
    await renderSetupScreen();

    expect(screen.getByTestId('lobby-control-panel')).toHaveClass('lobby-panel');
  });

  it('renders the stage brand block and decorative floating card cluster', async () => {
    await renderSetupScreen();

    expect(screen.getByRole('heading', { name: 'Ghostvinci' })).toBeInTheDocument();
    expect(screen.getByTestId('floating-card-cluster')).toBeInTheDocument();
  });

  it('keeps the desktop-first lobby shell grid class', async () => {
    await renderSetupScreen();

    expect(screen.getByTestId('lobby-shell').innerHTML).toMatch(
      /lg:grid-cols-\[minmax\(0,1\.2fr\)_420px\]/,
    );
  });
});

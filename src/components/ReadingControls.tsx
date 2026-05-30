import type { TtsState } from '../lib/tts';
import { isTtsSupported } from '../lib/tts';
import { BookIcon, PlayIcon, PauseIcon, StopIcon } from './icons';

interface ReadingControlsProps {
  readingMode: boolean;
  ttsState: TtsState;
  onToggleReading: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function ReadingControls({
  readingMode,
  ttsState,
  onToggleReading,
  onPlay,
  onPause,
  onStop,
}: ReadingControlsProps) {
  const ttsLabel =
    ttsState === 'playing'
      ? 'Reproduciendo…'
      : ttsState === 'paused'
        ? 'En pausa'
        : 'Leer en voz alta';

  return (
    <>
      {readingMode && isTtsSupported() && (
        <div className="tts-bar">
          {ttsState === 'playing' ? (
            <button onClick={onPause} aria-label="Pausar">
              <PauseIcon size={18} />
            </button>
          ) : (
            <button onClick={onPlay} aria-label="Reproducir">
              <PlayIcon size={18} />
            </button>
          )}
          <button onClick={onStop} aria-label="Detener">
            <StopIcon size={18} />
          </button>
          <span className="tts-label">{ttsLabel}</span>
        </div>
      )}

      <button
        className={`read-fab${readingMode ? ' active' : ''}`}
        onClick={onToggleReading}
        aria-pressed={readingMode}
      >
        <BookIcon size={17} />
        <span>{readingMode ? 'Salir' : 'Modo lectura'}</span>
      </button>
    </>
  );
}

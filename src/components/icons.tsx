/**
 * A small, coherent set of inline SVG icons (no dependency, currentColor).
 * Outline icons use a 1.75 stroke; media-control glyphs (play/pause/stop) are
 * filled because that reads better at small sizes. Replacing emoji with these
 * is the difference between "looks templated" and "looks designed".
 */
import type { SVGProps } from 'react';

type IconProps = { size?: number } & SVGProps<SVGSVGElement>;

function Outline({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function Solid({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const DownloadIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </Outline>
);

export const SettingsIcon = (p: IconProps) => (
  <Outline {...p}>
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="16" x2="20" y2="16" />
    <circle cx="9" cy="8" r="2.2" />
    <circle cx="15" cy="16" r="2.2" />
  </Outline>
);

export const ImportIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 14V4" />
    <path d="m8 8 4-4 4 4" />
    <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
  </Outline>
);

export const BookIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M5 5a2 2 0 0 1 2-2h11v15H7a2 2 0 0 0-2 2z" />
    <path d="M5 5v15" />
  </Outline>
);

export const ClipboardIcon = (p: IconProps) => (
  <Outline {...p}>
    <rect x="7" y="4" width="10" height="17" rx="2" />
    <path d="M9.5 4V3.2A1.2 1.2 0 0 1 10.7 2h2.6a1.2 1.2 0 0 1 1.2 1.2V4" />
  </Outline>
);

export const FolderIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h3.6l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Outline>
);

export const ShareIcon = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="17" cy="6" r="2.4" />
    <circle cx="17" cy="18" r="2.4" />
    <path d="m8.1 10.9 6.8-3.8" />
    <path d="m8.1 13.1 6.8 3.8" />
  </Outline>
);

export const ChevronIcon = (p: IconProps) => (
  <Outline {...p}>
    <path d="m9 6 6 6-6 6" />
  </Outline>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Outline>
);

export const PlayIcon = (p: IconProps) => (
  <Solid {...p}>
    <path d="M8 5.5v13l10-6.5z" />
  </Solid>
);

export const PauseIcon = (p: IconProps) => (
  <Solid {...p}>
    <rect x="7" y="5" width="3.4" height="14" rx="1" />
    <rect x="13.6" y="5" width="3.4" height="14" rx="1" />
  </Solid>
);

export const StopIcon = (p: IconProps) => (
  <Solid {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
  </Solid>
);

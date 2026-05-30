import { get, set, del } from 'idb-keyval';

/**
 * Export-location handling. This is the web's closest equivalent to a native
 * app's "Export location" setting (e.g. CleanShot X): the File System Access API
 * lets the user grant a directory once; we persist the handle in IndexedDB and
 * write straight into it on every export. Chromium-only (Chrome/Edge/Brave/Arc)
 * over a secure context. Where it is unavailable (notably Safari), we fall back
 * to a normal download into the browser's Downloads folder.
 */

const DIR_HANDLE_KEY = 'criterio:export-dir-handle';

export function isFsAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export interface SaveResult {
  /** How the file was written. */
  method: 'directory' | 'download';
  /** The chosen directory name when method === 'directory'. */
  directoryName?: string;
  filename: string;
}

/** Prompt the user to choose an export directory and remember it. */
export async function pickExportDirectory(): Promise<string | null> {
  if (!isFsAccessSupported()) return null;
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await set(DIR_HANDLE_KEY, handle);
    return handle.name;
  } catch (err) {
    // The user cancelled the picker — not an error worth surfacing.
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
}

export async function getExportDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFsAccessSupported()) return null;
  const handle = await get<FileSystemDirectoryHandle>(DIR_HANDLE_KEY);
  return handle ?? null;
}

export async function getExportDirectoryName(): Promise<string | null> {
  const handle = await getExportDirectory();
  return handle?.name ?? null;
}

export async function clearExportDirectory(): Promise<void> {
  await del(DIR_HANDLE_KEY);
}

/** Verify (and if needed re-request) read-write permission on a stored handle. */
async function ensureWritePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const opts = { mode: 'readwrite' } as const;
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  return (await handle.requestPermission(opts)) === 'granted';
}

/**
 * Save `contents` as `filename`. Writes into the remembered export directory when
 * one is set and permission is granted; otherwise triggers a normal download.
 */
export async function saveFile(
  filename: string,
  contents: string,
  mimeType = 'text/html',
): Promise<SaveResult> {
  const dir = await getExportDirectory();
  if (dir && (await ensureWritePermission(dir))) {
    const fileHandle = await dir.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(new Blob([contents], { type: mimeType }));
    await writable.close();
    return { method: 'directory', directoryName: dir.name, filename };
  }
  return downloadFallback(filename, contents, mimeType);
}

function downloadFallback(filename: string, contents: string, mimeType: string): SaveResult {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the click is fully processed first.
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return { method: 'download', filename };
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Issue } from '../schema/issue';
import { loadAllBundledIssues } from '../lib/issues';
import { loadImportedIssues, removeImportedIssue, upsertImportedIssue } from '../lib/storage';
import {
  clearExportDirectory,
  getExportDirectoryName,
  isFsAccessSupported,
  pickExportDirectory,
  saveFile,
} from '../lib/download';
import { buildExportHtml, exportFilename } from '../lib/export-html';

export interface Toast {
  message: string;
  kind: 'ok' | 'error';
}

interface StoreValue {
  loading: boolean;
  issues: Issue[];
  current: Issue | null;
  currentDate: string | null;
  isImported: (date: string) => boolean;
  fsSupported: boolean;
  exportDirName: string | null;
  toast: Toast | null;
  selectIssue: (date: string) => void;
  importIssue: (issue: Issue) => void;
  removeIssue: (date: string) => void;
  chooseExportDir: () => Promise<void>;
  clearExportDir: () => Promise<void>;
  exportCurrent: () => Promise<void>;
  dismissToast: () => void;
  notify: (message: string, kind?: Toast['kind']) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function mergeIssues(bundled: Issue[], imported: Issue[]): Issue[] {
  const byDate = new Map<string, Issue>();
  for (const issue of bundled) byDate.set(issue.date, issue);
  for (const issue of imported) byDate.set(issue.date, issue); // imported wins on date clash
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [bundled, setBundled] = useState<Issue[]>([]);
  const [imported, setImported] = useState<Issue[]>([]);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [exportDirName, setExportDirName] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const fsSupported = useMemo(() => isFsAccessSupported(), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [bundledIssues, dirName] = await Promise.all([
        loadAllBundledIssues(),
        getExportDirectoryName(),
      ]);
      const importedIssues = loadImportedIssues();
      if (cancelled) return;
      setBundled(bundledIssues);
      setImported(importedIssues);
      setExportDirName(dirName);
      const merged = mergeIssues(bundledIssues, importedIssues);
      setCurrentDate(merged[0]?.date ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const issues = useMemo(() => mergeIssues(bundled, imported), [bundled, imported]);
  const current = useMemo(
    () => issues.find((i) => i.date === currentDate) ?? null,
    [issues, currentDate],
  );
  const importedDates = useMemo(() => new Set(imported.map((i) => i.date)), [imported]);

  const showToast = useCallback((message: string, kind: Toast['kind'] = 'ok') => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const selectIssue = useCallback((date: string) => setCurrentDate(date), []);

  const importIssue = useCallback(
    (issue: Issue) => {
      setImported(upsertImportedIssue(issue));
      setCurrentDate(issue.date);
      showToast(`Edición del ${issue.date} importada.`);
    },
    [showToast],
  );

  const removeIssue = useCallback(
    (date: string) => {
      const next = removeImportedIssue(date);
      setImported(next);
      setCurrentDate((prev) => {
        if (prev !== date) return prev;
        const merged = mergeIssues(bundled, next);
        return merged[0]?.date ?? null;
      });
    },
    [bundled],
  );

  const chooseExportDir = useCallback(async () => {
    try {
      const name = await pickExportDirectory();
      if (name) {
        setExportDirName(name);
        showToast(`Carpeta de exportación: ${name}`);
      }
    } catch {
      showToast('No se pudo seleccionar la carpeta.', 'error');
    }
  }, [showToast]);

  const clearExportDir = useCallback(async () => {
    await clearExportDirectory();
    setExportDirName(null);
  }, []);

  const exportCurrent = useCallback(async () => {
    if (!current) return;
    try {
      const result = await saveFile(exportFilename(current), buildExportHtml(current));
      showToast(
        result.method === 'directory'
          ? `Guardado en «${result.directoryName}» como ${result.filename}`
          : `Descargado: ${result.filename}`,
      );
    } catch {
      showToast('La exportación falló. Revisa los permisos de la carpeta.', 'error');
    }
  }, [current, showToast]);

  const value: StoreValue = {
    loading,
    issues,
    current,
    currentDate,
    isImported: (date) => importedDates.has(date),
    fsSupported,
    exportDirName,
    toast,
    selectIssue,
    importIssue,
    removeIssue,
    chooseExportDir,
    clearExportDir,
    exportCurrent,
    dismissToast: () => setToast(null),
    notify: showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

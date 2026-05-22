import type { PersistedWorkspace, WorkspaceState } from '@/app/types/code-frame';

export const STORAGE_KEY = 'codeframe:workspace:v1';

export function readPersistedWorkspace(defaultState: WorkspaceState, defaultCode: string): PersistedWorkspace | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedWorkspace> | null;
    const persistedState = (parsed?.state ?? {}) as Partial<WorkspaceState> & { markLine?: number };
    const markLines = normalizeHighlightLines(
      Array.isArray(persistedState.markLines)
        ? persistedState.markLines
        : typeof persistedState.markLine === 'number'
          ? [persistedState.markLine]
          : defaultState.markLines,
    );

    return {
      state: {
        ...defaultState,
        ...persistedState,
        markLines,
      },
      code: typeof parsed?.code === 'string' ? parsed.code : defaultCode,
    };
  } catch {
    return null;
  }
}

export function persistWorkspace(state: WorkspaceState, code: string) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, code }));
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function sanitizeInt(value: number, fallback: number, min: number, max: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function sanitizeFloat(value: number, fallback: number, min: number, max: number) {
  if (!Number.isFinite(value)) return fallback;
  const next = Math.round(value * 100) / 100;
  return Math.max(min, Math.min(max, next));
}

export function normalizeHighlightLines(lines: number[]) {
  return Array.from(
    new Set(
      lines
        .filter((line) => Number.isFinite(line))
        .map((line) => Math.trunc(line))
        .filter((line) => line > 0 && line <= 9999),
    ),
  ).sort((a, b) => a - b);
}

export function formatHighlightLines(lines: number[]) {
  return normalizeHighlightLines(lines).join(', ');
}

export function parseHighlightLines(value: string) {
  const lines = value
    .split(',')
    .flatMap((part) => {
      const token = part.trim();
      if (!token) return [];

      const [startRaw, endRaw] = token.split('-').map((item) => Number.parseInt(item.trim(), 10));
      if (!Number.isFinite(startRaw)) return [];
      if (!Number.isFinite(endRaw)) return [startRaw];

      const start = Math.min(startRaw, endRaw);
      const end = Math.max(startRaw, endRaw);
      return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    });

  return normalizeHighlightLines(lines);
}

export function isDarkBackground(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return true;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance <= 0.5;
}

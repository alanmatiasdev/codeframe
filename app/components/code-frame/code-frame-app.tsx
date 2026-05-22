'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import { CODE_EXAMPLES, DEFAULT_CODE, DEFAULT_STATE } from '@/app/constants/code-frame';
import { escapeHtml, normalizeHighlightLines, persistWorkspace, readPersistedWorkspace } from '@/app/lib/code-frame';
import { createCodeFrameSvg } from '@/app/lib/code-frame-svg';
import type { ToastState, WorkspaceState } from '@/app/types/code-frame';
import { AppHeader } from './app-header';
import { Preview } from './preview';
import { Sidebar } from './sidebar';
import { Toast } from './toast';

export function CodeFrameApp() {
  const [state, setState] = useState<WorkspaceState>(DEFAULT_STATE);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [toast, setToast] = useState<ToastState>(null);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [, startCodeTransition] = useTransition();
  const deferredCode = useDeferredValue(code);
  const deferredLanguage = useDeferredValue(state.lang);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const persistTimerRef = useRef<number | null>(null);
  const highlightCacheRef = useRef(new Map<string, string>());

  const lines = useMemo(() => code.split('\n'), [code]);
  const deferredLines = useMemo(() => deferredCode.split('\n'), [deferredCode]);
  const highlightedLines = useMemo(() => {
    const grammar = Prism.languages[deferredLanguage as keyof typeof Prism.languages];
    const cache = highlightCacheRef.current;

    return deferredLines.map((line) => {
      if (!grammar) return escapeHtml(line);

      const cacheKey = `${deferredLanguage}:${line}`;
      const cachedLine = cache.get(cacheKey);
      if (cachedLine) return cachedLine;

      try {
        const highlightedLine = Prism.highlight(line, grammar as Prism.Grammar, deferredLanguage);
        cache.set(cacheKey, highlightedLine);

        if (cache.size > 1200) {
          cache.clear();
        }

        return highlightedLine;
      } catch {
        return escapeHtml(line);
      }
    });
  }, [deferredLanguage, deferredLines]);

  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ message, kind });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const updateState = useCallback((next: Partial<WorkspaceState> | ((current: WorkspaceState) => Partial<WorkspaceState>)) => {
    setState((current) => ({
      ...current,
      ...(typeof next === 'function' ? next(current) : next),
    }));
  }, []);

  const handleCodeChange = useCallback(
    (nextCode: string) => {
      startCodeTransition(() => {
        setCode(nextCode);
      });
    },
    [startCodeTransition],
  );

  const captureCard = useCallback(async () => {
    if (!cardRef.current) {
      throw new Error('Preview element not found');
    }

    const { default: html2canvas } = await import('html2canvas');
    await document.fonts.ready;

    return html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      onclone(doc) {
        doc.querySelector('.code-in')?.remove();
        const pre = doc.querySelector<HTMLElement>('.code-pre');
        if (pre) pre.style.overflow = 'visible';
      },
    });
  }, []);

  const handleExportPng = useCallback(async () => {
    setExporting(true);
    notify('Gerando PNG...');

    try {
      const canvas = await captureCard();
      const link = document.createElement('a');
      link.download = 'codeframe.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      notify('PNG exportado.');
    } catch (error) {
      console.error(error);
      notify('Erro ao exportar.', 'error');
    } finally {
      setExporting(false);
    }
  }, [captureCard, notify]);

  const handleExportSvg = useCallback(async () => {
    setExporting(true);
    notify('Gerando SVG...');

    try {
      if (!cardRef.current) {
        throw new Error('Preview element not found');
      }

      await document.fonts.ready;

      const svg = createCodeFrameSvg(cardRef.current);
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const link = document.createElement('a');
      link.download = 'codeframe.svg';
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      notify('SVG exportado.');
    } catch (error) {
      console.error(error);
      notify('Erro ao exportar.', 'error');
    } finally {
      setExporting(false);
    }
  }, [captureCard, notify]);

  const handleCopyImage = useCallback(async () => {
    setExporting(true);
    notify('Copiando imagem...');

    try {
      const canvas = await captureCard();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

      if (!blob) {
        throw new Error('Could not create image blob');
      }

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      notify('Imagem copiada.');
    } catch (error) {
      console.error(error);
      notify('Clipboard indisponível neste browser.', 'error');
    } finally {
      setExporting(false);
    }
  }, [captureCard, notify]);

  const handleLanguageChange = useCallback(
    (language: string) => {
      const example = CODE_EXAMPLES[language];

      updateState({
        lang: language,
        fileName: example?.fileName ?? DEFAULT_STATE.fileName,
        markLines: example?.markLines ?? [],
        lineStart: 1,
      });

      if (example) {
        setCode(example.code);
      }
    },
    [updateState],
  );

  const handleToggleMarkLine = useCallback(
    (lineNumber: number, additive: boolean) => {
      updateState((current) => ({
        markLines: additive
          ? normalizeHighlightLines(
              current.markLines.includes(lineNumber)
                ? current.markLines.filter((markedLine) => markedLine !== lineNumber)
                : [...current.markLines, lineNumber],
            )
          : current.markLines.length === 1 && current.markLines[0] === lineNumber
            ? []
            : [lineNumber],
      }));
    },
    [updateState],
  );

  useEffect(() => {
    const saved = readPersistedWorkspace(DEFAULT_STATE, DEFAULT_CODE);
    if (saved) {
      setState(saved.state);
      setCode(saved.code);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = window.setTimeout(() => {
      persistWorkspace(state, code);
    }, 350);
  }, [state, code, ready]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <AppHeader exporting={exporting} onCopyImage={handleCopyImage} onExportSvg={handleExportSvg} onExportPng={handleExportPng} />

      <div className="body" data-od-id="body">
        <Sidebar state={state} updateState={updateState} onLanguageChange={handleLanguageChange} />
        <Preview
          code={code}
          lines={lines}
          highlightedLines={highlightedLines}
          state={state}
          cardRef={cardRef}
          inputRef={inputRef}
          onCodeChange={handleCodeChange}
          onToggleMarkLine={handleToggleMarkLine}
        />
      </div>

      <Toast toast={toast} />
    </div>
  );
}

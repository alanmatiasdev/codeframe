import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, ChangeEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';
import type { WorkspaceState } from '@/app/types/code-frame';

type PreviewProps = {
  code: string;
  lines: string[];
  highlightedLines: string[];
  state: WorkspaceState;
  cardRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onCodeChange: (value: string) => void;
  onToggleMarkLine: (lineNumber: number, additive: boolean) => void;
};

export function Preview({
  code,
  lines,
  highlightedLines,
  state,
  cardRef,
  inputRef,
  onCodeChange,
  onToggleMarkLine,
}: Readonly<PreviewProps>) {
  const cardClassName = `code-card ${state.theme === 'dark' ? 'am-syntax-black' : 'am-syntax-white'}`;
  const markedLines = useMemo(() => new Set(state.markLines), [state.markLines]);
  const inputValueRef = useRef(code);
  const changeFrameRef = useRef<number | null>(null);
  const onCodeChangeRef = useRef(onCodeChange);
  const lastEmittedCodeRef = useRef(code);

  const cardStyle = {
    width: state.fullWidth ? `${state.width}px` : undefined,
    maxWidth: state.fullWidth ? `${state.width}px` : '940px',
    background: state.customBg ? state.bg : 'var(--am-syntax-bg)',
    ['--cfs' as string]: `${state.fs}px`,
    ['--clh' as string]: state.lh,
  } as CSSProperties;

  const innerStyle = {
    ['--cp' as string]: `${state.pad}px`,
  } as CSSProperties;

  const fontStyle = {
    fontFamily: `"${state.font}", ui-monospace, monospace`,
  } as CSSProperties;

  const handleLineClick = (event: MouseEvent<HTMLSpanElement>, lineNumber: number) => {
    onToggleMarkLine(lineNumber, event.ctrlKey || event.metaKey);
  };

  const syncTextareaHeight = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const flushCodeChange = useCallback(() => {
    if (changeFrameRef.current !== null) {
      window.cancelAnimationFrame(changeFrameRef.current);
      changeFrameRef.current = null;
    }

    lastEmittedCodeRef.current = inputValueRef.current;
    onCodeChangeRef.current(inputValueRef.current);
  }, []);

  const scheduleCodeChange = useCallback(() => {
    if (changeFrameRef.current !== null) return;

    changeFrameRef.current = window.requestAnimationFrame(() => {
      changeFrameRef.current = null;
      lastEmittedCodeRef.current = inputValueRef.current;
      onCodeChangeRef.current(inputValueRef.current);
    });
  }, []);

  const handleCodeChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      inputValueRef.current = event.currentTarget.value;
      syncTextareaHeight(event.currentTarget);
      scheduleCodeChange();
    },
    [scheduleCodeChange, syncTextareaHeight],
  );

  const insertText = useCallback(
    (textarea: HTMLTextAreaElement, value: string, selectionOffset: number) => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextValue = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
      const nextSelection = start + selectionOffset;

      textarea.value = nextValue;
      textarea.selectionStart = textarea.selectionEnd = nextSelection;
      inputValueRef.current = nextValue;
      syncTextareaHeight(textarea);
      scheduleCodeChange();
    },
    [scheduleCodeChange, syncTextareaHeight],
  );

  const handleCodeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        insertText(event.currentTarget, '  ', 2);
        return;
      }

      if (event.key === 'Enter') {
        const textarea = event.currentTarget;
        const lineStart = textarea.value.lastIndexOf('\n', textarea.selectionStart - 1) + 1;
        const indentation = textarea.value.slice(lineStart, textarea.selectionStart).match(/^\s*/)?.[0] ?? '';

        if (indentation) {
          event.preventDefault();
          insertText(textarea, `\n${indentation}`, indentation.length + 1);
        }
      }
    },
    [insertText],
  );

  useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
  }, [onCodeChange]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (input.value === code) {
      inputValueRef.current = code;
      lastEmittedCodeRef.current = code;
      syncTextareaHeight(input);
      return;
    }

    if (document.activeElement === input) {
      syncTextareaHeight(input);
      return;
    }

    if (code !== lastEmittedCodeRef.current && input.value !== code) {
      input.value = code;
      inputValueRef.current = code;
      lastEmittedCodeRef.current = code;
    }

    syncTextareaHeight(input);
  }, [code, inputRef, syncTextareaHeight]);

  useEffect(() => {
    return () => {
      if (changeFrameRef.current !== null) {
        window.cancelAnimationFrame(changeFrameRef.current);
      }
    };
  }, []);

  return (
    <main className="preview" data-od-id="preview">
      <div className="preview-scroll">
        <div id="code-card" ref={cardRef} className={cardClassName} style={cardStyle}>
          <div className="card-inner" style={innerStyle}>
            <div className={`wchrome w-${state.win}`} id="wchrome">
              <div className="wdots" aria-hidden="true">
                <span className="wdot wdot-r" />
                <span className="wdot wdot-y" />
                <span className="wdot wdot-g" />
              </div>
              <span className="wlang">{state.lang}</span>
              <span className="wfname">{state.fileName || '—'}</span>
            </div>

            <div className="code-area">
              <div className={`lnums${state.lineNumbers ? '' : ' off'}`} aria-hidden="true" style={fontStyle}>
                {lines.map((_, index) => {
                  const lineNumber = index + state.lineStart;
                  const marked = markedLines.has(lineNumber);
                  return (
                    <span
                      key={`${lineNumber}-${index}`}
                      className={marked ? 'marked' : undefined}
                      data-line={lineNumber}
                      onClick={(event) => handleLineClick(event, lineNumber)}
                    >
                      {lineNumber}
                    </span>
                  );
                })}
              </div>

              <div className="code-pane">
                <pre className="code-pre" style={fontStyle}>
                  <code className="code-out">
                    {lines.map((_, index) => {
                      const lineNumber = index + state.lineStart;
                      const marked = markedLines.has(lineNumber);
                      return (
                        <span
                          key={`${lineNumber}-${index}`}
                          className={`code-line${marked ? ' marked' : ''}`}
                          data-line={lineNumber}
                          dangerouslySetInnerHTML={{ __html: highlightedLines[index] ?? '' }}
                        />
                      );
                    })}
                  </code>
                </pre>
                <textarea
                  ref={inputRef}
                  className="code-in"
                  id="code-in"
                  defaultValue={code}
                  onBlur={flushCodeChange}
                  onChange={handleCodeChange}
                  onKeyDown={handleCodeKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  wrap="off"
                  aria-label="Editor de código"
                  style={fontStyle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

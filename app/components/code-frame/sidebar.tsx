import { memo, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FONTS, LANGUAGES, SWATCHES, THEMES, WINDOWS } from '@/app/constants/code-frame';
import { formatHighlightLines, isDarkBackground, parseHighlightLines, sanitizeFloat, sanitizeInt } from '@/app/lib/code-frame';
import type { ThemeMode, WindowMode, WorkspaceState } from '@/app/types/code-frame';
import { ControlGroup, RangeField, SelectField, ToggleField } from './controls';

type SidebarProps = {
  state: WorkspaceState;
  updateState: (next: Partial<WorkspaceState> | ((current: WorkspaceState) => Partial<WorkspaceState>)) => void;
  onLanguageChange: (language: string) => void;
};

function SidebarComponent({ state, updateState, onLanguageChange }: Readonly<SidebarProps>) {
  const [highlightValue, setHighlightValue] = useState(() => formatHighlightLines(state.markLines));

  useEffect(() => {
    setHighlightValue(formatHighlightLines(state.markLines));
  }, [state.markLines]);

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const theme = event.target.value as ThemeMode;
    updateState({
      theme,
      customBg: false,
      bg: theme === 'dark' ? '#0B0B0D' : '#F7F7F8',
    });
  };

  const applyColor = (bg: string) => {
    updateState({
      bg,
      customBg: true,
      theme: isDarkBackground(bg) ? 'dark' : 'light',
    });
  };

  return (
    <aside className="sidebar" data-od-id="sidebar">
      <ControlGroup title="Language">
        <SelectField id="ctrl-lang" value={state.lang} options={LANGUAGES} onChange={(event) => onLanguageChange(event.target.value)} />
      </ControlGroup>

      <ControlGroup title="Theme">
        <SelectField id="ctrl-theme" value={state.theme} options={THEMES} onChange={handleThemeChange} />
        <SelectField
          id="ctrl-win"
          label="Window"
          value={state.win}
          options={WINDOWS}
          onChange={(event) => updateState({ win: event.target.value as WindowMode })}
        />
        <div className="ctrl-f">
          <label className="ctrl-lbl" htmlFor="ctrl-fname">
            Filename
          </label>
          <input
            type="text"
            className="ctrl-inp"
            id="ctrl-fname"
            value={state.fileName}
            placeholder="index.php"
            onChange={(event) => updateState({ fileName: event.target.value })}
          />
        </div>
      </ControlGroup>

      <ControlGroup title="Typography">
        <SelectField
          id="ctrl-font"
          label="Font"
          value={state.font}
          options={FONTS.map((font) => ({ value: font, label: font === 'ui-monospace' ? 'System Mono' : font }))}
          onChange={(event) => updateState({ font: event.target.value })}
        />
        <RangeField
          id="ctrl-fs"
          label="Font Size"
          value={state.fs}
          min={10}
          max={24}
          step={1}
          onChange={(event) => updateState({ fs: sanitizeInt(Number.parseFloat(event.target.value), state.fs, 10, 24) })}
        />
        <RangeField
          id="ctrl-lh"
          label="Line Height"
          value={state.lh}
          min={1.2}
          max={2}
          step={0.05}
          onChange={(event) => updateState({ lh: sanitizeFloat(Number.parseFloat(event.target.value), state.lh, 1.2, 2) })}
        />
      </ControlGroup>

      <ControlGroup title="Layout">
        <RangeField
          id="ctrl-pad"
          label="Padding"
          value={state.pad}
          min={16}
          max={80}
          step={4}
          onChange={(event) => updateState({ pad: sanitizeInt(Number.parseFloat(event.target.value), state.pad, 16, 80) })}
        />
        <div className="ctrl-f">
          <ToggleField id="ctrl-fw" label="Fixed width" checked={state.fullWidth} onChange={(event) => updateState({ fullWidth: event.target.checked })} />
          <RangeField
            id="ctrl-w"
            label=""
            value={state.width}
            min={400}
            max={1200}
            step={20}
            disabled={!state.fullWidth}
            onChange={(event) => updateState({ width: sanitizeInt(Number.parseFloat(event.target.value), state.width, 400, 1200) })}
          />
        </div>
        <ToggleField
          id="ctrl-ln"
          label="Line numbers"
          checked={state.lineNumbers}
          onChange={(event) => updateState({ lineNumbers: event.target.checked })}
        />
        <div className="ctrl-f">
          <label className="ctrl-lbl" htmlFor="ctrl-line-start">
            Start line
          </label>
          <input
            type="number"
            className="ctrl-inp"
            id="ctrl-line-start"
            min={0}
            max={9999}
            step={1}
            value={state.lineStart}
            onChange={(event) => updateState({ lineStart: sanitizeInt(Number.parseFloat(event.target.value), 1, 0, 9999) })}
          />
        </div>
        <div className="ctrl-f">
          <label className="ctrl-lbl" htmlFor="ctrl-line-mark">
            Highlight lines
          </label>
          <input
            type="text"
            className="ctrl-inp"
            id="ctrl-line-mark"
            value={highlightValue}
            placeholder="3, 5-7"
            onChange={(event) => {
              const nextValue = event.target.value;
              setHighlightValue(nextValue);
              updateState({ markLines: parseHighlightLines(nextValue) });
            }}
            onBlur={() => setHighlightValue(formatHighlightLines(state.markLines))}
          />
        </div>
      </ControlGroup>

      <ControlGroup title="Background">
        <div className="ctrl-f">
          <label className="ctrl-lbl">Card color</label>
          <div className="sw-row" role="group" aria-label="Card color">
            {SWATCHES.map((swatch) => {
              const active = state.customBg && state.bg.toLowerCase() === swatch.value.toLowerCase();
              return (
                <button
                  key={swatch.value}
                  type="button"
                  className={`sw${active ? ' active' : ''}`}
                  style={{
                    background: swatch.value,
                    borderColor: active ? undefined : swatch.borderColor,
                  }}
                  title={swatch.title}
                  aria-label={swatch.title}
                  onClick={() => applyColor(swatch.value)}
                />
              );
            })}
            <label className="sw sw-custom" style={{ background: 'conic-gradient(#E75521,#9333EA,#06B6D4,#E75521)' }} title="Custom">
              <input type="color" id="ctrl-cc" value={state.bg} onChange={(event) => applyColor(event.target.value)} aria-label="Custom card color" />
            </label>
          </div>
        </div>
      </ControlGroup>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);

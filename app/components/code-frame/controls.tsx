import type { ChangeEvent, ReactNode } from 'react';
import type { Option } from '@/app/types/code-frame';

type SelectFieldProps<T extends string> = {
  id: string;
  label?: string;
  value: T;
  options: Array<Option<T>>;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

type RangeFieldProps = {
  id: string;
  label?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type ToggleFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ControlGroup({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className="ctrl-grp">
      <p className="ctrl-grp-ttl">{title}</p>
      {children}
    </div>
  );
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: Readonly<SelectFieldProps<T>>) {
  return (
    <div className="ctrl-f">
      {label ? (
        <label className="ctrl-lbl" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select className="ctrl-sel" id={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: Readonly<RangeFieldProps>) {
  return (
    <div className="ctrl-f">
      {label ? (
        <label className="ctrl-lbl" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="rng-row" style={disabled ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
        <input
          type="range"
          className="ctrl-rng"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <span className="rng-val">{value}</span>
      </div>
    </div>
  );
}

export function ToggleField({ id, label, checked, onChange }: Readonly<ToggleFieldProps>) {
  return (
    <div className="tog-row">
      <span className="tog-lbl">{label}</span>
      <label className="tog" aria-label={label}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <span className="tog-track" />
      </label>
    </div>
  );
}

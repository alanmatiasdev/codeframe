export type ThemeMode = 'dark' | 'light';

export type WindowMode = 'macos' | 'minimal' | 'none';

export type WorkspaceState = {
  lang: string;
  theme: ThemeMode;
  win: WindowMode;
  fileName: string;
  font: string;
  fs: number;
  lh: number;
  pad: number;
  fullWidth: boolean;
  width: number;
  lineNumbers: boolean;
  lineStart: number;
  markLines: number[];
  bg: string;
  customBg: boolean;
};

export type PersistedWorkspace = {
  state: WorkspaceState;
  code: string;
};

export type ToastState = {
  message: string;
  kind: 'success' | 'error';
} | null;

export type Option<T extends string = string> = {
  value: T;
  label: string;
};

export type ColorSwatch = {
  value: string;
  title: string;
  borderColor?: string;
};

export type CodeExample = {
  code: string;
  fileName: string;
  markLines: number[];
};

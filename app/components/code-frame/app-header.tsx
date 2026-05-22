type AppHeaderProps = {
  exporting: boolean;
  onCopyImage: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
};

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function AppHeader({ exporting, onCopyImage, onExportSvg, onExportPng }: Readonly<AppHeaderProps>) {
  return (
    <header className="hdr" data-od-id="header">
      <div className="logo">
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 1.5L1.5 18.5h4.7l1.6-3.7h4.4l1.6 3.7h4.7L10 1.5zm-1.8 10.7 1.8-4.1 1.8 4.1H8.2z"
            fill="#E75521"
          />
        </svg>
        <span>
          code<em>frame</em>
        </span>
      </div>

      <div className="hdr-actions">
        <button className="btn btn-ghost" type="button" onClick={onCopyImage} disabled={exporting}>
          <CopyIcon />
          <span>Copiar</span>
        </button>
        <button className="btn btn-ghost" type="button" onClick={onExportSvg} disabled={exporting}>
          <DownloadIcon />
          <span>SVG</span>
        </button>
        <button className="btn btn-primary" type="button" onClick={onExportPng} disabled={exporting}>
          <DownloadIcon />
          <span>{exporting ? 'Exportando' : 'Export PNG'}</span>
        </button>
      </div>
    </header>
  );
}

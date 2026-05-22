type SvgToken = {
  text: string;
  fill: string;
  fontStyle?: string;
  fontWeight?: string;
};

type SvgColors = {
  fg: string;
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  type: string;
  property: string;
  punctuation: string;
};

const SVG_NS = 'http://www.w3.org/2000/svg';

function attr(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function text(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function num(value: number) {
  if (!Number.isFinite(value)) return '0';
  return Number.parseFloat(value.toFixed(3)).toString();
}

function cssVar(style: CSSStyleDeclaration, name: string, fallback: string) {
  return style.getPropertyValue(name).trim() || fallback;
}

function px(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function rectFor(element: Element, root: DOMRect) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - root.left,
    y: rect.top - root.top,
    width: rect.width,
    height: rect.height,
    right: rect.right - root.left,
    bottom: rect.bottom - root.top,
  };
}

function classesFor(node: Node) {
  const classes = new Set<string>();
  let current: Node | null = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const element = current as Element;
    element.classList.forEach((className) => classes.add(className));
    current = current.parentNode;
  }

  return classes;
}

function tokenStyle(classes: Set<string>, colors: SvgColors): Omit<SvgToken, 'text'> {
  if (classes.has('comment') || classes.has('prolog') || classes.has('doctype') || classes.has('cdata')) {
    return { fill: colors.comment, fontStyle: 'italic' };
  }

  if (classes.has('keyword') || classes.has('atrule') || classes.has('tag')) {
    return { fill: colors.keyword, fontWeight: '500' };
  }

  if (classes.has('string') || classes.has('char') || classes.has('attr-value') || classes.has('inserted')) {
    return { fill: colors.string };
  }

  if (classes.has('boolean') || classes.has('number') || classes.has('constant') || classes.has('deleted') || classes.has('symbol')) {
    return { fill: colors.number };
  }

  if (classes.has('function')) {
    return { fill: colors.function };
  }

  if (classes.has('class-name') || classes.has('builtin') || classes.has('namespace')) {
    return { fill: colors.type };
  }

  if (classes.has('attr-name') || classes.has('property')) {
    return { fill: colors.property };
  }

  if (classes.has('punctuation') || classes.has('operator') || classes.has('entity') || classes.has('url')) {
    return { fill: colors.punctuation };
  }

  return { fill: colors.fg };
}

function mergeToken(tokens: SvgToken[], token: SvgToken) {
  const previous = tokens.at(-1);

  if (
    previous &&
    previous.fill === token.fill &&
    previous.fontStyle === token.fontStyle &&
    previous.fontWeight === token.fontWeight
  ) {
    previous.text += token.text;
    return;
  }

  tokens.push(token);
}

function tokensFromHtml(html: string, colors: SvgColors) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const tokens: SvgToken[] = [];

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent ?? '';
      if (value) {
        mergeToken(tokens, { text: value, ...tokenStyle(classesFor(node), colors) });
      }
      return;
    }

    node.childNodes.forEach(visit);
  };

  template.content.childNodes.forEach(visit);
  return tokens;
}

function tokenMarkup(tokens: SvgToken[]) {
  return tokens
    .map((token) => {
      const fontStyle = token.fontStyle ? ` font-style="${attr(token.fontStyle)}"` : '';
      const fontWeight = token.fontWeight ? ` font-weight="${attr(token.fontWeight)}"` : '';
      return `<tspan fill="${attr(token.fill)}"${fontStyle}${fontWeight}>${text(token.text)}</tspan>`;
    })
    .join('');
}

function textElement({
  className,
  x,
  y,
  fill,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  textAnchor,
  content,
}: {
  className?: string;
  x: number;
  y: number;
  fill: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: string;
  letterSpacing?: string;
  textAnchor?: 'start' | 'end';
  content: string;
}) {
  const classAttr = className ? ` class="${attr(className)}"` : '';
  const weightAttr = fontWeight ? ` font-weight="${attr(fontWeight)}"` : '';
  const spacingAttr = letterSpacing ? ` letter-spacing="${attr(letterSpacing)}"` : '';
  const anchorAttr = textAnchor ? ` text-anchor="${textAnchor}"` : '';

  return `<text${classAttr} x="${num(x)}" y="${num(y)}" fill="${attr(fill)}" font-family="${attr(fontFamily)}" font-size="${num(
    fontSize,
  )}"${weightAttr}${spacingAttr}${anchorAttr} dominant-baseline="text-before-edge" xml:space="preserve">${content}</text>`;
}

function lineTextY(element: HTMLElement, root: DOMRect) {
  const rect = rectFor(element, root);
  return rect.y + Math.max(0, (rect.height - px(getComputedStyle(element).fontSize)) / 2);
}

export function createCodeFrameSvg(card: HTMLElement) {
  const rootRect = card.getBoundingClientRect();
  const cardStyle = getComputedStyle(card);
  const width = Math.ceil(rootRect.width);
  const height = Math.ceil(rootRect.height);
  const radius = px(cardStyle.borderTopLeftRadius, 0);
  const colors: SvgColors = {
    fg: cssVar(cardStyle, '--am-syntax-fg', '#25252A'),
    comment: cssVar(cardStyle, '--am-syntax-comment', '#65656D'),
    keyword: cssVar(cardStyle, '--am-syntax-keyword', '#7E22CE'),
    string: cssVar(cardStyle, '--am-syntax-string', '#0F6A47'),
    number: cssVar(cardStyle, '--am-syntax-number', '#1D4ED8'),
    function: cssVar(cardStyle, '--am-syntax-function', '#A83716'),
    type: cssVar(cardStyle, '--am-syntax-type', '#0E7490'),
    property: cssVar(cardStyle, '--am-syntax-property', '#B45309'),
    punctuation: cssVar(cardStyle, '--am-syntax-punctuation', '#4A4A52'),
  };
  const parts: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="${SVG_NS}" width="${num(width)}" height="${num(height)}" viewBox="0 0 ${num(width)} ${num(height)}" role="img">`,
    `<defs><clipPath id="codeframe-card-clip"><rect x="0" y="0" width="${num(width)}" height="${num(height)}" rx="${num(
      radius,
    )}"/></clipPath></defs>`,
    `<rect x="0.5" y="0.5" width="${num(width - 1)}" height="${num(height - 1)}" rx="${num(radius)}" fill="${attr(
      cardStyle.backgroundColor,
    )}" stroke="${attr(cardStyle.borderTopColor)}"/>`,
    `<g clip-path="url(#codeframe-card-clip)">`,
  ];

  const chrome = card.querySelector<HTMLElement>('.wchrome');
  if (chrome && getComputedStyle(chrome).display !== 'none') {
    const chromeRect = rectFor(chrome, rootRect);
    const chromeStyle = getComputedStyle(chrome);

    parts.push(
      `<rect x="${num(chromeRect.x)}" y="${num(chromeRect.y)}" width="${num(chromeRect.width)}" height="${num(
        chromeRect.height,
      )}" fill="${attr(chromeStyle.backgroundColor)}"/>`,
      `<line x1="${num(chromeRect.x)}" y1="${num(chromeRect.bottom - 0.5)}" x2="${num(chromeRect.right)}" y2="${num(
        chromeRect.bottom - 0.5,
      )}" stroke="${attr(cardStyle.borderTopColor)}"/>`,
    );

    const dots = Array.from(chrome.querySelectorAll<HTMLElement>('.wdot'));
    if (dots.length > 0 && getComputedStyle(dots[0].parentElement as HTMLElement).display !== 'none') {
      dots.forEach((dot) => {
        const dotRect = rectFor(dot, rootRect);
        parts.push(
          `<circle cx="${num(dotRect.x + dotRect.width / 2)}" cy="${num(dotRect.y + dotRect.height / 2)}" r="${num(
            dotRect.width / 2,
          )}" fill="${attr(getComputedStyle(dot).backgroundColor)}"/>`,
        );
      });
    } else {
      parts.push(
        `<rect x="${num(chromeRect.x + 14)}" y="${num(chromeRect.y + chromeRect.height / 2 - 1)}" width="24" height="2" rx="1" fill="${attr(
          cardStyle.borderTopColor,
        )}"/>`,
      );
    }

    const lang = chrome.querySelector<HTMLElement>('.wlang');
    if (lang) {
      const langRect = rectFor(lang, rootRect);
      const langStyle = getComputedStyle(lang);
      parts.push(
        `<rect x="${num(langRect.x)}" y="${num(langRect.y)}" width="${num(langRect.width)}" height="${num(langRect.height)}" rx="${num(
          px(langStyle.borderTopLeftRadius, 0),
        )}" fill="none" stroke="${attr(langStyle.borderTopColor)}"/>`,
        textElement({
          x: langRect.x + px(langStyle.paddingLeft),
          y: langRect.y + px(langStyle.paddingTop),
          fill: langStyle.color,
          fontFamily: langStyle.fontFamily,
          fontSize: px(langStyle.fontSize),
          letterSpacing: langStyle.letterSpacing,
          content: text(lang.textContent ?? ''),
        }),
      );
    }

    const fileName = chrome.querySelector<HTMLElement>('.wfname');
    if (fileName) {
      const fileNameRect = rectFor(fileName, rootRect);
      const fileNameStyle = getComputedStyle(fileName);
      parts.push(
        textElement({
          x: fileNameRect.x,
          y: lineTextY(fileName, rootRect),
          fill: fileNameStyle.color,
          fontFamily: fileNameStyle.fontFamily,
          fontSize: px(fileNameStyle.fontSize),
          letterSpacing: fileNameStyle.letterSpacing,
          content: text(fileName.textContent ?? ''),
        }),
      );
    }
  }

  const markedLineFill = cssVar(cardStyle, '--am-syntax-mark-bg', 'rgba(231,85,33,0.09)');
  const markedLineStroke = cssVar(cardStyle, '--am-syntax-mark-line', '#E75521');
  const lineNumberActive = cssVar(cardStyle, '--am-syntax-gutter-active', '#65656D');
  const lineNumberDefault = cssVar(cardStyle, '--am-syntax-gutter', '#B6B6BD');
  const lineNumberSpans = Array.from(card.querySelectorAll<HTMLElement>('.lnums span'));
  const codeLines = Array.from(card.querySelectorAll<HTMLElement>('.code-line'));

  codeLines.forEach((line) => {
    if (!line.classList.contains('marked')) return;

    const lineRect = rectFor(line, rootRect);
    parts.push(
      `<rect x="${num(lineRect.x)}" y="${num(lineRect.y)}" width="${num(lineRect.width)}" height="${num(lineRect.height)}" fill="${attr(
        markedLineFill,
      )}"/>`,
    );
  });

  lineNumberSpans.forEach((lineNumber) => {
    if (getComputedStyle(lineNumber).display === 'none') return;
    const lineNumberRect = rectFor(lineNumber, rootRect);
    if (lineNumberRect.width === 0 && lineNumberRect.height === 0) return;

    const lineNumberStyle = getComputedStyle(lineNumber);
    const isMarked = lineNumber.classList.contains('marked');

    if (isMarked) {
      parts.push(
        `<rect x="${num(lineNumberRect.x)}" y="${num(lineNumberRect.y)}" width="${num(lineNumberRect.width)}" height="${num(
          lineNumberRect.height,
        )}" fill="${attr(markedLineFill)}"/>`,
        `<rect x="${num(lineNumberRect.x)}" y="${num(lineNumberRect.y)}" width="3" height="${num(lineNumberRect.height)}" fill="${attr(
          markedLineStroke,
        )}"/>`,
      );
    }

    parts.push(
      textElement({
        x: lineNumberRect.right,
        y: lineTextY(lineNumber, rootRect),
        fill: isMarked ? lineNumberActive : lineNumberDefault,
        fontFamily: lineNumberStyle.fontFamily,
        fontSize: px(lineNumberStyle.fontSize),
        textAnchor: 'end',
        content: text(lineNumber.textContent ?? ''),
      }),
    );
  });

  codeLines.forEach((line) => {
    const lineRect = rectFor(line, rootRect);
    const lineStyle = getComputedStyle(line);
    const tokens = tokensFromHtml(line.innerHTML, colors);

    parts.push(
      textElement({
        className: 'code-line-text',
        x: lineRect.x + px(lineStyle.paddingLeft),
        y: lineTextY(line, rootRect),
        fill: colors.fg,
        fontFamily: lineStyle.fontFamily,
        fontSize: px(lineStyle.fontSize),
        content: tokenMarkup(tokens),
      }),
    );
  });

  parts.push('</g>', '</svg>');
  return `${parts.join('\n')}\n`;
}

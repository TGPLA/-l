// @审计已完成
// EPUB CFI 计算工具

export interface XuanZe XinXi {
  selectedText: string;
  cfiRange: string;
  range: Range;
  rect: DOMRect;
}

export function jiSuanCFi(range: Range, cfiRange: string, contents: any): string {
  const doc = contents.document;
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;

  function getTextNodePath(node: Node, doc: Document): string {
    if (node.nodeType === Node.TEXT_NODE) {
      let path = '';
      let current = node.parentElement;
      while (current && current !== doc.body) {
        const siblings = Array.from(current.parentElement?.children || []);
        const index = siblings.indexOf(current) + 1;
        path = `/${index}${path}`;
        current = current.parentElement;
      }
      return path;
    }
    return '';
  }

  function getCfiTextLocation(node: Node, offset: number): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return `:${offset}`;
    }
    return '';
  }

  const startPath = getTextNodePath(startContainer, doc);
  const endPath = getTextNodePath(endContainer, doc);
  const startLocation = getCfiTextLocation(startContainer, startOffset);
  const endLocation = getCfiTextLocation(endContainer, endOffset);

  const cfiBaseMatch = cfiRange.match(/epubcfi\(([^!]+)/);
  const base = cfiBaseMatch ? cfiBaseMatch[1] : '/6/4';

  let computedCfi = '';
  const adjustedRange = doc.createRange();
  try {
    adjustedRange.setStart(startContainer, startOffset);
    adjustedRange.setEnd(endContainer, endOffset);
    computedCfi = contents.cfiFromRange(adjustedRange) || '';
  } catch {
    computedCfi = contents.cfiFromRange(range) || '';
  }

  if (computedCfi) {
    const pathMatch = computedCfi.match(/epubcfi\([^!]+!(.+)\)/);
    const pathPart = pathMatch ? pathMatch[1] : `${startPath}${startLocation},${endPath}${endLocation}`;
    return `epubcfi(${base}!${pathPart})`;
  } else if (startPath && endPath) {
    return `epubcfi(${base}!${startPath}${startLocation},${endPath}${endLocation})`;
  }
  return cfiRange;
}

export function jiSuanWeiZhi(rect: RangeRect, iframe: Element | null): DOMRect {
  if (iframe) {
    const iframeRect = iframe.getBoundingClientRect();
    return {
      top: rect.top + iframeRect.top,
      left: rect.left + iframeRect.left,
      width: rect.width,
      height: rect.height,
      right: rect.right + iframeRect.left,
      bottom: rect.bottom + iframeRect.top,
    };
  }
  return rect as DOMRect;
}
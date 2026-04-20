// @审计已完成
// EPUB CFI 计算工具

export interface XuanZeXinXi {
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

  function getNodePath(node: Node, doc: Document): string {
    let path = '';
    let current: Element | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
    while (current && current !== doc.body) {
      const siblings = Array.from(current.parentElement?.children || []);
      const index = siblings.indexOf(current) + 1;
      path = `/${index}${path}`;
      current = current.parentElement;
    }
    return path;
  }

  function getCfiTextLocation(node: Node, offset: number): string {
    return `:${offset}`;
  }

  const startPath = getNodePath(startContainer, doc);
  const endPath = getNodePath(endContainer, doc);
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

interface WeiZhiXinXi {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export function jiSuanWeiZhi(rect: WeiZhiXinXi, iframe: Element | null): DOMRect {
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
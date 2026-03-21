// @审计已完成
// EPUB 解析逻辑层 - OPF/NCX/NAV 文件解析

import type { EPUBMetadata, ManifestItem, SpineItem } from './epubTypes';

export function jieXiOPF(content: string): {
  metadata: EPUBMetadata;
  manifest: ManifestItem[];
  spine: SpineItem[];
  ncxHref: string | null;
  navHref: string | null;
} {
  const metadata: EPUBMetadata = {
    title: '',
    author: '',
    publisher: '',
    date: '',
  };
  
  const titleMatch = content.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/i);
  if (titleMatch) metadata.title = titleMatch[1].trim();
  
  const creatorMatch = content.match(/<dc:creator[^>]*>([^<]*)<\/dc:creator>/i);
  if (creatorMatch) metadata.author = creatorMatch[1].trim();
  
  const publisherMatch = content.match(/<dc:publisher[^>]*>([^<]*)<\/dc:publisher>/i);
  if (publisherMatch) metadata.publisher = publisherMatch[1].trim();
  
  const dateMatch = content.match(/<dc:date[^>]*>([^<]*)<\/dc:date>/i);
  if (dateMatch) metadata.date = dateMatch[1].trim();
  
  const manifest: ManifestItem[] = [];
  let ncxHref: string | null = null;
  let navHref: string | null = null;
  
  const manifestRegex = /<item\s+[^>]*\/>/gi;
  let match;
  while ((match = manifestRegex.exec(content)) !== null) {
    const itemStr = match[0];
    const idMatch = itemStr.match(/id=["']([^"']+)["']/i);
    const hrefMatch = itemStr.match(/href=["']([^"']+)["']/i);
    const mediaTypeMatch = itemStr.match(/media-type=["']([^"']+)["']/i);
    const propertiesMatch = itemStr.match(/properties=["']([^"']+)["']/i);
    
    if (idMatch && hrefMatch) {
      const item: ManifestItem = {
        id: idMatch[1],
        href: hrefMatch[1],
        mediaType: mediaTypeMatch ? mediaTypeMatch[1] : '',
        properties: propertiesMatch ? propertiesMatch[1] : undefined,
      };
      manifest.push(item);
      
      if (item.mediaType === 'application/x-dtbncx+xml') {
        ncxHref = item.href;
      }
      if (item.properties && item.properties.includes('nav')) {
        navHref = item.href;
      }
    }
  }
  
  const spine: SpineItem[] = [];
  const spineRegex = /<itemref\s+[^>]*\/>/gi;
  while ((match = spineRegex.exec(content)) !== null) {
    const itemStr = match[0];
    const idrefMatch = itemStr.match(/idref=["']([^"']+)["']/i);
    if (idrefMatch) {
      spine.push({ idref: idrefMatch[1] });
    }
  }
  
  return { metadata, manifest, spine, ncxHref, navHref };
}

export function jieXiNCX(ncxContent: string, titles: Map<string, string>): void {
  const navPointRegex = /<navPoint[^>]*>[\s\S]*?<\/navPoint>/gi;
  let match;
  
  while ((match = navPointRegex.exec(ncxContent)) !== null) {
    const navPoint = match[0];
    
    const textMatch = navPoint.match(/<text[^>]*>([^<]*)<\/text>/i);
    const srcMatch = navPoint.match(/<content[^>]*src=["']([^"']+)["']/i);
    
    if (textMatch && srcMatch) {
      const title = textMatch[1].trim();
      let href = srcMatch[1].split('#')[0];
      href = guiFanHuaHref(href);
      
      if (title && href && !titles.has(href)) {
        titles.set(href, title);
      }
    }
  }
}

export function jieXiNAV(navContent: string, titles: Map<string, string>): void {
  const liRegex = /<li[^>]*>[\s\S]*?<\/li>/gi;
  let match;
  
  while ((match = liRegex.exec(navContent)) !== null) {
    const li = match[0];
    
    const aRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/i;
    const aMatch = li.match(aRegex);
    
    if (aMatch) {
      const title = aMatch[2].trim();
      let href = aMatch[1].split('#')[0];
      href = guiFanHuaHref(href);
      
      if (title && href && !titles.has(href)) {
        titles.set(href, title);
      }
    }
  }
}

export function guiFanHuaHref(href: string): string {
  try {
    return decodeURIComponent(href);
  } catch {
    return href;
  }
}

export function tiQuBiaoTi(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    return titleMatch[1].trim();
  }
  
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match && h1Match[1].trim()) {
    return h1Match[1].trim();
  }
  
  return null;
}

export function qingLiHTML(html: string): string {
  let text = html;
  
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  text = text.replace(/<[^>]+>/g, '\n');
  
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');
  
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.replace(/^\s+|\s+$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
}

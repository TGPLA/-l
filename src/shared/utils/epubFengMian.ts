// @审计已完成
// EPUB 封面提取工具

import JSZip from 'jszip';

interface OPFManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties?: string;
}

export async function tiQuFengMian(opfContent: string, zip: JSZip, opfDir: string): Promise<string | null> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opfContent, 'application/xml');
  
  const metadata = doc.querySelector('metadata');
  if (!metadata) return null;

  let coverId: string | null = null;
  const metaElements = metadata.querySelectorAll('meta');
  for (const meta of metaElements) {
    if (meta.getAttribute('name') === 'cover') {
      coverId = meta.getAttribute('content');
      break;
    }
  }

  const manifest = doc.querySelector('manifest');
  if (!manifest) return null;

  const manifestItems: OPFManifestItem[] = [];
  const items = manifest.querySelectorAll('item');
  items.forEach(item => {
    manifestItems.push({
      id: item.getAttribute('id') || '',
      href: item.getAttribute('href') || '',
      mediaType: item.getAttribute('media-type') || '',
      properties: item.getAttribute('properties') || undefined
    });
  });

  let coverItem: OPFManifestItem | null = null;

  if (coverId) {
    coverItem = manifestItems.find(item => item.id === coverId) || null;
  }

  if (!coverItem) {
    coverItem = manifestItems.find(item => item.properties?.includes('cover-image')) || null;
  }

  if (!coverItem) {
    coverItem = manifestItems.find(item => 
      item.id.toLowerCase().includes('cover') || 
      item.href.toLowerCase().includes('cover')
    ) || null;
  }

  if (!coverItem) return null;

  const coverPath = opfDir ? `${opfDir}/${coverItem.href}` : coverItem.href;
  const coverFile = zip.file(coverPath);
  
  if (!coverFile) {
    console.warn('未找到封面文件:', coverPath);
    return null;
  }

  try {
    const coverBlob = await coverFile.async('base64');
    const mimeType = coverItem.mediaType || 'image/jpeg';
    return `data:${mimeType};base64,${coverBlob}`;
  } catch (error) {
    console.error('读取封面文件失败:', error);
    return null;
  }
}

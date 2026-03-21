// @审计已完成
// EPUB 解析工具 - 主入口（浏览器环境）

import JSZip from 'jszip';
import type { EPUBParseResult, ManifestItem } from './epubTypes';
import { jieXiOPF, jieXiNCX, jieXiNAV, guiFanHuaHref, tiQuBiaoTi, qingLiHTML } from './epubParserLogic';

export type { EPUBMetadata, EPUBChapter, EPUBParseResult } from './epubTypes';

export async function jieXiEPUB(file: File): Promise<EPUBParseResult> {
  const zip = await JSZip.loadAsync(file);
  
  const opfFile = await zhaoDaoOPFWenJian(zip);
  if (!opfFile) {
    throw new Error('无法找到 OPF 文件');
  }
  
  const opfContent = await opfFile.async('string');
  const { metadata, manifest, spine, ncxHref, navHref } = jieXiOPF(opfContent);
  
  const opfDir = huoQuOPFMuLu(opfFile.name);
  const navTitles = await jieXiDaoHangBiaoTi(zip, opfDir, ncxHref, navHref);
  
  const chapters = await gouJianZhangJieList(zip, opfDir, spine, manifest, navTitles);
  
  return { metadata, chapters };
}

async function zhaoDaoOPFWenJian(zip: JSZip): Promise<JSZip.JSZipObject | null> {
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) return null;
  
  const containerContent = await containerFile.async('string');
  const rootfileMatch = containerContent.match(/rootfile\s+[^>]*full-path=["']([^"']+)["']/i);
  
  if (!rootfileMatch) return null;
  
  return zip.file(rootfileMatch[1]) || null;
}

function huoQuOPFMuLu(opfPath: string): string {
  const parts = opfPath.split('/');
  parts.pop();
  return parts.join('/');
}

async function jieXiDaoHangBiaoTi(
  zip: JSZip,
  opfDir: string,
  ncxHref: string | null,
  navHref: string | null
): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  
  if (navHref) {
    const navPath = opfDir ? `${opfDir}/${navHref}` : navHref;
    const navFile = zip.file(navPath);
    if (navFile) {
      const navContent = await navFile.async('string');
      jieXiNAV(navContent, titles);
    }
  }
  
  if (ncxHref && titles.size === 0) {
    const ncxPath = opfDir ? `${opfDir}/${ncxHref}` : ncxHref;
    const ncxFile = zip.file(ncxPath);
    if (ncxFile) {
      const ncxContent = await ncxFile.async('string');
      jieXiNCX(ncxContent, titles);
    }
  }
  
  return titles;
}

async function gouJianZhangJieList(
  zip: JSZip,
  opfDir: string,
  spine: { idref: string }[],
  manifest: ManifestItem[],
  navTitles: Map<string, string>
): Promise<{ id: string; title: string; content: string; orderIndex: number; selected: boolean }[]> {
  const chapters: { id: string; title: string; content: string; orderIndex: number; selected: boolean }[] = [];
  
  for (let i = 0; i < spine.length; i++) {
    const spineItem = spine[i];
    const manifestItem = manifest.find(m => m.id === spineItem.idref);
    
    if (manifestItem) {
      const chapterPath = opfDir ? `${opfDir}/${manifestItem.href}` : manifestItem.href;
      const chapterFile = zip.file(chapterPath);
      
      let content = '';
      let title = `第 ${i + 1} 章`;
      
      const hrefKey = guiFanHuaHref(manifestItem.href);
      if (navTitles.has(hrefKey)) {
        title = navTitles.get(hrefKey)!;
      }
      
      if (chapterFile) {
        const htmlContent = await chapterFile.async('string');
        content = qingLiHTML(htmlContent);
        if (title === `第 ${i + 1} 章`) {
          const extractedTitle = tiQuBiaoTi(htmlContent);
          if (extractedTitle) title = extractedTitle;
        }
      }
      
      chapters.push({
        id: spineItem.idref,
        title,
        content,
        orderIndex: i,
        selected: true,
      });
    }
  }
  
  return chapters;
}

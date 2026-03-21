// @审计已完成
// EPUB 类型定义

export interface EPUBMetadata {
  title: string;
  author: string;
  publisher: string;
  date: string;
}

export interface EPUBChapter {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  selected: boolean;
}

export interface EPUBParseResult {
  metadata: EPUBMetadata;
  chapters: EPUBChapter[];
}

export interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties?: string;
}

export interface SpineItem {
  idref: string;
  title?: string;
}

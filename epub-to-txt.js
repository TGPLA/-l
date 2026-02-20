import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

class EPUBConverter {
  constructor() {
    this.zip = null;
  }

  async convertToTXT(epubPath, outputPath) {
    try {
      console.log(`正在读取 EPUB 文件: ${epubPath}`);
      
      const zip = new AdmZip(epubPath);
      const zipEntries = zip.getEntries();
      
      console.log(`找到 ${zipEntries.length} 个文件`);

      let txtContent = '';
      
      const opfEntry = zipEntries.find(entry => 
        entry.entryName.toLowerCase().endsWith('.opf')
      );

      if (opfEntry) {
        console.log('找到 OPF 文件:', opfEntry.entryName);
        const opfContent = opfEntry.getData().toString('utf8');
        
        const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/i);
        const creatorMatch = opfContent.match(/<dc:creator[^>]*>([^<]*)<\/dc:creator>/i);
        const publisherMatch = opfContent.match(/<dc:publisher[^>]*>([^<]*)<\/dc:publisher>/i);
        const dateMatch = opfContent.match(/<dc:date[^>]*>([^<]*)<\/dc:date>/i);

        txtContent += `书名：${titleMatch ? titleMatch[1] : '未知'}\n`;
        txtContent += `作者：${creatorMatch ? creatorMatch[1] : '未知'}\n`;
        txtContent += `出版社：${publisherMatch ? publisherMatch[1] : '未知'}\n`;
        txtContent += `出版日期：${dateMatch ? dateMatch[1] : '未知'}\n`;
        txtContent += `\n${'='.repeat(80)}\n\n`;
      } else {
        console.warn('未找到 OPF 文件');
        txtContent += `书名：${path.basename(epubPath, '.epub')}\n\n`;
        txtContent += `${'='.repeat(80)}\n\n`;
      }

      const htmlEntries = zipEntries.filter(entry => 
        entry.entryName.toLowerCase().endsWith('.html') || 
        entry.entryName.toLowerCase().endsWith('.xhtml')
      );

      console.log(`找到 ${htmlEntries.length} 个 HTML 文件`);

      const sortedEntries = htmlEntries.sort((a, b) => a.entryName.localeCompare(b.entryName));

      for (let i = 0; i < sortedEntries.length; i++) {
        const entry = sortedEntries[i];
        const chapterTitle = path.basename(entry.entryName, path.extname(entry.entryName));
        console.log(`正在处理第 ${i + 1}/${sortedEntries.length} 个文件: ${chapterTitle}`);
        
        try {
          const htmlContent = entry.getData().toString('utf8');
          const cleanText = this.cleanHTML(htmlContent);
          
          if (cleanText.trim().length > 50) {
            txtContent += `第 ${i + 1} 章：${chapterTitle}\n`;
            txtContent += `${'─'.repeat(80)}\n\n`;
            txtContent += cleanText;
            txtContent += '\n\n';
          }
        } catch (error) {
          console.error(`处理文件 ${entry.entryName} 时出错:`, error.message);
        }
      }

      console.log('正在写入 TXT 文件...');
      fs.writeFileSync(outputPath, txtContent, 'utf8');
      console.log(`转换完成！输出文件: ${outputPath}`);
      console.log(`文件大小: ${fs.statSync(outputPath).size} 字节`);
      
      return {
        success: true,
        outputPath,
        chapters: sortedEntries.length,
        size: fs.statSync(outputPath).size
      };
    } catch (error) {
      console.error('转换失败:', error);
      console.error('错误详情:', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  cleanHTML(html) {
    let text = html;

    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    text = text.replace(/<!DOCTYPE[^>]*>/gi, '');
    text = text.replace(/<html[^>]*>/gi, '');
    text = text.replace(/<\/html>/gi, '');
    text = text.replace(/<body[^>]*>/gi, '');
    text = text.replace(/<\/body>/gi, '');
    text = text.replace(/<[^>]+>/g, '\n');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&apos;/g, "'");
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&#34;/g, '"');
    text = text.replace(/&#38;/g, '&');
    text = text.replace(/&#60;/g, '<');
    text = text.replace(/&#62;/g, '>');
    text = text.replace(/&mdash;/g, '—');
    text = text.replace(/&ndash;/g, '–');

    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.replace(/^\s+|\s+$/gm, '');

    return text;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('使用方法: node epub-to-txt.js <epub文件路径> [输出txt路径]');
    console.log('示例: node epub-to-txt.js book.epub book.txt');
    console.log('示例: node epub-to-txt.js book.epub (自动生成 book.txt)');
    console.log('\n或者直接运行: node epub-to-txt.js --auto (自动查找当前目录下的 EPUB 文件)');
    process.exit(1);
  }

  let epubPath = args[0];
  let outputPath = args[1];

  if (epubPath === '--auto' || epubPath === '-a') {
    console.log('正在查找当前目录下的 EPUB 文件...');
    const files = fs.readdirSync('.');
    const epubFiles = files.filter(f => f.toLowerCase().endsWith('.epub'));
    
    if (epubFiles.length === 0) {
      console.error('错误: 当前目录下没有找到 EPUB 文件');
      process.exit(1);
    }
    
    if (epubFiles.length > 1) {
      console.log('找到多个 EPUB 文件:');
      epubFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
      console.log('\n请指定要转换的文件');
      process.exit(1);
    }
    
    epubPath = epubFiles[0];
    console.log(`自动找到 EPUB 文件: ${epubPath}`);
  }

  if (!fs.existsSync(epubPath)) {
    console.error(`错误: 文件不存在: ${epubPath}`);
    process.exit(1);
  }

  if (!outputPath) {
    const epubName = path.basename(epubPath, path.extname(epubPath));
    outputPath = path.join(path.dirname(epubPath), `${epubName}.txt`);
  }

  console.log(`输出文件路径: ${outputPath}`);
  console.log('开始转换...\n');

  const converter = new EPUBConverter();
  const result = await converter.convertToTXT(epubPath, outputPath);

  if (result.success) {
    console.log('\n✅ 转换成功！');
    console.log(`📄 文件数: ${result.chapters}`);
    console.log(`📊 文件大小: ${result.size} 字节`);
    console.log(`📁 输出路径: ${result.outputPath}`);
  } else {
    console.error('\n❌ 转换失败:', result.error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
// @审计已完成
// 文件行数检查脚本 - 检查新创建文件是否符合 100 行限制

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_LINES = 100;
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'archived_旧版归档', '项目参考'];
const CHECK_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function shouldExclude(dirPath) {
  return EXCLUDE_DIRS.some(exclude => dirPath.includes(exclude));
}

function checkDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldExclude(filePath)) {
        checkDirectory(filePath, results);
      }
    } else if (CHECK_EXTENSIONS.some(ext => file.endsWith(ext))) {
      const lines = countLines(filePath);
      if (lines > MAX_LINES) {
        results.push({ file: filePath, lines });
      }
    }
  });

  return results;
}

function main() {
  const projectRoot = path.join(__dirname, '..');
  const srcDir = path.join(projectRoot, 'src');

  console.log('🔍 检查文件行数（限制：100 行）...\n');

  const violations = checkDirectory(srcDir);

  if (violations.length === 0) {
    console.log('✅ 所有文件符合行数限制！');
    process.exit(0);
  }

  console.log(`❌ 发现 ${violations.length} 个文件超过${MAX_LINES}行限制：\n`);
  violations.forEach(({ file, lines }) => {
    const relativePath = path.relative(projectRoot, file);
    console.log(`  ${relativePath}: ${lines} 行`);
  });

  console.log('\n💡 建议：按照三层架构拆分超标文件');
  console.log('   主视图层 + 子组件层 + 数据逻辑层');

  process.exit(1);
}

main();

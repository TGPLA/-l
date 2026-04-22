#!/usr/bin/env node

/**
 * 行数检查脚本
 * 按文件类型显示行数（参考用）
 * 新规则：按类型分类限制，非统一 100 行限制
 * @审计已完成
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join, basename } from 'path';

const dirs = ['src', 'backend'];

function getFileType(fileName) {
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
    if (fileName.includes('-Page.tsx')) return '页面组件';
    if (fileName.includes('-Modal.tsx')) return '功能组件';
    if (fileName.startsWith('use') && fileName.endsWith('.ts')) return '业务Hooks';
    if (fileName.endsWith('types.ts') || fileName.endsWith('Type.ts')) return '类型定义';
    if (fileName.includes('Hook.ts') || fileName.includes('hooks')) return '业务Hooks';
    return '其他';
  }
  if (fileName.endsWith('.go')) return 'Go';
  return '其他';
}

function getLimit(fileName, type) {
  const limits = {
    '页面组件': { warn: 300, error: null },
    '功能组件': { warn: 200, error: null },
    '业务Hooks': { warn: 250, error: null },
    'UI组件': { warn: 100, error: 150 },
    '类型定义': { warn: 80, error: 100 },
    '工具函数': { warn: 150, error: 200 },
    'Go': { warn: 200, error: null },
    '其他': { warn: 150, error: null },
  };
  
  if (type === '业务Hooks' && fileName.startsWith('use')) {
    return limits['业务Hooks'];
  }
  if (type === '其他' && (fileName.endsWith('Service.ts') || fileName.endsWith('service.ts'))) {
    return limits['工具函数'];
  }
  
  return limits[type] || limits['其他'];
}

function walk(dir, callback) {
  if (!statSync(dir).isDirectory()) return;
  
  readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath, callback);
      }
    } else if (entry.isFile() && 
             (entry.name.endsWith('.ts') || 
              entry.name.endsWith('.tsx') || 
              entry.name.endsWith('.go'))) {
      const content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;
      callback(fullPath, lines);
    }
  });
}

console.log('='.repeat(60));
console.log('📊 文件行数检查（按类型限制）');
console.log('='.repeat(60));
console.log('说明: 新规则按文件类型分类限制，行数仅供参考');
console.log('      复杂度（嵌套/分支）才是真正质量指标');
console.log('='.repeat(60));

let types = {};

dirs.forEach(dir => {
  if (!statSync(dir).isDirectory()) return;
  
  walk(dir, (filePath, lines) => {
    const relativePath = filePath.replace(process.cwd() + '\\', '');
    const fileName = basename(filePath);
    const type = getFileType(fileName);
    const limit = getLimit(fileName, type);
    
    if (!types[type]) types[type] = [];
    types[type].push({ path: relativePath, lines, limit, fileName });
  });
});

Object.entries(types).forEach(([type, files]) => {
  console.log(`\n📁 ${type} (${files.length} 个文件)`);
  console.log('-'.repeat(50));
  
  const sorted = files.sort((a, b) => b.lines - a.lines);
  sorted.forEach(f => {
    const status = f.lines > f.limit.warn ? '⚠️' : '✅';
    console.log(`  ${status} ${f.path}:${f.lines} (限制:${f.limit.warn})`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('🚨 超过限制的文件需要人工审查复杂度');
console.log('='.repeat(60));
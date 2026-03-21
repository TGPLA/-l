#!/usr/bin/env node

/**
 * 文件创建命令脚本
 * 用于标准化文件创建流程，确保符合项目规范
 * @审计已完成
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.error('❌  请指定要创建的文件路径');
  console.log('用法：npm run create-file <文件路径>');
  process.exit(1);
}

function createFileWithTemplate(filePath) {
  const fullPath = path.resolve(filePath);
  const dirPath = path.dirname(fullPath);
  const fileName = path.basename(fullPath);
  
  // 确保目录存在
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁  创建目录：${dirPath}`);
  }
  
  // 检查文件是否已存在
  if (fs.existsSync(fullPath)) {
    console.error('❌  文件已存在：', fullPath);
    process.exit(1);
  }
  
  // 根据文件类型生成模板
  let template = '';
  if (fileName.endsWith('.js')) {
    template = generateJavaScriptTemplate(fileName);
  } else if (fileName.endsWith('.ts')) {
    template = generateTypeScriptTemplate(fileName);
  } else if (fileName.endsWith('.tsx')) {
    template = generateReactTemplate(fileName);
  } else {
    console.error('❌  不支持的文件类型：', fileName);
    process.exit(1);
  }
  
  // 写入文件
  fs.writeFileSync(fullPath, template);
  console.log(`✅  创建文件：${fullPath}`);
  
  // 提示更新项目地图
  console.log('\n📝  请记得更新 02_项目地图.md 文件');
}

function generateJavaScriptTemplate(fileName) {
  const chineseName = getChineseName(fileName);
  return `#!/usr/bin/env node

/**
 * ${chineseName}
 * 功能说明
 * @审计已完成
 */

`;
}

function generateTypeScriptTemplate(fileName) {
  const chineseName = getChineseName(fileName);
  return `/**
 * ${chineseName}
 * 功能说明
 * @审计已完成
 */

`;
}

function generateReactTemplate(fileName) {
  const chineseName = getChineseName(fileName);
  const componentName = fileName.replace('.tsx', '');
  return `/**
 * ${chineseName}
 * 功能说明
 * @审计已完成
 */

import React from 'react';

const ${componentName}: React.FC = () => {
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};

export default ${componentName};
`;
}

function getChineseName(fileName) {
  // 简单的文件名转中文逻辑
  const nameMap = {
    'check-port.js': '端口检查脚本',
    'epub-to-txt.js': 'EPUB转换工具'
  };
  return nameMap[fileName] || fileName;
}

// 执行文件创建
createFileWithTemplate(filePath);
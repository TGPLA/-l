#!/usr/bin/env node

/**
 * 文件操作检查脚本
 * 用于检查新创建的文件是否符合项目规范
 * 并自动更新项目地图
 * @审计已完成
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_MAP_PATH = '02_项目地图.md';

function checkFileCreation() {
  try {
    // 获取最近修改的文件
    const recentFiles = getRecentFiles();
    
    if (recentFiles.length === 0) {
      console.log('✅  没有检测到新创建的文件');
      return;
    }
    
    console.log('🔍  检测到新创建的文件：');
    recentFiles.forEach(file => {
      console.log(`   - ${file}`);
      
      // 检查文件是否符合规范
      checkFile规范(file);
      
      // 检查是否需要更新项目地图
      if (shouldUpdateProjectMap(file)) {
        updateProjectMap(file);
      }
    });
    
  } catch (error) {
    console.error('❌  检查文件操作时出错：', error.message);
  }
}

function getRecentFiles() {
  try {
    // 使用 git 命令获取最近修改的文件
    const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file && fs.existsSync(file));
  } catch (error) {
    // 如果 git 命令失败，返回空数组
    return [];
  }
}

function checkFile规范(file) {
  // 只检查代码文件
  if (!file.match(/\.(js|ts|tsx|jsx)$/)) {
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  
  // 检查是否有中文头部注释
  if (!content.includes('/**') || !content.includes('* @审计已完成')) {
    console.log(`⚠️  文件 ${file} 缺少规范的头部注释`);
  }
}

function shouldUpdateProjectMap(file) {
  // 只更新根目录的工具脚本和源代码文件
  return file.startsWith('src/') || file.match(/^[^/]+\.(js|ts)$/);
}

function updateProjectMap(file) {
  if (!fs.existsSync(PROJECT_MAP_PATH)) {
    console.log('❌  项目地图文件不存在');
    return;
  }
  
  const content = fs.readFileSync(PROJECT_MAP_PATH, 'utf8');
  
  // 根据文件路径判断应该更新哪个部分
  if (file.startsWith('src/')) {
    // 源代码文件，需要根据目录结构更新
    updateSourceCodeMap(file, content);
  } else if (file.match(/\.(js|ts)$/)) {
    // 根目录工具脚本
    updateRootScriptMap(file, content);
  }
}

function updateRootScriptMap(file, content) {
  const fileName = path.basename(file);
  const fileInfo = {
    name: fileName,
    chineseName: getChineseName(fileName),
    description: '功能说明'
  };
  
  // 检查是否已经存在
  if (content.includes(fileName)) {
    console.log(`✅  文件 ${file} 已在项目地图中记录`);
    return;
  }
  
  // 找到工具脚本部分并添加
  const updatedContent = content.replace(
    /## 🛠️ 根目录工具脚本[\s\S]*?---/,
    match => {
      const lastLine = match.trim().split('\n').pop();
      if (lastLine === '---') {
        return match.replace(
          '---',
          `| **${fileInfo.name}** | ${fileInfo.chineseName} | ${fileInfo.description} |\n---`
        );
      }
      return match;
    }
  );
  
  fs.writeFileSync(PROJECT_MAP_PATH, updatedContent);
  console.log(`✅  已将 ${file} 添加到项目地图`);
}

function updateSourceCodeMap(file, content) {
  // 这里可以根据需要实现更复杂的源代码文件更新逻辑
  console.log(`⚠️  源代码文件 ${file} 需要手动更新到项目地图`);
}

function getChineseName(fileName) {
  const nameMap = {
    'check-port.js': '端口检查脚本',
    'epub-to-txt.js': 'EPUB转换工具'
  };
  return nameMap[fileName] || '未命名文件';
}

// 执行检查
checkFileCreation();
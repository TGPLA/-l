#!/usr/bin/env node

/**
 * 文档更新提醒工具
 * 用于监控代码变更，分析需要更新的文档，并提供更新建议
 * 
 * 功能：
 * 1. 分析 git 变更，识别修改的文件
 * 2. 根据变更类型，推荐需要更新的文档
 * 3. 生成详细的更新检查清单
 * 4. 提供更新建议和指导
 */

import fs from 'fs';
import { execSync } from 'child_process';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logTitle(message) {
  log(`📋 ${message}`, 'magenta');
}

// 执行 git 命令获取变更
function getGitChanges() {
  try {
    const output = execSync('git diff --name-status', { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line);
  } catch (error) {
    logError('无法获取 git 变更信息');
    return [];
  }
}

// 分析变更文件类型
function analyzeChanges(changes) {
  const fileTypes = {
    backend: [],
    frontend: [],
    config: [],
    database: [],
    other: []
  };

  changes.forEach(change => {
    const [status, filePath] = change.split(/\s+/);
    
    if (filePath.startsWith('backend/')) {
      if (filePath.endsWith('.sql')) {
        fileTypes.database.push({ status, path: filePath });
      } else {
        fileTypes.backend.push({ status, path: filePath });
      }
    } else if (filePath.startsWith('src/')) {
      fileTypes.frontend.push({ status, path: filePath });
    } else if (['package.json', '.env.example', 'vite.config.ts'].includes(filePath)) {
      fileTypes.config.push({ status, path: filePath });
    } else {
      fileTypes.other.push({ status, path: filePath });
    }
  });

  return fileTypes;
}

// 生成文档更新建议
function generateRecommendations(fileTypes) {
  const recommendations = [];
  const docsToUpdate = new Set();

  // 后端变更
  if (fileTypes.backend.length > 0) {
    logInfo(`检测到 ${fileTypes.backend.length} 个后端文件变更`);
    docsToUpdate.add('01_README.md');
    docsToUpdate.add('02_项目地图.md');
    docsToUpdate.add('04_项目运作流程.md');
    
    // 检查是否有新的 API 路由
    fileTypes.backend.forEach(file => {
      if (file.path.includes('routes/')) {
        recommendations.push('更新 API 路由配置信息');
      }
      if (file.path.includes('controllers/')) {
        recommendations.push('更新业务流程描述');
      }
      if (file.path.includes('models/')) {
        recommendations.push('更新数据模型描述');
      }
    });
  }

  // 前端变更
  if (fileTypes.frontend.length > 0) {
    logInfo(`检测到 ${fileTypes.frontend.length} 个前端文件变更`);
    docsToUpdate.add('01_README.md');
    docsToUpdate.add('02_项目地图.md');
    
    // 检查是否有新的组件
    fileTypes.frontend.forEach(file => {
      if (file.path.includes('components/')) {
        recommendations.push('更新前端组件结构');
      }
    });
  }

  // 数据库变更
  if (fileTypes.database.length > 0) {
    logInfo(`检测到 ${fileTypes.database.length} 个数据库文件变更`);
    docsToUpdate.add('01_README.md');
    docsToUpdate.add('04_项目运作流程.md');
    recommendations.push('更新数据库表结构描述');
  }

  // 配置变更
  if (fileTypes.config.length > 0) {
    logInfo(`检测到 ${fileTypes.config.length} 个配置文件变更`);
    docsToUpdate.add('01_README.md');
    docsToUpdate.add('07_部署指南.md');
    recommendations.push('更新配置信息和部署指南');
  }

  return {
    docs: Array.from(docsToUpdate),
    recommendations: [...new Set(recommendations)] // 去重
  };
}

// 生成更新检查清单
function generateChecklist(docs, recommendations) {
  logTitle('📋 文档更新检查清单');
  log('=' . repeat(80), 'cyan');

  // 按优先级排序文档
  const priorityOrder = [
    '01_README.md',
    '02_项目地图.md',
    '04_项目运作流程.md',
    '08_项目进度.md',
    '05_审计违规清单.md',
    '07_部署指南.md',
    '03_开发协议.md',
    '06_项目规划.txt'
  ];

  const sortedDocs = priorityOrder.filter(doc => docs.includes(doc));
  
  sortedDocs.forEach((doc, index) => {
    const priority = index < 3 ? '高' : index < 5 ? '中' : '低';
    log(`[${priority}] ${doc}`, 'yellow');
  });

  if (recommendations.length > 0) {
    log('\n🔍 建议更新内容:', 'cyan');
    recommendations.forEach(rec => {
      log(`  - ${rec}`, 'green');
    });
  }

  log('\n💡 更新提示:', 'blue');
  log('  1. 优先更新 README.md（项目门面）', 'blue');
  log('  2. 确保 API 路由信息一致', 'blue');
  log('  3. 检查数据库表结构描述', 'blue');
  log('  4. 更新前端组件结构', 'blue');
  log('  5. 验证版本信息一致性', 'blue');
}

// 主函数
function runReminder() {
  log('🚀 开始文档更新提醒分析...', 'magenta');
  log('=' . repeat(80), 'magenta');

  const changes = getGitChanges();
  
  if (changes.length === 0) {
    logSuccess('🎉 未检测到代码变更，无需更新文档');
    log('=' . repeat(80), 'magenta');
    return;
  }

  logInfo(`检测到 ${changes.length} 个文件变更`);
  
  const fileTypes = analyzeChanges(changes);
  const { docs, recommendations } = generateRecommendations(fileTypes);

  if (docs.length === 0) {
    logSuccess('🎉 变更文件不需要更新文档');
    log('=' . repeat(80), 'magenta');
    return;
  }

  log('\n📄 需要更新的文档:', 'yellow');
  docs.forEach(doc => {
    log(`  - ${doc}`, 'yellow');
  });

  generateChecklist(docs, recommendations);

  log('\n' + '=' . repeat(80), 'magenta');
  log('✨ 文档更新提醒完成！', 'green');
  log('=' . repeat(80), 'magenta');
}

// 执行提醒
if (import.meta.url === `file://${process.argv[1]}`) {
  runReminder();
}

export {
  runReminder,
  getGitChanges,
  analyzeChanges,
  generateRecommendations,
  generateChecklist
};

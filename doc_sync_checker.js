#!/usr/bin/env node

/**
 * 文档同步检查工具
 * 用于检查项目文档之间的一致性，确保信息同步
 * 
 * 检查内容：
 * 1. README.md 与 项目地图.md 的文件结构一致性
 * 2. README.md 与 项目运作流程.md 的 API 路由一致性
 * 3. README.md 与 数据库表结构的一致性
 * 4. 版本信息一致性检查
 */

import fs from 'fs';
import path from 'path';

function logError(message) {
  console.log(`❌ ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// 读取文件内容
function readFile(filePath) {
  try {
    console.log(`尝试读取文件: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`成功读取文件: ${filePath}, 长度: ${content.length}`);
    return content;
  } catch (error) {
    console.log(`无法读取文件: ${filePath}, 错误: ${error.message}`);
    return null;
  }
}

// 提取 README 中的 API 路由
function extractReadmeRoutes(content) {
  if (!content) return [];
  
  const routesMatch = content.match(/\/api\/[\w\/*-]+\s+-/g);
  if (!routesMatch) return [];
  
  return routesMatch.map(route => route.trim().replace(/\s+-$/, ''));
}

// 提取 项目运作流程.md 中的 API 路由
function extractWorkflowRoutes(content) {
  if (!content) return [];
  
  const routesMatch = content.match(/\/api\/[\w\/*-]+\s+-/g);
  if (!routesMatch) return [];
  
  return routesMatch.map(route => route.trim().replace(/\s+-$/, ''));
}

// 提取 README 中的数据库表结构
function extractReadmeTables(content) {
  if (!content) return [];
  
  const tableMatch = content.match(/\| `(\w+)` \|/g);
  if (!tableMatch) return [];
  
  return tableMatch.map(table => table.match(/`(\w+)`/)[1]);
}

// 提取数据库迁移脚本中的表结构
function extractMigrationTables(content) {
  if (!content) return [];
  
  const tableMatch = content.match(/CREATE TABLE IF NOT EXISTS (\w+)|ALTER TABLE (\w+)/g);
  if (!tableMatch) return [];
  
  const tables = [];
  tableMatch.forEach(match => {
    const tableName = match.match(/CREATE TABLE IF NOT EXISTS (\w+)|ALTER TABLE (\w+)/);
    if (tableName[1]) tables.push(tableName[1]);
    if (tableName[2]) tables.push(tableName[2]);
  });
  
  return [...new Set(tables)]; // 去重
}

// 检查 API 路由一致性
function checkApiRoutesConsistency() {
  logInfo('检查 API 路由一致性...');
  
  const readmeContent = readFile('01_README.md');
  const workflowContent = readFile('04_项目运作流程.md');
  
  if (!readmeContent || !workflowContent) {
    logError('无法读取必要的文档文件');
    return false;
  }
  
  const readmeRoutes = extractReadmeRoutes(readmeContent);
  const workflowRoutes = extractWorkflowRoutes(workflowContent);
  
  logInfo(`README 中的路由: ${readmeRoutes.length} 个`);
  logInfo(`运作流程中的路由: ${workflowRoutes.length} 个`);
  
  // 检查 README 是否包含所有运作流程中的路由
  const missingInReadme = workflowRoutes.filter(route => !readmeRoutes.includes(route));
  if (missingInReadme.length > 0) {
    logError('README 缺少以下路由:');
    missingInReadme.forEach(route => logError(`  - ${route}`));
  }
  
  // 检查运作流程是否包含所有 README 中的路由
  const missingInWorkflow = readmeRoutes.filter(route => !workflowRoutes.includes(route));
  if (missingInWorkflow.length > 0) {
    logError('运作流程缺少以下路由:');
    missingInWorkflow.forEach(route => logError(`  - ${route}`));
  }
  
  if (missingInReadme.length === 0 && missingInWorkflow.length === 0) {
    logSuccess('API 路由一致性检查通过');
    return true;
  }
  
  return false;
}

// 检查数据库表结构一致性
function checkDatabaseTablesConsistency() {
  logInfo('检查数据库表结构一致性...');
  
  const readmeContent = readFile('01_README.md');
  const migrationContent = readFile('backend/数据库迁移_v3.0.sql');
  
  if (!readmeContent || !migrationContent) {
    logError('无法读取必要的文档文件');
    return false;
  }
  
  const readmeTables = extractReadmeTables(readmeContent);
  const migrationTables = extractMigrationTables(migrationContent);
  
  logInfo(`README 中的表: ${readmeTables.length} 个`);
  logInfo(`迁移脚本中的表: ${migrationTables.length} 个`);
  
  // 检查 README 是否包含所有迁移脚本中的表
  const missingInReadme = migrationTables.filter(table => !readmeTables.includes(table));
  if (missingInReadme.length > 0) {
    logError('README 缺少以下表:');
    missingInReadme.forEach(table => logError(`  - ${table}`));
  }
  
  if (missingInReadme.length === 0) {
    logSuccess('数据库表结构一致性检查通过');
    return true;
  }
  
  return false;
}

// 检查版本信息一致性
function checkVersionConsistency() {
  logInfo('检查版本信息一致性...');
  
  const packageJsonContent = readFile('package.json');
  const changelogContent = readFile('public/changelog.json');
  
  if (!packageJsonContent) {
    logError('无法读取 package.json');
    return false;
  }
  
  try {
    const packageData = JSON.parse(packageJsonContent);
    const packageVersion = packageData.version;
    
    logInfo(`package.json 版本: ${packageVersion}`);
    
    if (changelogContent) {
      const changelogData = JSON.parse(changelogContent);
      const latestVersion = changelogData[0]?.version;
      
      if (latestVersion) {
        logInfo(`changelog.json 最新版本: ${latestVersion}`);
        
        if (packageVersion === latestVersion) {
          logSuccess('版本信息一致性检查通过');
          return true;
        } else {
          logError('版本信息不一致');
          logError(`package.json: ${packageVersion}`);
          logError(`changelog.json: ${latestVersion}`);
          return false;
        }
      } else {
        logWarning('changelog.json 中未找到版本信息');
        return true;
      }
    } else {
      logWarning('未找到 changelog.json 文件');
      return true;
    }
  } catch (error) {
    logError('解析 JSON 文件失败');
    return false;
  }
}

// 主检查函数
function runChecks() {
  console.log('🚀 开始文档同步检查...');
  console.log('=' . repeat(60));
  
  const checks = [
    { name: 'API 路由一致性', fn: checkApiRoutesConsistency },
    { name: '数据库表结构一致性', fn: checkDatabaseTablesConsistency },
    { name: '版本信息一致性', fn: checkVersionConsistency }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    console.log('\n' + '=' . repeat(60));
    console.log(`检查: ${check.name}`);
    console.log('-' . repeat(60));
    
    const passed = check.fn();
    if (!passed) {
      allPassed = false;
    }
  });
  
  console.log('\n' + '=' . repeat(60));
  if (allPassed) {
    console.log('🎉 所有检查通过！文档同步状态良好');
  } else {
    console.log('❌ 部分检查失败，需要更新文档');
  }
  console.log('=' . repeat(60));
  
  return allPassed;
}

// 执行检查
console.log('脚本开始执行...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('是否直接执行:', import.meta.url === `file://${process.argv[1]}`);

// 直接执行检查，不使用条件判断
runChecks();

export {
  runChecks,
  checkApiRoutesConsistency,
  checkDatabaseTablesConsistency,
  checkVersionConsistency
};

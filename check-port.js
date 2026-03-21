#!/usr/bin/env node

/**
 * 端口检查脚本
 * 用于在启动开发服务器前检查 5173 端口是否被占用
 * @审计已完成
 */

import { execSync } from 'child_process';

const PORT = 5173;

function checkPort() {
  try {
    // 使用 netstat 命令检查端口占用情况
    const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    
    if (output.trim()) {
      console.log('⚠️  检测到端口', PORT, '已被占用：');
      console.log(output);
      
      // 提取所有相关进程 ID
      const lines = output.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          if (pid && pid !== '0') { // 排除系统进程
            pids.add(pid);
          }
        }
      });
      
      if (pids.size > 0) {
        console.log('\n正在终止占用端口的进程...');
        pids.forEach(pid => {
          try {
            execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
            console.log('✅  进程', pid, '已终止');
          } catch (error) {
            console.log('❌  终止进程', pid, '失败：', error.message);
          }
        });
      }
    } else {
      console.log('✅  端口', PORT, '可用');
    }
  } catch (error) {
    // 没有找到占用的端口，说明端口可用
    console.log('✅  端口', PORT, '可用');
  }
}

// 执行检查
checkPort();

// 测试书籍API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8080/api';

// 测试1：检查健康状态
async function testHealth() {
  console.log('=== 测试1：健康检查 ===');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log('✅ 健康检查成功:', data);
    return true;
  } catch (error) {
    console.log('❌ 健康检查失败:', error);
    return false;
  }
}

// 测试2：尝试登录（使用测试账号）
async function testLogin() {
  console.log('\n=== 测试2：登录测试 ===');
  try {
    const username = '10001';
    const password = '123456';
    
    console.log('尝试登录:', username);
    
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log('登录响应:', data);
    
    if (data.success) {
      console.log('✅ 登录成功');
      console.log('用户ID:', data.data.user.id);
      console.log('Token:', data.data.token.substring(0, 50) + '...');
      return data.data;
    } else {
      console.log('❌ 登录失败:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ 登录请求失败:', error);
    return null;
  }
}

// 测试3：获取书籍列表
async function testGetBooks(token, userId) {
  console.log('\n=== 测试3：获取书籍列表 ===');
  try {
    console.log('使用用户ID:', userId);
    
    const response = await fetch(`${API_BASE}/books`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('获取书籍响应:', data);
    
    if (data.success) {
      console.log('✅ 获取书籍成功');
      console.log('书籍数量:', data.data.length);
      data.data.forEach((book, index) => {
        console.log(`  书籍${index + 1}:`, book.title, '(ID:', book.id, ')');
      });
      return data.data;
    } else {
      console.log('❌ 获取书籍失败:', data.error);
      return [];
    }
  } catch (error) {
    console.log('❌ 获取书籍请求失败:', error);
    return [];
  }
}

// 主测试流程
async function main() {
  console.log('开始测试书籍API...\n');
  
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ 后端服务未运行，请先启动后端服务');
    return;
  }
  
  const authData = await testLogin();
  if (!authData) {
    console.log('\n❌ 无法登录，请检查账号密码或注册新账号');
    return;
  }
  
  await testGetBooks(authData.token, authData.user.id);
  
  console.log('\n=== 测试完成 ===');
}

main().catch(console.error);

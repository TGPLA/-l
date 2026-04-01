
// 测试书籍API - 用户1001
const http = require('http');

const API_BASE = 'http://localhost:8080/api';

// 简单的HTTP请求函数
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) =&gt; {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) =&gt; {
      let data = '';
      res.on('data', (chunk) =&gt; {
        data += chunk;
      });
      res.on('end', () =&gt; {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) =&gt; {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// 测试1：检查健康状态
async function testHealth() {
  console.log('=== 测试1：健康检查 ===');
  try {
    const result = await makeRequest('GET', '/health');
    console.log('✅ 健康检查成功:', result.data);
    return true;
  } catch (error) {
    console.log('❌ 健康检查失败:', error);
    return false;
  }
}

// 测试2：尝试登录用户1001
async function testLogin() {
  console.log('\n=== 测试2：登录测试（用户1001）===');
  try {
    const username = '1001';
    const password = '123456'; // 假设密码
    
    console.log('尝试登录:', username);
    
    const result = await makeRequest('POST', '/auth/signin', { username, password });
    
    console.log('登录响应:', result.data);
    
    if (result.data.success) {
      console.log('✅ 登录成功');
      console.log('用户ID:', result.data.data.user.id);
      console.log('Token:', result.data.data.token.substring(0, 50) + '...');
      return result.data.data;
    } else {
      console.log('❌ 登录失败:', result.data.error);
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
    
    const result = await makeRequest('GET', '/books', null, token);
    
    console.log('获取书籍响应:', result.data);
    
    if (result.data.success) {
      console.log('✅ 获取书籍成功');
      console.log('书籍数量:', result.data.data.length);
      result.data.data.forEach((book, index) =&gt; {
        console.log(`  书籍${index + 1}:`, book.title, '(ID:', book.id, ', UserId:', book.user_id, ')');
      });
      return result.data.data;
    } else {
      console.log('❌ 获取书籍失败:', result.data.error);
      return [];
    }
  } catch (error) {
    console.log('❌ 获取书籍请求失败:', error);
    return [];
  }
}

// 主测试流程
async function main() {
  console.log('开始测试用户1001的书籍API...\n');
  
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ 后端服务未运行，请先启动后端服务');
    return;
  }
  
  const authData = await testLogin();
  if (!authData) {
    console.log('\n❌ 无法登录，请检查账号密码');
    console.log('提示：如果密码不是123456，请告诉我正确的密码');
    return;
  }
  
  await testGetBooks(authData.token, authData.user.id);
  
  console.log('\n=== 测试完成 ===');
}

main().catch(console.error);

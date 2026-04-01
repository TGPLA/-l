const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:8080/api';

async function testEPUBUpload() {
  console.log('🧪 开始测试 EPUB 上传流程...\n');

  try {
    // 1. 登录
    console.log('1️⃣  正在登录...');
    const loginRes = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '1001', password: '001221' }),
    });
    const loginData = await loginRes.json();
    console.log('✅ 登录响应:', loginData);
    const token = loginData.data.token;
    const userId = loginData.data.user.id;
    console.log('📋 Token:', token.substring(0, 50) + '...');
    console.log('👤 用户 ID:', userId, '\n');

    // 2. 创建书籍
    console.log('2️⃣  正在创建书籍...');
    const createBookRes = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: '测试书籍',
        author: '测试作者',
        coverUrl: '',
      }),
    });
    const createBookData = await createBookRes.json();
    console.log('✅ 创建书籍响应:', createBookData, '\n');

    if (!createBookData.success || !createBookData.data) {
      console.error('❌ 创建书籍失败！');
      return;
    }

    const bookId = createBookData.data.id;
    console.log('📚 书籍 ID:', bookId, '\n');

    console.log('🎉 测试完成！创建书籍的流程是正常的！');
    console.log('\n📝 后端日志应该显示了详细的创建书籍信息');
    console.log('💡 现在让我们检查后端日志...');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testEPUBUpload();

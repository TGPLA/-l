
const http = require('http');

console.log('=== 简单测试 ===');

// 测试健康检查
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) =&gt; {
  let data = '';
  res.on('data', (chunk) =&gt; {
    data += chunk;
  });
  res.on('end', () =&gt; {
    console.log('健康检查响应:', data);
  });
});

req.on('error', (error) =&gt; {
  console.error('请求错误:', error);
});

req.end();

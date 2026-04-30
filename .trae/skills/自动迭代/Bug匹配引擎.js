/**
 * Bug匹配引擎 - 智能复用历史解决方案
 *
 * 功能：
 * 1. 接收用户Bug描述
 * 2. 匹配历史Bug索引
 * 3. 展示已验证的解决方案
 * 4. 如果是新Bug，提示创建复盘存档
 *
 * 使用方式：
 *   node Bug匹配引擎.js "划线不同步"           # 单关键词匹配
 *   node Bug匹配引擎.js "翻页跳过" "spine"     # 多关键词匹配
 *   node Bug匹配引擎.js --interactive        # 交互模式
 */
const fs = require('fs')
const path = require('path')

// ==================== 配置区 ====================
const 项目根目录 = path.join(__dirname, '../../..')
const 复盘存档目录 = path.join(项目根目录, 'archived_复盘存档')
const 索引文件 = path.join(__dirname, 'Bug索引.md')
// ==================== Bug索引数据结构 ====================
const Bug索引 = {
  B001: {
    关键词: ['划线', '同步', '跨浏览器', 'storage'],
    问题类型: '逻辑错误',
    问题名称: '三套同步机制冲突导致划线不显示',
    来源: '划线数据同步问题_2026-04-08.md',
    解决状态: '已解决',
    风险等级: 'P1',
    相关文件: ['useHuaXianChuTi.ts', 'useHuaXianDianJi.ts'],
    解决思路: '信任 useLocalStorageState，移除手动的 storage 监听器',
    核心代码: `// 正确：只使用 useLocalStorageState
const [huaXianList, setHuaXianList] = useLocalStorageState<...>(storageKey, { defaultValue: [] });
// 只依赖 huaXianList 变化
useEffect(() => {
  if (applyBiaoJiRef.current) {
    applyBiaoJiRef.current();
  }
}, [huaXianList]);`
  },
  B002: {
    关键词: ['划线', '不显示', 'CFI', '位置'],
    问题类型: '渲染问题',
    问题名称: '跨浏览器划线丢失',
    来源: 'B001 同源',
    解决状态: '已解决',
    风险等级: 'P2',
    相关文件: ['EPUBYueDuQuYu.tsx'],
    解决思路: '只依赖 huaXianList 变化，重新应用划线',
    核心代码: '// 参考 B001'
  },
  B003: {
    关键词: ['翻页', '跳过', 'spine', '章节'],
    问题类型: '逻辑错误',
    问题名称: 'spine跳转导致跳过章节内页面',
    来源: 'EPUB阅读器翻页跳过问题_2026-04-23.md',
    解决状态: '已解决',
    风险等级: 'P1',
    相关文件: ['useEPUBReaderFanYeHeYeMa.ts'],
    解决思路: '使用 rendition.next() 替代 spine 跳转',
    核心代码: `// 正确：使用 rendition.next() 翻到下一页
rendition.next().then(() => {
  const currentLocation = rendition.location;
  const currentHref = currentLocation?.start?.href || '';
  if (currentHref && saveImmediately) {
    saveImmediately(currentHref);
  }
}).catch((error) => {
  console.error('下一页出错:', error);
});`
  },
  B004: {
    关键词: ['翻页', '卡顿', '性能'],
    问题类型: '性能问题',
    问题名称: '翻页响应慢',
    来源: 'B003 同源',
    解决状态: '已解决',
    风险等级: 'P2',
    相关文件: ['useEPUBReaderFanYeHeYeMa.ts'],
    解决思路: '检查是否使用了 rendition.next() 替代 spine',
    核心代码: '// 参考 B003'
  },
  B005: {
    关键词: ['封面', '字段', '长度', '数据库', 'VARCHAR'],
    问题类型: '数据问题',
    问题名称: '封面URL字段过长导致存储失败',
    来源: 'EPUB导入封面字段长度问题_2026-04-01.md',
    解决状态: '已解决',
    风险等级: 'P2',
    相关文件: ['backend/models/models_content.igo'],
    解决思路: '扩大字段长度 VARCHAR(500) 或改用 TEXT',
    核心代码: '-- 扩大封面字段长度或使用 TEXT 类���'
  },
  B006: {
    关键词: ['封面', '为空', 'null', '解析'],
    问题类型: '解析问题',
    问题名称: '封面解析失败返回空',
    来源: 'EPUB导入封面问题_2026-04-01.md',
    解决状态: '已解决',
    风险等级: 'P2',
    相关文件: ['backend/services/...ig'],
    解决思路: '检查 epub.getMetadata() 返回的封面路径',
    核心代码: '-- 检查元数据解析逻辑'
  },
  B007: {
    关键词: ['文件', '选择', '选择器', '上传'],
    问题类型: 'UI问题',
    问题名称: '文件选择器无法打开',
    来源: 'EPUB导入文件选择器问题_2026-03-20.md',
    解决状态: '已解决',
    风险等级: 'P3',
    相关文件: ['EPUBDaoRuTanChuangShangChuanWenJian.tsx'],
    解决思路: '检查文件输入组件状态和 ref',
    核心代码: '-- 检查 input ref 和状态'
  }
}
// ==================== 匹配算法 ====================
/**
 * 关键词权重匹配算法
 * @param {string[]} 用户关键词 - 用户描述中的关键词
 * @param {Object} Bug条目 - Bug索引条目
 * @returns {number} 匹配得分
 */
function 计算匹配得分(用户关键词, Bug条目) {
  let 得分 = 0
  const 小写关键词 = 用户关键词.map(k => k.toLowerCase())

  for (const 关键词 of Bug条目.关键词) {
    const 小写Bug关键词 = 关键词.toLowerCase()
    if (小写关键词.includes(小写Bug关键词)) {
      得分 += 10 // 完全匹配
    } else {
      // 检查是否包含在关键词中（如 "同步" 匹配 "跨浏览器同步"）
      for (const 用户词 of 小写关键词) {
        if (小写Bug关键词.includes(用户词) || 用户词.includes(小写Bug关键词)) {
          得分 += 5 // 部分匹配
        }
      }
    }
  }

  return 得分
}
/**
 * 从文本提取关键词
 * @param {string} 文本 - 用户描述
 * @returns {string[]} 提取的关键词数组
 */
function 提取关键词(文本) {
  // 移除标点符号，分割为单词
  const 清理后文本 = 文本.replace(/[，。！？、：；""''【】（）()\\]/g, ' ')
  const 单词数组 = 清理后文本.split(/\s+/).filter(w => w.length > 1)

  // 常见停用词（不作为关键词）
  const 停用词 = [
    '问题', '错误', '修复', '解决', '处理', '解决',
    '代码', '文件', '组件', '功能', '模块',
    '这个', '那个', '一个', '什么', '怎么',
    '但是', '因为', '所以', '如果', '然后'
  ]

  return 单词数组.filter(w => !停用词.includes(w) && w.length > 1)
}
// ==================== 核心匹配函数 ====================
/**
 * 匹配Bug
 * @param {string[]} 用户关键词 - 用户描述的关键词数组
 * @param {number} 最低得分 - 最低匹配得分阈值
 * @returns {Object[]} 匹配的Bug列表，按得分排序
 */
function 匹配Bug(用户关键词, 最低得分 = 5) {
  const 匹配结果 = []

  for (const [BugID, Bug条目] of Object.entries(Bug索引)) {
    const 得分 = 计算匹配得分(用户关键词, Bug条目)
    if (得分 >= 最低得分) {
      匹配结果.push({
        BugID,
        得分,
        ...Bug条目
      })
    }
  }

  return 匹配结果.sort((a, b) => b.得分 - a.得分)
}
/**
 * 格式化输出匹配结果
 * @param {Object[]} 匹配结果 - 匹配到的Bug列表
 * @returns {string} 格式化的输出
 */
function 格式化输出(匹配结果) {
  if (匹配结果.length === 0) {
    return '❌ 未匹配到历史Bug！\n   这可能是新问题，建议创建复盘��档。'
  }

  let 输出 = `🔍 匹配到 ${匹配结果.length} 个相关历史Bug：\n\n`

  for (const 结果 of 匹配结果.slice(0, 3)) {
    const 状态标记 = {
      '已解决': '✅',
      '待验证': '⏳',
      '部分解决': '⚠️'
    }[结果.解决状态] || '❓'

    输出 += `${状态标记} [${结果.BugID}] ${结果.问题名称}\n`
    输出 += `   关键词: ${结果.关键词.join(', ')}\n`
    输出 += `   解决思路: ${结果.解决思路}\n`
    输出 += `   相关文件: ${结果.相关文件.join(', ')}\n`
    输出 += `   来源: ${结果.来源}\n`

    if (结果.解决状态 === '已解决') {
      输出 += `\n   📝 已验证的解决方案:\n`
      输出 += `   \`\`\`\`\n`
      输出 += 结果.核心代码.split('\n').map((行, i) => `   ${行}`).join('\n')
      输出 += `\n   \`\`\`\`\n`
    }

    输出 += '\n'
  }

  return 输出
}
// ==================== 主函数 ====================
/**
 * 执行Bug匹配
 * @param {string} 用户描述 - 用户的问题描述
 * @returns {Object} 匹配结果
 */
async function 执行匹配(用户描述) {
  console.log('\n🔍 开始Bug匹配...\n')
  console.log(`📝 用户描述: "${用户描述}"\n`)

  const 关键词 = 提取关键词(用户描述)
  console.log(`🏷️ 提取关键词: [${关键词.join(', ')}]\n`)

  const 匹配结果 = 匹配Bug(关键词)
  const 输出 = 格式化输出(匹配结果)
  console.log(输出)

  return {
    用户描述,
    提取的关键词: 关键词,
    匹配结果,
    是否新Bug: 匹配结果.length === 0
  }
}
/**
 * 处理交互模式
 */
async function 交互模式() {
  console.log('\n🔧 Bug匹配引擎 - 交互模式')
  console.log('=' .repeat(50))
  console.log('请输入问题描述（输入"退出"结束）:\n')

  const 读取行 = () =>
    new Promise((resolve) => {
      process.stdin.resume()
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim())
      })
    })
  while (true) {
    const 输入 = await 读取行()
    if (输入 === '退出' || 输入 === 'exit') {
      console.log('\n👋 退出匹配引擎')
      break
    }
    if (输入) {
      await 执行匹配(输入)
    }
    console.log('\n请输入下一个问题（输入"退出"结束）:\n')
  }
  process.exit(0)
}
// ==================== 导出 ====================
module. exports = {
  执行匹配,
  交互模式,
  匹配Bug,
  提取关键词,
  计算匹配得分,
  格式化输出,
  Bug索引
}
// ==================== CLI入口 ====================
if (require. main === module) {
  const 参数 = process. argv. slice(2)

  if (参数. includes('--interactive')) {
    交互模式()
  } else if (参数. length > 0) {
    const 用户描述 = 参数. join(' ')
    执行匹配(用户描述)
      .then(() => {
        console.log('\n✅ 匹配完成')
        process. exit(0)
      })
      .catch((错误) => {
        console. error('❌ 匹配失败:', 错误)
        process. exit(1)
      })
  } else {
    console. log(`
🔧 Bug匹配引擎

使用方法：
  node Bug匹配引擎. js "划线不同步"           # 单关键词匹配
  node Bug匹配引擎. js "翻页跳过" "spine"        # 多关键词匹配
  node Bug匹配引擎. js --interactive           # 交互模式
    `)
    process. exit(0)
  }
}
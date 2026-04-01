/**
 * @vitest-environment jsdom
 * 关键代码保护测试 - 验证关键代码段存在且功能正常
 * 
 * 目的：防止关键代码被意外删除或修改
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('关键代码保护测试', () => {
  const 项目根目录 = path.resolve(__dirname, '../../../')

  describe('关键代码存在性检查', () => {
    it('database.ts 中应该包含 401 认证失败后刷新页面的关键代码', () => {
      const 文件路径 = path.join(项目根目录, 'src', 'shared', 'services', 'database.ts')
      expect(fs.existsSync(文件路径)).toBe(true)

      const 文件内容 = fs.readFileSync(文件路径, 'utf-8')
      
      expect(文件内容).toContain('@关键代码-不要随意删除')
      expect(文件内容).toContain('认证失败后刷新页面')
      expect(文件内容).toContain('window.location.reload()')
      expect(文件内容).toContain('response.status === 401')
    })

    it('auth.ts 中应该包含登录前清理旧状态的关键代码', () => {
      const 文件路径 = path.join(项目根目录, 'src', 'shared', 'services', 'auth.ts')
      expect(fs.existsSync(文件路径)).toBe(true)

      const 文件内容 = fs.readFileSync(文件路径, 'utf-8')
      
      expect(文件内容).toContain('@关键代码-不要随意删除')
      expect(文件内容).toContain('登录前清理旧状态')
      expect(文件内容).toContain('this.signOut()')
    })
  })

  describe('关键代码清单文档检查', () => {
    it('应该存在 .trae/关键代码清单.md 文件', () => {
      const 清单路径 = path.join(项目根目录, '.trae', '关键代码清单.md')
      expect(fs.existsSync(清单路径)).toBe(true)
    })

    it('关键代码清单应该包含当前的关键代码记录', () => {
      const 清单路径 = path.join(项目根目录, '.trae', '关键代码清单.md')
      const 清单内容 = fs.readFileSync(清单路径, 'utf-8')
      
      expect(清单内容).toContain('src/shared/services/database.ts')
      expect(清单内容).toContain('401 认证失败后刷新页面')
      expect(清单内容).toContain('src/shared/services/auth.ts')
      expect(清单内容).toContain('登录前清理旧状态')
    })
  })

  describe('代码修改检查清单文档检查', () => {
    it('应该存在 .trae/代码修改检查清单.md 文件', () => {
      const 清单路径 = path.join(项目根目录, '.trae', '代码修改检查清单.md')
      expect(fs.existsSync(清单路径)).toBe(true)
    })

    it('代码修改检查清单应该包含关键代码检查阶段', () => {
      const 清单路径 = path.join(项目根目录, '.trae', '代码修改检查清单.md')
      const 清单内容 = fs.readFileSync(清单路径, 'utf-8')
      
      expect(清单内容).toContain('关键代码检查')
      expect(清单内容).toContain('@关键代码')
      expect(清单内容).toContain('停止！')
    })
  })

  describe('Git 工作流规范文档检查', () => {
    it('应该存在 .trae/Git工作流规范.md 文件', () => {
      const 规范路径 = path.join(项目根目录, '.trae', 'Git工作流规范.md')
      expect(fs.existsSync(规范路径)).toBe(true)
    })

    it('Git 工作流规范应该禁止直接 push 到 main', () => {
      const 规范路径 = path.join(项目根目录, '.trae', 'Git工作流规范.md')
      const 规范内容 = fs.readFileSync(规范路径, 'utf-8')
      
      expect(规范内容).toContain('禁止直接 push 到 main')
      expect(规范内容).toContain('feature/*')
      expect(规范内容).toContain('fix/*')
    })
  })
})

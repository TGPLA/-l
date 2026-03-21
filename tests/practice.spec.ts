import { test, expect } from '@playwright/test'

const testUsername = `${Date.now()}${Math.floor(Math.random() * 1000)}`
const testPassword = 'test123456'
const testBookTitle = `练习测试书籍_${Date.now()}`

test.describe('练习模式 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('登录并进入练习模式', async ({ page }) => {
    await page.getByText('立即注册').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('例如：10001').fill(testUsername)
    await page.getByPlaceholder('••••••••').fill(testPassword)

    const [signupResponse] = await Promise.all([
      page.waitForResponse(/\/api\/auth\/signup/, { timeout: 15000 }),
      page.getByRole('button', { name: '注册' }).click()
    ])

    expect(signupResponse.status()).toBe(200)
    await page.waitForTimeout(2000)
  })

  test('创建书籍和章节', async ({ page }) => {
    await page.waitForTimeout(1000)

    await page.getByText('添加书籍').click()
    await page.waitForTimeout(500)

    await page.getByPlaceholder('输入书名').fill(testBookTitle)
    await page.getByPlaceholder('输入书籍简介（可选）').fill('用于练习模式测试')

    const [bookResponse] = await Promise.all([
      page.waitForResponse(/\/api\/books/, { timeout: 15000 }),
      page.getByRole('button', { name: '保存' }).click()
    ])

    expect(bookResponse.status()).toBe(200)
    await page.waitForTimeout(1000)

    await page.getByText(testBookTitle).first().click()
    await page.waitForTimeout(1000)

    await page.getByText('添加章节').click()
    await page.waitForTimeout(500)

    const chapterTitle = `练习测试章节_${Date.now()}`
    await page.getByPlaceholder('输入章节标题').fill(chapterTitle)

    const [chapterResponse] = await Promise.all([
      page.waitForResponse(/\/api\/chapters/, { timeout: 15000 }),
      page.getByRole('button', { name: '保存' }).click()
    ])

    expect(chapterResponse.status()).toBe(200)
    await page.waitForTimeout(1000)

    await expect(page.getByText(chapterTitle)).toBeVisible()
  })

  test('练习模式入口验证', async ({ page }) => {
    await page.waitForTimeout(1000)

    await page.getByText(testBookTitle).first().click()
    await page.waitForTimeout(1000)

    const practiceButton = page.getByRole('button', { name: /练习/ })
    await expect(practiceButton.first()).toBeVisible()
  })
})
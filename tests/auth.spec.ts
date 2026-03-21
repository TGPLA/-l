import { test, expect } from '@playwright/test'

const testPassword = 'test123456'

test.describe('Auth E2E Test - 登录', () => {
  test('应该使用已注册账号登录成功', async ({ page }) => {
    const testUsername = `${Date.now()}${Math.floor(Math.random() * 1000)}`

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByText('立即注册').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('例如：10001').fill(testUsername)
    await page.getByPlaceholder('••••••••').fill(testPassword)
    await page.waitForTimeout(300)

    const [signupResponse] = await Promise.all([
      page.waitForResponse(/\/api\/auth\/signup/, { timeout: 15000 }),
      page.getByRole('button', { name: '注册' }).click()
    ])

    expect(signupResponse.status()).toBe(200)

    await page.waitForTimeout(1000)

    await page.getByText('退出').click()
    await page.waitForTimeout(500)

    await page.getByText('立即登录').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('例如：10001').fill(testUsername)
    await page.getByPlaceholder('••••••••').fill(testPassword)

    const [loginResponse] = await Promise.all([
      page.waitForResponse(/\/api\/auth\/login/, { timeout: 15000 }),
      page.getByRole('button', { name: '登录' }).click()
    ])

    expect(loginResponse.status()).toBe(200)
  })
})
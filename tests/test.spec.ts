import { test, expect } from '@playwright/test'

const testPassword = 'test123456'

test.describe('Auth E2E Test', () => {
  test('should register new user successfully', async ({ page }) => {
    const testUsername = `${Date.now()}${Math.floor(Math.random() * 1000)}`

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByText('立即注册').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('例如：10001').fill(testUsername)
    await page.getByPlaceholder('••••••••').fill(testPassword)
    await page.waitForTimeout(300)

    const [response] = await Promise.all([
      page.waitForResponse(/\/api\/auth\/signup/, { timeout: 15000 }),
      page.getByRole('button', { name: '注册' }).click()
    ])

    expect(response.status()).toBe(200)
  })
})
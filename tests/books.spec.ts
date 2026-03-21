import { test, expect } from '@playwright/test'

function generateUsername() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`
}

const testPassword = 'test123456'

test.describe('书籍管理 E2E 测试', () => {
  async function registerUser(page: any) {
    const username = generateUsername()
    await page.getByText('立即注册').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('例如：10001').fill(username)
    await page.getByPlaceholder('••••••••').fill(testPassword)

    const [response] = await Promise.all([
      page.waitForResponse(/\/api\/auth\/signup/, { timeout: 15000 }),
      page.getByRole('button', { name: '注册' }).click()
    ])

    expect(response.status()).toBe(200)
    await page.waitForTimeout(2000)
    return username
  }

  async function addBook(page: any, bookTitle: string) {
    await page.getByRole('button', { name: '添加书籍' }).first().click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('请输入书名').fill(bookTitle)
    await page.getByPlaceholder('请输入作者').fill('测试作者')

    const [response] = await Promise.all([
      page.waitForResponse(/\/api\/books/, { timeout: 15000 }),
      page.getByRole('button', { name: '添加', exact: true }).click()
    ])

    expect(response.status()).toBe(200)
    await page.waitForTimeout(2000)
  }

  test('注册并添加书籍', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerUser(page)
    const bookTitle = `测试书籍_${Date.now()}`

    await addBook(page, bookTitle)

    await expect(page.getByText(bookTitle).first()).toBeVisible()
  })

  test('查看书籍详情', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerUser(page)
    const bookTitle = `测试书籍_${Date.now()}`

    await addBook(page, bookTitle)

    await page.getByText(bookTitle).first().click()
    await page.waitForTimeout(1000)

    await expect(page.getByText(bookTitle)).toBeVisible()
    await expect(page.getByRole('button', { name: '添加章节' })).toBeVisible()
  })

  test('创建章节', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerUser(page)
    const bookTitle = `测试书籍_${Date.now()}`
    const chapterTitle = `测试章节_${Date.now()}`

    await addBook(page, bookTitle)

    await page.getByText(bookTitle).first().click()
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: '添加章节' }).click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('输入章节标题').fill(chapterTitle)

    const [response] = await Promise.all([
      page.waitForResponse(/\/api\/chapters/, { timeout: 15000 }),
      page.getByRole('button', { name: '保存' }).click()
    ])

    expect(response.status()).toBe(200)
    await page.waitForTimeout(1000)

    await expect(page.getByText(chapterTitle)).toBeVisible()
  })

  test('删除书籍', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerUser(page)
    const bookTitle = `测试书籍_${Date.now()}`

    await addBook(page, bookTitle)

    page.on('dialog', dialog => dialog.accept())

    const bookCard = page.locator('.grid > div').filter({ hasText: bookTitle }).first()
    await bookCard.hover()
    await page.waitForTimeout(500)

    const deleteButton = bookCard.getByTitle('删除')
    await deleteButton.click()
    await page.waitForTimeout(1000)

    await expect(page.getByText(bookTitle).first()).not.toBeVisible()
  })
})
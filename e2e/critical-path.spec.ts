import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Unique email per test run so register tests don't collide between runs.
 * Each test that needs a fresh account generates one via this helper.
 */
function uniqueEmail() {
  return `e2e+${Date.now()}@reckon-test.local`
}

const TEST_PASSWORD = 'TestPassword123!'

/**
 * Register a brand-new account and return the credentials used.
 */
async function registerNew(page: Page) {
  const email = uniqueEmail()
  await page.goto('/register')
  await page.getByLabel('Full name').fill('E2E Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL('/', { timeout: 10_000 })
  return { email, password: TEST_PASSWORD }
}

/**
 * Log in with known credentials. Assumes the account already exists.
 */
async function loginWith(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/', { timeout: 10_000 })
}

// ---------------------------------------------------------------------------
// 1. Auth flow
// ---------------------------------------------------------------------------

test.describe('Auth flow', () => {
  test('register → redirects to dashboard', async ({ page }) => {
    await registerNew(page)
    // Already asserted inside registerNew; double-check title
    await expect(page).toHaveTitle(/Dashboard/)
  })

  test('login with valid credentials → redirects to dashboard', async ({ page }) => {
    // Register first so the account exists, then log out implicitly by visiting /login
    const { email, password } = await registerNew(page)
    await loginWith(page, email, password)
    await expect(page).toHaveTitle(/Dashboard/)
  })

  test('login with invalid password → shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('no-such-user@reckon-test.local')
    await page.getByLabel('Password').fill('WrongPassword!')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Error message should appear without redirecting
    await expect(page.locator('[class*="text-danger"]').first()).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL('/login')
  })
})

// ---------------------------------------------------------------------------
// 2. Dashboard
// ---------------------------------------------------------------------------

test.describe('Dashboard', () => {
  let sharedEmail: string

  test.beforeAll(async ({ browser }) => {
    // Create one account to share across all dashboard tests
    const page = await browser.newPage()
    const creds = await registerNew(page)
    sharedEmail = creds.email
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await loginWith(page, sharedEmail, TEST_PASSWORD)
  })

  test('page title contains Dashboard', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/)
  })

  test('KPI cards are visible', async ({ page }) => {
    // The dashboard renders at least one .card element
    const cards = page.locator('.card')
    await expect(cards.first()).toBeVisible({ timeout: 8_000 })
  })

  test('navigation sidebar links are visible', async ({ page }) => {
    // Sidebar renders nav links by label text
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Transactions' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Budgets' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// 3. Transactions page
// ---------------------------------------------------------------------------

test.describe('Transactions page', () => {
  let sharedEmail: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const creds = await registerNew(page)
    sharedEmail = creds.email
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await loginWith(page, sharedEmail, TEST_PASSWORD)
  })

  test('renders without errors (table or empty state)', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page).toHaveTitle(/Transactions/)

    // Either a table or an empty-state message is visible — just assert the
    // page itself loaded without a crash (no "Application error" text)
    await expect(page.locator('body')).not.toContainText('Application error')
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Something meaningful is rendered (table, heading, or empty-state card)
    const rendered =
      (await page.locator('table').count()) > 0 ||
      (await page.locator('.card').count()) > 0 ||
      (await page.getByRole('heading').count()) > 0
    expect(rendered).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. Budgets page
// ---------------------------------------------------------------------------

test.describe('Budgets page', () => {
  let sharedEmail: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const creds = await registerNew(page)
    sharedEmail = creds.email
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await loginWith(page, sharedEmail, TEST_PASSWORD)
  })

  test('page title contains Budgets', async ({ page }) => {
    await page.goto('/budgets')
    await expect(page).toHaveTitle(/Budgets/)
  })

  test('renders without errors', async ({ page }) => {
    await page.goto('/budgets')
    await expect(page.locator('body')).not.toContainText('Application error')
    // Page heading
    await expect(page.getByRole('heading', { name: /budget/i })).toBeVisible({ timeout: 8_000 })
  })
})

// ---------------------------------------------------------------------------
// 5. Settings page
// ---------------------------------------------------------------------------

test.describe('Settings page', () => {
  let sharedEmail: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const creds = await registerNew(page)
    sharedEmail = creds.email
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await loginWith(page, sharedEmail, TEST_PASSWORD)
  })

  test('page title contains Settings', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveTitle(/Settings/)
  })

  test('name and email fields are visible', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('#profile-name')).toBeVisible({ timeout: 8_000 })
    await expect(page.locator('#profile-email')).toBeVisible()
  })

  test('page heading is visible', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 8_000 })
  })
})

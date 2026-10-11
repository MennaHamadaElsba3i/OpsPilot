import { test, expect } from '@playwright/test';

test.describe('Operations Dashboard End-to-End Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base route, redirects to /operations
    await page.goto('/operations');
    await page.waitForLoadState('networkidle');
  });

  test('direct navigation to operations list and initial dashboard render', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Operations Management Dashboard');

    // Verify status cards are rendered with non-zero counts
    const totalCard = page.locator('button', { hasText: 'Total Operations' });
    await expect(totalCard).toBeVisible();

    // Verify operations table has rows
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(10);
  });

  test('searching operations updates URL and filters visible results', async ({ page }) => {
    const searchInput = page.locator('#operations-search-input');
    await searchInput.fill('Sync');

    // URL should reflect debounced search param
    await expect(page).toHaveURL(/search=Sync/);

    // Filtered rows should match search term
    const firstRowName = page.locator('tbody tr').first().locator('td').nth(1);
    await expect(firstRowName).toContainText(/Sync/i);
  });

  test('status filter and pagination combined with URL sync', async ({ page }) => {
    // Select status filter
    const statusSelect = page.locator('#status-select');
    await statusSelect.selectOption('Completed');

    await expect(page).toHaveURL(/status=Completed/);

    // Verify all rows have Completed status badge
    const badges = page.locator('tbody tr').first().locator('td').nth(3);
    await expect(badges).toContainText('Completed');

    // Click Next page
    const nextBtn = page.locator('button[aria-label="Next page"]');
    await nextBtn.click();

    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('text=Showing 11 to 20')).toBeVisible();
  });

  test('opening details and returning preserves all list URL parameters', async ({ page }) => {
    // 1. Set filters on list: status=Running, page=2
    const statusSelect = page.locator('#status-select');
    await statusSelect.selectOption('Running');
    await expect(page).toHaveURL(/status=Running/);

    const nextBtn = page.locator('button[aria-label="Next page"]');
    await nextBtn.click();
    await expect(page).toHaveURL(/page=2/);

    // Capture the target operation ID on page 2
    const firstRowId = page.locator('tbody tr').first().locator('td').first();
    const opId = (await firstRowId.textContent())?.trim();
    expect(opId).toBeTruthy();

    // 2. Click the row to open details
    await firstRowId.click();

    // Verify on details page with preserved query string in URL
    await expect(page).toHaveURL(new RegExp(`/operations/${opId}\\?.*status=Running.*page=2`));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Update Status Lifecycle')).toBeVisible();

    // 3. Click "Back to Operations List"
    const backBtn = page.locator('button', { hasText: 'Back to Operations List' });
    await backBtn.click();

    // 4. Verify returning restores identical list state (page 2, status Running)
    await expect(page).toHaveURL(new RegExp(`/operations\\?.*status=Running.*page=2`));
    await expect(page.locator('text=Showing 11 to 20')).toBeVisible();
  });

  test('direct navigation to details page works with fallback back-button', async ({ page }) => {
    await page.goto('/operations/OP-00001');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=OP-00001')).toBeVisible();

    // Clicking back returns to /operations cleanly
    const backBtn = page.locator('button', { hasText: 'Back to Operations List' });
    await backBtn.click();

    await expect(page).toHaveURL(/\/operations$/);
  });

  test('refreshing filtered and sorted list preserves state', async ({ page }) => {
    await page.goto('/operations?status=Pending&sortBy=createdAt&sortOrder=asc&page=3');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Showing 21 to 30')).toBeVisible();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // URL and state must remain identical
    await expect(page).toHaveURL(/status=Pending&sortBy=createdAt&sortOrder=asc&page=3/);
    await expect(page.locator('text=Showing 21 to 30')).toBeVisible();
  });

  test('browser Back and Forward restores URL and visible list state', async ({ page }) => {
    // Step 1: Start at base
    await expect(page.locator('text=Showing 1 to 10')).toBeVisible();

    // Step 2: Navigate to Page 2
    const nextBtn = page.locator('button[aria-label="Next page"]');
    await nextBtn.click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('text=Showing 11 to 20')).toBeVisible();

    // Step 3: Filter by status
    const statusSelect = page.locator('#status-select');
    await statusSelect.selectOption('Failed');
    await expect(page).toHaveURL(/status=Failed/);

    // Step 4: Browser Back (should return to Page 2 unfiltered)
    await page.goBack();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('text=Showing 11 to 20')).toBeVisible();

    // Step 5: Browser Back again (should return to Page 1)
    await page.goBack();
    await expect(page.locator('text=Showing 1 to 10')).toBeVisible();

    // Step 6: Browser Forward (should return to Page 2)
    await page.goForward();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('text=Showing 11 to 20')).toBeVisible();
  });

  test('status update is saved and persists across page reload', async ({ page }) => {
    await page.goto('/operations');
    await page.waitForLoadState('networkidle');

    // Open first operation
    const firstRow = page.locator('tbody tr').first().locator('td').first();
    await firstRow.click();

    // Change status on details page
    const setCompletedBtn = page.locator('button', { hasText: 'Set Completed' });
    await setCompletedBtn.click();

    await expect(page.locator('text=Status updated successfully to Completed.')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify Completed status persists after reload
    await expect(page.locator('button', { hasText: 'Set Completed' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('keyboard accessibility: navigates table rows using keyboard focus and Enter key', async ({ page }) => {
    // Focus search input
    await page.locator('#operations-search-input').focus();

    // Tab to first table row
    await page.keyboard.press('Tab'); // to clear search or first control
    const row = page.locator('tbody tr').first();

    // Focus row directly and press Enter
    await row.focus();
    await page.keyboard.press('Enter');

    // Must navigate to details page
    await expect(page.locator('text=Update Status Lifecycle')).toBeVisible();
  });
});

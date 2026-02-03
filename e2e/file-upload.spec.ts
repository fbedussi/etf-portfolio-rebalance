import { test, expect } from '@playwright/test';

test('should open file selection dialog when open-file-btn is clicked', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for the button to be visible
    const openFileBtn = page.locator('[data-test-id="open-file-btn"]');
    await expect(openFileBtn).toBeVisible();

    // Set up a promise to listen for the file chooser dialog
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Click the button
    await openFileBtn.click();

    // Wait for the file chooser to appear
    const fileChooser = await fileChooserPromise;

    // Verify that the file chooser was opened
    expect(fileChooser).toBeTruthy();
});

test('should only accept YAML files in the file dialog', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for the button to be visible
    const openFileBtn = page.locator('[data-test-id="open-file-btn"]');
    await expect(openFileBtn).toBeVisible();

    // Set up a promise to listen for the file chooser dialog
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Click the button
    await openFileBtn.click();

    // Wait for the file chooser to appear
    const fileChooser = await fileChooserPromise;

    // Verify that the file chooser only accepts YAML files
    // The accept property should contain .yaml and .yml
    const element = await fileChooser.element();
    const acceptAttribute = await element.getAttribute('accept');

    expect(acceptAttribute).toBe('.yaml,.yml');
});

test('should update portfolio name after uploading a file', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for the button to be visible
    const openFileBtn = page.locator('[data-test-id="open-file-btn"]');

    // Start waiting for file chooser before clicking
    const fileChooserPromise = page.waitForEvent('filechooser');
    await openFileBtn.click();
    const fileChooser = await fileChooserPromise;

    // Upload the file
    await fileChooser.setFiles('portfolio-simple.yaml');

    // Verify the portfolio name matches the one in the yaml file
    const portfolioName = page.locator('[data-test-id="portfolio-name"]');
    await portfolioName.waitFor({ state: 'attached' });
    await expect(portfolioName).toHaveText('My Simple Portfolio');
});

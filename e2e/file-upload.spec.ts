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

test('should show the portfolio data after uploading a file', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    const openFileBtn = page.locator('[data-test-id="open-file-btn"]');

    // Start waiting for file chooser before clicking
    const fileChooserPromise = page.waitForEvent('filechooser');
    await openFileBtn.click();
    const fileChooser = await fileChooserPromise;

    // Upload the file
    await fileChooser.setFiles('portfolio-simple.yaml');

    // Verify the portfolio name matches the one in the yaml file
    const portfolioName = page.locator('[data-test-id="portfolio-name"]');
    await expect(portfolioName).toHaveText('My Simple Portfolio');
});

test('after a portfolio is uploaded the prices are fetched', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173');
    const openFileBtn = page.locator('[data-test-id="open-file-btn"]');
    // Start waiting for file chooser before clicking
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    // Act
    await openFileBtn.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('portfolio-simple.yaml');

    // Assert
    const portfolioCurrentTotalName = page.locator('[data-test-id="portfolio-current-total"]');
    await expect(portfolioCurrentTotalName).toHaveText('5500,00 €');
});

test('the uploaded portfolio persists across page reloads', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173');
    const openFileBtn = page.locator('[data-test-id="open-file-btn"]');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await openFileBtn.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('portfolio-simple.yaml');
    const portfolioName = page.locator('[data-test-id="portfolio-name"]');
    await expect(portfolioName).toHaveText('My Simple Portfolio');

    // Act
    await page.reload()


    // Assert
    await expect(portfolioName).toHaveText('My Simple Portfolio');
});

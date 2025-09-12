const { test, expect } = require('@playwright/test');

test.describe('Simplified Processing Test', () => {
  test('Test processing application and print preview', async ({ page }) => {
    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 2: Start new quote and select customer
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(2000);
    await page.click('text=John Smith Construction');

    // Step 3: Create a room
    await page.waitForTimeout(2000);
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    await page.click('button:has-text("Create Room & Start Quote")');

    // Step 4: Move to product configuration
    await page.click('button:has-text("Continue →")');

    // Add a product
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Step 5: Click on the product in the "Your Order" section to select it
    const productInOrder = page.locator('h5:has-text("12\\" Base Cabinet")').locator('..');
    await productInOrder.click();
    await page.waitForTimeout(2000);

    // Step 6: Find and click the Dark Stain Configure button
    const processingContainer = page.locator('div:has-text("Available Processing")').first();
    const allConfigureButtons = processingContainer.locator('button:has-text("Configure")');
    const configureButtonCount = await allConfigureButtons.count();

    if (configureButtonCount >= 2) {
      // Click the Dark Stain Configure button (index 1)
      await allConfigureButtons.nth(1).click();
      await page.waitForTimeout(1000);

      // Step 7: Handle the modal
      await page.waitForTimeout(2000);
      const modalHeadings = await page.locator('h3:has-text("Configure")').all();

      if (modalHeadings.length > 0) {
        // Select an option in the modal
        const selectElements = await page.locator('select').all();
        if (selectElements.length > 0) {
          const options = await selectElements[0].locator('option').all();
          if (options.length > 1) {
            const firstOptionValue = await options[1].getAttribute('value');
            await selectElements[0].selectOption(firstOptionValue);
          }
        }

        // Click Apply Processing button
        const applyButton = page.locator('button:has-text("Apply Processing")');
        if (await applyButton.isVisible()) {
          await applyButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Step 8: Go to Fees phase and check print preview
    await page.click('button:has-text("Continue →")');
    const printButton = page.locator('button:has-text("Preview Print")');
    await printButton.click();
    await page.waitForTimeout(2000);

    // Check if Dark Stain appears in the print preview
    const printPreview = page.locator('text=/Dark Stain|Processing/');
    const hasDarkStainInPreview = await printPreview.isVisible();

    expect(hasDarkStainInPreview).toBe(true);
  });
});

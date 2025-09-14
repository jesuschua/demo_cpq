const { test, expect } = require('@playwright/test');

test.describe('Room Processing Option Update', () => {
  test('Should update inherited processing options when room processing is changed', async ({ page }) => {
    test.setTimeout(60000);

    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 2: Start new quote and select customer
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    await page.click('text=John Smith Construction');
    await page.click('button:has-text("Create Order")');

    // Step 3: Create a room
    await page.waitForTimeout(2000);

    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');

    const descriptionInput = page.locator('input[placeholder="Special notes..."]');
    await descriptionInput.fill('Test Kitchen');

    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('Traditional Oak');

    // Click Add Room button
    await page.click('button:has-text("Add Room")');
    await page.waitForTimeout(2000);

    // Wait for room to appear in the middle pane
    await page.waitForSelector('text=Test Kitchen', { timeout: 10000 });

    // Step 4: Configure room processing - Custom Paint Color with Navy Blue
    // Select the room to show processing options
    await page.click('text=Test Kitchen');
    await page.waitForTimeout(1000);

    // Click Custom Paint Color checkbox
    const customPaintLabel = page.locator('label:has-text("Custom Paint Color")');
    const customPaintCheckbox = customPaintLabel.locator('input[type="checkbox"]');
    await customPaintCheckbox.click();
    await page.waitForTimeout(1000);

    // Verify modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Select Navy Blue paint color
    const paintColorSelect = page.locator('select').first();
    await paintColorSelect.selectOption('navy_blue');
    await page.waitForTimeout(500);

    // Select Semi-Gloss finish
    const paintFinishSelect = page.locator('select').nth(1);
    await paintFinishSelect.selectOption('semi_gloss');
    await page.waitForTimeout(500);

    // Apply the processing
    await page.click('button:has-text("Apply Processing")');
    await page.waitForTimeout(1000);

    // Step 5: Add a product that will inherit the processing
    await page.click('button:has-text("Add Products")');
    await page.waitForTimeout(1000);

    // Add a cabinet product
    const cabinetButton = page.locator('button:has-text("Add Cabinet")').first();
    await cabinetButton.click();
    await page.waitForTimeout(1000);

    // Step 6: Go to finalize phase to verify navy blue is shown
    await page.click('button:has-text("Finalize Order")');
    await page.waitForTimeout(2000);

    // Verify navy blue is shown in the processing details
    const navyBlueDetails = page.locator('text=Navy Blue');
    await expect(navyBlueDetails).toBeVisible();
    console.log('✓ Initial navy blue processing verified');

    // Step 7: Go back to edit and change room processing to Sage Green
    await page.click('button:has-text("Back to Edit")');
    await page.waitForTimeout(2000);

    // Select the room again
    await page.click('text=Test Kitchen');
    await page.waitForTimeout(1000);

    // Click Custom Paint Color checkbox again to open modal
    await customPaintCheckbox.click();
    await page.waitForTimeout(1000);

    // Verify modal opens
    await expect(modal).toBeVisible();

    // Change to Sage Green paint color
    await paintColorSelect.selectOption('sage_green');
    await page.waitForTimeout(500);

    // Keep Semi-Gloss finish
    await paintFinishSelect.selectOption('semi_gloss');
    await page.waitForTimeout(500);

    // Apply the updated processing
    await page.click('button:has-text("Apply Processing")');
    await page.waitForTimeout(1000);

    // Step 8: Go back to finalize phase to verify sage green is now shown
    await page.click('button:has-text("Finalize Order")');
    await page.waitForTimeout(2000);

    // Verify sage green is now shown in the processing details
    const sageGreenDetails = page.locator('text=Sage Green');
    await expect(sageGreenDetails).toBeVisible();
    console.log('✓ Updated sage green processing verified');

    // Verify navy blue is no longer shown
    const navyBlueDetailsAfter = page.locator('text=Navy Blue');
    await expect(navyBlueDetailsAfter).not.toBeVisible();
    console.log('✓ Old navy blue processing removed');
  });
});

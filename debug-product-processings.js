const { test, expect } = require('@playwright/test');

test('Debug product processings', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Start new quote and select customer
  await page.click('button:has-text("Create Quote")');
  await page.waitForTimeout(2000);
  await page.click('text=John Smith Construction');
  await page.click('button:has-text("Create Order")');

  // Create a room
  await page.waitForTimeout(2000);
  const roomTypeSelect = page.locator('select').first();
  await roomTypeSelect.selectOption('Kitchen');
  const descriptionInput = page.locator('input[placeholder="Special notes..."]');
  await descriptionInput.fill('Test Kitchen');
  const styleSelect = page.locator('select').nth(1);
  await styleSelect.selectOption('Traditional Oak');
  await page.click('button:has-text("Add Room")');
  await page.waitForTimeout(2000);
  await page.waitForSelector('text=Test Kitchen', { timeout: 10000 });

  // Move to product configuration
  await page.click('button:has-text("Continue →")');

  // Add a product
  await page.click('text=12" Base Cabinet');
  await page.waitForTimeout(3000);

  // Click on the product to select it
  const productInOrder = page.locator('h5:has-text("12\\" Base Cabinet")').locator('..');
  await productInOrder.click();
  await page.waitForTimeout(2000);

  // Debug: Check what processings are available
  const processingContainer = page.locator('div:has-text("Available Processing")').first();
  const allProcessingItems = processingContainer.locator('div').all();
  const processingCount = await allProcessingItems.count();
  
  console.log(`Found ${processingCount} processing items`);
  
  for (let i = 0; i < processingCount; i++) {
    const item = allProcessingItems[i];
    const text = await item.textContent();
    console.log(`Processing ${i}: ${text}`);
  }

  // Check for Configure buttons
  const allConfigureButtons = processingContainer.locator('button:has-text("Configure")');
  const configureButtonCount = await allConfigureButtons.count();
  console.log(`Found ${configureButtonCount} Configure buttons`);
  
  for (let i = 0; i < configureButtonCount; i++) {
    const button = allConfigureButtons.nth(i);
    const parentDiv = button.locator('..');
    const parentText = await parentDiv.textContent();
    console.log(`Configure button ${i}: ${parentText}`);
  }
});

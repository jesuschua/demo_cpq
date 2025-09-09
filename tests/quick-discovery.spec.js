const { test, expect } = require('@playwright/test');

test.describe('Quick App Discovery', () => {
  test('discover app flow quickly', async ({ page }) => {
    console.log('=== Quick Discovery ===');
    
    // Navigate and take initial screenshot
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'discovery-1-initial.png' });
    
    // Click Start New Quote
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'discovery-2-customers.png' });
    
    // Click customer
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'discovery-3-room-config.png' });
    
    // Fill room form quickly
    await page.locator('select').filter({ hasText: 'Select a style' }).selectOption({ index: 1 });
    await page.fill('textarea', 'Test room');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'discovery-4-products.png' });
    
    // Add a product
    const addButtons = await page.locator('button').filter({ hasText: 'Add to Quote' }).all();
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'discovery-5-after-add-product.png' });
    }
    
    // Go to quote builder
    const configureButton = page.locator('button').filter({ hasText: 'Configure Items' });
    if (await configureButton.isVisible()) {
      await configureButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'discovery-6-quote-builder.png' });
      
      // Look for debug panel
      const debugPanel = page.locator('text=DEBUG PANEL');
      if (await debugPanel.isVisible()) {
        console.log('DEBUG PANEL FOUND!');
        await page.screenshot({ path: 'discovery-7-debug-panel.png' });
      } else {
        console.log('No debug panel found');
      }
      
      // Look for available processings
      const availableProcessings = page.locator('text=Available Processings:');
      if (await availableProcessings.isVisible()) {
        console.log('Available processings section found');
        await page.screenshot({ path: 'discovery-8-available-processings.png' });
      } else {
        console.log('No available processings section found');
      }
    }
    
    console.log('=== Discovery Complete ===');
  });
});

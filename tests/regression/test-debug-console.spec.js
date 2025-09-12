const { test, expect } = require('@playwright/test');

test.describe('Debug Console Output', () => {
  test('Capture console output to debug AvailableProcessing', async ({ page }) => {
    console.log('🔍 Starting console debug test');
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      console.log(`📝 Console [${msg.type()}]:`, msg.text());
      if (msg.text().includes('🔧')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Load page and get to product configuration with product added
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(1000);
    await page.click('text=John Smith Construction');
    await page.waitForTimeout(1000);
    
    // Fill room details
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    await page.fill('textarea', 'Test Kitchen Room');
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    
    // Add a product
    const firstProduct = page.locator('text=12" Base Cabinet').first();
    await firstProduct.click();
    await page.waitForTimeout(1000);
    console.log('✅ Added 12" Base Cabinet');
    
    // Click on the product in the order to show processing options
    const clickableElements = await page.locator('text=12" Base Cabinet').all();
    if (clickableElements.length > 1) {
      await clickableElements[1].click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked on product in order to show processing options');
    }
    
    // Wait for any console messages
    await page.waitForTimeout(2000);
    
    console.log(`📊 Captured ${consoleMessages.length} debug messages:`);
    consoleMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg}`);
    });
    
    console.log('✅ Console debug test completed');
  });
});

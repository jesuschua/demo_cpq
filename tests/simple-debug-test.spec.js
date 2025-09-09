const { test, expect } = require('@playwright/test');

test.describe('Simple Debug Test', () => {
  test('check debug panel exists', async ({ page }) => {
    console.log('=== Simple Debug Test ===');
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'simple-debug-test.png' });
    
    // Check for any red elements
    const redElements = await page.locator('[class*="red"]').all();
    console.log(`Found ${redElements.length} red elements`);
    
    // Check for debug text
    const debugText = await page.locator('text=DEBUG').all();
    console.log(`Found ${debugText.length} elements with "DEBUG" text`);
    
    // Get page content
    const content = await page.textContent('body');
    console.log('Page content preview:', content.substring(0, 200));
    
    // Look for any buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    console.log('=== Test Complete ===');
  });
});

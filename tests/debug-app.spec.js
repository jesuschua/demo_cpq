const { test, expect } = require('@playwright/test');

test.describe('Debug App State', () => {
  test('take screenshot and debug app', async ({ page }) => {
    console.log('=== Debugging App State ===');
    
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'debug-initial-state.png' });
    console.log('Screenshot saved: debug-initial-state.png');
    
    // Get all text content on the page
    const pageContent = await page.textContent('body');
    console.log('Page content:', pageContent);
    
    // Look for any buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    // Look for customer-related elements
    const customerElements = await page.locator('text=Customer').all();
    console.log(`Found ${customerElements.length} customer-related elements`);
    
    // Look for any select elements
    const selects = await page.locator('select').all();
    console.log(`Found ${selects.length} select elements`);
    
    // Wait a bit and take another screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-after-wait.png' });
    
    console.log('=== Debug Complete ===');
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Debug App Flow', () => {
  test('debug step by step flow', async ({ page }) => {
    console.log('=== Debugging Step by Step Flow ===');
    
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'debug-step1-initial.png' });
    console.log('Step 1: Initial state screenshot saved');
    
    // Click Start New Quote
    console.log('Step 2: Clicking Start New Quote...');
    const startQuoteButton = page.locator('button').filter({ hasText: 'Start New Quote' });
    await startQuoteButton.click();
    
    // Wait a moment and take screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-step2-after-start-quote.png' });
    console.log('Step 2: After Start New Quote screenshot saved');
    
    // Get page content after clicking Start New Quote
    const pageContent = await page.textContent('body');
    console.log('Page content after Start New Quote:', pageContent);
    
    // Look for any buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons after Start New Quote:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    // Look for any text containing "Customer" or "Select"
    const customerText = await page.locator('text=Customer').all();
    const selectText = await page.locator('text=Select').all();
    console.log(`Found ${customerText.length} elements with "Customer"`);
    console.log(`Found ${selectText.length} elements with "Select"`);
    
    // Try to find any clickable elements
    const clickableElements = await page.locator('a, button, [role="button"]').all();
    console.log(`Found ${clickableElements.length} clickable elements:`);
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      const text = await clickableElements[i].textContent();
      const tagName = await clickableElements[i].evaluate(el => el.tagName);
      console.log(`Clickable ${i}: <${tagName}> "${text}"`);
    }
    
    console.log('=== Debug Complete ===');
  });
});

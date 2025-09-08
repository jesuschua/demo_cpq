const { test, expect } = require('@playwright/test');

test.describe('Debug Simplified App', () => {
  test('debug simplified app UI', async ({ page }) => {
    console.log('🚀 Starting debug simplified app test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Get all text content
    const pageText = await page.textContent('body');
    console.log('🔍 Page text (first 1000 chars):', pageText.substring(0, 1000));
    
    // Step 3: Get all buttons
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔍 Found ${buttonCount} total buttons`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      console.log(`  Button ${i}: "${buttonText}"`);
    }
    
    // Step 4: Get all headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    console.log(`🔍 Found ${headingCount} headings`);
    
    for (let i = 0; i < headingCount; i++) {
      const headingText = await headings.nth(i).textContent();
      console.log(`  Heading ${i}: "${headingText}"`);
    }
    
    // Step 5: Take screenshot
    await page.screenshot({ path: 'debug-simplified-app.png' });
    
    console.log('🏁 Test completed');
  });
});

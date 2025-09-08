const { test, expect } = require('@playwright/test');

test.describe('Debug After Customer', () => {
  test('debug after customer selection', async ({ page }) => {
    console.log('🚀 Starting debug after customer test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForLoadState('networkidle');
    console.log('✅ Customer selected');
    
    // Step 3: Get all text content
    const pageText = await page.textContent('body');
    console.log('🔍 Page text (first 1000 chars):', pageText.substring(0, 1000));
    
    // Step 4: Get all buttons
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔍 Found ${buttonCount} total buttons`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      console.log(`  Button ${i}: "${buttonText}"`);
    }
    
    // Step 5: Get all select elements
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log(`🔍 Found ${selectCount} select elements`);
    
    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const options = await select.locator('option').allTextContents();
      console.log(`  Select ${i}: [${options.join(', ')}]`);
    }
    
    // Step 6: Get all input elements
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`🔍 Found ${inputCount} input elements`);
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`  Input ${i}: type="${type}", placeholder="${placeholder}"`);
    }
    
    // Step 7: Take screenshot
    await page.screenshot({ path: 'debug-after-customer.png' });
    
    console.log('🏁 Test completed');
  });
});

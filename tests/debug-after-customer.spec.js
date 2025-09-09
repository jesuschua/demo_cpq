const { test, expect } = require('@playwright/test');

test.describe('Debug After Customer Selection', () => {
  test('debug after customer selection', async ({ page }) => {
    console.log('=== Debugging After Customer Selection ===');
    
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Start New Quote
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    
    // Click on customer
    await page.waitForSelector('text=John Smith Construction');
    await page.locator('text=John Smith Construction').first().click();
    
    // Wait and take screenshot
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-after-customer-selection.png' });
    console.log('Screenshot after customer selection saved');
    
    // Get page content
    const pageContent = await page.textContent('body');
    console.log('Page content after customer selection:', pageContent);
    
    // Look for any buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons after customer selection:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    // Look for input fields
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields:`);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}"`);
    }
    
    // Look for textareas
    const textareas = await page.locator('textarea').all();
    console.log(`Found ${textareas.length} textarea fields:`);
    for (let i = 0; i < textareas.length; i++) {
      const placeholder = await textareas[i].getAttribute('placeholder');
      console.log(`Textarea ${i}: placeholder="${placeholder}"`);
    }
    
    // Look for selects
    const selects = await page.locator('select').all();
    console.log(`Found ${selects.length} select fields:`);
    for (let i = 0; i < selects.length; i++) {
      const options = await selects[i].locator('option').all();
      console.log(`Select ${i} has ${options.length} options`);
    }
    
    console.log('=== Debug Complete ===');
  });
});

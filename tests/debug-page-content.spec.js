const { test, expect } = require('@playwright/test');

test.describe('Debug Page Content', () => {
  test('debug page content after button click', async ({ page }) => {
    console.log('🚀 Starting debug page content test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Capture ALL console messages
    page.on('console', msg => {
      console.log(`🔧 Console [${msg.type()}]:`, msg.text());
    });
    
    // Step 3: Capture page errors
    page.on('pageerror', error => {
      console.log('❌ Page error:', error.message);
    });
    
    // Step 4: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 5: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 6: Fill room form
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption({ index: 1 }); // Select "Bathroom"
    console.log('✅ Room type selected');
    
    const modelSelect = page.locator('select').nth(1);
    await modelSelect.selectOption({ index: 1 }); // Select first model
    const selectedModelValue = await modelSelect.inputValue();
    console.log('✅ Model selected:', selectedModelValue);
    
    // Fill dimensions
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    console.log('✅ Dimensions filled');
    
    // Step 7: Check the button state before clicking
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    const isDisabled = await createButton.isDisabled();
    console.log('🔍 Create button disabled:', isDisabled);
    
    // Step 8: Take screenshot before clicking
    await page.screenshot({ path: 'debug-before-click.png' });
    
    // Step 9: Click the button and wait for any changes
    console.log('🖱️ Clicking "Create Room & Start Quote" button...');
    await createButton.click();
    
    // Step 10: Wait for navigation and check for console logs
    await page.waitForLoadState('networkidle');
    console.log('✅ Button clicked, waiting for logs...');
    
    // Step 11: Wait a moment for any additional logs
    await page.waitForTimeout(3000);
    
    // Step 12: Take screenshot after clicking
    await page.screenshot({ path: 'debug-after-click.png' });
    
    // Step 13: Get all text content
    const pageText = await page.textContent('body');
    console.log('🔍 Full page text (first 1000 chars):', pageText.substring(0, 1000));
    
    // Step 14: Check for specific elements
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('🔍 All headings:', headings);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('🔍 All buttons:', buttons);
    
    // Step 15: Check if the app is still loading
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').count();
    console.log('🔍 Loading elements found:', loadingElements);
    
    console.log('🏁 Test completed');
  });
});

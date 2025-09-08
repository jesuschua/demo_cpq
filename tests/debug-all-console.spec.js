const { test, expect } = require('@playwright/test');

test.describe('Debug All Console', () => {
  test('debug all console messages and errors', async ({ page }) => {
    console.log('🚀 Starting debug all console test...');
    
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
    
    // Step 8: Click the button and wait for any changes
    console.log('🖱️ Clicking "Create Room & Start Quote" button...');
    await createButton.click();
    
    // Step 9: Wait for navigation and check for console logs
    await page.waitForLoadState('networkidle');
    console.log('✅ Button clicked, waiting for logs...');
    
    // Step 10: Wait a moment for any additional logs
    await page.waitForTimeout(3000);
    
    // Step 11: Check what's on the page
    const pageText = await page.textContent('body');
    console.log('🔍 Page contains "Build Your Quote":', pageText.includes('Build Your Quote'));
    console.log('🔍 Page contains "Room Setup":', pageText.includes('Room Setup'));
    console.log('🔍 Page contains "Select Customer":', pageText.includes('Select Customer'));
    console.log('🔍 Page contains "Configure Products":', pageText.includes('Configure Products'));
    
    console.log('🏁 Test completed');
  });
});

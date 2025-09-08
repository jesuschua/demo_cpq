const { test, expect } = require('@playwright/test');

test.describe('Debug Button Click', () => {
  test('debug button click and function calls', async ({ page }) => {
    console.log('🚀 Starting debug button click test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Capture all console logs
    page.on('console', msg => {
      if (msg.text().includes('🔧') || msg.text().includes('❌')) {
        console.log('🔧 Console log:', msg.text());
      }
    });
    
    // Step 3: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 4: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 5: Fill room form
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
    
    // Step 6: Check the button state before clicking
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    const isDisabled = await createButton.isDisabled();
    console.log('🔍 Create button disabled:', isDisabled);
    
    // Step 7: Click the button and wait for any changes
    console.log('🖱️ Clicking "Create Room & Start Quote" button...');
    await createButton.click();
    
    // Step 8: Wait for navigation and check for console logs
    await page.waitForLoadState('networkidle');
    console.log('✅ Button clicked, waiting for logs...');
    
    // Step 9: Wait a moment for any additional logs
    await page.waitForTimeout(2000);
    
    // Step 10: Check what view we're in
    const currentView = await page.evaluate(() => {
      // Look for view indicators
      const allText = document.body.textContent || '';
      
      if (allText.includes('Build Your Quote')) return 'product_selection';
      if (allText.includes('Room Setup')) return 'room_management';
      if (allText.includes('Select Customer')) return 'customer_selection';
      return 'unknown';
    });
    
    console.log('🔍 Current view:', currentView);
    
    // Step 11: Take screenshot
    await page.screenshot({ path: 'debug-button-click.png' });
    
    console.log('🏁 Test completed');
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Debug Console Logs', () => {
  test('debug console logs to see selectedModel issue', async ({ page }) => {
    console.log('🚀 Starting debug console logs test...');
    
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
    
    // Step 6: Create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 7: Navigate to products
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to products');
    
    // Step 8: Wait a moment for any additional logs
    await page.waitForTimeout(2000);
    
    console.log('🏁 Test completed');
  });
});

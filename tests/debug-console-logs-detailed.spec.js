const { test, expect } = require('@playwright/test');

test.describe('Debug Console Logs Detailed', () => {
  test('debug console logs in detail', async ({ page }) => {
    console.log('🚀 Starting debug console logs detailed test...');
    
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
    
    // Step 7: Click "Create Room & Start Quote"
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    await createButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 8: Click "Proceed to Products"
    const proceedButton = page.locator('button:has-text("Proceed to Products")');
    await proceedButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Proceeded to products');
    
    // Step 9: Wait for any additional logs
    await page.waitForTimeout(2000);
    
    // Step 10: Check if we can find the ProductCatalog component in the DOM
    const productCatalogFound = await page.evaluate(() => {
      // Look for any div that contains "Kitchen Models" text
      const allDivs = document.querySelectorAll('div');
      for (const div of allDivs) {
        if (div.textContent && div.textContent.includes('Kitchen Models')) {
          return true;
        }
      }
      return false;
    });
    
    console.log('🔍 ProductCatalog component found in DOM:', productCatalogFound);
    
    // Step 11: Check if there are any React components
    const reactComponents = await page.evaluate(() => {
      // Try to find React fiber nodes
      const root = document.querySelector('#root');
      if (root && root._reactInternalFiber) {
        return true;
      }
      return false;
    });
    
    console.log('🔍 React components found:', reactComponents);
    
    // Step 12: Check the current state of the app
    const appState = await page.evaluate(() => {
      // Try to access the app state through the window object
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        return 'React DevTools available';
      }
      return 'React DevTools not available';
    });
    
    console.log('🔍 App state:', appState);
    
    console.log('🏁 Test completed');
  });
});

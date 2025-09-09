const { test, expect } = require('@playwright/test');

test.describe('Debug Product State', () => {
  test('check if products are being added to workflow state', async ({ page }) => {
    console.log('=== Debugging Product State ===');
    
    // Navigate to product phase
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForTimeout(1000);
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForTimeout(1000);
    await page.locator('select').filter({ hasText: 'Select a style' }).selectOption({ index: 1 });
    await page.fill('textarea', 'Test room');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: 'Proceed to Products →' }).click();
    await page.waitForTimeout(2000);
    
    // Check initial state
    console.log('=== Initial State ===');
    const initialContent = await page.textContent('body');
    console.log('Initial - Contains "Products: 0":', initialContent.includes('Products: 0'));
    console.log('Initial - Contains "Products: 1":', initialContent.includes('Products: 1'));
    
    // Add first product
    console.log('=== Adding First Product ===');
    await page.locator('h4').filter({ hasText: '12" Base Cabinet' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-state-1-first-product.png' });
    
    const afterFirstContent = await page.textContent('body');
    console.log('After first - Contains "Products: 1":', afterFirstContent.includes('Products: 1'));
    console.log('After first - Contains "Products: 0":', afterFirstContent.includes('Products: 0'));
    
    // Add second product
    console.log('=== Adding Second Product ===');
    await page.locator('h4').filter({ hasText: '15" Base Cabinet' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-state-2-second-product.png' });
    
    const afterSecondContent = await page.textContent('body');
    console.log('After second - Contains "Products: 2":', afterSecondContent.includes('Products: 2'));
    console.log('After second - Contains "Products: 1":', afterSecondContent.includes('Products: 1'));
    console.log('After second - Contains "Products: 0":', afterSecondContent.includes('Products: 0'));
    
    // Check if products are visible in the right panel
    const rightPanelContent = await page.textContent('body');
    console.log('Right panel - Contains "12":', rightPanelContent.includes('12'));
    console.log('Right panel - Contains "15":', rightPanelContent.includes('15'));
    console.log('Right panel - Contains "Base Cabinet":', rightPanelContent.includes('Base Cabinet'));
    
    // Try to proceed to processing phase
    console.log('=== Proceeding to Processing Phase ===');
    await page.locator('button').filter({ hasText: 'Proceed to Quote →' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-state-3-processing-phase.png' });
    
    const processingContent = await page.textContent('body');
    console.log('Processing - Contains "No products in quote":', processingContent.includes('No products in quote'));
    console.log('Processing - Contains "Items: 0":', processingContent.includes('Items: 0'));
    console.log('Processing - Contains "Items: 2":', processingContent.includes('Items: 2'));
    console.log('Processing - Contains "12":', processingContent.includes('12'));
    console.log('Processing - Contains "15":', processingContent.includes('15'));
    
    // Check if there are any error messages
    const errorElements = await page.locator('text=error, text=Error, text=ERROR').all();
    console.log(`Found ${errorElements.length} error elements`);
    
    // Check console for any errors
    const consoleErrors = await page.evaluate(() => {
      if (window.console && window.console.error) {
        return 'Console.error available';
      }
      return 'Console.error not available';
    });
    console.log('Console error status:', consoleErrors);
    
    console.log('=== Debug Complete ===');
  });
});

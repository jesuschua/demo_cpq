const { test, expect } = require('@playwright/test');
const { setupBasicQuote } = require('./helpers/test-helpers.js');

test('Test helper function fix', async ({ page }) => {
  console.log('=== Testing fixed helper function ===');
  
  try {
    await setupBasicQuote(page);
    console.log('✅ Helper function succeeded!');
    
    // Verify we're in the product phase by checking for product catalog
    const productCatalogVisible = await page.locator('text=Product Catalog').isVisible();
    const proceedToProductsVisible = await page.locator('text=Proceed to Products').isVisible();
    
    console.log(`Product Catalog visible: ${productCatalogVisible}`);
    console.log(`Proceed to Products visible: ${proceedToProductsVisible}`);
    
    // Take a screenshot to see where we are
    await page.screenshot({ path: 'helper-function-result.png' });
    
  } catch (error) {
    console.log('❌ Helper function failed:', error.message);
    
    // Take a debug screenshot
    await page.screenshot({ path: 'helper-function-error.png' });
    throw error;
  }
});

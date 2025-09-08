const { test, expect } = require('@playwright/test');

test.describe('Debug HTML Structure', () => {
  test('debug HTML structure and find where products are rendered', async ({ page }) => {
    console.log('🚀 Starting debug HTML structure test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 3: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 4: Fill room form
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption({ index: 1 }); // Select "Bathroom"
    console.log('✅ Room type selected');
    
    const modelSelect = page.locator('select').nth(1);
    await modelSelect.selectOption({ index: 1 }); // Select first model
    console.log('✅ Model selected');
    
    // Fill dimensions
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    console.log('✅ Dimensions filled');
    
    // Step 5: Create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 6: Navigate to products
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to products');
    
    // Step 7: Get the full HTML structure
    const htmlContent = await page.content();
    console.log('🔍 HTML length:', htmlContent.length);
    
    // Step 8: Look for product-related elements
    const productElements = await page.locator('*:has-text("Base Cabinet"), *:has-text("Wall Cabinet"), *:has-text("Pantry Cabinet")').all();
    console.log(`🔍 Found ${productElements.length} elements containing cabinet text`);
    
    if (productElements.length > 0) {
      // Check the first few elements
      for (let i = 0; i < Math.min(productElements.length, 5); i++) {
        const element = productElements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.getAttribute('class');
        const textContent = await element.textContent();
        console.log(`🔍 Element ${i}: <${tagName}> class="${className}" text="${textContent?.substring(0, 50)}..."`);
        
        // Check if this element has buttons
        const buttons = element.locator('button');
        const buttonCount = await buttons.count();
        if (buttonCount > 0) {
          console.log(`  Has ${buttonCount} buttons:`);
          for (let j = 0; j < buttonCount; j++) {
            const buttonText = await buttons.nth(j).textContent();
            console.log(`    Button ${j}: "${buttonText}"`);
          }
        }
      }
    }
    
    // Step 9: Look for any grid or flex containers
    const gridContainers = page.locator('[class*="grid"], [class*="flex"]');
    const gridCount = await gridContainers.count();
    console.log(`🔍 Found ${gridCount} grid/flex containers`);
    
    // Step 10: Look for the specific ProductCatalog structure
    const productCatalog = page.locator('div:has-text("Available Products")');
    const catalogCount = await productCatalog.count();
    console.log(`🔍 Found ${catalogCount} "Available Products" containers`);
    
    if (catalogCount > 0) {
      const catalog = productCatalog.first();
      const catalogHTML = await catalog.innerHTML();
      console.log('🔍 Product catalog HTML (first 500 chars):', catalogHTML.substring(0, 500));
      
      // Look for buttons within this container
      const buttons = catalog.locator('button');
      const buttonCount = await buttons.count();
      console.log(`🔍 Product catalog has ${buttonCount} buttons`);
      
      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await buttons.nth(i).textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
      }
    }
    
    // Step 11: Look for any elements with "Add to Quote" text
    const addToQuoteElements = page.locator('*:has-text("Add to Quote")');
    const addToQuoteCount = await addToQuoteElements.count();
    console.log(`🔍 Found ${addToQuoteCount} elements with "Add to Quote" text`);
    
    // Step 12: Check if there are any hidden elements
    const hiddenElements = page.locator('[style*="display: none"], [style*="visibility: hidden"]');
    const hiddenCount = await hiddenElements.count();
    console.log(`🔍 Found ${hiddenCount} hidden elements`);
    
    // Step 13: Take a detailed screenshot
    await page.screenshot({ path: 'debug-html-structure.png', fullPage: true });
    
    console.log('🏁 Test completed');
  });
});

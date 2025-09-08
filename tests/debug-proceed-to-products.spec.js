const { test, expect } = require('@playwright/test');

test.describe('Debug Proceed to Products', () => {
  test('debug proceed to products button click', async ({ page }) => {
    console.log('🚀 Starting debug proceed to products test...');
    
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
    
    // Step 8: Take screenshot after room creation
    await page.screenshot({ path: 'debug-after-room-creation.png' });
    
    // Step 9: Look for "Proceed to Products" button
    const proceedButton = page.locator('button:has-text("Proceed to Products")');
    const proceedCount = await proceedButton.count();
    console.log(`🔍 Found ${proceedCount} "Proceed to Products" buttons`);
    
    if (proceedCount > 0) {
      console.log('🖱️ Clicking "Proceed to Products" button...');
      await proceedButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Proceeded to products');
      
      // Step 10: Take screenshot after proceeding to products
      await page.screenshot({ path: 'debug-after-proceed-to-products.png' });
      
      // Step 11: Check what view we're in now
      const pageText = await page.textContent('body');
      console.log('🔍 Page contains "Build Your Quote":', pageText.includes('Build Your Quote'));
      console.log('🔍 Page contains "Configure Products":', pageText.includes('Configure Products'));
      console.log('🔍 Page contains "Available Products":', pageText.includes('Available Products'));
      
      // Step 12: Look for ProductCatalog elements
      const productCatalogElements = page.locator('div:has-text("Kitchen Models")');
      const catalogCount = await productCatalogElements.count();
      console.log(`🔍 Found ${catalogCount} ProductCatalog elements`);
      
      if (catalogCount > 0) {
        console.log('✅ ProductCatalog component is rendered!');
        
        // Check for model selection buttons
        const modelButtons = page.locator('div:has-text("Kitchen Models") button');
        const modelButtonCount = await modelButtons.count();
        console.log(`🔍 Found ${modelButtonCount} model selection buttons`);
        
        // Check for selected model
        const selectedModelButton = page.locator('div:has-text("Kitchen Models") button[class*="border-blue-500"]');
        const selectedCount = await selectedModelButton.count();
        console.log(`🔍 Found ${selectedCount} selected model buttons`);
        
        if (selectedCount > 0) {
          const selectedModelName = await selectedModelButton.first().locator('h3').textContent();
          console.log('🔍 Selected model name:', selectedModelName);
        }
        
        // Check for products section
        const productsSection = page.locator('div:has-text("Available Products")');
        const productsCount = await productsSection.count();
        console.log(`🔍 Found ${productsCount} "Available Products" sections`);
        
        if (productsCount > 0) {
          // Check for product cards
          const productCards = productsSection.locator('div[class*="border border-gray-200"]');
          const cardCount = await productCards.count();
          console.log(`🔍 Found ${cardCount} product cards`);
          
          if (cardCount > 0) {
            const firstCard = productCards.first();
            const productName = await firstCard.locator('h3').textContent();
            const addButton = firstCard.locator('button');
            const buttonCount = await addButton.count();
            console.log(`🔍 First product: "${productName}", has ${buttonCount} buttons`);
            
            if (buttonCount > 0) {
              const buttonText = await addButton.first().textContent();
              console.log('🔍 Button text:', buttonText);
            }
          }
        }
      } else {
        console.log('❌ ProductCatalog component not found');
      }
    } else {
      console.log('❌ "Proceed to Products" button not found');
    }
    
    console.log('🏁 Test completed');
  });
});

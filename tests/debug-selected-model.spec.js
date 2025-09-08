const { test, expect } = require('@playwright/test');

test.describe('Debug Selected Model', () => {
  test('debug selectedModel value and ProductCatalog rendering', async ({ page }) => {
    console.log('🚀 Starting debug selectedModel test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Add console logging for selectedModel
    await page.addInitScript(() => {
      // Override console.log to capture our debug messages
      const originalLog = console.log;
      console.log = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('🔍')) {
          originalLog(...args);
        }
      };
    });
    
    // Step 3: Check for console errors and logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      } else if (msg.text().includes('🔍') || msg.text().includes('selectedModel') || msg.text().includes('filteredProducts')) {
        console.log('🔧 Debug log:', msg.text());
      }
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
    
    // Step 7: Create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 8: Navigate to products
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to products');
    
    // Step 9: Check if selectedModel is being passed correctly
    await page.evaluate(() => {
      // Try to find the ProductCatalog component and check its props
      const allDivs = document.querySelectorAll('div');
      let productCatalogContainer = null;
      
      // Find the container with "Kitchen Models" text
      for (const div of allDivs) {
        if (div.textContent && div.textContent.includes('Kitchen Models')) {
          productCatalogContainer = div;
          break;
        }
      }
      
      if (productCatalogContainer) {
        console.log('🔍 Found ProductCatalog container');
        
        // Check if the model selection section is visible
        const modelButtons = productCatalogContainer.querySelectorAll('button');
        console.log('🔍 Found', modelButtons.length, 'model buttons');
        
        // Check if any model is selected
        const selectedModelButton = productCatalogContainer.querySelector('button[class*="border-blue-500"]');
        if (selectedModelButton) {
          const modelName = selectedModelButton.querySelector('h3')?.textContent;
          console.log('🔍 Selected model button found:', modelName);
        } else {
          console.log('🔍 No selected model button found');
        }
        
        // Check if the products section is visible
        const allText = productCatalogContainer.textContent;
        if (allText && allText.includes('Available Products')) {
          console.log('🔍 Products section found in text');
          
          // Check if there are any product cards
          const productCards = productCatalogContainer.querySelectorAll('div[class*="border border-gray-200"]');
          console.log('🔍 Found', productCards.length, 'product cards');
          
          if (productCards.length > 0) {
            const firstCard = productCards[0];
            const productName = firstCard.querySelector('h3')?.textContent;
            const addButton = firstCard.querySelector('button');
            console.log('🔍 First product card:', productName, 'has button:', !!addButton);
            if (addButton) {
              console.log('🔍 Button text:', addButton.textContent);
            }
          }
        } else {
          console.log('🔍 Products section not found in text');
        }
      } else {
        console.log('🔍 ProductCatalog container not found');
      }
    });
    
    // Step 10: Take screenshot
    await page.screenshot({ path: 'debug-selected-model.png' });
    
    // Step 11: Check if the model selection buttons are visible
    const modelButtons = page.locator('div:has-text("Kitchen Models") button');
    const modelButtonCount = await modelButtons.count();
    console.log(`🔍 Found ${modelButtonCount} model selection buttons`);
    
    if (modelButtonCount > 0) {
      // Check if any model is selected
      const selectedModelButton = page.locator('div:has-text("Kitchen Models") button[class*="border-blue-500"]');
      const selectedCount = await selectedModelButton.count();
      console.log(`🔍 Found ${selectedCount} selected model buttons`);
      
      if (selectedCount > 0) {
        const selectedModelName = await selectedModelButton.first().locator('h3').textContent();
        console.log('🔍 Selected model name:', selectedModelName);
      }
    }
    
    // Step 12: Check if the products section is visible
    const productsSection = page.locator('div:has-text("Available Products")');
    const productsSectionCount = await productsSection.count();
    console.log(`🔍 Found ${productsSectionCount} "Available Products" sections`);
    
    if (productsSectionCount > 0) {
      // Check if there are product cards within this section
      const productCards = productsSection.locator('div[class*="border border-gray-200"]');
      const cardCount = await productCards.count();
      console.log(`🔍 Found ${cardCount} product cards in products section`);
      
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
    
    console.log('🏁 Test completed');
  });
});

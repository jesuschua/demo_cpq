const { test, expect } = require('@playwright/test');

test.describe('Debug Product Filtering', () => {
  test('debug product filtering and rendering', async ({ page }) => {
    console.log('🚀 Starting debug product filtering test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Add console logging for product filtering
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
      } else if (msg.text().includes('🔍') || msg.text().includes('filteredProducts') || msg.text().includes('selectedModel')) {
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
    console.log('✅ Model selected');
    
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
    
    // Step 9: Inject debugging code into the page
    await page.evaluate(() => {
      // Find the ProductCatalog component and add debugging
      const productGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
      if (productGrid) {
        console.log('🔍 Found product grid with', productGrid.children.length, 'children');
        
        // Check each product card
        Array.from(productGrid.children).forEach((card, index) => {
          const productName = card.querySelector('h3')?.textContent;
          const addButton = card.querySelector('button');
          console.log(`🔍 Product ${index}: "${productName}", has button: ${!!addButton}`);
          if (addButton) {
            console.log(`🔍 Button text: "${addButton.textContent}"`);
          }
        });
      } else {
        console.log('🔍 Product grid not found');
      }
    });
    
    // Step 10: Take screenshot
    await page.screenshot({ path: 'debug-filtering-1-product-view.png' });
    
    // Step 11: Check if products are being rendered but buttons are missing
    const productCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div');
    const cardCount = await productCards.count();
    console.log(`🔍 Found ${cardCount} product cards`);
    
    if (cardCount > 0) {
      // Check the first few cards for buttons
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = productCards.nth(i);
        const productName = await card.locator('h3').textContent();
        const buttons = card.locator('button');
        const buttonCount = await buttons.count();
        console.log(`🔍 Card ${i} (${productName}): ${buttonCount} buttons`);
        
        if (buttonCount > 0) {
          for (let j = 0; j < buttonCount; j++) {
            const buttonText = await buttons.nth(j).textContent();
            console.log(`  Button ${j}: "${buttonText}"`);
          }
        }
      }
    }
    
    // Step 12: Check if there's a different product rendering structure
    const allProductDivs = page.locator('div:has-text("Base Cabinet"), div:has-text("Wall Cabinet"), div:has-text("Pantry Cabinet")');
    const productDivCount = await allProductDivs.count();
    console.log(`🔍 Found ${productDivCount} product divs with cabinet text`);
    
    if (productDivCount > 0) {
      const firstDiv = allProductDivs.first();
      const buttons = firstDiv.locator('button');
      const buttonCount = await buttons.count();
      console.log(`🔍 First product div has ${buttonCount} buttons`);
      
      if (buttonCount > 0) {
        for (let i = 0; i < buttonCount; i++) {
          const buttonText = await buttons.nth(i).textContent();
          console.log(`  Button ${i}: "${buttonText}"`);
        }
      }
    }
    
    // Step 13: Check the hasQuote prop by looking at the component props
    await page.evaluate(() => {
      // Try to find React component instances
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('🔍 Found React root');
        // This is a bit hacky, but let's see if we can find the component
        console.log('🔍 React root type:', reactRoot._reactInternalFiber.type);
      }
    });
    
    console.log('🏁 Test completed');
  });
});

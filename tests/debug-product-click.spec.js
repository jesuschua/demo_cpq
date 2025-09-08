const { test, expect } = require('@playwright/test');

test.describe('Debug Product Click', () => {
  test('debug product click functionality', async ({ page }) => {
    console.log('🚀 Starting debug product click test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Capture ALL console messages
    page.on('console', msg => {
      console.log(`🔧 Console [${msg.type()}]:`, msg.text());
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
    
    // Step 6: Click "Create Room & Start Quote"
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    await createButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 7: Click "Proceed to Products"
    const proceedButton = page.locator('button:has-text("Proceed to Products")');
    await proceedButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Proceeded to products');
    
    // Step 8: Find the first product card
    const productCards = page.locator('div:has-text("Available Products") div[class*="border border-gray-200"]');
    const cardCount = await productCards.count();
    console.log(`🔍 Found ${cardCount} product cards`);
    
    if (cardCount > 0) {
      const firstCard = productCards.first();
      const productName = await firstCard.locator('h4').textContent();
      console.log(`🔍 First product: "${productName}"`);
      
      // Step 9: Check product count before clicking
      const productCountBefore = await page.locator('text=/products/').count();
      console.log(`🔍 Product references before click: ${productCountBefore}`);
      
      // Step 10: Click on the first product
      console.log('🖱️ Clicking on first product...');
      await firstCard.click();
      await page.waitForTimeout(1000);
      
      // Step 11: Check product count after clicking
      const productCountAfter = await page.locator('text=/products/').count();
      console.log(`🔍 Product references after click: ${productCountAfter}`);
      
      // Step 12: Check if the product was added to the room
      const roomProducts = page.locator('text=Bathroom Products');
      const roomProductsCount = await roomProducts.count();
      console.log(`🔍 Found ${roomProductsCount} "Bathroom Products" sections`);
      
      if (roomProductsCount > 0) {
        const roomProductsSection = roomProducts.first();
        const productList = roomProductsSection.locator('div[class*="border border-gray-200"]');
        const productListCount = await productList.count();
        console.log(`🔍 Found ${productListCount} products in room section`);
        
        if (productListCount > 0) {
          const firstRoomProduct = productList.first();
          const roomProductName = await firstRoomProduct.locator('h4, h3').textContent();
          console.log(`🔍 First room product: "${roomProductName}"`);
        }
      }
      
      // Step 13: Check if we can proceed to quote builder
      const configureItemsButton = page.locator('button:has-text("Configure Items")');
      const configureCount = await configureItemsButton.count();
      console.log(`🔍 Found ${configureCount} "Configure Items" buttons`);
      
      if (configureCount > 0) {
        console.log('✅ Configure Items button found!');
        
        // Click on Configure Items
        await configureItemsButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Clicked Configure Items');
        
        // Check if we're in the quote builder
        const quoteBuilderText = await page.textContent('body');
        console.log('🔍 Page contains "Quote Builder":', quoteBuilderText.includes('Quote Builder'));
        console.log('🔍 Page contains "Available Processings":', quoteBuilderText.includes('Available Processings'));
        
        if (quoteBuilderText.includes('Available Processings')) {
          console.log('✅ Quote Builder loaded!');
          
          // Look for "Cut to Size" processing
          const cutToSizeButton = page.locator('text=Cut to Size');
          const cutToSizeCount = await cutToSizeButton.count();
          console.log(`🔍 Found ${cutToSizeCount} "Cut to Size" buttons`);
          
          if (cutToSizeCount > 0) {
            console.log('✅ Cut to Size processing found!');
            
            // Check if it has "Requires Options" badge
            const requiresOptionsBadge = page.locator('text=Requires Options');
            const badgeCount = await requiresOptionsBadge.count();
            console.log(`🔍 Found ${badgeCount} "Requires Options" badges`);
            
            // Click on "Cut to Size" and watch for debug logs
            console.log('🖱️ Clicking on "Cut to Size" processing...');
            await cutToSizeButton.first().click();
            await page.waitForTimeout(2000);
            
            // Check if option selector modal opened
            const modal = page.locator('[data-testid="option-selector-modal"]');
            const modalCount = await modal.count();
            console.log(`🔍 Found ${modalCount} option selector modals`);
            
            if (modalCount > 0) {
              console.log('✅ Option selector modal opened!');
              
              // Check for the cut amount input
              const cutAmountInput = page.locator('input[type="number"]');
              const inputCount = await cutAmountInput.count();
              console.log(`🔍 Found ${inputCount} number inputs in modal`);
              
              if (inputCount > 0) {
                console.log('✅ Option input found!');
                
                // Fill in the cut amount
                await cutAmountInput.first().fill('3.5');
                console.log('✅ Cut amount filled');
                
                // Click apply
                const applyButton = page.locator('[data-testid="apply-options-button"]');
                const applyCount = await applyButton.count();
                if (applyCount > 0) {
                  await applyButton.click();
                  console.log('✅ Apply button clicked');
                } else {
                  // Try alternative selector
                  await page.click('button:has-text("Apply")');
                  console.log('✅ Apply button clicked (alternative)');
                }
                
                // Wait for modal to close
                await page.waitForTimeout(1000);
                
                // Verify the processing was added with options
                const appliedProcessing = page.locator('[data-testid="applied-processing"]:has-text("Cut to Size")');
                const appliedCount = await appliedProcessing.count();
                console.log(`🔍 Found ${appliedCount} applied "Cut to Size" processings`);
                
                if (appliedCount > 0) {
                  console.log('✅ Processing successfully added with options!');
                } else {
                  console.log('❌ Processing was not added');
                }
              } else {
                console.log('❌ No option input found in modal');
              }
            } else {
              console.log('❌ Option selector modal did not open');
            }
          } else {
            console.log('❌ "Cut to Size" processing not found');
          }
        } else {
          console.log('❌ Quote Builder did not load properly');
        }
      } else {
        console.log('❌ Configure Items button not found');
      }
    } else {
      console.log('❌ No product cards found');
    }
    
    // Step 14: Take screenshot
    await page.screenshot({ path: 'debug-product-click.png' });
    
    console.log('🏁 Test completed');
  });
});

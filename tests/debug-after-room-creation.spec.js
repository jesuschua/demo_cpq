const { test, expect } = require('@playwright/test');

test.describe('Debug After Room Creation', () => {
  test('debug what buttons are available after room creation', async ({ page }) => {
    console.log('🚀 Starting debug after room creation test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Capture ALL console messages
    page.on('console', msg => {
      console.log(`🔧 Console [${msg.type()}]:`, msg.text());
    });
    
    // Step 3: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForLoadState('networkidle');
    console.log('✅ Customer selected');
    
    // Step 4: Fill room form
    const roomNameInput = page.locator('input[placeholder*="Kitchen, Master Bath"]');
    await roomNameInput.fill('Test Bathroom');
    console.log('✅ Room name filled');
    
    const modelSelect = page.locator('select');
    await modelSelect.selectOption({ index: 1 }); // Select first model
    const selectedModelValue = await modelSelect.inputValue();
    console.log('✅ Model selected:', selectedModelValue);
    
    // Fill dimensions
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    console.log('✅ Dimensions filled');
    
    // Step 5: Click "DEBUG BUTTON" (our Create Room & Start Quote button)
    const createButton = page.locator('button:has-text("DEBUG BUTTON")');
    await createButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 6: Check what's on the page now
    const allButtons = await page.locator('button').all();
    console.log(`🔍 Found ${allButtons.length} buttons on the page:`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`  Button ${i + 1}: "${text}" (visible: ${isVisible})`);
    }
    
    // Check for any text that might indicate the current view
    const pageText = await page.textContent('body');
    console.log('🔍 Page contains "Proceed to Products":', pageText.includes('Proceed to Products'));
    console.log('🔍 Page contains "Configure Items":', pageText.includes('Configure Items'));
    console.log('🔍 Page contains "Available Products":', pageText.includes('Available Products'));
    console.log('🔍 Page contains "Kitchen Models":', pageText.includes('Kitchen Models'));
    
    // Check if we're already in the product selection view
    const productCatalog = page.locator('div:has-text("Kitchen Models")');
    const catalogCount = await productCatalog.count();
    console.log(`🔍 Found ${catalogCount} ProductCatalog components`);
    
    if (catalogCount > 0) {
      console.log('✅ We are already in the product selection view!');
      
      // Check for products
      const productCards = page.locator('div[class*="border border-gray-200"]');
      const cardCount = await productCards.count();
      console.log(`🔍 Found ${cardCount} product cards`);
      
      if (cardCount > 0) {
        const firstCard = productCards.first();
        const productName = await firstCard.locator('h3').textContent();
        console.log(`🔍 First product: "${productName}"`);
        
        // Click on the first product
        console.log('🖱️ Clicking on first product...');
        await firstCard.click();
        await page.waitForTimeout(2000);
        console.log('✅ Product clicked');
        
        // Check what buttons are available now
        const buttonsAfterProduct = await page.locator('button').all();
        console.log(`🔍 Found ${buttonsAfterProduct.length} buttons after product click:`);
        
        for (let i = 0; i < buttonsAfterProduct.length; i++) {
          const button = buttonsAfterProduct[i];
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          console.log(`  Button ${i + 1}: "${text}" (visible: ${isVisible})`);
        }
        
        // Look for "Configure Items" button
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
    } else {
      console.log('❌ ProductCatalog component not found - we are not in product selection view');
    }
    
    // Step 7: Take screenshot
    await page.screenshot({ path: 'debug-after-room-creation.png' });
    
    console.log('🏁 Test completed');
  });
});

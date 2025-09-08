const { test, expect } = require('@playwright/test');

test.describe('Debug Product Catalog', () => {
  test('debug product catalog and add products to quote', async ({ page }) => {
    console.log('🚀 Starting debug product catalog test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Check for console errors and logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      } else if (msg.text().includes('🔧') || msg.text().includes('addProcessingToItem')) {
        console.log('🔧 Debug log:', msg.text());
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
    console.log('✅ Model selected');
    
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
    
    // Step 8: Take screenshot of product view
    await page.screenshot({ path: 'debug-catalog-1-product-view.png' });
    
    // Step 9: Look for "Add to Quote" buttons
    const addToQuoteButtons = page.locator('button:has-text("Add to Quote")');
    const addToQuoteCount = await addToQuoteButtons.count();
    console.log(`🔍 Found ${addToQuoteCount} "Add to Quote" buttons`);
    
    if (addToQuoteCount > 0) {
      console.log('✅ Found Add to Quote buttons!');
      
      // Click the first one
      await addToQuoteButtons.first().click();
      console.log('✅ Clicked first Add to Quote button');
      
      // Wait for any changes
      await page.waitForTimeout(1000);
      
      // Take screenshot after adding product
      await page.screenshot({ path: 'debug-catalog-2-after-add.png' });
      
      // Step 10: Look for "Configure Items" button
      const configureItemsButton = page.locator('button:has-text("Configure Items")');
      const configureCount = await configureItemsButton.count();
      console.log(`🔍 Found ${configureCount} "Configure Items" buttons`);
      
      if (configureCount > 0) {
        console.log('✅ Found Configure Items button!');
        await configureItemsButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Clicked Configure Items');
        
        // Step 11: Take screenshot of quote builder
        await page.screenshot({ path: 'debug-catalog-3-quote-builder.png' });
        
        // Step 12: Look for processings with options
        const availableProcessings = page.locator('text=Available Processings');
        const availableCount = await availableProcessings.count();
        console.log(`🔍 Found ${availableCount} "Available Processings" elements`);
        
        if (availableCount > 0) {
          console.log('✅ Available processings section found!');
          
          // Check for "Cut to Size" processing
          const cutToSizeButton = page.locator('text=Cut to Size');
          const cutToSizeCount = await cutToSizeButton.count();
          console.log(`🔍 Found ${cutToSizeCount} "Cut to Size" buttons`);
          
          if (cutToSizeCount > 0) {
            // Check if it has "Requires Options" badge
            const requiresOptionsBadge = page.locator('text=Requires Options');
            const badgeCount = await requiresOptionsBadge.count();
            console.log(`🔍 Found ${badgeCount} "Requires Options" badges`);
            
            // Take screenshot of the specific processing
            await cutToSizeButton.first().screenshot({ path: 'debug-catalog-4-cut-to-size-button.png' });
            
            // Step 13: Click on "Cut to Size" and watch for debug logs
            console.log('🖱️ Clicking on "Cut to Size" processing...');
            await cutToSizeButton.first().click();
            
            // Wait a moment for any modal to appear
            await page.waitForTimeout(2000);
            
            // Take screenshot after clicking
            await page.screenshot({ path: 'debug-catalog-5-after-click.png' });
            
            // Step 14: Check if option selector modal opened
            const modal = page.locator('[data-testid="option-selector-modal"]');
            const modalCount = await modal.count();
            console.log(`🔍 Found ${modalCount} option selector modals`);
            
            if (modalCount > 0) {
              console.log('✅ Option selector modal opened!');
              
              // Take screenshot of the modal
              await modal.screenshot({ path: 'debug-catalog-6-option-modal.png' });
              
              // Check for the cut amount input
              const cutAmountInput = page.locator('input[type="number"]');
              const inputCount = await cutAmountInput.count();
              console.log(`🔍 Found ${inputCount} number inputs in modal`);
              
              if (inputCount > 0) {
                console.log('✅ Option input found!');
                
                // Fill in the cut amount
                await cutAmountInput.first().fill('3.5');
                console.log('✅ Cut amount filled');
                
                // Take screenshot with filled input
                await page.screenshot({ path: 'debug-catalog-7-input-filled.png' });
                
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
                
                // Take final screenshot
                await page.screenshot({ path: 'debug-catalog-8-final-state.png' });
                
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
              
              // Check if the processing was added without options
              const appliedProcessing = page.locator('[data-testid="applied-processing"]:has-text("Cut to Size")');
              const appliedCount = await appliedProcessing.count();
              console.log(`🔍 Found ${appliedCount} applied "Cut to Size" processings (should be 0 if modal should have opened)`);
            }
          } else {
            console.log('❌ "Cut to Size" processing not found in available processings');
            
            // List all available processings
            const allProcessings = page.locator('[data-testid="processing-item"]');
            const processingCount = await allProcessings.count();
            console.log(`🔍 Found ${processingCount} total processings`);
            
            for (let i = 0; i < processingCount; i++) {
              const processingText = await allProcessings.nth(i).textContent();
              console.log(`  - ${processingText}`);
            }
          }
        } else {
          console.log('❌ "Available Processings" section not found');
        }
      } else {
        console.log('❌ Could not find "Configure Items" button');
      }
    } else {
      console.log('❌ Could not find "Add to Quote" buttons');
      
      // Let's see what buttons are available
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`🔍 Found ${buttonCount} buttons in product view`);
      
      for (let i = 0; i < Math.min(buttonCount, 15); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
      }
    }
    
    console.log('🏁 Test completed');
  });
});

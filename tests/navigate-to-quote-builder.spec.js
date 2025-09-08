const { test, expect } = require('@playwright/test');

test.describe('Navigate to Quote Builder', () => {
  test('navigate to quote builder and test processing options', async ({ page }) => {
    console.log('🚀 Starting navigate to quote builder test...');
    
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
    
    // Step 8: Add a product
    const productElements = page.locator('text=12" Base Cabinet');
    const productCount = await productElements.count();
    console.log(`🔍 Found ${productCount} product elements`);
    
    if (productCount > 0) {
      await productElements.first().click();
      console.log('✅ Clicked on product');
      
      // Wait for any modal or form to appear
      await page.waitForTimeout(1000);
      
      // Look for add button with different selectors
      const addButtonSelectors = [
        'button:has-text("Add to Quote")',
        'button:has-text("Add")',
        'button:has-text("Add to Cart")',
        'button:has-text("Add Product")',
        'button[data-testid="add-product-button"]'
      ];
      
      let addButtonFound = false;
      for (const selector of addButtonSelectors) {
        const addButton = page.locator(selector);
        const addCount = await addButton.count();
        if (addCount > 0) {
          await addButton.click();
          console.log(`✅ Product added using selector: ${selector}`);
          addButtonFound = true;
          break;
        }
      }
      
      if (!addButtonFound) {
        console.log('❌ Could not find add button for product');
      }
    } else {
      console.log('❌ Could not find "12" Base Cabinet" product');
    }
    
    // Step 9: Navigate to quote builder
    const proceedToQuoteButton = page.locator('button:has-text("Proceed to Quote")');
    const proceedCount = await proceedToQuoteButton.count();
    if (proceedCount > 0) {
      await proceedToQuoteButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Clicked Proceed to Quote');
    } else {
      console.log('❌ Could not find "Proceed to Quote" button');
    }
    
    // Step 10: Take screenshot of current state
    await page.screenshot({ path: 'navigate-1-current-state.png' });
    
    // Step 11: Check what view we're in
    const possibleViews = [
      'text=Build Your Quote',
      'text=Configure Items',
      'text=Available Processings',
      'text=Quote Builder',
      'text=Configure Quote',
      'text=Product Catalog',
      'text=Room Setup',
      'text=Select Customer'
    ];
    
    let currentView = 'unknown';
    for (const element of possibleViews) {
      const count = await page.locator(element).count();
      if (count > 0) {
        currentView = element;
        console.log(`✅ Found ${element}, current view: ${currentView}`);
        break;
      }
    }
    
    // Step 12: Try to navigate to quote builder if we're not there
    if (currentView !== 'text=Available Processings' && currentView !== 'text=Configure Items') {
      console.log('🔍 Not in quote builder, trying to navigate...');
      
      // Look for navigation buttons
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`🔍 Found ${buttonCount} buttons in current view`);
      
      for (let i = 0; i < Math.min(buttonCount, 15); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
      }
      
      // Try different navigation approaches
      const navButtons = [
        'button:has-text("Configure")',
        'button:has-text("Quote")',
        'button:has-text("Build")',
        'button:has-text("Items")',
        'button:has-text("Processings")',
        'button:has-text("Edit")',
        'button:has-text("Manage")',
        'button:has-text("Back to Products")',
        'button:has-text("Configure Items")'
      ];
      
      for (const buttonText of navButtons) {
        const button = page.locator(buttonText);
        const count = await button.count();
        if (count > 0) {
          console.log(`🔍 Found ${buttonText}, clicking...`);
          await button.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    }
    
    // Step 13: Take final screenshot
    await page.screenshot({ path: 'navigate-2-final-state.png' });
    
    // Step 14: Look for processings with options
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
        await cutToSizeButton.first().screenshot({ path: 'navigate-3-cut-to-size-button.png' });
        
        // Step 15: Click on "Cut to Size" and watch for debug logs
        console.log('🖱️ Clicking on "Cut to Size" processing...');
        await cutToSizeButton.first().click();
        
        // Wait a moment for any modal to appear
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking
        await page.screenshot({ path: 'navigate-4-after-click.png' });
        
        // Step 16: Check if option selector modal opened
        const modal = page.locator('[data-testid="option-selector-modal"]');
        const modalCount = await modal.count();
        console.log(`🔍 Found ${modalCount} option selector modals`);
        
        if (modalCount > 0) {
          console.log('✅ Option selector modal opened!');
          
          // Take screenshot of the modal
          await modal.screenshot({ path: 'navigate-5-option-modal.png' });
          
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
            await page.screenshot({ path: 'navigate-6-input-filled.png' });
            
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
            await page.screenshot({ path: 'navigate-7-final-state.png' });
            
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
      
      // Let's see what's actually on the page
      const allText = page.locator('*');
      const textCount = await allText.count();
      console.log(`🔍 Found ${textCount} elements on page`);
      
      // Look for any text that might indicate we're in the right place
      const possibleTexts = [
        'text=Processing',
        'text=Options',
        'text=Cut',
        'text=Size',
        'text=Quote',
        'text=Builder',
        'text=Available',
        'text=Processings'
      ];
      
      for (const text of possibleTexts) {
        const count = await page.locator(text).count();
        if (count > 0) {
          console.log(`✅ Found ${text}: ${count} elements`);
        }
      }
    }
    
    console.log('🏁 Test completed');
  });
});

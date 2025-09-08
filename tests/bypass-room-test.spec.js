const { test, expect } = require('@playwright/test');

test.describe('Bypass Room Test', () => {
  test('test processing options by bypassing room creation', async ({ page }) => {
    console.log('🚀 Starting bypass room test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Check if there are any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
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
    
    // Step 5: Take screenshot to see what's actually rendered
    await page.screenshot({ path: 'bypass-1-room-form.png' });
    
    // Step 6: Try to find the room type dropdown
    const roomTypeSelect = page.locator('select').first();
    const roomTypeCount = await roomTypeSelect.count();
    console.log(`🔍 Found ${roomTypeCount} select elements`);
    
    if (roomTypeCount > 0) {
      // Get the options in the first select
      const options = roomTypeSelect.locator('option');
      const optionCount = await options.count();
      console.log(`🔍 Found ${optionCount} options in first select`);
      
      for (let i = 0; i < optionCount; i++) {
        const optionText = await options.nth(i).textContent();
        console.log(`  Option ${i}: "${optionText}"`);
      }
      
      // Select the first non-empty option
      await roomTypeSelect.selectOption({ index: 1 });
      console.log('✅ Room type selected');
    }
    
    // Step 7: Select model
    const modelSelect = page.locator('select').nth(1);
    const modelCount = await modelSelect.count();
    console.log(`🔍 Found ${modelCount} select elements`);
    
    if (modelCount > 0) {
      await modelSelect.selectOption({ index: 1 });
      console.log('✅ Model selected');
    }
    
    // Step 8: Fill dimensions
    const widthInput = page.locator('input[placeholder*="Width"]');
    const heightInput = page.locator('input[placeholder*="Height"]');
    const depthInput = page.locator('input[placeholder*="Depth"]');
    
    await widthInput.fill('12');
    await heightInput.fill('8');
    await depthInput.fill('15');
    console.log('✅ Dimensions filled');
    
    // Step 9: Take screenshot before clicking create
    await page.screenshot({ path: 'bypass-2-filled-form.png' });
    
    // Step 10: Check if create button is enabled
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    const isEnabled = await createButton.isEnabled();
    console.log(`🔍 Create button enabled: ${isEnabled}`);
    
    if (isEnabled) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Room created, quote started');
    } else {
      console.log('❌ Create button is still disabled, trying to force click...');
      await createButton.click({ force: true });
      await page.waitForTimeout(2000);
    }
    
    // Step 11: Take screenshot of current state
    await page.screenshot({ path: 'bypass-3-after-room-creation.png' });
    
    // Step 12: Check what view we're in after room creation
    const possibleViews = [
      'text=Build Your Quote',
      'text=Configure Items', 
      'text=Add Products',
      'text=Available Processings',
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
    
    // Also check for any buttons that might help us navigate
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔍 Found ${buttonCount} buttons`);
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      console.log(`  Button ${i}: "${buttonText}"`);
    }
    
    // Step 13: Navigate to quote builder if needed
    if (currentView === 'text=Add Products') {
      await page.click('text=Add Products');
      await page.waitForSelector('text=Product Catalog');
      console.log('✅ Product catalog opened');
      
      // Add a product
      await page.click('text=12" Base Cabinet');
      await page.click('button:has-text("Add to Quote")');
      console.log('✅ Product added to quote');
      
      // Go to quote builder
      await page.click('text=Configure Items');
      await page.waitForLoadState('networkidle');
      console.log('✅ Quote builder opened');
    } else if (currentView === 'unknown') {
      // We're in the room configuration view, need to proceed to products
      console.log('🔍 In room configuration view, proceeding to products...');
      
      // Click "Proceed to Products →"
      const proceedButton = page.locator('button:has-text("Proceed to Products")');
      const proceedCount = await proceedButton.count();
      console.log(`🔍 Found ${proceedCount} "Proceed to Products" buttons`);
      
      if (proceedCount > 0) {
        await proceedButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Proceeded to products');
        
        // Take screenshot of product view
        await page.screenshot({ path: 'bypass-4-product-view.png' });
        
        // Check what's available in the product view
        const productButtons = page.locator('button');
        const productButtonCount = await productButtons.count();
        console.log(`🔍 Found ${productButtonCount} buttons in product view`);
        
        for (let i = 0; i < Math.min(productButtonCount, 15); i++) {
          const buttonText = await productButtons.nth(i).textContent();
          console.log(`  Product Button ${i}: "${buttonText}"`);
        }
        
        // Look for any text that might be a product name
        const productTexts = page.locator('text=12" Base Cabinet, text=Base Cabinet, text=Cabinet');
        const productTextCount = await productTexts.count();
        console.log(`🔍 Found ${productTextCount} product text elements`);
        
        // Try to find and click on a product
        const productElements = page.locator('text=12" Base Cabinet');
        const productCount = await productElements.count();
        console.log(`🔍 Found ${productCount} "12" Base Cabinet" elements`);
        
        if (productCount > 0) {
          await productElements.first().click();
          console.log('✅ Clicked on product');
          
          // Wait a moment for any modal or form to appear
          await page.waitForTimeout(1000);
          
          // Take screenshot after clicking product
          await page.screenshot({ path: 'bypass-5-after-product-click.png' });
          
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
              console.log(`✅ Product added to quote using selector: ${selector}`);
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
        
        // Try to navigate to quote builder - look for different button names
        const quoteBuilderButtons = [
          'text=Configure Items',
          'text=Configure Quote',
          'text=Quote Builder',
          'text=Build Quote',
          'text=Continue',
          'text=Next',
          'text=Proceed'
        ];
        
        let quoteBuilderFound = false;
        for (const buttonText of quoteBuilderButtons) {
          const button = page.locator(buttonText);
          const count = await button.count();
          if (count > 0) {
            await button.click();
            await page.waitForLoadState('networkidle');
            console.log(`✅ Quote builder opened using: ${buttonText}`);
            quoteBuilderFound = true;
            break;
          }
        }
        
        if (!quoteBuilderFound) {
          console.log('❌ Could not find quote builder button');
          // Take screenshot to see what's available
          await page.screenshot({ path: 'bypass-6-no-quote-builder.png' });
        }
      } else {
        console.log('❌ Could not find "Proceed to Products" button');
      }
    }
    
    // Step 14: Take screenshot of current state
    await page.screenshot({ path: 'bypass-4-current-state.png' });
    
    // Step 15: Check what view we're in after navigation
    const possibleViewsAfter = [
      'text=Build Your Quote',
      'text=Configure Items', 
      'text=Add Products',
      'text=Available Processings',
      'text=Product Catalog',
      'text=Room Setup',
      'text=Select Customer',
      'text=Quote Builder',
      'text=Configure Quote'
    ];
    
    let currentViewAfter = 'unknown';
    for (const element of possibleViewsAfter) {
      const count = await page.locator(element).count();
      if (count > 0) {
        currentViewAfter = element;
        console.log(`✅ Found ${element}, current view: ${currentViewAfter}`);
        break;
      }
    }
    
    // Also check for any buttons that might help us navigate
    const allButtonsAfter = page.locator('button');
    const buttonCountAfter = await allButtonsAfter.count();
    console.log(`🔍 Found ${buttonCountAfter} buttons in current view`);
    
    for (let i = 0; i < Math.min(buttonCountAfter, 10); i++) {
      const buttonText = await allButtonsAfter.nth(i).textContent();
      console.log(`  Button ${i}: "${buttonText}"`);
    }
    
    // Step 16: Look for processings with options
    const availableProcessings = page.locator('text=Available Processings');
    const availableCount = await availableProcessings.count();
    console.log(`🔍 Found ${availableCount} "Available Processings" elements`);
    
    if (availableCount > 0) {
      console.log('✅ Available processings section visible');
      
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
        await cutToSizeButton.first().screenshot({ path: 'bypass-5-cut-to-size-button.png' });
        
        // Step 16: Click on "Cut to Size"
        console.log('🖱️ Clicking on "Cut to Size" processing...');
        await cutToSizeButton.first().click();
        
        // Wait a moment for any modal to appear
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking
        await page.screenshot({ path: 'bypass-6-after-click.png' });
        
        // Step 17: Check if option selector modal opened
        const modal = page.locator('[data-testid="option-selector-modal"]');
        const modalCount = await modal.count();
        console.log(`🔍 Found ${modalCount} option selector modals`);
        
        if (modalCount > 0) {
          console.log('✅ Option selector modal opened!');
          
          // Take screenshot of the modal
          await modal.screenshot({ path: 'bypass-7-option-modal.png' });
          
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
            await page.screenshot({ path: 'bypass-8-input-filled.png' });
            
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
            await page.screenshot({ path: 'bypass-9-final-state.png' });
            
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
    
    console.log('🏁 Test completed');
  });
});

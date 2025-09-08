const { test, expect } = require('@playwright/test');

test.describe('Debug Processing Options', () => {
  test('comprehensive processing options test', async ({ page }) => {
    console.log('🚀 Starting comprehensive processing options test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-1-initial.png' });
    
    // Step 2: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Take screenshot of customer selection
    await page.screenshot({ path: 'debug-2-customer-selection.png' });
    
    // Step 3: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 4: Take screenshot to see the form
    await page.screenshot({ path: 'debug-3a-room-form.png' });
    
    // Step 4: Fill room details - try the correct placeholder
    const roomNameInput = page.locator('input[placeholder*="e.g., Kitchen"]');
    const roomNameCount = await roomNameInput.count();
    console.log(`🔍 Found ${roomNameCount} room name inputs with "e.g., Kitchen" placeholder`);
    
    if (roomNameCount > 0) {
      await roomNameInput.fill('Main Kitchen');
      console.log('✅ Room name filled');
    } else {
      // Try alternative selectors
      const textInputs = page.locator('input[type="text"]');
      const textInputCount = await textInputs.count();
      console.log(`🔍 Found ${textInputCount} text inputs`);
      
      if (textInputCount > 0) {
        await textInputs.first().fill('Main Kitchen');
        console.log('✅ Room name filled with first text input');
      } else {
        // Try any input with placeholder containing "Kitchen"
        const kitchenInput = page.locator('input[placeholder*="Kitchen"]');
        const kitchenCount = await kitchenInput.count();
        console.log(`🔍 Found ${kitchenCount} inputs with "Kitchen" in placeholder`);
        
        if (kitchenCount > 0) {
          await kitchenInput.first().fill('Main Kitchen');
          console.log('✅ Room name filled with Kitchen input');
        }
      }
    }
    
    // Fill dimensions
    const widthInput = page.locator('input[placeholder*="Width"]');
    const widthCount = await widthInput.count();
    if (widthCount > 0) {
      await widthInput.fill('12');
      console.log('✅ Width filled');
    }
    
    const heightInput = page.locator('input[placeholder*="Height"]');
    const heightCount = await heightInput.count();
    if (heightCount > 0) {
      await heightInput.fill('8');
      console.log('✅ Height filled');
    }
    
    const depthInput = page.locator('input[placeholder*="Depth"]');
    const depthCount = await depthInput.count();
    if (depthCount > 0) {
      await depthInput.fill('15');
      console.log('✅ Depth filled');
    }
    
    // Select model
    const selectInput = page.locator('select');
    const selectCount = await selectInput.count();
    if (selectCount > 0) {
      await selectInput.first().selectOption({ index: 1 });
      console.log('✅ Model selected');
    }
    
    console.log('✅ Room details filled');
    
    // Take screenshot before creating room
    await page.screenshot({ path: 'debug-3-room-details.png' });
    
    // Step 5: Create room and start quote
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created, quote started');
    
    // Take screenshot of quote builder
    await page.screenshot({ path: 'debug-4-quote-builder.png' });
    
    // Step 6: Add a product
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    console.log('✅ Product catalog opened');
    
    // Take screenshot of product catalog
    await page.screenshot({ path: 'debug-5-product-catalog.png' });
    
    // Step 7: Select a cabinet product
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    console.log('✅ Product added to quote');
    
    // Take screenshot after adding product
    await page.screenshot({ path: 'debug-6-product-added.png' });
    
    // Step 8: Look for processings with options
    await page.waitForSelector('text=Available Processings');
    console.log('✅ Available processings section visible');
    
    // Take screenshot of available processings
    await page.screenshot({ path: 'debug-7-available-processings.png' });
    
    // Step 9: Check for "Cut to Size" processing
    const cutToSizeButton = page.locator('text=Cut to Size');
    const cutToSizeCount = await cutToSizeButton.count();
    console.log(`🔍 Found ${cutToSizeCount} "Cut to Size" buttons`);
    
    if (cutToSizeCount > 0) {
      // Check if it has "Requires Options" badge
      const requiresOptionsBadge = page.locator('text=Requires Options');
      const badgeCount = await requiresOptionsBadge.count();
      console.log(`🔍 Found ${badgeCount} "Requires Options" badges`);
      
      // Take screenshot of the specific processing
      await cutToSizeButton.first().screenshot({ path: 'debug-8-cut-to-size-button.png' });
      
      // Step 10: Click on "Cut to Size"
      console.log('🖱️ Clicking on "Cut to Size" processing...');
      await cutToSizeButton.first().click();
      
      // Wait a moment for any modal to appear
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'debug-9-after-click.png' });
      
      // Step 11: Check if option selector modal opened
      const modal = page.locator('[data-testid="option-selector-modal"]');
      const modalCount = await modal.count();
      console.log(`🔍 Found ${modalCount} option selector modals`);
      
      if (modalCount > 0) {
        console.log('✅ Option selector modal opened!');
        
        // Take screenshot of the modal
        await modal.screenshot({ path: 'debug-10-option-modal.png' });
        
        // Check for the cut amount input
        const cutAmountInput = page.locator('[data-testid="option-input"]');
        const inputCount = await cutAmountInput.count();
        console.log(`🔍 Found ${inputCount} option inputs`);
        
        if (inputCount > 0) {
          console.log('✅ Option input found!');
          
          // Fill in the cut amount
          await cutAmountInput.first().fill('3.5');
          console.log('✅ Cut amount filled');
          
          // Take screenshot with filled input
          await page.screenshot({ path: 'debug-11-input-filled.png' });
          
          // Click apply
          await page.click('[data-testid="apply-options-button"]');
          console.log('✅ Apply button clicked');
          
          // Wait for modal to close
          await page.waitForTimeout(1000);
          
          // Take final screenshot
          await page.screenshot({ path: 'debug-12-final-state.png' });
          
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
    
    console.log('🏁 Test completed');
  });
});

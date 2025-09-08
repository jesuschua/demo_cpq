const { test, expect } = require('@playwright/test');

test.describe('Simple Processing Options Test', () => {
  test('test processing options directly', async ({ page }) => {
    console.log('🚀 Starting simple processing test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'simple-1-initial.png' });
    
    // Step 2: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Take screenshot of customer selection
    await page.screenshot({ path: 'simple-2-customer-selection.png' });
    
    // Step 3: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Take screenshot of room form
    await page.screenshot({ path: 'simple-3-room-form.png' });
    
    // Step 4: Try to find and fill the room name field
    // Let's try all possible selectors
    const allInputs = page.locator('input');
    const inputCount = await allInputs.count();
    console.log(`🔍 Found ${inputCount} total inputs`);
    
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.getAttribute('value');
      console.log(`  Input ${i}: type="${type}", placeholder="${placeholder}", value="${value}"`);
    }
    
    // Try to fill the first text input (should be room name)
    const textInputs = page.locator('input[type="text"]');
    const textInputCount = await textInputs.count();
    console.log(`🔍 Found ${textInputCount} text inputs`);
    
    if (textInputCount > 0) {
      await textInputs.first().fill('Main Kitchen');
      console.log('✅ Room name filled');
    }
    
    // Fill dimensions
    const numberInputs = page.locator('input[type="number"]');
    const numberInputCount = await numberInputs.count();
    console.log(`🔍 Found ${numberInputCount} number inputs`);
    
    if (numberInputCount >= 3) {
      await numberInputs.nth(0).fill('12'); // width
      await numberInputs.nth(1).fill('8');  // height
      await numberInputs.nth(2).fill('15'); // depth
      console.log('✅ Dimensions filled');
    }
    
    // Select model
    const selectInputs = page.locator('select');
    const selectCount = await selectInputs.count();
    console.log(`🔍 Found ${selectCount} select inputs`);
    
    if (selectCount > 0) {
      await selectInputs.first().selectOption({ index: 1 });
      console.log('✅ Model selected');
    }
    
    // Take screenshot before clicking create
    await page.screenshot({ path: 'simple-4-filled-form.png' });
    
    // Step 5: Try to create room
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    const isEnabled = await createButton.isEnabled();
    console.log(`🔍 Create button enabled: ${isEnabled}`);
    
    if (isEnabled) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Room created, quote started');
    } else {
      console.log('❌ Create button is disabled, cannot proceed');
      return;
    }
    
    // Take screenshot of quote builder
    await page.screenshot({ path: 'simple-5-quote-builder.png' });
    
    // Step 6: Add a product
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    console.log('✅ Product catalog opened');
    
    // Take screenshot of product catalog
    await page.screenshot({ path: 'simple-6-product-catalog.png' });
    
    // Step 7: Select a cabinet product
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    console.log('✅ Product added to quote');
    
    // Take screenshot after adding product
    await page.screenshot({ path: 'simple-7-product-added.png' });
    
    // Step 8: Go to quote builder to see processings
    await page.click('text=Configure Items');
    await page.waitForLoadState('networkidle');
    console.log('✅ Quote builder opened');
    
    // Take screenshot of quote builder with processings
    await page.screenshot({ path: 'simple-8-quote-builder-processings.png' });
    
    // Step 9: Look for processings with options
    await page.waitForSelector('text=Available Processings');
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
      await cutToSizeButton.first().screenshot({ path: 'simple-9-cut-to-size-button.png' });
      
      // Step 10: Click on "Cut to Size"
      console.log('🖱️ Clicking on "Cut to Size" processing...');
      await cutToSizeButton.first().click();
      
      // Wait a moment for any modal to appear
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'simple-10-after-click.png' });
      
      // Step 11: Check if option selector modal opened
      const modal = page.locator('[data-testid="option-selector-modal"]');
      const modalCount = await modal.count();
      console.log(`🔍 Found ${modalCount} option selector modals`);
      
      if (modalCount > 0) {
        console.log('✅ Option selector modal opened!');
        
        // Take screenshot of the modal
        await modal.screenshot({ path: 'simple-11-option-modal.png' });
        
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
          await page.screenshot({ path: 'simple-12-input-filled.png' });
          
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
          await page.screenshot({ path: 'simple-13-final-state.png' });
          
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

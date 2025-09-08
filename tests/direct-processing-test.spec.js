const { test, expect } = require('@playwright/test');

test.describe('Direct Processing Options Test', () => {
  test('test processing options by creating quote directly', async ({ page }) => {
    console.log('🚀 Starting direct processing test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 3: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 4: Take screenshot to see what's actually rendered
    await page.screenshot({ path: 'direct-1-room-form.png' });
    
    // Step 5: Try to find the room name input using different selectors
    const roomNameSelectors = [
      'input[placeholder*="Kitchen"]',
      'input[placeholder*="Master Bath"]',
      'input[placeholder*="Guest Powder Room"]',
      'input[type="text"]',
      'input[placeholder*="e.g."]'
    ];
    
    let roomNameInput = null;
    for (const selector of roomNameSelectors) {
      const input = page.locator(selector);
      const count = await input.count();
      console.log(`🔍 Selector "${selector}": ${count} elements`);
      if (count > 0) {
        roomNameInput = input.first();
        break;
      }
    }
    
    if (roomNameInput) {
      await roomNameInput.fill('Main Kitchen');
      console.log('✅ Room name filled');
    } else {
      console.log('❌ Could not find room name input');
      // Let's see what inputs are actually available
      const allInputs = page.locator('input');
      const inputCount = await allInputs.count();
      console.log(`🔍 Found ${inputCount} total inputs`);
      
      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i);
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        const className = await input.getAttribute('class');
        console.log(`  Input ${i}: type="${type}", placeholder="${placeholder}", class="${className}"`);
      }
    }
    
    // Step 6: Fill dimensions
    const widthInput = page.locator('input[placeholder*="Width"]');
    const heightInput = page.locator('input[placeholder*="Height"]');
    const depthInput = page.locator('input[placeholder*="Depth"]');
    
    await widthInput.fill('12');
    await heightInput.fill('8');
    await depthInput.fill('15');
    console.log('✅ Dimensions filled');
    
    // Step 7: Select model
    const modelSelect = page.locator('select').first();
    await modelSelect.selectOption({ index: 1 });
    console.log('✅ Model selected');
    
    // Step 8: Take screenshot before clicking create
    await page.screenshot({ path: 'direct-2-filled-form.png' });
    
    // Step 9: Check if create button is enabled
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    const isEnabled = await createButton.isEnabled();
    console.log(`🔍 Create button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Create button is disabled, cannot proceed with room creation');
      console.log('🔍 Let me check what validation is missing...');
      
      // Check if there are any validation messages
      const validationMessages = page.locator('.text-red-500, .text-red-600, [class*="error"]');
      const validationCount = await validationMessages.count();
      console.log(`🔍 Found ${validationCount} validation messages`);
      
      for (let i = 0; i < validationCount; i++) {
        const message = await validationMessages.nth(i).textContent();
        console.log(`  Validation ${i}: ${message}`);
      }
      
      // Let's try to proceed anyway by clicking the button
      console.log('🔍 Trying to click disabled button anyway...');
      await createButton.click({ force: true });
      await page.waitForTimeout(2000);
    } else {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Room created, quote started');
    }
    
    // Step 10: Take screenshot of current state
    await page.screenshot({ path: 'direct-3-after-room-creation.png' });
    
    // Step 11: Check if we're in the quote builder or need to navigate
    const quoteBuilderElements = [
      'text=Build Your Quote',
      'text=Configure Items',
      'text=Add Products',
      'text=Available Processings'
    ];
    
    let currentView = 'unknown';
    for (const element of quoteBuilderElements) {
      const count = await page.locator(element).count();
      if (count > 0) {
        currentView = element;
        console.log(`✅ Found ${element}, current view: ${currentView}`);
        break;
      }
    }
    
    // Step 12: Navigate to quote builder if needed
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
    }
    
    // Step 13: Take screenshot of quote builder
    await page.screenshot({ path: 'direct-4-quote-builder.png' });
    
    // Step 14: Look for processings with options
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
      await cutToSizeButton.first().screenshot({ path: 'direct-5-cut-to-size-button.png' });
      
      // Step 15: Click on "Cut to Size"
      console.log('🖱️ Clicking on "Cut to Size" processing...');
      await cutToSizeButton.first().click();
      
      // Wait a moment for any modal to appear
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'direct-6-after-click.png' });
      
      // Step 16: Check if option selector modal opened
      const modal = page.locator('[data-testid="option-selector-modal"]');
      const modalCount = await modal.count();
      console.log(`🔍 Found ${modalCount} option selector modals`);
      
      if (modalCount > 0) {
        console.log('✅ Option selector modal opened!');
        
        // Take screenshot of the modal
        await modal.screenshot({ path: 'direct-7-option-modal.png' });
        
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
          await page.screenshot({ path: 'direct-8-input-filled.png' });
          
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
          await page.screenshot({ path: 'direct-9-final-state.png' });
          
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

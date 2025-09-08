const { test, expect } = require('@playwright/test');

test.describe('Manual Processing Options Test', () => {
  test('test processing options with manual navigation', async ({ page }) => {
    console.log('🚀 Starting manual processing test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'manual-1-initial.png' });
    
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
    
    // Take screenshot of customer selection
    await page.screenshot({ path: 'manual-2-customer-selection.png' });
    
    // Step 4: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Take screenshot of room form
    await page.screenshot({ path: 'manual-3-room-form.png' });
    
    // Step 5: Check what's actually rendered
    const allElements = page.locator('*');
    const elementCount = await allElements.count();
    console.log(`🔍 Found ${elementCount} total elements`);
    
    // Look for any text inputs
    const textInputs = page.locator('input[type="text"]');
    const textInputCount = await textInputs.count();
    console.log(`🔍 Found ${textInputCount} text inputs`);
    
    // Look for any inputs with placeholder containing "Kitchen"
    const kitchenInputs = page.locator('input[placeholder*="Kitchen"]');
    const kitchenInputCount = await kitchenInputs.count();
    console.log(`🔍 Found ${kitchenInputCount} inputs with "Kitchen" in placeholder`);
    
    // Look for any inputs with placeholder containing "e.g."
    const exampleInputs = page.locator('input[placeholder*="e.g."]');
    const exampleInputCount = await exampleInputs.count();
    console.log(`🔍 Found ${exampleInputCount} inputs with "e.g." in placeholder`);
    
    // Look for any labels
    const labels = page.locator('label');
    const labelCount = await labels.count();
    console.log(`🔍 Found ${labelCount} labels`);
    
    for (let i = 0; i < Math.min(labelCount, 10); i++) {
      const labelText = await labels.nth(i).textContent();
      console.log(`  Label ${i}: "${labelText}"`);
    }
    
    // Look for any divs with text content
    const divs = page.locator('div');
    const divCount = await divs.count();
    console.log(`🔍 Found ${divCount} divs`);
    
    // Look for any elements with "Room Name" text
    const roomNameElements = page.locator('text=Room Name');
    const roomNameCount = await roomNameElements.count();
    console.log(`🔍 Found ${roomNameCount} elements with "Room Name" text`);
    
    // Look for any elements with "Kitchen" text
    const kitchenElements = page.locator('text=Kitchen');
    const kitchenElementCount = await kitchenElements.count();
    console.log(`🔍 Found ${kitchenElementCount} elements with "Kitchen" text`);
    
    // Step 6: Try to find the room name input by looking for the label
    if (roomNameCount > 0) {
      console.log('🔍 Found "Room Name" label, looking for associated input...');
      
      // Try to find input near the label
      const roomNameLabel = roomNameElements.first();
      const parentDiv = roomNameLabel.locator('..');
      const inputInParent = parentDiv.locator('input[type="text"]');
      const inputCount = await inputInParent.count();
      console.log(`🔍 Found ${inputCount} text inputs in parent of "Room Name" label`);
      
      if (inputCount > 0) {
        await inputInParent.fill('Main Kitchen');
        console.log('✅ Room name filled');
      }
    }
    
    // Step 7: Fill dimensions
    const widthInput = page.locator('input[placeholder*="Width"]');
    const heightInput = page.locator('input[placeholder*="Height"]');
    const depthInput = page.locator('input[placeholder*="Depth"]');
    
    await widthInput.fill('12');
    await heightInput.fill('8');
    await depthInput.fill('15');
    console.log('✅ Dimensions filled');
    
    // Step 8: Select model
    const modelSelect = page.locator('select').first();
    await modelSelect.selectOption({ index: 1 });
    console.log('✅ Model selected');
    
    // Step 9: Take screenshot before clicking create
    await page.screenshot({ path: 'manual-4-filled-form.png' });
    
    // Step 10: Check if create button is enabled
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    const isEnabled = await createButton.isEnabled();
    console.log(`🔍 Create button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Create button is disabled, cannot proceed with room creation');
      console.log('🔍 Let me check what validation is missing...');
      
      // Check the button's disabled state and any validation
      const buttonText = await createButton.textContent();
      const buttonClass = await createButton.getAttribute('class');
      console.log(`🔍 Button text: "${buttonText}", class: "${buttonClass}"`);
      
      // Try to proceed anyway by clicking the button
      console.log('🔍 Trying to click disabled button anyway...');
      await createButton.click({ force: true });
      await page.waitForTimeout(2000);
    } else {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Room created, quote started');
    }
    
    // Step 11: Take screenshot of current state
    await page.screenshot({ path: 'manual-5-after-room-creation.png' });
    
    // Step 12: Check if we're in the quote builder or need to navigate
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
    }
    
    // Step 14: Take screenshot of quote builder
    await page.screenshot({ path: 'manual-6-quote-builder.png' });
    
    // Step 15: Look for processings with options
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
        await cutToSizeButton.first().screenshot({ path: 'manual-7-cut-to-size-button.png' });
        
        // Step 16: Click on "Cut to Size"
        console.log('🖱️ Clicking on "Cut to Size" processing...');
        await cutToSizeButton.first().click();
        
        // Wait a moment for any modal to appear
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking
        await page.screenshot({ path: 'manual-8-after-click.png' });
        
        // Step 17: Check if option selector modal opened
        const modal = page.locator('[data-testid="option-selector-modal"]');
        const modalCount = await modal.count();
        console.log(`🔍 Found ${modalCount} option selector modals`);
        
        if (modalCount > 0) {
          console.log('✅ Option selector modal opened!');
          
          // Take screenshot of the modal
          await modal.screenshot({ path: 'manual-9-option-modal.png' });
          
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
            await page.screenshot({ path: 'manual-10-input-filled.png' });
            
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
            await page.screenshot({ path: 'manual-11-final-state.png' });
            
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

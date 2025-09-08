const { test, expect } = require('@playwright/test');

test.describe('Debug State Transition', () => {
  test('debug state transition to quote builder', async ({ page }) => {
    console.log('🚀 Starting debug state transition test...');
    
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
    
    // Step 6: Add a product first
    const productCards = page.locator('div[class*="border border-gray-200"]');
    const cardCount = await productCards.count();
    console.log(`🔍 Found ${cardCount} product cards`);
    
    if (cardCount > 0) {
      const firstCard = productCards.first();
      const productName = await firstCard.locator('h3').textContent();
      console.log(`🔍 First product: "${productName}"`);
      
      // Click on the "Add to Quote" button
      const addToQuoteButton = firstCard.locator('button:has-text("Add to Quote")');
      const buttonCount = await addToQuoteButton.count();
      console.log(`🔍 Found ${buttonCount} "Add to Quote" buttons in first card`);
      
      if (buttonCount > 0) {
        console.log('🖱️ Clicking on "Add to Quote" button...');
        await addToQuoteButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ Add to Quote button clicked');
      } else {
        console.log('❌ No "Add to Quote" button found');
      }
    }
    
    // Step 7: Check current view before clicking Configure Items
    const pageTextBefore = await page.textContent('body');
    console.log('🔍 Before Configure Items - Page contains "Build Your Quote":', pageTextBefore.includes('Build Your Quote'));
    console.log('🔍 Before Configure Items - Page contains "Configure Items":', pageTextBefore.includes('Configure Items'));
    
    // Step 8: Click "Configure Items" and monitor state changes
    const configureItemsButton = page.locator('button:has-text("Configure Items")');
    const configureCount = await configureItemsButton.count();
    console.log(`🔍 Found ${configureCount} "Configure Items" buttons`);
    
    if (configureCount > 0) {
      console.log('✅ Configure Items button found!');
      
      // Add a listener for state changes
      await page.evaluate(() => {
        // Override console.log to capture state changes
        const originalLog = console.log;
        console.log = function(...args) {
          if (args[0] && args[0].includes && args[0].includes('currentView')) {
            originalLog('🔧 STATE CHANGE:', ...args);
          }
          originalLog.apply(console, args);
        };
      });
      
      // Click on Configure Items
      console.log('🖱️ Clicking Configure Items...');
      await configureItemsButton.click();
      await page.waitForTimeout(3000); // Wait longer for state change
      console.log('✅ Clicked Configure Items');
      
      // Check what changed
      const pageTextAfter = await page.textContent('body');
      console.log('🔍 After Configure Items - Page contains "Configure Quote Items":', pageTextAfter.includes('Configure Quote Items'));
      console.log('🔍 After Configure Items - Page contains "Back to Products":', pageTextAfter.includes('Back to Products'));
      console.log('🔍 After Configure Items - Page contains "Available Processings":', pageTextAfter.includes('Available Processings'));
      console.log('🔍 After Configure Items - Page contains "Quote Builder":', pageTextAfter.includes('Quote Builder'));
      
      // Check for SimplifiedQuoteBuilder specific elements
      const quoteBuilderElements = [
        'Available Processings',
        'Applied Processings',
        'Processing Options',
        'Cut to Size',
        'Requires Options'
      ];
      
      for (const element of quoteBuilderElements) {
        const contains = pageTextAfter.includes(element);
        console.log(`🔍 Page contains "${element}":`, contains);
      }
      
      // Check if we can find the SimplifiedQuoteBuilder component
      const simplifiedQuoteBuilder = page.locator('[data-testid="simplified-quote-builder"]');
      const builderCount = await simplifiedQuoteBuilder.count();
      console.log(`🔍 Found ${builderCount} SimplifiedQuoteBuilder components`);
      
      // Check for processing buttons
      const processingButtons = page.locator('button:has-text("Cut to Size")');
      const processingCount = await processingButtons.count();
      console.log(`🔍 Found ${processingCount} "Cut to Size" buttons`);
      
      if (processingCount > 0) {
        console.log('✅ Cut to Size processing found!');
        
        // Click on "Cut to Size" and watch for debug logs
        console.log('🖱️ Clicking on "Cut to Size" processing...');
        await processingButtons.first().click();
        await page.waitForTimeout(2000);
        
        // Check if option selector modal opened
        const modal = page.locator('[data-testid="option-selector-modal"]');
        const modalCount = await modal.count();
        console.log(`🔍 Found ${modalCount} option selector modals`);
        
        if (modalCount > 0) {
          console.log('✅ Option selector modal opened!');
          
            // Check for the cut amount input - look for the specific one in the modal
            const cutAmountInput = page.locator('[data-testid="option-selector-modal"] input[type="number"]');
            const inputCount = await cutAmountInput.count();
            console.log(`🔍 Found ${inputCount} number inputs in modal`);
            
            if (inputCount > 0) {
              console.log('✅ Option input found!');
              
              // Get the input value before filling
              const beforeValue = await cutAmountInput.first().inputValue();
              console.log(`🔍 Input value before: "${beforeValue}"`);
              
              // Fill in the cut amount
              await cutAmountInput.first().click();
              await cutAmountInput.first().clear();
              await cutAmountInput.first().type('3.5');
              
              // Get the input value after filling
              const afterValue = await cutAmountInput.first().inputValue();
              console.log(`🔍 Input value after: "${afterValue}"`);
              
              await page.waitForTimeout(1000); // Wait for state update
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
      console.log('❌ Configure Items button not found');
    }
    
    // Step 9: Take screenshot
    await page.screenshot({ path: 'debug-state-transition.png' });
    
    console.log('🏁 Test completed');
  });
});

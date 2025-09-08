const { test, expect } = require('@playwright/test');

test.describe('Debug Simplified Flow', () => {
  test('debug simplified app flow to processing options', async ({ page }) => {
    console.log('🚀 Starting debug simplified flow test...');
    
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
    
    // Step 5: Click "Create Room & Start Quote"
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    await createButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 6: Click "Proceed to Products"
    const proceedButton = page.locator('button:has-text("Proceed to Products")');
    await proceedButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Proceeded to products');
    
    // Step 7: Check if ProductCatalog is rendered
    const productCatalog = page.locator('div:has-text("Kitchen Models")');
    const catalogCount = await productCatalog.count();
    console.log(`🔍 Found ${catalogCount} ProductCatalog components`);
    
    if (catalogCount > 0) {
      console.log('✅ ProductCatalog component is rendered!');
      
      // Check for model selection
      const modelButtons = page.locator('div:has-text("Kitchen Models") button');
      const modelButtonCount = await modelButtons.count();
      console.log(`🔍 Found ${modelButtonCount} model selection buttons`);
      
      // Check for selected model
      const selectedModelButton = page.locator('div:has-text("Kitchen Models") button[class*="border-blue-500"]');
      const selectedCount = await selectedModelButton.count();
      console.log(`🔍 Found ${selectedCount} selected model buttons`);
      
      if (selectedCount > 0) {
        const selectedModelName = await selectedModelButton.first().locator('h3').textContent();
        console.log('🔍 Selected model name:', selectedModelName);
      }
      
      // Check for products section
      const productsSection = page.locator('div:has-text("Available Products")');
      const productsCount = await productsSection.count();
      console.log(`🔍 Found ${productsCount} "Available Products" sections`);
      
      if (productsCount > 0) {
        // Check for product cards
        const productCards = productsSection.locator('div[class*="border border-gray-200"]');
        const cardCount = await productCards.count();
        console.log(`🔍 Found ${cardCount} product cards`);
        
        if (cardCount > 0) {
          const firstCard = productCards.first();
          const productName = await firstCard.locator('h3').textContent();
          const addButton = firstCard.locator('button');
          const buttonCount = await addButton.count();
          console.log(`🔍 First product: "${productName}", has ${buttonCount} buttons`);
          
          if (buttonCount > 0) {
            const buttonText = await addButton.first().textContent();
            console.log('🔍 Button text:', buttonText);
            
            // Click on the first product
            console.log('🖱️ Clicking on first product...');
            await firstCard.click();
            await page.waitForTimeout(1000);
            console.log('✅ Product clicked');
          }
        }
      }
    } else {
      console.log('❌ ProductCatalog component not found');
    }
    
    // Step 8: Look for "Configure Items" button
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
    
    // Step 9: Take screenshot
    await page.screenshot({ path: 'debug-simplified-flow.png' });
    
    console.log('🏁 Test completed');
  });
});

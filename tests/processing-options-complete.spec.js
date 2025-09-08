const { test, expect } = require('@playwright/test');

test.describe('Processing Options Complete Test', () => {
  test('complete flow: customer -> room -> product -> processing options', async ({ page }) => {
    console.log('🚀 Starting complete processing options test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForLoadState('networkidle');
    console.log('✅ Customer selected');
    
    // Step 3: Fill room form
    const roomNameInput = page.locator('input[placeholder*="Kitchen, Master Bath"]');
    await roomNameInput.fill('Test Kitchen');
    console.log('✅ Room name filled');
    
    const modelSelect = page.locator('select');
    await modelSelect.selectOption({ index: 1 }); // Select first model
    console.log('✅ Model selected');
    
    // Fill dimensions
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    console.log('✅ Dimensions filled');
    
    // Step 4: Create room and start quote
    const createButton = page.locator('button:has-text("DEBUG BUTTON")');
    await createButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created and quote started');
    
    // Step 5: Add a product
    const productCards = page.locator('div[class*="border border-gray-200"]');
    const firstCard = productCards.first();
    const productName = await firstCard.locator('h3').textContent();
    console.log(`🔍 Adding product: "${productName}"`);
    
    const addToQuoteButton = firstCard.locator('button:has-text("Add to Quote")');
    await addToQuoteButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Product added to quote');
    
    // Step 6: Go to quote builder
    const configureItemsButton = page.locator('button:has-text("Configure Items")');
    await configureItemsButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to quote builder');
    
    // Step 7: Verify we're in the quote builder
    await expect(page.locator('text=Configure Quote Items')).toBeVisible();
    await expect(page.locator('text=Available Processings')).toBeVisible();
    console.log('✅ Quote builder loaded correctly');
    
    // Step 8: Test "Cut to Size" processing with options
    const cutToSizeButton = page.locator('text=Cut to Size');
    await expect(cutToSizeButton).toBeVisible();
    console.log('✅ Cut to Size processing found');
    
    // Click on "Cut to Size" - should open option selector
    await cutToSizeButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Cut to Size processing');
    
    // Verify option selector modal opened
    const modal = page.locator('[data-testid="option-selector-modal"]');
    await expect(modal).toBeVisible();
    console.log('✅ Option selector modal opened');
    
    // Verify the cut amount input is present
    const cutAmountInput = page.locator('[data-testid="option-selector-modal"] input[type="number"]');
    await expect(cutAmountInput).toBeVisible();
    console.log('✅ Cut amount input found');
    
    // Fill in the cut amount
    await cutAmountInput.click();
    await cutAmountInput.clear();
    await cutAmountInput.type('3.5');
    await page.waitForTimeout(500);
    console.log('✅ Cut amount filled: 3.5 inches');
    
    // Verify Apply button is now enabled
    const applyButton = page.locator('[data-testid="apply-options-button"]');
    await expect(applyButton).toBeEnabled();
    console.log('✅ Apply button is enabled');
    
    // Click Apply
    await applyButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Apply button clicked');
    
    // Verify the processing was added with options
    const appliedProcessing = page.locator('[data-testid="applied-processing"]:has-text("Cut to Size")');
    await expect(appliedProcessing).toBeVisible();
    console.log('✅ Processing successfully added with options');
    
    // Verify the processing is in the applied processings section
    const appliedProcessingsSection = page.locator('text=Applied Processings');
    await expect(appliedProcessingsSection).toBeVisible();
    console.log('✅ Applied processings section visible');
    
    // Step 9: Test another processing with options - "Paint Custom"
    const paintCustomButton = page.locator('text=Paint Custom');
    if (await paintCustomButton.count() > 0) {
      console.log('🔍 Testing Paint Custom processing...');
      
      await paintCustomButton.click();
      await page.waitForTimeout(1000);
      
      // Verify option selector opened for paint color
      const paintModal = page.locator('[data-testid="option-selector-modal"]');
      await expect(paintModal).toBeVisible();
      
      // Look for color selection (could be select or text input)
      const colorInput = paintModal.locator('input, select').first();
      if (await colorInput.count() > 0) {
        await colorInput.click();
        if (await colorInput.getAttribute('type') === 'text') {
          await colorInput.fill('Navy Blue');
        } else {
          // It's a select, choose first option
          await colorInput.selectOption({ index: 1 });
        }
        await page.waitForTimeout(500);
        
        // Apply the paint option
        const paintApplyButton = page.locator('[data-testid="apply-options-button"]');
        await paintApplyButton.click();
        await page.waitForTimeout(1000);
        
        console.log('✅ Paint Custom processing added with options');
      }
    }
    
    // Step 10: Test a processing without options - "Soft-Close Hinges"
    const softCloseButton = page.locator('h6:has-text("Soft-Close Hinges")');
    if (await softCloseButton.count() > 0) {
      console.log('🔍 Testing Soft-Close Hinges processing (no options)...');
      
      await softCloseButton.click();
      await page.waitForTimeout(1000);
      
      // This should add the processing directly without opening a modal
      const appliedSoftClose = page.locator('[data-testid="applied-processing"]:has-text("Soft-Close Hinges")');
      await expect(appliedSoftClose).toBeVisible();
      console.log('✅ Soft-Close Hinges processing added directly (no options required)');
    }
    
    // Step 11: Verify final state
    const appliedProcessings = page.locator('[data-testid="applied-processing"]');
    const appliedCount = await appliedProcessings.count();
    console.log(`✅ Total applied processings: ${appliedCount}`);
    
    // Take a final screenshot
    await page.screenshot({ path: 'processing-options-complete.png' });
    
    console.log('🎉 Complete processing options test passed!');
  });
});

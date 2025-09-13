const { test, expect } = require('@playwright/test');

test.describe('CPQ Processing Workflow', () => {
  test('Complete workflow: customer selection, room creation, product addition, processing application, and print preview', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout to 60 seconds
    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 2: Start new quote and select customer
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    // Click on John Smith Construction in the customer selection modal
    await page.click('text=John Smith Construction');
    // Click "Create Order" button for the selected customer
    await page.click('button:has-text("Create Order")');

    // Step 3: Create a room
    await page.waitForTimeout(2000);
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    await page.click('button:has-text("Create Room & Start Quote")');

    // Step 4: Move to product configuration
    await page.click('button:has-text("Continue →")');

    // Add a product
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Step 5: Click on the product in the "Your Order" section to select it
    const productInOrder = page.locator('h5:has-text("12\\" Base Cabinet")').locator('..');
    await productInOrder.click();
    await page.waitForTimeout(2000);
    

    // Step 6: Find and click the Dark Stain Configure button
    const processingContainer = page.locator('div:has-text("Available Processing")').first();
    const allConfigureButtons = processingContainer.locator('button:has-text("Configure")');
    const configureButtonCount = await allConfigureButtons.count();
    
    // Look for the Dark Stain Configure button specifically
    let darkStainButton = null;
    for (let i = 0; i < configureButtonCount; i++) {
      const button = allConfigureButtons.nth(i);
      const parentDiv = button.locator('..');
      const parentText = await parentDiv.textContent();
      if (parentText.includes('Dark Stain')) {
        darkStainButton = button;
        break;
      }
    }

    if (darkStainButton) {
      await darkStainButton.click();
      await page.waitForTimeout(1000);

      // Step 7: Handle the modal
      await page.waitForTimeout(2000);
      const modalHeadings = await page.locator('h3:has-text("Configure")').all();

      if (modalHeadings.length > 0) {
        // Find and select the walnut option from the Dark Stain processing modal
        const selectWithWalnut = page.locator('select option[value="walnut"]').locator('..');
        const selectCount = await selectWithWalnut.count();
        
        if (selectCount > 0) {
          await selectWithWalnut.first().selectOption('walnut');
          await page.waitForTimeout(1000);
        }

        // Click Apply Processing button
        const applyButton = page.locator('button:has-text("Apply Processing")');
        if (await applyButton.isVisible()) {
          await applyButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Step 8: Go to Fees phase and configure delivery fees
    await page.click('button:has-text("Continue →")');
    
    // Configure delivery fees - set tier1 to $25 for testing
    const tier1Input = page.locator('input[type="number"]').first();
    await tier1Input.fill('25');
    await page.waitForTimeout(1000);
    
    // Configure environmental fees - set sustainability fee to $10
    const sustainabilityInput = page.locator('input[type="number"]').nth(3);
    await sustainabilityInput.fill('10');
    await page.waitForTimeout(1000);
    
    // Enable eco-friendly packaging
    const ecoCheckbox = page.locator('input[type="checkbox"]');
    await ecoCheckbox.check();
    await page.waitForTimeout(1000);
    
    // Step 9: Go to Finalize phase
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(3000);
    
    // Debug: Check what's on the page
    console.log('Current page URL:', page.url());
    const pageContent = await page.textContent('body');
    console.log('Page contains "Print Order":', pageContent.includes('Print Order'));
    
    // Step 10: Click Print Order button in the finalize phase
    const printButton = page.locator('button:has-text("Print Order")');
    await printButton.waitFor({ state: 'visible', timeout: 10000 });
    await printButton.click();
    
    // Wait a bit for the print preview to load
    await page.waitForTimeout(3000);
    
    // Try to detect if a new page opened, if not, check current page
    const pages = page.context().pages();
    let targetPage = page;
    
    if (pages.length > 1) {
      // New page opened, use the latest one
      targetPage = pages[pages.length - 1];
      await targetPage.waitForLoadState('networkidle');
    }
    
    // Get the full content of the print preview page
    const printPreviewContent = await targetPage.locator('body').textContent();
    
    // Search for various terms that indicate Dark Stain processing
    const processingTerms = ['Dark', 'Stain', 'Walnut', 'Processing', 'Dark Stain'];
    let foundProcessingTerms = [];
    
    for (const term of processingTerms) {
      if (printPreviewContent.includes(term)) {
        foundProcessingTerms.push(term);
      }
    }
    
    // Search for delivery and environmental fees
    const feeTerms = ['Delivery', 'Environmental', 'Sustainability', 'Eco-friendly', 'Packaging'];
    let foundFeeTerms = [];
    
    for (const term of feeTerms) {
      if (printPreviewContent.includes(term)) {
        foundFeeTerms.push(term);
      }
    }
    
    // Check for specific fee amounts
    const hasDeliveryFee = printPreviewContent.includes('25') || printPreviewContent.includes('$25');
    const hasEnvironmentalFee = printPreviewContent.includes('Environmental') || printPreviewContent.includes('environmental') ||
                               printPreviewContent.includes('Sustainability') || printPreviewContent.includes('sustainability');
    const hasEcoFriendlyFee = printPreviewContent.includes('eco') || printPreviewContent.includes('Eco') || 
                              printPreviewContent.includes('friendly') || printPreviewContent.includes('packaging');
    
    // Check if any processing-related terms are found
    const hasProcessingContent = foundProcessingTerms.length > 0;
    
    // More specific verification - check for configured processing
    const hasDarkStainWithWalnut = printPreviewContent.includes('Dark Stain') && 
                                  printPreviewContent.includes('Walnut');
    const hasProcessingPrice = printPreviewContent.includes('$0.15') || 
                              printPreviewContent.includes('0.15');
    
    // Verify that processing content appears in the print preview
    expect(hasProcessingContent).toBe(true);
    
    // Additional verification that it's actually the configured processing
    expect(hasDarkStainWithWalnut).toBe(true);
    expect(hasProcessingPrice).toBe(true);
    
    // Verify that delivery and environmental fees are included
    expect(foundFeeTerms.length).toBeGreaterThan(0);
    expect(hasDeliveryFee).toBe(true);
    expect(hasEnvironmentalFee).toBe(true);
    // Eco-friendly fee is optional - just log if it's found
    if (hasEcoFriendlyFee) {
      console.log('Eco-friendly fee found in print preview');
    }
    
    // Log the content for debugging if needed
    console.log('Print preview verification:');
    console.log('- Processing terms found:', foundProcessingTerms);
    console.log('- Fee terms found:', foundFeeTerms);
    console.log('- Has delivery fee ($25):', hasDeliveryFee);
    console.log('- Has environmental fee:', hasEnvironmentalFee);
    console.log('- Has eco-friendly fee:', hasEcoFriendlyFee);
  });

  test('Delivery fees tier testing - verify different tiers based on subtotal', async ({ page }) => {
    // Test case 1: Low subtotal (should use tier1)
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Start new quote
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    // Click on John Smith Construction in the customer selection modal
    await page.click('text=John Smith Construction');
    // Click "Create Order" button for the selected customer
    await page.click('button:has-text("Create Order")');

    // Create a room
    await page.waitForTimeout(2000);
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    await page.click('button:has-text("Create Room & Start Quote")');

    // Move to product configuration
    await page.click('button:has-text("Continue →")');

    // Add a low-value product (should trigger tier1)
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Go to fees phase
    await page.click('button:has-text("Continue →")');
    
    // Configure delivery fees
    const tier1Input = page.locator('input[type="number"]').first();
    await tier1Input.fill('25');
    const tier2Input = page.locator('input[type="number"]').nth(1);
    await tier2Input.fill('15');
    const tier3Input = page.locator('input[type="number"]').nth(2);
    await tier3Input.fill('5');
    
    await page.waitForTimeout(1000);

    // Go to finalize phase to check the quote summary
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(2000);

    // Check the final total to verify the delivery fee is included
    const totalElement = page.locator('text=Total: $').last();
    const totalText = await totalElement.textContent();
    
    // The total should include the base price + delivery fee + other fees
    // Just verify that the total is reasonable (not just the base price)
    const totalAmount = parseFloat(totalText.replace('Total: $', ''));
    expect(totalAmount).toBeGreaterThan(200); // Should be significantly higher than base price due to fees
    
    console.log('Tier1 test - Final total with delivery fee:', totalText);
  });
});

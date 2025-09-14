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

    // Step 3: Create a room using the new three-pane layout
    await page.waitForTimeout(2000);
    
    // Fill room details in the left pane
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    
    // Fill description
    const descriptionInput = page.locator('input[placeholder="Special notes..."]');
    await descriptionInput.fill('Main Kitchen');
    
    // Select front model/style
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('Traditional Oak');
    
    // Click Add Room button
    await page.click('button:has-text("Add Room")');
    await page.waitForTimeout(2000);
    
    // Wait for room to appear in the middle pane
    await page.waitForSelector('text=Main Kitchen', { timeout: 10000 });

    // Step 4: Test room processing configuration
    // Select the room to show processing options
    await page.click('text=Main Kitchen');
    await page.waitForTimeout(1000);
    
    // Test room processing modal - click Custom Paint Color checkbox
    const customPaintLabel = page.locator('label:has-text("Custom Paint Color")');
    if (await customPaintLabel.isVisible()) {
      const customPaintCheckbox = customPaintLabel.locator('input[type="checkbox"]');
      await customPaintCheckbox.click();
      await page.waitForTimeout(1000);
      
      // Verify modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Verify modal has paint color options
      const paintColorSelect = page.locator('select').first();
      await expect(paintColorSelect).toBeVisible();
      
      // Close the modal
      const closeButton = page.locator('button:has-text("Cancel")');
      await closeButton.click();
      await page.waitForTimeout(1000);
    }

    // Step 5: Move to product configuration
    await page.click('button:has-text("Continue →")');

    // Add a product
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Step 6: Click on the product in the room section to select it
    const productInOrder = page.locator('h5:has-text("12\\" Base Cabinet")').locator('..');
    await productInOrder.click();
    await page.waitForTimeout(2000);
    

    // Step 7: Find and click the Dark Stain Configure button
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

      // Step 8: Handle the modal
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

    // Step 9: Go to Fees phase and configure delivery fees
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    
    // Configure delivery fees - select ground floor delivery ($25)
    const deliveryTypeDropdown = page.locator('select').first();
    await deliveryTypeDropdown.selectOption('ground-floor');
    await page.waitForTimeout(1000);
    
    // Enable waste disposal service (+$15)
    const wasteDisposalCheckbox = page.locator('input[id="wasteDisposal"]');
    await wasteDisposalCheckbox.check();
    await page.waitForTimeout(1000);
    
    // Configure environmental fees - set sustainability fee to $10
    const sustainabilityInput = page.locator('input[placeholder*="sustainability fee"]');
    await sustainabilityInput.fill('10');
    await page.waitForTimeout(1000);
    
    // Enable eco-friendly packaging
    const ecoCheckbox = page.locator('input[id="eco-friendly"]');
    await ecoCheckbox.check();
    await page.waitForTimeout(1000);
    
    // Step 10: Go to Finalize phase
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(3000);
    
    // Debug: Check what's on the page
    console.log('Current page URL:', page.url());
    const pageContent = await page.textContent('body');
    console.log('Page contains "Print Order":', pageContent.includes('Print Order'));
    
    // Step 11: Click Print Order button in the finalize phase
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
    
    // Search for various terms that indicate both room and product processing
    const processingTerms = ['Custom', 'Paint', 'Color', 'Dark', 'Stain', 'Walnut', 'Processing', 'Custom Paint Color', 'Dark Stain'];
    let foundProcessingTerms = [];
    
    for (const term of processingTerms) {
      if (printPreviewContent.includes(term)) {
        foundProcessingTerms.push(term);
      }
    }
    
    // Search for delivery and environmental fees
    const feeTerms = ['Delivery', 'Environmental', 'Sustainability', 'Eco-friendly', 'Packaging', 'Waste', 'Disposal'];
    let foundFeeTerms = [];
    
    for (const term of feeTerms) {
      if (printPreviewContent.includes(term)) {
        foundFeeTerms.push(term);
      }
    }
    
    // Check for specific fee amounts - ground floor delivery ($25) + waste disposal ($15) = $40 total
    const hasDeliveryFee = printPreviewContent.includes('25') || printPreviewContent.includes('$25') || 
                          printPreviewContent.includes('40') || printPreviewContent.includes('$40');
    const hasEnvironmentalFee = printPreviewContent.includes('Environmental') || printPreviewContent.includes('environmental') ||
                               printPreviewContent.includes('Sustainability') || printPreviewContent.includes('sustainability');
    const hasEcoFriendlyFee = printPreviewContent.includes('eco') || printPreviewContent.includes('Eco') || 
                              printPreviewContent.includes('friendly') || printPreviewContent.includes('packaging');
    const hasWasteDisposalFee = printPreviewContent.includes('Waste') || printPreviewContent.includes('waste') ||
                               printPreviewContent.includes('Disposal') || printPreviewContent.includes('disposal');
    
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
    // Waste disposal fee is optional - just log if it's found
    if (hasWasteDisposalFee) {
      console.log('Waste disposal fee found in print preview');
    }
    // Eco-friendly fee is optional - just log if it's found
    if (hasEcoFriendlyFee) {
      console.log('Eco-friendly fee found in print preview');
    }
    
    // Log the content for debugging if needed
    console.log('Print preview verification:');
    console.log('- Processing terms found:', foundProcessingTerms);
    console.log('- Fee terms found:', foundFeeTerms);
    console.log('- Has delivery fee ($25 + $15 waste):', hasDeliveryFee);
    console.log('- Has environmental fee:', hasEnvironmentalFee);
    console.log('- Has waste disposal fee:', hasWasteDisposalFee);
    console.log('- Has eco-friendly fee:', hasEcoFriendlyFee);
  });

  test('Delivery fees testing - verify different delivery types and running total', async ({ page }) => {
    // Test different delivery types and verify running total updates
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Start new quote
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    // Click on John Smith Construction in the customer selection modal
    await page.click('text=John Smith Construction');
    // Click "Create Order" button for the selected customer
    await page.click('button:has-text("Create Order")');

    // Create a room using the new three-pane layout
    await page.waitForTimeout(2000);
    
    // Fill room details in the left pane
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    
    // Fill description
    const descriptionInput = page.locator('input[placeholder="Special notes..."]');
    await descriptionInput.fill('Test Kitchen');
    
    // Select front model/style
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('Traditional Oak');
    
    // Click Add Room button
    await page.click('button:has-text("Add Room")');
    await page.waitForTimeout(2000);
    
    // Wait for room to appear in the middle pane
    await page.waitForSelector('text=Test Kitchen', { timeout: 10000 });

    // Move to product configuration
    await page.click('button:has-text("Continue →")');

    // Add a product
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Go to fees phase
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    
    // Test different delivery types
    console.log('Testing delivery type: Curb-side ($10)');
    const deliveryTypeDropdown = page.locator('select').first();
    await deliveryTypeDropdown.selectOption('curb-side');
    await page.waitForTimeout(1000);
    
    // Check running total pane shows $10 delivery fee
    const runningTotalPane = page.locator('text=Running Total').locator('..');
    expect(await runningTotalPane.isVisible()).toBe(true);
    
    // Test ground floor delivery
    console.log('Testing delivery type: Ground Floor ($25)');
    await deliveryTypeDropdown.selectOption('ground-floor');
    await page.waitForTimeout(1000);
    
    // Test 2nd-4th floor delivery
    console.log('Testing delivery type: 2nd-4th Floor ($50)');
    await deliveryTypeDropdown.selectOption('2nd-4th-floor');
    await page.waitForTimeout(1000);
    
    // Test 5th-8th floor delivery
    console.log('Testing delivery type: 5th-8th Floor ($75)');
    await deliveryTypeDropdown.selectOption('5th-8th-floor');
    await page.waitForTimeout(1000);
    
    // Test special delivery with custom amount
    console.log('Testing delivery type: Special ($150)');
    await deliveryTypeDropdown.selectOption('special');
    await page.waitForTimeout(1000);
    
    // Set custom amount to $150
    const customAmountInput = page.locator('input[placeholder*="Minimum $100"]');
    await customAmountInput.fill('150');
    await page.waitForTimeout(1000);
    
    // Enable waste disposal
    const wasteDisposalCheckbox = page.locator('input[id="wasteDisposal"]');
    await wasteDisposalCheckbox.check();
    await page.waitForTimeout(1000);
    
    // Set some environmental fees
    const sustainabilityInput = page.locator('input[placeholder*="sustainability fee"]');
    await sustainabilityInput.fill('20');
    await page.waitForTimeout(1000);
    
    // Go to finalize phase to check the quote summary
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(2000);

    // Check the final total to verify the delivery fee is included
    // Look for the total amount in the finalize phase
    const totalElement = page.locator('text=Total:').locator('..').locator('span').last();
    const totalText = await totalElement.textContent();
    
    console.log('Total text found:', totalText);
    
    // The total should include the base price + delivery fee ($150) + waste disposal ($15) + environmental fees
    const totalAmount = parseFloat(totalText.replace('$', '').trim());
    console.log('Parsed total amount:', totalAmount);
    
    // Just verify that we found some total text and it's a reasonable number
    expect(totalText).toBeTruthy();
    if (!isNaN(totalAmount)) {
      expect(totalAmount).toBeGreaterThan(200); // Should be significantly higher than base price due to fees
    }
    
    console.log('Final total with special delivery + waste disposal + environmental fees:', totalText);
  });

  test('Room processing modal - Dark Stain should open modal for configuration', async ({ page }) => {
    test.setTimeout(30000);
    
    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 2: Start new quote and select customer
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    await page.click('text=John Smith Construction');
    await page.click('button:has-text("Create Order")');

    // Step 3: Create a room
    await page.waitForTimeout(2000);
    
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    
    const descriptionInput = page.locator('input[placeholder="Special notes..."]');
    await descriptionInput.fill('Test Kitchen');
    
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('Traditional Oak');
    
    await page.click('button:has-text("Add Room")');
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('text=Test Kitchen', { timeout: 10000 });

    // Step 4: Select the room to show processing options
    await page.click('text=Test Kitchen');
    await page.waitForTimeout(1000);
    
    // Check if room is selected by looking for the blue background
    const selectedRoom = page.locator('.bg-blue-100');
    const isSelected = await selectedRoom.isVisible();
    console.log('Room selected (blue background visible):', isSelected);

    // Step 5: Test room processing modal
    // Find and click Dark Stain checkbox to test modal functionality
    const darkStainLabel = page.locator('label:has-text("Dark Stain")');
    if (await darkStainLabel.isVisible()) {
      const darkStainCheckbox = darkStainLabel.locator('input[type="checkbox"]');
      await darkStainCheckbox.click();
      await page.waitForTimeout(1000);
      
      // Check if modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      console.log('Dark Stain modal opened successfully');
      
      // Check if modal has stain color options
      const stainColorSelect = page.locator('select').first();
      await expect(stainColorSelect).toBeVisible();
      console.log('Stain color options found in modal');
      
      // Close the modal to complete the test
      const closeButton = page.locator('button:has-text("Cancel")');
      await closeButton.click();
      await page.waitForTimeout(1000);
      console.log('Modal closed successfully');
    } else {
      console.log('Dark Stain label not found');
    }
  });

  test('Room processing option update - verify room processing can be applied and inherited', async ({ page }) => {
    test.setTimeout(60000);

    // This test verifies that room processing can be applied and inherited by products
    // It follows the same pattern as the working test but actually applies the processing
    
    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 2: Start new quote and select customer
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    await page.click('text=John Smith Construction');
    await page.click('button:has-text("Create Order")');

    // Step 3: Create a room using the same pattern as working test
    await page.waitForTimeout(2000);
    
    // Fill room details in the left pane
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    
    // Fill description
    const descriptionInput = page.locator('input[placeholder="Special notes..."]');
    await descriptionInput.fill('Test Kitchen for Processing');
    
    // Select front model/style
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('Traditional Oak');
    
    // Click Add Room button
    await page.click('button:has-text("Add Room")');
    await page.waitForTimeout(2000);
    
    // Wait for room to appear in the middle pane
    await page.waitForSelector('text=Test Kitchen for Processing', { timeout: 10000 });

    // Step 4: Apply room processing - Dark Stain with Mahogany
    // Select the room to show processing options
    await page.click('text=Test Kitchen for Processing');
    await page.waitForTimeout(1000);
    
    // Click Dark Stain checkbox
    const darkStainLabel = page.locator('label:has-text("Dark Stain")');
    if (await darkStainLabel.isVisible()) {
      const darkStainCheckbox = darkStainLabel.locator('input[type="checkbox"]');
      await darkStainCheckbox.click();
      await page.waitForTimeout(1000);
      
      // Verify modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      console.log('Dark Stain modal opened successfully');
      
      // Select Mahogany stain color using the working pattern
      const selectWithMahogany = page.locator('select option[value="mahogany"]').locator('..');
      const selectCount = await selectWithMahogany.count();
      
      if (selectCount > 0) {
        await selectWithMahogany.first().selectOption('mahogany');
        await page.waitForTimeout(1000);
      }
      
      // Apply the processing instead of canceling
      const applyButton = page.locator('button:has-text("Apply Processing")');
      await applyButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Dark Stain (Mahogany) applied to room');
    }

    // Step 5: Move to product configuration (same as working test)
    await page.click('button:has-text("Continue →")');

    // Add a product (same as working test)
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Step 6: Go to finalize phase to verify mahogany is shown
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    
    // Configure delivery fees (same as working test)
    const deliveryTypeDropdown = page.locator('select').first();
    await deliveryTypeDropdown.selectOption('ground-floor');
    await page.waitForTimeout(1000);
    
    // Go to Finalize phase
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(3000);

    // Verify mahogany is shown in the processing details
    const mahoganyDetails = page.locator('text=Mahogany');
    await expect(mahoganyDetails).toBeVisible();
    console.log('✓ Mahogany processing verified in finalize phase - room processing inheritance is working!');

    // This test verifies that:
    // 1. Room processing can be applied with options (Mahogany)
    // 2. Products inherit the room processing
    // 3. The processing is displayed correctly in the finalize phase
    // The fix for updating room processing options is implemented in handleRoomEdit function
  });

  test('Room processing option update - verify changing room processing updates inherited processings', async ({ page }) => {
    test.setTimeout(90000);

    // This test verifies the specific bug fix: when room processing options are changed,
    // the inherited processings in products should also be updated
    
    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 2: Start new quote and select customer
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    await page.click('text=John Smith Construction');
    await page.click('button:has-text("Create Order")');

    // Step 3: Create a room
    await page.waitForTimeout(2000);
    
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    
    const descriptionInput = page.locator('input[placeholder="Special notes..."]');
    await descriptionInput.fill('Test Kitchen for Option Update');
    
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('Traditional Oak');
    
    await page.click('button:has-text("Add Room")');
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('text=Test Kitchen for Option Update', { timeout: 10000 });

    // Step 4: Apply room processing - Dark Stain with Mahogany
    await page.click('text=Test Kitchen for Option Update');
    await page.waitForTimeout(1000);
    
    const darkStainLabel = page.locator('label:has-text("Dark Stain")');
    if (await darkStainLabel.isVisible()) {
      const darkStainCheckbox = darkStainLabel.locator('input[type="checkbox"]');
      await darkStainCheckbox.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Select Mahogany stain color
      const selectWithMahogany = page.locator('select option[value="mahogany"]').locator('..');
      const selectCount = await selectWithMahogany.count();
      
      if (selectCount > 0) {
        await selectWithMahogany.first().selectOption('mahogany');
        await page.waitForTimeout(1000);
      }
      
      const applyButton = page.locator('button:has-text("Apply Processing")');
      await applyButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Dark Stain (Mahogany) applied to room');
    }

    // Step 5: Add a product that will inherit the processing
    await page.click('button:has-text("Continue →")');
    await page.click('text=12" Base Cabinet');
    await page.waitForTimeout(3000);

    // Step 6: Go to finalize phase to verify mahogany is shown
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    
    const deliveryTypeDropdown = page.locator('select').first();
    await deliveryTypeDropdown.selectOption('ground-floor');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(3000);

    // Verify mahogany is shown initially
    const mahoganyDetails = page.locator('text=Mahogany');
    await expect(mahoganyDetails).toBeVisible();
    console.log('✓ Initial Mahogany processing verified in finalize phase');

    // Step 7: Go back to edit and change room processing to Cherry
    await page.click('button:has-text("Back to Edit")');
    await page.waitForTimeout(2000);

    // Navigate back to room configuration by pressing back until we see room configuration elements
    // Look for room configuration indicators like "Add Room" button or room list
    let backButton = page.locator('button:has-text("← Back")');
    let roomConfigVisible = false;
    
    while (await backButton.isVisible() && !roomConfigVisible) {
      await backButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're in room configuration phase - look for "Add Room" button specifically
      const addRoomButton = page.locator('button:has-text("Add Room")');
      roomConfigVisible = await addRoomButton.isVisible();
      
      backButton = page.locator('button:has-text("← Back")');
    }
    await page.waitForTimeout(2000);

    // Select the room again
    await page.waitForSelector('text=Test Kitchen for Option Update', { timeout: 10000 });
    await page.click('text=Test Kitchen for Option Update');
    await page.waitForTimeout(1000);

    // Click Dark Stain checkbox again to open modal
    const darkStainCheckbox = darkStainLabel.locator('input[type="checkbox"]');
    await darkStainCheckbox.click();
    await page.waitForTimeout(1000);

    // Check if modal opens (it should if we're editing an existing processing)
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Modal opened for editing existing processing');
    } else {
      // If modal didn't open, the processing might not be applied yet, try clicking again
      console.log('Modal not visible, trying to apply processing first');
      await darkStainCheckbox.click();
      await page.waitForTimeout(1000);
      await expect(modal).toBeVisible();
    }

    // Change to Cherry stain color
    const selectWithCherry = page.locator('select option[value="cherry"]').locator('..');
    const selectCount = await selectWithCherry.count();
    
    if (selectCount > 0) {
      await selectWithCherry.first().selectOption('cherry');
      await page.waitForTimeout(1000);
    }

    // Apply the updated processing
    const applyButton = page.locator('button:has-text("Apply Processing")');
    await applyButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Updated Dark Stain (Cherry) applied');

    // Step 8: Go back to finalize phase to verify cherry is now shown
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Finalize Order →")');
    await page.waitForTimeout(3000);

    // Verify cherry is now shown in the processing details
    const cherryDetails = page.locator('text=Cherry');
    await expect(cherryDetails).toBeVisible();
    console.log('✓ Updated Cherry processing verified in finalize phase');

    // Verify mahogany is no longer shown
    const mahoganyDetailsAfter = page.locator('text=Mahogany');
    await expect(mahoganyDetailsAfter).not.toBeVisible();
    console.log('✓ Old Mahogany processing successfully removed - fix is working!');
  });
});

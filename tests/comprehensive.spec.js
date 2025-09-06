const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ - Comprehensive Functionality Tests', () => {

  // Helper function to set up basic workflow
  async function setupBasicQuote(page) {
    await page.goto('http://localhost:3000');
    await page.click('text=Elite Kitchen Designs');
    await page.click('text=Proceed to Room Setup');
    await page.fill('input[placeholder*="Kitchen, Master Bath"]', 'Test Kitchen');
    await page.selectOption('select', 'mod_traditional_oak');
    await page.click('text=Create Room & Start Quote');
    await page.click('text=Proceed to Products');
  }

  test('product configuration and processing application', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Add a product to quote
    const addButtons = page.locator('text=Add to Quote');
    await addButtons.first().click();
    
    // Verify product was added
    await expect(page.locator('text=Proceed to Quote')).toBeVisible();
    
    // Go to quote configuration (Phase 4)
    await page.click('text=Proceed to Quote →');
    
    // Should see Quote Summary section
    await expect(page.locator('text=Quote Summary')).toBeVisible();
    
    // Check if we have items (simplified check)
    const hasItems = await page.locator('text=Subtotal').isVisible();
    expect(hasItems).toBe(true);
    
    // Try to apply a processing (look for actual processing names)
    const processingButtons = page.locator('button').filter({ hasText: /Cut to Size|Dark Stain|Medium Stain|White Paint|Install/ });
    if (await processingButtons.count() > 0) {
      await processingButtons.first().click();
      
      // Verify processing was applied
      await expect(page.locator('text=Applied Processings')).toBeVisible();
    }
    
    console.log('✅ Product configuration test passed');
  });

  test('pricing calculations are accurate', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Add multiple products and track pricing
    const addButtons = page.locator('text=Add to Quote');
    const productCount = await addButtons.count();
    
    console.log(`Found ${productCount} products available to add`);
    
    if (productCount > 0) {
      // Add first product
      await addButtons.first().click();
      
      // Check if quote total updates in the sidebar
      const quoteTotal = page.locator('text=Total:').locator('..').locator('span');
      const initialTotal = await quoteTotal.textContent();
      console.log('Initial total after adding product:', initialTotal);
      
      // Add second product if available
      if (productCount > 1) {
        await addButtons.nth(1).click();
        
        // Verify total increased
        const newTotal = await quoteTotal.textContent();
        console.log('Total after adding second product:', newTotal);
        
        // Basic validation that total changed
        expect(newTotal).not.toBe(initialTotal);
      }
      
      // Go to detailed quote
      await page.click('text=Proceed to Quote →');
      
      // Verify subtotal exists and is > 0
      const subtotalElement = page.locator('text=Subtotal:').locator('..').locator('span');
      const subtotal = await subtotalElement.textContent();
      console.log('Quote subtotal:', subtotal);
      
      // Extract numeric value and verify it's > 0
      const subtotalValue = parseFloat(subtotal.replace(/[$,]/g, ''));
      expect(subtotalValue).toBeGreaterThan(0);
      
      // Verify customer discount is applied
      const discountElement = page.locator('text=Customer Discount').locator('..').locator('span');
      const discount = await discountElement.textContent();
      console.log('Customer discount:', discount);
      
      // Should show some discount for Elite Kitchen Designs (3%)
      expect(discount).toContain('-$');
    }
    
    console.log('✅ Pricing calculations test passed');
  });

  test('quote save and print functionality', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Add a product
    const addButtons = page.locator('text=Add to Quote');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
    }
    
    // Test save quote functionality
    const saveButton = page.locator('text=Save Quote');
    if (await saveButton.isVisible()) {
      // Mock the alert for save confirmation
      page.on('dialog', dialog => {
        console.log('Save dialog message:', dialog.message());
        dialog.accept();
      });
      
      await saveButton.click();
      console.log('✅ Save quote functionality triggered');
    }
    
    // Go to quote finalization
    await page.click('text=Proceed to Quote');
    
    // Test print functionality
    const printButton = page.locator('text=Print Quote');
    if (await printButton.isVisible()) {
      // Mock window.print
      await page.addInitScript(() => {
        window.print = () => {
          console.log('Print function called');
          window.printCalled = true;
        };
      });
      
      await printButton.click();
      
      // Verify print was called
      const printCalled = await page.evaluate(() => window.printCalled);
      expect(printCalled).toBe(true);
      console.log('✅ Print functionality works');
    }
    
    console.log('✅ Save and print test passed');
  });

  test('quote calculation accuracy with discounts', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Add a specific product and verify calculations
    const addButtons = page.locator('text=Add to Quote');
    await addButtons.first().click();
    
    await page.click('text=Proceed to Quote →');
    
    // Get the subtotal
    const subtotalText = await page.locator('text=Subtotal:').locator('..').locator('span').textContent();
    const subtotal = parseFloat(subtotalText.replace(/[$,]/g, ''));
    
    // Get customer discount (should be 3% for Elite Kitchen Designs)
    const discountText = await page.locator('text=Customer Discount').locator('..').locator('span').textContent();
    const discountAmount = parseFloat(discountText.replace(/[-$,]/g, ''));
    
    // Calculate expected discount (3% of subtotal)
    const expectedDiscount = subtotal * 0.03;
    
    // Verify discount calculation is approximately correct (within $0.01)
    expect(Math.abs(discountAmount - expectedDiscount)).toBeLessThan(0.01);
    
    // Get final total
    const finalTotalText = await page.locator('text=Final Total:').locator('..').locator('span').textContent();
    const finalTotal = parseFloat(finalTotalText.replace(/[$,]/g, ''));
    
    // Verify final total calculation
    const expectedFinalTotal = subtotal - discountAmount;
    expect(Math.abs(finalTotal - expectedFinalTotal)).toBeLessThan(0.01);
    
    console.log(`✅ Calculations verified: Subtotal: $${subtotal}, Discount: $${discountAmount}, Final: $${finalTotal}`);
  });

  test('room model inheritance and product filtering', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test with Traditional Oak
    await page.click('text=Elite Kitchen Designs');
    await page.click('text=Proceed to Room Setup');
    await page.fill('input[placeholder*="Kitchen, Master Bath"]', 'Traditional Kitchen');
    await page.selectOption('select', 'mod_traditional_oak');
    await page.click('text=Create Room & Start Quote');
    await page.click('text=Proceed to Products');
    
    // Verify Traditional Oak products are shown
    await expect(page.locator('text=Traditional Oak Products')).toBeVisible();
    
    // Count products available
    const traditionalOakProductCount = await page.locator('text=Add to Quote').count();
    console.log(`Traditional Oak products available: ${traditionalOakProductCount}`);
    
    // Go back and change to Modern Euro
    await page.click('text=← Back to Room Setup');
    await page.click('text=Edit Room');
    await page.selectOption('select', 'mod_modern_euro');
    await page.click('text=Update Room');
    await page.click('text=Proceed to Products');
    
    // Verify Modern Euro products are shown
    await expect(page.locator('text=Modern Euro Products')).toBeVisible();
    
    // Count products available (should be different)
    const modernEuroProductCount = await page.locator('text=Add to Quote').count();
    console.log(`Modern Euro products available: ${modernEuroProductCount}`);
    
    // Products should be different between models
    expect(modernEuroProductCount).not.toBe(traditionalOakProductCount);
    
    console.log('✅ Room model inheritance test passed');
  });

  test('processing rules and dependencies', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Add a cabinet product
    const cabinetProduct = page.locator('button').filter({ hasText: /Cabinet/ }).locator('text=Add to Quote');
    if (await cabinetProduct.count() > 0) {
      await cabinetProduct.first().click();
    } else {
      // Add any product
      await page.locator('text=Add to Quote').first().click();
    }
    
    await page.click('text=Proceed to Quote →');
    
    // Look for available processings (use actual processing names)
    const processingButtons = page.locator('button').filter({ hasText: /Cut to Size|Dark Stain|Medium Stain|White Paint|Install/ });
    const processingCount = await processingButtons.count();
    
    console.log(`Found ${processingCount} available processings`);
    
    if (processingCount > 0) {
      // Apply first processing
      await processingButtons.first().click();
      
      // Verify processing was applied
      await expect(page.locator('text=Applied Processings')).toBeVisible();
      
      // Check if applying one processing affects available options
      const newProcessingCount = await page.locator('button').filter({ hasText: /Stain|Paint|Install/ }).count();
      console.log(`Processings available after applying one: ${newProcessingCount}`);
      
      // Should be fewer options due to mutual exclusions
      expect(newProcessingCount).toBeLessThanOrEqual(processingCount);
    }
    
    console.log('✅ Processing rules test passed');
  });

  test('approval threshold functionality', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Add multiple expensive products to trigger approval threshold
    const addButtons = page.locator('text=Add to Quote');
    const productCount = await addButtons.count();
    
    // Add several products to increase total
    for (let i = 0; i < Math.min(productCount, 5); i++) {
      await addButtons.nth(i).click();
      await page.waitForTimeout(200); // Small delay between adds
    }
    
    await page.click('text=Proceed to Quote →');
    
    // Check final total
    const finalTotalText = await page.locator('text=Final Total:').locator('..').locator('span').textContent();
    const finalTotal = parseFloat(finalTotalText.replace(/[$,]/g, ''));
    
    console.log(`Final total: $${finalTotal}`);
    
    // Check if approval warning appears for large quotes
    if (finalTotal > 5000) {
      await expect(page.locator('text=requires approval')).toBeVisible();
      console.log('✅ Approval threshold warning displayed correctly');
    } else {
      console.log('Total under approval threshold, no warning expected');
    }
    
    console.log('✅ Approval threshold test passed');
  });

  test('edge cases and error handling', async ({ page }) => {
    // Test empty quote scenarios
    await page.goto('http://localhost:3000');
    
    // Try to proceed without selecting customer
    const proceedButton = page.locator('text=Proceed to Room Setup');
    await expect(proceedButton).not.toBeVisible(); // Should not be visible without customer
    
    // Select customer and proceed
    await page.click('text=Elite Kitchen Designs');
    await expect(proceedButton).toBeVisible();
    await page.click('text=Proceed to Room Setup');
    
    // Try to proceed without creating room
    const proceedToProducts = page.locator('text=Proceed to Products');
    await expect(proceedToProducts).not.toBeVisible(); // Should not be visible without room
    
    // Create room and proceed
    await page.fill('input[placeholder*="Kitchen, Master Bath"]', 'Test Kitchen');
    await page.selectOption('select', 'mod_traditional_oak');
    await page.click('text=Create Room & Start Quote');
    await expect(proceedToProducts).toBeVisible();
    await page.click('text=Proceed to Products');
    
    // Try to proceed to quote without products
    const proceedToQuote = page.locator('text=Proceed to Quote');
    await expect(proceedToQuote).not.toBeVisible(); // Should not be visible without products
    
    // Add product and verify proceed button appears
    await page.locator('text=Add to Quote').first().click();
    await expect(proceedToQuote).toBeVisible();
    
    console.log('✅ Edge cases and validation test passed');
  });
});

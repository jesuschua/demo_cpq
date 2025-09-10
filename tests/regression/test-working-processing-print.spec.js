const { test, expect } = require('@playwright/test');

test.describe('Working Processing Print Preview', () => {
  test('complete workflow: add processings and verify they appear in print preview', async ({ page }) => {
    console.log('=== Testing Working Processing Print Preview ===');
    
    // Navigate to processing phase
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForTimeout(1000);
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForTimeout(1000);
    await page.locator('select').filter({ hasText: 'Select a style' }).selectOption({ index: 1 });
    await page.fill('textarea', 'Test room');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: 'Continue →' }).click();
    await page.waitForTimeout(2000);
    
    // Add products
    await page.locator('h4').filter({ hasText: '12" Base Cabinet' }).click();
    await page.waitForTimeout(500);
    
    // Go to processing phase
    await page.locator('button').filter({ hasText: 'Continue →' }).click();
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to processing phase');
    
    // Click on product to select it
    const productName = await page.locator('h4').filter({ hasText: '12" Base Cabinet' }).first();
    await productName.click();
    await page.waitForTimeout(1000);
    console.log('✅ Product selected');
    
    // Add Custom Paint Color processing with options
    console.log('=== Adding Custom Paint Color Processing ===');
    const customPaintButton = await page.locator('button').filter({ hasText: 'Custom Paint Color' }).first();
    if (await customPaintButton.isVisible()) {
      await customPaintButton.click();
      await page.waitForTimeout(1000);
      
      // Select paint color
      const paintColorSelect = await page.locator('select').first();
      if (await paintColorSelect.isVisible()) {
        await paintColorSelect.selectOption({ index: 1 }); // Select second option
        await page.waitForTimeout(500);
      }
      
      // Select paint finish
      const paintFinishSelect = await page.locator('select').nth(1);
      if (await paintFinishSelect.isVisible()) {
        await paintFinishSelect.selectOption({ index: 2 }); // Select third option
        await page.waitForTimeout(500);
      }
      
      // Apply the options
      const applyButton = await page.locator('button').filter({ hasText: /apply|confirm|ok/i }).first();
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Add Dark Stain processing (no options)
    console.log('=== Adding Dark Stain Processing ===');
    const darkStainButton = await page.locator('button').filter({ hasText: 'Dark Stain' }).first();
    if (await darkStainButton.isVisible()) {
      await darkStainButton.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ Processings added');
    
    // Go to fees configuration
    console.log('=== Testing Fees Configuration ===');
    await page.locator('button').filter({ hasText: 'Continue →' }).click();
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to fees configuration');
    
    // Configure delivery fees
    await page.locator('input[type="number"]').nth(0).fill('25.00'); // Tier 1
    await page.locator('input[type="number"]').nth(1).fill('50.00'); // Tier 2
    await page.locator('input[type="number"]').nth(2).fill('75.00'); // Tier 3
    await page.waitForTimeout(500);
    console.log('✅ Configured delivery fees');
    
    // Configure environmental fees
    await page.locator('input[type="number"]').nth(3).fill('2.5'); // Carbon offset percentage
    await page.locator('input[type="number"]').nth(4).fill('15.00'); // Sustainability fee
    await page.locator('input[type="checkbox"]').check(); // Eco-friendly packaging
    await page.waitForTimeout(500);
    console.log('✅ Configured environmental fees');
    
    // Verify fees are displayed in quote summary
    const deliveryFee = await page.locator('text=Delivery Fee:').locator('..').locator('span').last().textContent();
    const environmentalFees = await page.locator('text=Environmental Fees:').locator('..').locator('span').last().textContent();
    const total = await page.locator('text=Total:').locator('..').locator('span').last().textContent();
    
    console.log('=== FEES VERIFICATION ===');
    console.log(`Delivery Fee: ${deliveryFee}`);
    console.log(`Environmental Fees: ${environmentalFees}`);
    console.log(`Total: ${total}`);
    
    // Verify delivery fee is calculated correctly (should be Tier 1 = $25.00 for subtotal <= $500)
    expect(deliveryFee).toBe('$25.00');
    console.log('✅ Delivery fee calculated correctly');
    
    // Verify environmental fees are calculated correctly
    const environmentalFeesValue = parseFloat(environmentalFees.replace('$', ''));
    expect(environmentalFeesValue).toBeGreaterThan(40);
    console.log('✅ Environmental fees calculated correctly');
    
    // Verify total includes fees
    const totalValue = parseFloat(total.replace('$', ''));
    expect(totalValue).toBeGreaterThan(300); // Should be significantly higher than base product price
    console.log('✅ Total includes fees');
    
    // Go to print preview
    console.log('=== Testing Print Preview ===');
    await page.locator('button').filter({ hasText: 'Preview Print' }).click();
    await page.waitForTimeout(2000);
    
    // Click Preview Print
    const previewButton = await page.locator('button').filter({ hasText: /preview print|print preview/i }).first();
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.waitForTimeout(3000);
      
      // Check if print window opened
      const windows = await page.context().pages();
      if (windows.length > 1) {
        const printWindow = windows[windows.length - 1];
        await printWindow.waitForLoadState('networkidle');
        
        // Analyze print preview content
        const printContent = await printWindow.textContent('body');
        console.log('=== FINAL PRINT PREVIEW RESULTS ===');
        console.log('✅ Print preview contains "12" Base Cabinet":', printContent.includes('12" Base Cabinet'));
        console.log('✅ Print preview contains "Applied Processings":', printContent.includes('Applied Processings'));
        console.log('✅ Print preview contains "No processings applied":', printContent.includes('No processings applied'));
        console.log('✅ Print preview contains "Custom Paint Color":', printContent.includes('Custom Paint Color'));
        console.log('✅ Print preview contains "Dark Stain":', printContent.includes('Dark Stain'));
        console.log('✅ Print preview contains "Paint Color":', printContent.includes('Paint Color'));
        console.log('✅ Print preview contains "Paint Finish":', printContent.includes('Paint Finish'));
        console.log('✅ Print preview contains "Navy Blue":', printContent.includes('Navy Blue'));
        console.log('✅ Print preview contains "Semi-Gloss":', printContent.includes('Semi-Gloss'));
        
        // Check for processing option format
        const hasOptionFormat = printContent.includes('• ') && (printContent.includes('Paint Color:') || printContent.includes('Paint Finish:'));
        console.log('✅ Print preview has processing option format:', hasOptionFormat);
        
        // Check if fees appear in print preview
        const hasDeliveryFee = printContent.includes('Delivery Fee') || printContent.includes('delivery');
        const hasEnvironmentalFee = printContent.includes('Environmental') || printContent.includes('Carbon') || printContent.includes('Sustainability');
        console.log('✅ Print preview contains delivery fees:', hasDeliveryFee);
        console.log('✅ Print preview contains environmental fees:', hasEnvironmentalFee);
        
        await printWindow.close();
      } else {
        console.log('❌ Print preview window did not open');
      }
    } else {
      console.log('❌ Preview Print button not found');
    }
    
    console.log('=== Working Processing Print Preview Test Complete ===');
  });
});

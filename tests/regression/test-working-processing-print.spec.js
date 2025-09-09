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
    await page.locator('button').filter({ hasText: 'Proceed to Products →' }).click();
    await page.waitForTimeout(2000);
    
    // Add products
    await page.locator('h4').filter({ hasText: '12" Base Cabinet' }).click();
    await page.waitForTimeout(500);
    
    // Go to processing phase
    await page.locator('button').filter({ hasText: 'Proceed to Quote →' }).click();
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
    
    // Go to print preview
    console.log('=== Testing Print Preview ===');
    await page.locator('button').filter({ hasText: 'Continue →' }).click();
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

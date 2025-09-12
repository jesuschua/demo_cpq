const { test, expect } = require('@playwright/test');

test.describe('Processing Workflow Investigation Step 3', () => {
  test('Add a processing and check if it appears in print preview', async ({ page }) => {
    console.log('🔍 Step 3: Adding a processing and checking print preview');
    
    // Load page and get to product configuration with product added
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(1000);
    await page.click('text=John Smith Construction');
    await page.waitForTimeout(1000);
    
    // Fill room details
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    await page.fill('textarea', 'Test Kitchen Room');
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    
    // Add a product
    const firstProduct = page.locator('text=12" Base Cabinet').first();
    await firstProduct.click();
    await page.waitForTimeout(1000);
    console.log('✅ Added 12" Base Cabinet');
    
    // Click on the product in the order to show processing options
    const clickableElements = await page.locator('text=12" Base Cabinet').all();
    if (clickableElements.length > 1) {
      await clickableElements[1].click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked on product in order to show processing options');
    }
    
    // Add a processing - try "Dark Stain" first
    const darkStainButton = page.locator('button:has-text("Add")').filter({ hasText: 'Dark Stain' }).first();
    if (await darkStainButton.isVisible()) {
      await darkStainButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Added Dark Stain processing');
    } else {
      // Try to find any "Add" button near "Dark Stain"
      const darkStainElement = page.locator('text=Dark Stain').first();
      const addButton = darkStainElement.locator('..').locator('button:has-text("Add")');
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Added Dark Stain processing via parent element');
      } else {
        console.log('❌ Could not find Add button for Dark Stain');
      }
    }
    
    // Take a screenshot after adding processing
    await page.screenshot({ path: 'processing-after-adding-dark-stain.png' });
    console.log('📸 Screenshot saved: processing-after-adding-dark-stain.png');
    
    // Look for the processing in the order
    const processingInOrder = await page.locator('text=Dark Stain').count();
    console.log(`🔧 Found ${processingInOrder} instances of "Dark Stain" in the order`);
    
    // Continue to Fees phase to check print preview
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    console.log('✅ Moved to Fees phase');
    
    // Click Preview Print
    const previewButton = page.locator('button:has-text("Preview Print")');
    await previewButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Preview Print');
    
    // Check if print window opened
    const windows = await page.context().pages();
    if (windows.length > 1) {
      const printWindow = windows[windows.length - 1];
      await printWindow.waitForLoadState('domcontentloaded');
      console.log('✅ Print window opened');
      
      // Take a screenshot of the print window
      await printWindow.screenshot({ path: 'processing-print-preview-with-dark-stain.png' });
      console.log('📸 Screenshot saved: processing-print-preview-with-dark-stain.png');
      
      // Check if Dark Stain appears in the print preview
      const darkStainInPrint = await printWindow.locator('text=Dark Stain').count();
      console.log(`🔧 Found ${darkStainInPrint} instances of "Dark Stain" in print preview`);
      
      // Get print content to analyze
      const printContent = await printWindow.textContent('body');
      console.log('📄 Print content (first 1000 chars):');
      console.log(printContent.substring(0, 1000));
      
      // Look for any processing-related text in print preview
      const processingInPrint = await printWindow.locator('text=/Processing|Stain|Finish|Cut|Size/').count();
      console.log(`🔧 Found ${processingInPrint} processing-related elements in print preview`);
      
      await printWindow.close();
      console.log('✅ Print window closed');
    } else {
      console.log('❌ No print window opened');
    }
    
    console.log('✅ Step 3 completed - processing and print preview test');
  });
});

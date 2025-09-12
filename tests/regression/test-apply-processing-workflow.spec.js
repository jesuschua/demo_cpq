const { test, expect } = require('@playwright/test');

test.describe('Apply Processing Workflow Test', () => {
  test('Complete workflow: add product → select product → configure processing → apply → check print preview', async ({ page }) => {
    console.log('🔍 Starting complete processing workflow test');
    
    // Step 1: Load page and get to product configuration
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Start New Quote');
    
    await page.click('text=John Smith Construction');
    await page.waitForTimeout(1000);
    console.log('✅ Selected customer');
    
    // Fill room details
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    await page.fill('textarea', 'Test Kitchen Room');
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(2000);
    console.log('✅ Created room');
    
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    console.log('✅ Moved to product configuration phase');
    
    // Step 2: Add a product
    const firstProduct = page.locator('text=12" Base Cabinet').first();
    await firstProduct.click();
    await page.waitForTimeout(1000);
    console.log('✅ Added 12" Base Cabinet');
    
    // Step 3: Click on the product in the order to select it
    const clickableElements = await page.locator('text=12" Base Cabinet').all();
    if (clickableElements.length > 1) {
      await clickableElements[1].click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked on product in order to select it');
    }
    
    // Step 4: Wait for Available Processing section to appear and check its content
    await page.waitForTimeout(2000);
    const availableProcessingSection = page.locator('text=Available Processing');
    const isVisible = await availableProcessingSection.isVisible();
    console.log(`🔧 Available Processing section visible: ${isVisible}`);
    
    if (isVisible) {
      // Get the full HTML of the Available Processing section
      const processingContainer = availableProcessingSection.locator('..');
      const containerHTML = await processingContainer.innerHTML();
      console.log('🔍 Available Processing container HTML:');
      console.log(containerHTML.substring(0, 1000)); // First 1000 chars
      
      // Look for any buttons in the processing section
      const buttons = processingContainer.locator('button');
      const buttonCount = await buttons.count();
      console.log(`🔘 Found ${buttonCount} buttons in Available Processing section`);
      
      // Look for processing items
      const processingItems = processingContainer.locator('text=/Dark Stain|Cut to Size|Medium Stain/');
      const processingCount = await processingItems.count();
      console.log(`🔧 Found ${processingCount} processing items`);
      
      // If we found buttons, try to click one
      if (buttonCount > 0) {
        console.log('🔧 Attempting to click first processing button');
        await buttons.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicked processing button');
        
        // Check if modal opened
        const modal = page.locator('text=/Configure|Apply Processing/');
        const modalVisible = await modal.isVisible();
        console.log(`🔧 Modal visible: ${modalVisible}`);
        
        if (modalVisible) {
          // Try to fill out modal and apply
          const selectElements = await page.locator('select').all();
          if (selectElements.length > 0) {
            await selectElements[0].selectOption('walnut');
            console.log('✅ Selected option in modal');
          }
          
          const applyButton = page.locator('button:has-text("Apply Processing")');
          if (await applyButton.isVisible()) {
            await applyButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Applied processing');
          }
        }
      }
    }
    
    // Step 5: Go to Fees phase and check print preview
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
      
      // Check if Dark Stain appears in the print preview
      const darkStainInPrint = await printWindow.locator('text=Dark Stain').count();
      console.log(`🔧 Found ${darkStainInPrint} instances of "Dark Stain" in print preview`);
      
      // Get print content to analyze
      const printContent = await printWindow.textContent('body');
      console.log('📄 Print content (first 2000 chars):');
      console.log(printContent.substring(0, 2000));
      
      // Look for any processing-related text in print preview
      const processingInPrint = await printWindow.locator('text=/Processing|Stain|Finish|Cut|Size/').count();
      console.log(`🔧 Found ${processingInPrint} processing-related elements in print preview`);
      
      await printWindow.close();
      console.log('✅ Print window closed');
    } else {
      console.log('❌ No print window opened');
    }
    
    console.log('✅ Complete processing workflow test completed');
  });
});

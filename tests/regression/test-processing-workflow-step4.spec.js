const { test, expect } = require('@playwright/test');

test.describe('Processing Workflow Investigation Step 4', () => {
  test('Investigate what processing elements appear in print preview', async ({ page }) => {
    console.log('🔍 Step 4: Investigating what processing elements appear in print preview');
    
    // Load page and get to product configuration with product and processing added
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
    
    // Add Dark Stain processing
    const darkStainElement = page.locator('text=Dark Stain').first();
    const addButton = darkStainElement.locator('..').locator('button:has-text("Add")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Added Dark Stain processing');
    }
    
    // Go to Fees phase and open print preview
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Preview Print")');
    await page.waitForTimeout(2000);
    
    const windows = await page.context().pages();
    if (windows.length > 1) {
      const printWindow = windows[windows.length - 1];
      await printWindow.waitForLoadState('domcontentloaded');
      console.log('✅ Print window opened');
      
      // Get the full print content
      const printContent = await printWindow.textContent('body');
      console.log('📄 Full print content:');
      console.log(printContent);
      
      // Look for all processing-related text
      const allProcessingText = await printWindow.locator('text=/Processing|Stain|Finish|Cut|Size|Dark|Light|LED|notch/').all();
      console.log(`🔧 Found ${allProcessingText.length} processing-related text elements:`);
      for (let i = 0; i < allProcessingText.length; i++) {
        const text = await allProcessingText[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      // Look for the product section specifically
      const productSections = await printWindow.locator('text=/12" Base Cabinet|Base Cabinet/').all();
      console.log(`🛍️ Found ${productSections.length} product-related text elements:`);
      for (let i = 0; i < productSections.length; i++) {
        const text = await productSections[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      // Look for any text that might contain processing information
      const allText = await printWindow.locator('*').all();
      console.log(`📝 Total elements in print preview: ${allText.length}`);
      
      // Look for specific patterns that might indicate processing
      const processingPatterns = [
        'Dark Stain',
        'Medium Stain', 
        'Cut to Size',
        'Cut notch',
        'LED Lighting',
        'Processing',
        'Applied',
        'Manual',
        'Inherited'
      ];
      
      for (const pattern of processingPatterns) {
        const count = await printWindow.locator(`text=${pattern}`).count();
        console.log(`🔍 Pattern "${pattern}": ${count} occurrences`);
      }
      
      await printWindow.close();
    }
    
    console.log('✅ Step 4 completed - print preview processing investigation');
  });
});

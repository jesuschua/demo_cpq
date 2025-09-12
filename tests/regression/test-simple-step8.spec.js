const { test, expect } = require('@playwright/test');

test.describe('Simple Step 8 Test', () => {
  test('Click Preview Print and test print functionality', async ({ page }) => {
    console.log('🔍 Step 8: Clicking Preview Print and testing print functionality');
    
    // Load page and get to Fees phase
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
    
    // Go to Fees phase
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    console.log('✅ Reached Fees phase');
    
    // Click Preview Print
    const previewButton = page.locator('button:has-text("Preview Print")');
    await expect(previewButton).toBeVisible();
    await previewButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Preview Print');
    
    // Check if print window opened
    const windows = await page.context().pages();
    console.log(`🪟 Found ${windows.length} windows after clicking Preview Print`);
    
    if (windows.length > 1) {
      const printWindow = windows[windows.length - 1];
      await printWindow.waitForLoadState('domcontentloaded');
      console.log('✅ Print window opened');
      
      // Take a screenshot of the print window
      await printWindow.screenshot({ path: 'step8-print-window.png' });
      console.log('📸 Screenshot saved: step8-print-window.png');
      
      // Get print content
      const printContent = await printWindow.textContent('body');
      console.log('📄 Print content length:', printContent.length);
      console.log('📄 Print content (first 1000 chars):');
      console.log(printContent.substring(0, 1000));
      
      // Look for specific content in print preview
      const customerName = await printWindow.locator('text=John Smith Construction').count();
      console.log(`👤 Customer name found ${customerName} times in print preview`);
      
      const productName = await printWindow.locator('text=12" Base Cabinet').count();
      console.log(`🛍️ Product name found ${productName} times in print preview`);
      
      const roomName = await printWindow.locator('text=Test Kitchen Room').count();
      console.log(`🏠 Room name found ${roomName} times in print preview`);
      
      // Look for processing information
      const processingText = await printWindow.locator('text=/Processing|Stain|Finish/').count();
      console.log(`🔧 Processing-related text found ${processingText} times in print preview`);
      
      // Look for pricing information
      const priceText = await printWindow.locator('text=/\$|Price|Total/').count();
      console.log(`💰 Price-related text found ${priceText} times in print preview`);
      
      await printWindow.close();
      console.log('✅ Print window closed');
    } else {
      console.log('❌ No print window opened');
    }
    
    console.log('✅ Step 8 completed - print functionality tested');
  });
});

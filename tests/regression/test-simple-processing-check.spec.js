const { test, expect } = require('@playwright/test');

test.describe('Simple Processing Check', () => {
  test('Check if AvailableProcessing component is rendered', async ({ page }) => {
    console.log('🔍 Simple check: Is AvailableProcessing component rendered?');
    
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
    
    // Look for the AvailableProcessing component container
    const availableProcessingContainer = page.locator('text=Available Processing').locator('..');
    const containerExists = await availableProcessingContainer.isVisible();
    console.log(`🔧 AvailableProcessing container visible: ${containerExists}`);
    
    if (containerExists) {
      // Get the full HTML of the container
      const containerHTML = await availableProcessingContainer.innerHTML();
      console.log('🔍 AvailableProcessing container HTML:');
      console.log(containerHTML);
      
      // Look for any buttons in the container
      const buttonsInContainer = availableProcessingContainer.locator('button');
      const buttonCount = await buttonsInContainer.count();
      console.log(`🔘 Found ${buttonCount} buttons in AvailableProcessing container`);
      
      // Look for processing items
      const processingItems = availableProcessingContainer.locator('text=/Dark Stain|Cut to Size|Medium Stain/');
      const processingCount = await processingItems.count();
      console.log(`🔧 Found ${processingCount} processing items in container`);
    }
    
    // Check for JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ JavaScript Error:', msg.text());
      }
    });
    
    // Wait a bit to catch any errors
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} JavaScript errors`);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    console.log('✅ Simple processing check completed');
  });
});

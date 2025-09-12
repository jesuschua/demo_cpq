const { test, expect } = require('@playwright/test');

test.describe('Processing Workflow Investigation', () => {
  test('Investigate processing workflow from product to print preview', async ({ page }) => {
    console.log('🔍 Investigating processing workflow');
    
    // Load page and get to product configuration
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
    console.log('✅ Reached product configuration');
    
    // Take a screenshot before adding product
    await page.screenshot({ path: 'processing-before-product.png' });
    console.log('📸 Screenshot saved: processing-before-product.png');
    
    // Add a product
    const firstProduct = page.locator('text=12" Base Cabinet').first();
    await firstProduct.click();
    await page.waitForTimeout(1000);
    console.log('✅ Added 12" Base Cabinet');
    
    // Take a screenshot after adding product
    await page.screenshot({ path: 'processing-after-product.png' });
    console.log('📸 Screenshot saved: processing-after-product.png');
    
    // Look for processing-related elements that might have appeared
    const processingElements = await page.locator('text=/Processing|Stain|Finish|Cut|Size|Dark|Light/').all();
    console.log(`🔧 Found ${processingElements.length} processing-related elements after adding product:`);
    for (let i = 0; i < processingElements.length; i++) {
      const text = await processingElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for buttons that might be related to processing
    const allButtons = await page.locator('button').all();
    console.log(`🔘 Found ${allButtons.length} buttons after adding product:`);
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for any new sections or panes that might have appeared
    const newSections = await page.locator('text=/Available|Processing|Options|Configure/').all();
    console.log(`📋 Found ${newSections.length} new section elements:`);
    for (let i = 0; i < newSections.length; i++) {
      const text = await newSections[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Get the full page content to see what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content after adding product (first 1000 chars):');
    console.log(pageContent.substring(0, 1000));
    
    console.log('✅ Processing workflow investigation completed');
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Simple Step 6 Test', () => {
  test('Add product and look for print preview', async ({ page }) => {
    console.log('🔍 Step 6: Adding product and looking for print preview');
    
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
    
    // Add a product
    const firstProduct = page.locator('text=12" Base Cabinet').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await page.waitForTimeout(1000);
    console.log('✅ Added 12" Base Cabinet');
    
    // Take a screenshot
    await page.screenshot({ path: 'step6-after-product.png' });
    console.log('📸 Screenshot saved: step6-after-product.png');
    
    // Explore what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content after adding product (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    // Find all buttons now
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons after adding product:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for print preview button
    const printButton = page.locator('button:has-text("Preview Print")');
    const printVisible = await printButton.isVisible();
    console.log(`🖨️ Print preview button visible: ${printVisible}`);
    
    // Look for other potential print buttons
    const printButtons = await page.locator('button:has-text("Print"), button:has-text("Preview"), button:has-text("Generate")').all();
    console.log(`🖨️ Found ${printButtons.length} print-related buttons:`);
    for (let i = 0; i < printButtons.length; i++) {
      const text = await printButtons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for continue/next buttons
    const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Finish"), button:has-text("Complete")').all();
    console.log(`➡️ Found ${continueButtons.length} continue-related buttons:`);
    for (let i = 0; i < continueButtons.length; i++) {
      const text = await continueButtons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for workflow phases
    const phaseElements = await page.locator('text=/Phase|Customer|Room|Product|Fee|Configuration/').all();
    console.log(`📋 Found ${phaseElements.length} workflow phase elements:`);
    for (let i = 0; i < phaseElements.length; i++) {
      const text = await phaseElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    console.log('✅ Step 6 completed - product added and explored');
  });
});

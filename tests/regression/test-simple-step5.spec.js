const { test, expect } = require('@playwright/test');

test.describe('Simple Step 5 Test', () => {
  test('Click Continue and explore product configuration', async ({ page }) => {
    console.log('🔍 Step 5: Clicking Continue and exploring product configuration');
    
    // Load page and get to room configuration
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
    console.log('✅ Room created');
    
    // Click Continue to move to next phase
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Continue');
    
    // Take a screenshot
    await page.screenshot({ path: 'step5-product-config.png' });
    console.log('📸 Screenshot saved: step5-product-config.png');
    
    // Explore what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content in product configuration (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    // Find all buttons now
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons in product config:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for product elements
    const productElements = await page.locator('text=/Base Cabinet|Wall Cabinet|Pantry|Cabinet|Product|Add|Remove/').all();
    console.log(`🛍️ Found ${productElements.length} product-related elements:`);
    for (let i = 0; i < productElements.length; i++) {
      const text = await productElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for workflow phases
    const phaseElements = await page.locator('text=/Phase|Customer|Room|Product|Fee|Configuration/').all();
    console.log(`📋 Found ${phaseElements.length} workflow phase elements:`);
    for (let i = 0; i < phaseElements.length; i++) {
      const text = await phaseElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for print preview button
    const printButton = page.locator('button:has-text("Preview Print")');
    const printVisible = await printButton.isVisible();
    console.log(`🖨️ Print preview button visible: ${printVisible}`);
    
    console.log('✅ Step 5 completed - product configuration explored');
  });
});

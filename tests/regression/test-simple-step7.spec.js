const { test, expect } = require('@playwright/test');

test.describe('Simple Step 7 Test', () => {
  test('Click Continue to Fees phase and look for print preview', async ({ page }) => {
    console.log('🔍 Step 7: Clicking Continue to Fees phase and looking for print preview');
    
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
    console.log('✅ Product added');
    
    // Click Continue to move to Fees phase
    await page.click('button:has-text("Continue →")');
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Continue to Fees phase');
    
    // Take a screenshot
    await page.screenshot({ path: 'step7-fees-phase.png' });
    console.log('📸 Screenshot saved: step7-fees-phase.png');
    
    // Explore what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content in Fees phase (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    // Find all buttons now
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons in Fees phase:`);
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
    
    // Look for workflow phases
    const phaseElements = await page.locator('text=/Phase|Customer|Room|Product|Fee|Configuration/').all();
    console.log(`📋 Found ${phaseElements.length} workflow phase elements:`);
    for (let i = 0; i < phaseElements.length; i++) {
      const text = await phaseElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for any text that might indicate we're at the end
    const endTexts = await page.locator('text=/Complete|Finish|Final|Summary|Quote|Total/').all();
    console.log(`🏁 Found ${endTexts.length} end-related text elements:`);
    for (let i = 0; i < endTexts.length; i++) {
      const text = await endTexts[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    console.log('✅ Step 7 completed - Fees phase explored');
  });
});

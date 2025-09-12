const { test, expect } = require('@playwright/test');

test.describe('Step-by-Step UI Discovery', () => {
  test('Step 3: Click on customer and explore changes', async ({ page }) => {
    console.log('🔍 Step 3: Clicking on customer and exploring changes');
    
    // Load page and get to customer selection
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(1000);
    console.log('✅ Reached customer selection');
    
    // Click on first customer
    const firstCustomer = page.locator('text=John Smith Construction').first();
    await expect(firstCustomer).toBeVisible();
    await firstCustomer.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked on John Smith Construction');
    
    // Take a screenshot
    await page.screenshot({ path: 'step3-after-customer.png' });
    console.log('📸 Screenshot saved: step3-after-customer.png');
    
    // Explore what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content after customer selection (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    // Find all buttons now
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons after customer selection:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for workflow phases
    const phaseElements = await page.locator('text=/Phase|Customer|Room|Product|Fee|Configuration/').all();
    console.log(`📋 Found ${phaseElements.length} workflow phase elements:`);
    for (let i = 0; i < phaseElements.length; i++) {
      const text = await phaseElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for form elements
    const selects = await page.locator('select').all();
    console.log(`📝 Found ${selects.length} select elements:`);
    for (let i = 0; i < selects.length; i++) {
      const options = await selects[i].locator('option').all();
      console.log(`  Select ${i + 1} has ${options.length} options`);
    }
    
    // Look for textareas
    const textareas = await page.locator('textarea').all();
    console.log(`📄 Found ${textareas.length} textarea elements`);
    
    console.log('✅ Step 3 completed - post customer selection explored');
  });
});

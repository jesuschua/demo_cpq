const { test, expect } = require('@playwright/test');

test.describe('Simple Step 4 Test', () => {
  test('Fill room form and explore changes', async ({ page }) => {
    console.log('🔍 Step 4: Filling room form and exploring changes');
    
    // Load page and get to room configuration
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(1000);
    await page.click('text=John Smith Construction');
    await page.waitForTimeout(1000);
    console.log('✅ Reached room configuration');
    
    // Fill room details using different approach
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('Kitchen');
    console.log('✅ Selected Kitchen room type');
    
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption('mod_traditional_oak');
    console.log('✅ Selected Traditional Oak style');
    
    await page.fill('textarea', 'Test Kitchen Room');
    console.log('✅ Filled room description');
    
    // Click create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Create Room & Start Quote');
    
    // Take a screenshot
    await page.screenshot({ path: 'step4-after-room.png' });
    console.log('📸 Screenshot saved: step4-after-room.png');
    
    // Explore what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content after room creation (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    // Find all buttons now
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons after room creation:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for product elements
    const productElements = await page.locator('text=/Base Cabinet|Wall Cabinet|Pantry|Cabinet|Product/').all();
    console.log(`🛍️ Found ${productElements.length} product-related elements:`);
    for (let i = 0; i < productElements.length; i++) {
      const text = await productElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for print preview button
    const printButton = page.locator('button:has-text("Preview Print")');
    const printVisible = await printButton.isVisible();
    console.log(`🖨️ Print preview button visible: ${printVisible}`);
    
    console.log('✅ Step 4 completed - post room creation explored');
  });
});

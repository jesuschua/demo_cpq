const { test, expect } = require('@playwright/test');

test.describe('Step-by-Step UI Discovery', () => {
  test('Step 2: Click Start New Quote and explore changes', async ({ page }) => {
    console.log('🔍 Step 2: Clicking Start New Quote and exploring changes');
    
    // Load the page first
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    // Click Start New Quote
    const startButton = page.locator('button:has-text("Start New Quote")');
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForTimeout(1000); // Short wait
    console.log('✅ Clicked Start New Quote');
    
    // Take a screenshot
    await page.screenshot({ path: 'step2-after-start.png' });
    console.log('📸 Screenshot saved: step2-after-start.png');
    
    // Explore what changed
    const pageContent = await page.textContent('body');
    console.log('📄 Page content after Start New Quote (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    // Find all buttons now
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons after Start New Quote:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for customer names
    const customerNames = await page.locator('text=/John|Smith|Construction|Elite|Kitchen|Designs|Mike|Johnson|Premier|Remodeling|Sarah|Wilson/').all();
    console.log(`👤 Found ${customerNames.length} customer name elements:`);
    for (let i = 0; i < customerNames.length; i++) {
      const text = await customerNames[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for any new text elements
    const newTexts = await page.locator('text=/Phase|Customer|Room|Product|Fee|Configuration/').all();
    console.log(`📝 Found ${newTexts.length} workflow-related text elements:`);
    for (let i = 0; i < newTexts.length; i++) {
      const text = await newTexts[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    console.log('✅ Step 2 completed - post Start New Quote explored');
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Step-by-Step UI Discovery', () => {
  test('Step 1: Load page and explore initial state', async ({ page }) => {
    console.log('🔍 Step 1: Loading page and exploring initial state');
    
    // Load the page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    // Take a screenshot
    await page.screenshot({ path: 'step1-initial.png' });
    console.log('📸 Screenshot saved: step1-initial.png');
    
    // Get page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Find all text elements that might be clickable
    const clickableTexts = await page.locator('text=/Start|New|Quote|Customer|John|Smith|Construction/').all();
    console.log(`📝 Found ${clickableTexts.length} potentially clickable text elements:`);
    for (let i = 0; i < clickableTexts.length; i++) {
      const text = await clickableTexts[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Get a sample of page content
    const pageContent = await page.textContent('body');
    console.log('📄 Page content (first 500 chars):');
    console.log(pageContent.substring(0, 500));
    
    console.log('✅ Step 1 completed - initial state explored');
  });
});

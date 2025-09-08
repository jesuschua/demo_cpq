const { test, expect } = require('@playwright/test');

test.describe('Debug Button Details', () => {
  test('debug button details and click behavior', async ({ page }) => {
    console.log('🚀 Starting debug button details test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 3: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 4: Fill room form
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption({ index: 1 }); // Select "Bathroom"
    console.log('✅ Room type selected');
    
    const modelSelect = page.locator('select').nth(1);
    await modelSelect.selectOption({ index: 1 }); // Select first model
    const selectedModelValue = await modelSelect.inputValue();
    console.log('✅ Model selected:', selectedModelValue);
    
    // Fill dimensions
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    console.log('✅ Dimensions filled');
    
    // Step 5: Find all buttons with "Create Room" text
    const createButtons = page.locator('button:has-text("Create Room")');
    const createButtonCount = await createButtons.count();
    console.log(`🔍 Found ${createButtonCount} buttons with "Create Room" text`);
    
    for (let i = 0; i < createButtonCount; i++) {
      const button = createButtons.nth(i);
      const buttonText = await button.textContent();
      const isDisabled = await button.isDisabled();
      const isVisible = await button.isVisible();
      console.log(`  Button ${i}: "${buttonText}", disabled: ${isDisabled}, visible: ${isVisible}`);
    }
    
    // Step 6: Find the specific "Create Room & Start Quote" button
    const specificButton = page.locator('button:has-text("Create Room & Start Quote")');
    const specificCount = await specificButton.count();
    console.log(`🔍 Found ${specificCount} "Create Room & Start Quote" buttons`);
    
    if (specificCount > 0) {
      const button = specificButton.first();
      const buttonText = await button.textContent();
      const isDisabled = await button.isDisabled();
      const isVisible = await button.isVisible();
      console.log(`🔍 Specific button: "${buttonText}", disabled: ${isDisabled}, visible: ${isVisible}`);
      
      // Step 7: Try to click the button
      if (!isDisabled && isVisible) {
        console.log('🖱️ Clicking the specific button...');
        await button.click();
        await page.waitForTimeout(1000);
        console.log('✅ Button clicked');
        
        // Step 8: Check if anything changed
        const pageText = await page.textContent('body');
        console.log('🔍 Page contains "Phase 2":', pageText.includes('Phase 2'));
        console.log('🔍 Page contains "Configure Room":', pageText.includes('Configure Room'));
        console.log('🔍 Page contains "Proceed to Products":', pageText.includes('Proceed to Products'));
      } else {
        console.log('❌ Button is disabled or not visible');
      }
    } else {
      console.log('❌ No "Create Room & Start Quote" button found');
    }
    
    // Step 9: Take screenshot
    await page.screenshot({ path: 'debug-button-details.png' });
    
    console.log('🏁 Test completed');
  });
});

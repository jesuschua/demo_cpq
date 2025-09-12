const { test, expect } = require('@playwright/test');

test.describe('Debug Processing Click', () => {
  test('Debug the processing Add button click', async ({ page }) => {
    console.log('🔍 Debug: Testing processing Add button click');
    
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
    
    // Check what phase we're in
    const phaseElements = await page.locator('text=/Phase [0-9]/').all();
    console.log(`📋 Found ${phaseElements.length} phase elements:`);
    for (let i = 0; i < phaseElements.length; i++) {
      const text = await phaseElements[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'debug-processing-state.png' });
    console.log('📸 Screenshot saved: debug-processing-state.png');
    
    // Look for all Add and Configure buttons
    const allAddButtons = await page.locator('button:has-text("Add")').all();
    const allConfigureButtons = await page.locator('button:has-text("Configure")').all();
    console.log(`🔘 Found ${allAddButtons.length} Add buttons and ${allConfigureButtons.length} Configure buttons on the page`);
    
    // Look for Available Processing section
    const availableProcessingElements = await page.locator('text=Available Processing').all();
    console.log(`🔧 Found ${availableProcessingElements.length} "Available Processing" elements`);
    
    // Look for Dark Stain specifically
    const darkStainElements = await page.locator('text=Dark Stain').all();
    console.log(`🔧 Found ${darkStainElements.length} Dark Stain elements`);
    
    // Try to find the Configure button near Dark Stain
    const darkStainElement = page.locator('text=Dark Stain').first();
    if (await darkStainElement.isVisible()) {
      console.log('✅ Dark Stain element is visible');
      
      // Get the HTML content around Dark Stain to see the structure
      const darkStainHTML = await darkStainElement.locator('..').innerHTML();
      console.log('🔍 Dark Stain parent HTML:', darkStainHTML.substring(0, 500));
      
      // Look for Configure button in the same container
      const parentElement = darkStainElement.locator('..');
      const configureButtonInParent = parentElement.locator('button:has-text("Configure")');
      const configureButtonCount = await configureButtonInParent.count();
      console.log(`🔘 Found ${configureButtonCount} Configure buttons in Dark Stain parent`);
      
      // Also look for any buttons in the parent
      const allButtonsInParent = parentElement.locator('button');
      const allButtonCount = await allButtonsInParent.count();
      console.log(`🔘 Found ${allButtonCount} total buttons in Dark Stain parent`);
      
      if (configureButtonCount > 0) {
        console.log('✅ Found Configure button for Dark Stain, clicking...');
        await configureButtonInParent.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicked Configure button for Dark Stain');
        
        // Take another screenshot
        await page.screenshot({ path: 'debug-after-configure-click.png' });
        console.log('📸 Screenshot saved: debug-after-configure-click.png');
      } else {
        console.log('❌ No Configure button found in Dark Stain parent');
      }
    } else {
      console.log('❌ Dark Stain element not visible');
    }
    
    // Check browser console for any errors or our debug logs
    const logs = [];
    page.on('console', msg => {
      console.log('📝 Browser console:', msg.type(), msg.text());
      if (msg.type() === 'log' && msg.text().includes('🔧')) {
        logs.push(msg.text());
      }
    });
    
    console.log('✅ Debug test completed');
  });
});

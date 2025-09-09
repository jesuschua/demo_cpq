const { test, expect } = require('@playwright/test');

test.describe('Debug Processing Options', () => {
  test('navigate through app and test processing options', async ({ page }) => {
    console.log('=== Debug Processing Options Test ===');
    
    // Navigate to app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'debug-1-initial.png' });
    
    // Check for debug panel
    const debugPanel = page.locator('text=DEBUG PANEL');
    if (await debugPanel.isVisible()) {
      console.log('✅ DEBUG PANEL FOUND!');
      await page.screenshot({ path: 'debug-1a-debug-panel.png' });
    } else {
      console.log('❌ DEBUG PANEL NOT FOUND');
    }
    
    // Start new quote
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-2-customers.png' });
    
    // Select customer
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-3-room-config.png' });
    
    // Fill room form
    await page.locator('select').filter({ hasText: 'Select a style' }).selectOption({ index: 1 });
    await page.fill('textarea', 'Test room');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-4-products.png' });
    
    // Add a product
    const addButtons = await page.locator('button').filter({ hasText: 'Add to Quote' }).all();
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'debug-5-after-add-product.png' });
    }
    
    // Look for processing options in the product phase
    console.log('=== Looking for processing options in product phase ===');
    const processingElements = await page.locator('text=processing').all();
    console.log(`Found ${processingElements.length} elements with "processing" text`);
    
    const optionElements = await page.locator('text=option').all();
    console.log(`Found ${optionElements.length} elements with "option" text`);
    
    const colorElements = await page.locator('text=color').all();
    console.log(`Found ${colorElements.length} elements with "color" text`);
    
    // Look for any modals
    const modals = await page.locator('[role="dialog"], .modal, [class*="modal"]').all();
    console.log(`Found ${modals.length} modal elements`);
    
    // Look for any buttons that might trigger processing options
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} total buttons`);
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const text = await allButtons[i].textContent();
      if (text && (text.includes('processing') || text.includes('option') || text.includes('color') || text.includes('paint'))) {
        console.log(`Relevant button ${i}: "${text}"`);
      }
    }
    
    // Check if we can proceed to quote finalize phase
    const nextPhaseButton = page.locator('button').filter({ hasText: 'Next' });
    if (await nextPhaseButton.isVisible()) {
      console.log('✅ Next phase button found, clicking...');
      await nextPhaseButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-6-quote-finalize.png' });
      
      // Look for processing options in quote finalize phase
      console.log('=== Looking for processing options in quote finalize phase ===');
      const processingElements2 = await page.locator('text=processing').all();
      console.log(`Found ${processingElements2.length} elements with "processing" text`);
      
      const optionElements2 = await page.locator('text=option').all();
      console.log(`Found ${optionElements2.length} elements with "option" text`);
      
      const colorElements2 = await page.locator('text=color').all();
      console.log(`Found ${colorElements2.length} elements with "color" text`);
      
      // Look for any buttons that might trigger processing options
      const allButtons2 = await page.locator('button').all();
      console.log(`Found ${allButtons2.length} total buttons in quote finalize phase`);
      for (let i = 0; i < Math.min(allButtons2.length, 10); i++) {
        const text = await allButtons2[i].textContent();
        if (text && (text.includes('processing') || text.includes('option') || text.includes('color') || text.includes('paint'))) {
          console.log(`Relevant button ${i}: "${text}"`);
        }
      }
    } else {
      console.log('❌ Next phase button not found');
    }
    
    // Check page content for any processing-related text
    const pageContent = await page.textContent('body');
    if (pageContent.includes('processing') || pageContent.includes('option') || pageContent.includes('color')) {
      console.log('✅ Found processing-related text in page content');
    } else {
      console.log('❌ No processing-related text found in page content');
    }
    
    console.log('=== Debug Complete ===');
  });
});

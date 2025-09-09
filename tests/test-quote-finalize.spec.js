const { test, expect } = require('@playwright/test');

test.describe('Test Quote Finalize Phase', () => {
  test('navigate to quote finalize and test processing options', async ({ page }) => {
    console.log('=== Test Quote Finalize Phase ===');
    
    // Navigate to app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'finalize-1-initial.png' });
    
    // Start new quote
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'finalize-2-customers.png' });
    
    // Select customer
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'finalize-3-room-config.png' });
    
    // Fill room form
    await page.locator('select').filter({ hasText: 'Select a style' }).selectOption({ index: 1 });
    await page.fill('textarea', 'Test room');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'finalize-4-products.png' });
    
    // Add a product
    const addButtons = await page.locator('button').filter({ hasText: 'Add to Quote' }).all();
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'finalize-5-after-add-product.png' });
    }
    
    // Look for phase progression buttons
    const phaseButtons = await page.locator('button').all();
    console.log(`Found ${phaseButtons.length} buttons in product phase`);
    for (let i = 0; i < phaseButtons.length; i++) {
      const text = await phaseButtons[i].textContent();
      if (text && (text.includes('Next') || text.includes('Phase') || text.includes('Finalize') || text.includes('Quote'))) {
        console.log(`Phase button ${i}: "${text}"`);
      }
    }
    
    // Try to find and click any button that might advance to quote finalize
    const nextButton = page.locator('button').filter({ hasText: 'Next' });
    const finalizeButton = page.locator('button').filter({ hasText: 'Finalize' });
    const quoteButton = page.locator('button').filter({ hasText: 'Quote' });
    
    if (await nextButton.isVisible()) {
      console.log('✅ Next button found, clicking...');
      await nextButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'finalize-6-after-next.png' });
    } else if (await finalizeButton.isVisible()) {
      console.log('✅ Finalize button found, clicking...');
      await finalizeButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'finalize-6-after-finalize.png' });
    } else if (await quoteButton.isVisible()) {
      console.log('✅ Quote button found, clicking...');
      await quoteButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'finalize-6-after-quote.png' });
    } else {
      console.log('❌ No phase progression buttons found');
    }
    
    // Look for processing options in current phase
    console.log('=== Looking for processing options ===');
    const processingElements = await page.locator('text=processing').all();
    console.log(`Found ${processingElements.length} elements with "processing" text`);
    
    const optionElements = await page.locator('text=option').all();
    console.log(`Found ${optionElements.length} elements with "option" text`);
    
    const colorElements = await page.locator('text=color').all();
    console.log(`Found ${colorElements.length} elements with "color" text`);
    
    const paintElements = await page.locator('text=paint').all();
    console.log(`Found ${paintElements.length} elements with "paint" text`);
    
    // Look for any buttons that might trigger processing options
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} total buttons in current phase`);
    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      const text = await allButtons[i].textContent();
      if (text && (text.includes('processing') || text.includes('option') || text.includes('color') || text.includes('paint') || text.includes('Custom'))) {
        console.log(`Relevant button ${i}: "${text}"`);
      }
    }
    
    // Check page content for processing-related text
    const pageContent = await page.textContent('body');
    if (pageContent.includes('processing') || pageContent.includes('option') || pageContent.includes('color') || pageContent.includes('paint')) {
      console.log('✅ Found processing-related text in page content');
      console.log('Content preview:', pageContent.substring(0, 500));
    } else {
      console.log('❌ No processing-related text found in page content');
    }
    
    console.log('=== Test Complete ===');
  });
});

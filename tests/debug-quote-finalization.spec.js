const { test, expect } = require('@playwright/test');

test.describe('Debug Quote Finalization', () => {
  test('debug quote finalization and processing options', async ({ page }) => {
    console.log('🚀 Starting debug quote finalization test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Capture ALL console messages
    page.on('console', msg => {
      console.log(`🔧 Console [${msg.type()}]:`, msg.text());
    });
    
    // Step 3: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 4: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 5: Fill room form
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
    
    // Step 6: Click "Create Room & Start Quote"
    const createButton = page.locator('button:has-text("Create Room & Start Quote")');
    await createButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 7: Click "Proceed to Products"
    const proceedButton = page.locator('button:has-text("Proceed to Products")');
    await proceedButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Proceeded to products');
    
    // Step 8: Add a product
    const productCards = page.locator('div:has-text("Available Products") div[class*="border border-gray-200"]');
    const cardCount = await productCards.count();
    console.log(`🔍 Found ${cardCount} product cards`);
    
    if (cardCount > 0) {
      const firstCard = productCards.first();
      const productName = await firstCard.locator('h4').textContent();
      console.log(`🔍 First product: "${productName}"`);
      
      // Click on the first product
      console.log('🖱️ Clicking on first product...');
      await firstCard.click();
      await page.waitForTimeout(1000);
      console.log('✅ Product clicked');
    }
    
    // Step 9: Look for "Proceed to Quote" button
    const proceedToQuoteButton = page.locator('button:has-text("Proceed to Quote")');
    const proceedToQuoteCount = await proceedToQuoteButton.count();
    console.log(`🔍 Found ${proceedToQuoteCount} "Proceed to Quote" buttons`);
    
    if (proceedToQuoteCount > 0) {
      console.log('🖱️ Clicking "Proceed to Quote" button...');
      await proceedToQuoteButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Proceeded to quote finalization');
      
      // Step 10: Check if we're in Phase 4
      const pageText = await page.textContent('body');
      console.log('🔍 Page contains "Phase 4":', pageText.includes('Phase 4'));
      console.log('🔍 Page contains "Quote Finalization":', pageText.includes('Quote Finalization'));
      console.log('🔍 Page contains "Finalize Quote":', pageText.includes('Finalize Quote'));
      
      // Step 11: Look for processing options or quote builder
      console.log('🔍 Page contains "Available Processings":', pageText.includes('Available Processings'));
      console.log('🔍 Page contains "Cut to Size":', pageText.includes('Cut to Size'));
      console.log('🔍 Page contains "Processing Options":', pageText.includes('Processing Options'));
      
      // Step 12: Look for any buttons that might be related to processing
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`🔍 Found ${buttonCount} total buttons in quote finalization`);
      
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        if (buttonText && (buttonText.includes('Processing') || buttonText.includes('Configure') || buttonText.includes('Options'))) {
          console.log(`  Processing-related button ${i}: "${buttonText}"`);
        }
      }
      
      // Step 13: Take screenshot
      await page.screenshot({ path: 'debug-quote-finalization.png' });
      
    } else {
      console.log('❌ "Proceed to Quote" button not found');
      
      // Check what buttons are available
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`🔍 Found ${buttonCount} total buttons in product config`);
      
      for (let i = 0; i < Math.min(buttonCount, 15); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
      }
    }
    
    console.log('🏁 Test completed');
  });
});

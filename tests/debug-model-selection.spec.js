const { test, expect } = require('@playwright/test');

test.describe('Debug Model Selection', () => {
  test('debug model selection and product filtering', async ({ page }) => {
    console.log('🚀 Starting debug model selection test...');
    
    // Step 1: Load the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');
    
    // Step 2: Check for console errors and logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      } else if (msg.text().includes('🔧') || msg.text().includes('selectedModel') || msg.text().includes('filteredProducts')) {
        console.log('🔧 Debug log:', msg.text());
      }
    });
    
    // Step 3: Start new quote
    await page.click('text=Start New Quote');
    await page.waitForSelector('text=Elite Kitchen Designs');
    console.log('✅ Customer selection visible');
    
    // Step 4: Select customer
    await page.click('text=Elite Kitchen Designs');
    await page.waitForSelector('button:has-text("Create Room & Start Quote")');
    console.log('✅ Customer selected');
    
    // Step 5: Check what room types are available
    const roomTypeSelect = page.locator('select').first();
    const roomTypeOptions = await roomTypeSelect.locator('option').allTextContents();
    console.log('🏠 Available room types:', roomTypeOptions);
    
    // Step 6: Select room type
    await roomTypeSelect.selectOption({ index: 1 }); // Select "Bathroom"
    console.log('✅ Room type selected: Bathroom');
    
    // Step 7: Check what models are available
    const modelSelect = page.locator('select').nth(1);
    const modelOptions = await modelSelect.locator('option').allTextContents();
    console.log('🎨 Available models:', modelOptions);
    
    // Step 8: Select model
    await modelSelect.selectOption({ index: 1 }); // Select first model
    const selectedModelText = await modelSelect.inputValue();
    console.log('✅ Model selected:', selectedModelText);
    
    // Step 9: Fill dimensions
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    console.log('✅ Dimensions filled');
    
    // Step 10: Create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Room created');
    
    // Step 11: Navigate to products
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to products');
    
    // Step 12: Take screenshot of product view
    await page.screenshot({ path: 'debug-model-1-product-view.png' });
    
    // Step 13: Check if there's a model selector in the product view
    const modelSelectors = page.locator('select');
    const modelSelectorCount = await modelSelectors.count();
    console.log(`🔍 Found ${modelSelectorCount} select elements in product view`);
    
    if (modelSelectorCount > 0) {
      for (let i = 0; i < modelSelectorCount; i++) {
        const selector = modelSelectors.nth(i);
        const options = await selector.locator('option').allTextContents();
        const selectedValue = await selector.inputValue();
        console.log(`  Selector ${i}: selected="${selectedValue}", options=[${options.join(', ')}]`);
      }
    }
    
    // Step 14: Look for any product-related text
    const productTexts = await page.locator('text=/product/i').allTextContents();
    console.log('🔍 Product-related text found:', productTexts);
    
    // Step 15: Look for any cabinet-related text
    const cabinetTexts = await page.locator('text=/cabinet/i').allTextContents();
    console.log('🔍 Cabinet-related text found:', cabinetTexts);
    
    // Step 16: Check if there are any product cards or items
    const productCards = page.locator('[class*="product"], [class*="card"], [class*="item"]');
    const cardCount = await productCards.count();
    console.log(`🔍 Found ${cardCount} potential product cards`);
    
    // Step 17: Look for "Add to Quote" buttons
    const addToQuoteButtons = page.locator('button:has-text("Add to Quote")');
    const addToQuoteCount = await addToQuoteButtons.count();
    console.log(`🔍 Found ${addToQuoteCount} "Add to Quote" buttons`);
    
    // Step 18: Look for any buttons that might be product-related
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔍 Found ${buttonCount} total buttons in product view`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      if (buttonText && (buttonText.includes('Add') || buttonText.includes('Quote') || buttonText.includes('Product') || buttonText.includes('Cabinet'))) {
        console.log(`  Product-related button ${i}: "${buttonText}"`);
      }
    }
    
    // Step 19: Check the page title and any headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    console.log(`🔍 Found ${headingCount} headings`);
    
    for (let i = 0; i < headingCount; i++) {
      const headingText = await headings.nth(i).textContent();
      console.log(`  Heading ${i}: "${headingText}"`);
    }
    
    console.log('🏁 Test completed');
  });
});

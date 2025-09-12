const { test, expect } = require('@playwright/test');

test.describe('Processing Workflow Investigation Step 2', () => {
  test('Click on product in order to see processing options', async ({ page }) => {
    console.log('🔍 Step 2: Clicking on product in order to see processing options');
    
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
    
    // Look for the product in the order (should be in "Your Order" or similar section)
    const orderSections = await page.locator('text=/Your Order|Order|Selected|Added/').all();
    console.log(`📦 Found ${orderSections.length} order-related sections:`);
    for (let i = 0; i < orderSections.length; i++) {
      const text = await orderSections[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Look for the product name in the order area
    const productInOrder = page.locator('text=12" Base Cabinet').all();
    const productInOrderCount = await productInOrder.length;
    console.log(`🛍️ Found ${productInOrderCount} instances of "12" Base Cabinet" on the page`);
    
    // Try to click on the product in the order area (not the available products)
    const productCards = await page.locator('.product-card, [class*="product"], [class*="order"], [class*="item"]').all();
    console.log(`🎴 Found ${productCards.length} potential product cards/items`);
    
    // Look for clickable elements that might be the product in the order
    const clickableElements = await page.locator('text=12" Base Cabinet').all();
    console.log(`🖱️ Found ${clickableElements.length} clickable elements with "12" Base Cabinet"`);
    
    // Try clicking on the second instance (assuming first is in available products, second in order)
    if (clickableElements.length > 1) {
      await clickableElements[1].click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked on product in order area');
      
      // Take a screenshot after clicking
      await page.screenshot({ path: 'processing-after-clicking-product.png' });
      console.log('📸 Screenshot saved: processing-after-clicking-product.png');
      
      // Look for processing options that might have appeared
      const processingElements = await page.locator('text=/Processing|Stain|Finish|Cut|Size|Dark|Light|Available Processing/').all();
      console.log(`🔧 Found ${processingElements.length} processing-related elements after clicking product:`);
      for (let i = 0; i < processingElements.length; i++) {
        const text = await processingElements[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      // Look for new buttons that might have appeared
      const newButtons = await page.locator('button').all();
      console.log(`🔘 Found ${newButtons.length} buttons after clicking product:`);
      for (let i = 0; i < newButtons.length; i++) {
        const text = await newButtons[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
    } else {
      console.log('❌ Could not find product in order area to click');
    }
    
    console.log('✅ Step 2 completed - product clicking investigation');
  });
});

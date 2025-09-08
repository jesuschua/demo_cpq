const { test, expect } = require('@playwright/test');

test.describe('Debug Improved App', () => {
  test('debug improved app currentRoomId issue', async ({ page }) => {
    console.log('🚀 Starting debug improved app test...');
    
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
    
    // Step 8: Check if we're in the product config phase
    const pageText = await page.textContent('body');
    console.log('🔍 Page contains "Phase 3":', pageText.includes('Phase 3'));
    console.log('🔍 Page contains "Product Configuration":', pageText.includes('Product Configuration'));
    
    // Step 9: Check if there's a room selection
    const roomButtons = page.locator('button:has-text("Bathroom")');
    const roomButtonCount = await roomButtons.count();
    console.log(`🔍 Found ${roomButtonCount} room buttons`);
    
    if (roomButtonCount > 0) {
      // Check if any room is selected
      const selectedRoomButton = page.locator('button:has-text("Bathroom")[class*="border-blue-500"]');
      const selectedRoomCount = await selectedRoomButton.count();
      console.log(`🔍 Found ${selectedRoomCount} selected room buttons`);
      
      if (selectedRoomCount > 0) {
        console.log('✅ Room is selected');
        
        // Step 10: Check if products are visible
        const productSection = page.locator('div:has-text("Available Products")');
        const productSectionCount = await productSection.count();
        console.log(`🔍 Found ${productSectionCount} "Available Products" sections`);
        
        if (productSectionCount > 0) {
          console.log('✅ Products section found');
          
          // Check for product cards
          const productCards = productSection.locator('div[class*="border border-gray-200"]');
          const cardCount = await productCards.count();
          console.log(`🔍 Found ${cardCount} product cards`);
          
          if (cardCount > 0) {
            const firstCard = productCards.first();
            const productName = await firstCard.locator('h4').textContent();
            const addButton = firstCard.locator('button');
            const buttonCount = await addButton.count();
            console.log(`🔍 First product: "${productName}", has ${buttonCount} buttons`);
            
            if (buttonCount > 0) {
              const buttonText = await addButton.first().textContent();
              console.log('🔍 Button text:', buttonText);
              
              // Step 11: Click on the first product
              console.log('🖱️ Clicking on first product...');
              await firstCard.click();
              await page.waitForTimeout(1000);
              
              // Check if product was added
              const addedProducts = page.locator('text=/products/');
              const addedCount = await addedProducts.count();
              console.log(`🔍 Found ${addedCount} product references after click`);
            }
          }
        } else {
          console.log('❌ Products section not found');
        }
      } else {
        console.log('❌ No room is selected');
        
        // Try to click on the room button
        console.log('🖱️ Clicking on room button...');
        await roomButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Check again
        const selectedRoomButtonAfter = page.locator('button:has-text("Bathroom")[class*="border-blue-500"]');
        const selectedRoomCountAfter = await selectedRoomButtonAfter.count();
        console.log(`🔍 Found ${selectedRoomCountAfter} selected room buttons after click`);
      }
    } else {
      console.log('❌ No room buttons found');
    }
    
    // Step 12: Take screenshot
    await page.screenshot({ path: 'debug-improved-app.png' });
    
    console.log('🏁 Test completed');
  });
});

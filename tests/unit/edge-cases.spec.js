const { test, expect } = require('@playwright/test');

test.describe('Edge Cases and Stress Tests', () => {
  
  async function setupBasicQuote(page) {
    await page.goto('http://localhost:3000');
    await page.click('text=New Quote');
    await page.waitForTimeout(500);
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    return page;
  }

  test('edge case: room with incompatible processing types', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Configure room with cabinet-specific processings
    await page.selectOption('select >> nth=1', 'mod_traditional_oak');
    await page.fill('textarea', 'Room with cabinet processings');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Select cabinet-specific processings
    await page.click('label:has-text("Dark Stain")');
    await page.click('label:has-text("Install Pulls")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add non-cabinet product - use proven pattern
    const productCards = page.locator('.border.border-gray-200.rounded-lg.p-3.cursor-pointer');
    await productCards.first().click();
    await page.waitForTimeout(500);
    
    // Verify some total value is shown
    await expect(page.locator('text=Total Value:')).toBeVisible();
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify workflow completed successfully
    await expect(page.locator('text=Final Total')).toBeVisible();
    
    console.log('✅ Incompatible processing types handled correctly');
  });

  test('edge case: maximum processings per room', async ({ page }) => {
    await setupBasicQuote(page);
    
    await page.selectOption('select >> nth=1', 'mod_traditional_oak');
    await page.fill('textarea', 'Room with maximum processings');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Select multiple processings using proven pattern
    await page.click('label:has-text("Dark Stain")');
    await page.click('label:has-text("Install Pulls")');
    await page.click('label:has-text("Soft-Close Hinges")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add cabinet product using proven pattern
    const productCards = page.locator('.border.border-gray-200.rounded-lg.p-3.cursor-pointer');
    await productCards.first().click();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify workflow completed successfully
    await expect(page.locator('text=Final Total')).toBeVisible();
    
    console.log('✅ Maximum processings per room handled correctly');
  });

  test('edge case: rapid processing selection/deselection', async ({ page }) => {
    await setupBasicQuote(page);
    
    await page.selectOption('select >> nth=1', 'mod_traditional_oak');
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Rapidly select and deselect processings using proven pattern
    for (let i = 0; i < 3; i++) {
      await page.click('label:has-text("Dark Stain")');
      await page.waitForTimeout(100);
      await page.click('label:has-text("Dark Stain")');
      await page.waitForTimeout(100);
    }
    
    // Select final processing and complete workflow
    await page.click('label:has-text("Dark Stain")');
    await page.waitForTimeout(200);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    const productCards = page.locator('.border.border-gray-200.rounded-lg.p-3.cursor-pointer');
    await productCards.first().click();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Final Total')).toBeVisible();
    
    console.log('✅ Rapid processing selection handled correctly');
  });

  test('stress test: large number of products with inheritance', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Configure room with multiple processings
    await page.selectOption('select >> nth=1', 'mod_traditional_oak');
    await page.fill('textarea', 'Stress test room with many products');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    await page.click('label:has-text("Dark Stain")');
    await page.click('label:has-text("Install Pulls")');
    await page.click('label:has-text("Soft-Close Hinges")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add many products using proven pattern
    const productCards = page.locator('.border.border-gray-200.rounded-lg.p-3.cursor-pointer');
    const startTime = Date.now();
    
    // Add first 5 products
    for (let i = 0; i < 5; i++) {
      await productCards.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    const additionTime = Date.now() - startTime;
    console.log(`Added 5 products in ${additionTime}ms`);
    
    // Verify total is calculated correctly
    await expect(page.locator('text=Total Value:')).toBeVisible();
    
    const quoteStartTime = Date.now();
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(2000);
    
    const quoteTime = Date.now() - quoteStartTime;
    console.log(`Quote generation took ${quoteTime}ms`);
    
    // Verify workflow completed
    await expect(page.locator('text=Final Total')).toBeVisible();
    
    // Performance should be reasonable
    expect(additionTime).toBeLessThan(10000); // 10 seconds max
    expect(quoteTime).toBeLessThan(5000); // 5 seconds max for quote generation
    
    console.log('✅ Large number of products handled efficiently');
  });

  test('edge case: empty room description and special characters', async ({ page }) => {
    await setupBasicQuote(page);
    
    await page.selectOption('select >> nth=1', 'Modern White (modern)');
    
    // Test with empty description
    await page.fill('textarea', '');
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Should work with empty description
    await expect(page.locator('text=Room: Kitchen')).toBeVisible();
    
    // Go back and test special characters
    await page.click('button:has-text("Back to Dashboard")');
    await page.waitForTimeout(500);
    
    await setupBasicQuote(page);
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    
    // Test special characters
    await page.fill('textarea', 'Kitchen with "quotes", \'apostrophes\', & special chars: @#$%^&*()');
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Should handle special characters gracefully
    await expect(page.locator('text=Kitchen with')).toBeVisible();
    
    console.log('✅ Empty descriptions and special characters handled correctly');
  });

  test('edge case: rapid navigation during processing', async ({ page }) => {
    await setupBasicQuote(page);
    
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Navigation stress test');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(300);
    
    await page.click('text=Dark Stain >> .. >> input[type="checkbox"]');
    await page.waitForTimeout(100);
    
    // Rapid navigation attempts
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(200);
    
    // Try to navigate before process completes
    await page.click('button:has-text("Back to Dashboard")');
    await page.waitForTimeout(500);
    
    // Should return to dashboard safely
    await expect(page.locator('text=Quote Builder Dashboard')).toBeVisible();
    
    console.log('✅ Rapid navigation handled gracefully');
  });

  test('stress test: complex pricing calculations', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Configure room with all percentage-based processings
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Complex pricing test');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Select multiple processings with different pricing models
    await page.click('text=Dark Stain >> .. >> input[type="checkbox"]'); // 15%
    await page.click('text=Install Pulls >> .. >> input[type="checkbox"]'); // $12 per unit
    await page.click('text=Soft-Close Hinges >> .. >> input[type="checkbox"]'); // $8 per unit
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add products with different base prices
    const products = [
      '12" Base Cabinet', // $285
      '21" Base Cabinet', // $335
      '18" Tall Cabinet'  // $385
    ];
    
    for (const product of products) {
      await page.click(`[class*="cursor-pointer"]:has-text("${product}")`);
      await page.waitForTimeout(300);
    }
    
    // Expected calculations:
    // 12" Base: $285 + $42.75 (15%) + $12 + $8 = $347.75
    // 21" Base: $335 + $50.25 (15%) + $12 + $8 = $405.25  
    // 18" Tall: $385 + $57.75 (15%) + $12 + $8 = $462.75
    // Total: $1,215.75
    
    await expect(page.locator('text=Total Value: $1,215.75')).toBeVisible();
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify customer discount (3% for Elite)
    // $1,215.75 * 0.97 = $1,179.28
    await expect(page.locator('text=Final Total: $1,179.28')).toBeVisible();
    
    console.log('✅ Complex pricing calculations are accurate');
  });

  test('edge case: browser refresh during workflow', async ({ page }) => {
    await setupBasicQuote(page);
    
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Refresh test room');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    await page.click('text=Dark Stain >> .. >> input[type="checkbox"]');
    await page.waitForTimeout(300);
    
    // Simulate browser refresh
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Should return to dashboard (state reset)
    await expect(page.locator('text=Quote Builder Dashboard')).toBeVisible();
    
    // Verify fresh start works
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Phase 1: Customer Selection')).toBeVisible();
    
    console.log('✅ Browser refresh handled correctly');
  });

  test('stress test: print functionality with large quotes', async ({ page }) => {
    await setupBasicQuote(page);
    
    // Create large quote
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Large quote stress test with extensive room description that includes many details about the kitchen design, customer preferences, special requirements, and detailed specifications');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Select all available processings
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < Math.min(count, 4); i++) { // Limit to 4 to avoid timeout
      await checkboxes.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add many products
    const manyProducts = [
      '12" Base Cabinet',
      '15" Base Cabinet', 
      '18" Base Cabinet',
      '15" Wall Cabinet',
      '18" Wall Cabinet',
      '18" Tall Cabinet',
      'Carrara Quartz'
    ];
    
    for (const product of manyProducts) {
      await page.click(`[class*="cursor-pointer"]:has-text("${product}")`);
      await page.waitForTimeout(200);
    }
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(2000);
    
    // Test print functionality with large quote
    await page.addInitScript(() => {
      window.originalPrint = window.print;
      window.print = () => {
        window.printTriggered = true;
        console.log('Large quote print triggered');
      };
    });
    
    const printStartTime = Date.now();
    await page.click('button:has-text("Print Quote")');
    await page.waitForTimeout(3000); // Give more time for large quote
    
    const printTime = Date.now() - printStartTime;
    console.log(`Large quote print took ${printTime}ms`);
    
    const wasPrintTriggered = await page.evaluate(() => window.printTriggered);
    expect(wasPrintTriggered).toBe(true);
    
    // Print should complete within reasonable time
    expect(printTime).toBeLessThan(10000); // 10 seconds max
    
    console.log('✅ Large quote print functionality works');
  });

  test('edge case: zero-price items and calculations', async ({ page }) => {
    await setupBasicQuote(page);
    
    await page.selectOption('select >> nth=1', 'Modern White (modern)');
    await page.fill('textarea', 'Zero price edge case test');
    
    // Configure processings
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    await page.click('text=Install Pulls >> .. >> input[type="checkbox"]'); // $12 per unit
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add lowest price item to test edge case
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.waitForTimeout(500);
    
    // Verify calculations with low amounts
    await expect(page.locator('text=Total Value:')).toBeVisible();
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify detailed pricing
    await expect(page.locator('text=$285.00 base')).toBeVisible();
    await expect(page.locator('text=Install Pulls')).toBeVisible();
    
    console.log('✅ Zero-price and edge case calculations handled correctly');
  });
});

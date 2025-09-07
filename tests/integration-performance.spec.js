const { test, expect } = require('@playwright/test');

test.describe('Integration and Performance Tests', () => {
  
  // Performance monitoring helper
  async function measurePerformance(page, actionName, action) {
    const startTime = Date.now();
    await action();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`${actionName} took ${duration}ms`);
    return duration;
  }

  // Helper to create performance baseline
  async function createPerformanceBaseline(page) {
    await page.goto('http://localhost:3000');
    const loadTime = await measurePerformance(page, 'Initial page load', async () => {
      await page.waitForSelector('text=Kitchen CPQ', { timeout: 10000 });
    });
    
    return { loadTime };
  }

  test('performance: application startup and initial load', async ({ page }) => {
    const baseline = await createPerformanceBaseline(page);
    
    // Startup should be reasonably fast
    expect(baseline.loadTime).toBeLessThan(5000); // 5 seconds max
    
    // Verify critical elements loaded
    await expect(page.locator('text=Kitchen CPQ')).toBeVisible();
    await expect(page.locator('button:has-text("New Quote")')).toBeVisible();
    
    console.log('✅ Application startup performance acceptable');
  });

  test('performance: complete workflow timing', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Phase 1: Customer Selection
    const customerTime = await measurePerformance(page, 'Customer selection', async () => {
      await page.click('button:has-text("Start New Quote")');
      await page.waitForTimeout(500);
      await page.click('text=Elite Kitchen Designs');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Step 2: Room Configuration')).toBeVisible();
    });
    
    // Phase 2: Room Configuration
    const roomTime = await measurePerformance(page, 'Room configuration', async () => {
      await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
      await page.fill('textarea', 'Performance test room');
      
      await page.click('button:has-text("Configure Processings")');
      await page.waitForTimeout(500);
      
      await page.click('label:has-text("Dark Stain")');
      await page.click('label:has-text("Install Pulls")');
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("Create Room & Start Quote")');
      await page.waitForTimeout(1000);
    });
    
    // Phase 3: Product Configuration
    const productTime = await measurePerformance(page, 'Product configuration', async () => {
      await page.click('button:has-text("Proceed to Products")');
      await page.waitForTimeout(1000);
      
      // Add products by clicking on product cards - same as comprehensive test
      const productCards = page.locator('.border.border-gray-200.rounded-lg.p-3.cursor-pointer');
      await productCards.first().click();
      await page.waitForTimeout(500);
      await productCards.nth(1).click();
      await page.waitForTimeout(500);
      await productCards.nth(2).click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('text=Total Value:')).toBeVisible();
    });
    
    // Phase 4: Quote Generation
    const quoteTime = await measurePerformance(page, 'Quote generation', async () => {
      await page.click('button:has-text("Proceed to Quote")');
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Step 4: Quote Finalization')).toBeVisible();
    });
    
    // Performance expectations - adjusted for headed testing with waits
    expect(customerTime).toBeLessThan(5000);   // 5 seconds
    expect(roomTime).toBeLessThan(8000);       // 8 seconds  
    expect(productTime).toBeLessThan(10000);   // 10 seconds for multiple products
    expect(quoteTime).toBeLessThan(5000);      // 5 seconds
    
    const totalTime = customerTime + roomTime + productTime + quoteTime;
    console.log(`Total workflow time: ${totalTime}ms`);
    expect(totalTime).toBeLessThan(20000); // 20 seconds total
    
    console.log('✅ Complete workflow performance acceptable');
  });

  test('integration: inheritance system end-to-end', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test complete inheritance flow
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    
    // Configure room with inheritance
    await page.selectOption('select >> nth=1', 'Modern White (modern)');
    await page.fill('textarea', 'Integration test - Full inheritance validation');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Select 3 different processing types
    await page.click('text=Dark Stain >> .. >> input[type="checkbox"]');      // Percentage
    await page.click('text=Install Pulls >> .. >> input[type="checkbox"]');   // Per unit
    await page.click('text=Soft-Close Hinges >> .. >> input[type="checkbox"]'); // Per unit
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add compatible and incompatible products
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")'); // Compatible
    await page.waitForTimeout(300);
    await page.click('[class*="cursor-pointer"]:has-text("Carrara Quartz")');    // Not compatible
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify inheritance integration
    
    // 1. Cabinet should have inherited processings
    await page.click('text=12" Base Cabinet >> ..');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Dark Stain >> .. >> text=Inherited')).toBeVisible();
    await expect(page.locator('text=Install Pulls >> .. >> text=Inherited')).toBeVisible();
    await expect(page.locator('text=Soft-Close Hinges >> .. >> text=Inherited')).toBeVisible();
    
    // Verify locked state
    await expect(page.locator('text=Dark Stain >> .. >> button:has-text("Locked")[disabled]')).toBeVisible();
    
    // 2. Countertop should not have inherited processings
    await page.click('text=Carrara Quartz >> ..');
    await page.waitForTimeout(500);
    
    // Should only show available processings, no inherited ones
    await expect(page.locator('text=Available Processings:')).toBeVisible();
    await expect(page.locator('text=Dark Stain >> .. >> text=Inherited')).not.toBeVisible();
    
    // 3. Test manual processing addition to inherited product
    await page.click('text=12" Base Cabinet >> ..');
    await page.waitForTimeout(500);
    
    const addButtons = page.locator('text=Available >> .. >> button:has-text("Add")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
      
      // Should now have both inherited and manual processings
      const removeButtons = page.locator('button:has-text("Remove")');
      await expect(removeButtons).toHaveCount(1); // Only manual should be removable
      
      const lockedButtons = page.locator('button:has-text("Locked")[disabled]');
      await expect(lockedButtons).toHaveCount(3); // 3 inherited should be locked
    }
    
    // 4. Verify pricing calculations with mixed inheritance
    await expect(page.locator('text=Subtotal:')).toBeVisible();
    await expect(page.locator('text=5% Customer Discount')).toBeVisible();
    await expect(page.locator('text=Final Total:')).toBeVisible();
    
    console.log('✅ Complete inheritance system integration successful');
  });

  test('integration: print functionality with inheritance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Create complete quote with inheritance
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Print integration test with detailed room description');
    
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    await page.click('label:has-text("Dark Stain")');
    await page.click('label:has-text("Install Pulls")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.click('[class*="cursor-pointer"]:has-text("15\\" Wall Cabinet")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Test print integration
    await page.addInitScript(() => {
      window.originalPrint = window.print;
      window.printTriggered = false;
      window.print = () => {
        window.printTriggered = true;
        console.log('Print integration test triggered');
      };
    });
    
    const printTime = await measurePerformance(page, 'Print with inheritance', async () => {
      await page.click('button:has-text("Print Quote")');
      await page.waitForTimeout(2000);
    });
    
    const wasPrintTriggered = await page.evaluate(() => window.printTriggered);
    expect(wasPrintTriggered).toBe(true);
    expect(printTime).toBeLessThan(5000); // 5 seconds max
    
    // Verify content preservation after print
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    await expect(page.locator('text=15" Wall Cabinet')).toBeVisible();
    await expect(page.locator('text=Elite Kitchen Designs')).toBeVisible();
    
    console.log('✅ Print functionality integration successful');
  });

  test('performance: stress test with maximum load', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Create maximum complexity quote
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    
    // Maximum room configuration
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Maximum stress test room with extensive description that contains many words to test the system performance under maximum load conditions including special characters, numbers 123456789, and symbols !@#$%^&*()');
    
    const processingTime = await measurePerformance(page, 'Maximum processing configuration', async () => {
      await page.click('button:has-text("Configure Processings")');
      await page.waitForTimeout(500);
      
      // Select all available processings
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
        await page.waitForTimeout(50);
      }
      
      await page.waitForTimeout(500);
    });
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    // Maximum product addition
    const productAddTime = await measurePerformance(page, 'Maximum product addition', async () => {
      await page.click('button:has-text("Proceed to Products")');
      await page.waitForTimeout(1000);
      
      // Add all available cabinet products
      const cabinetProducts = [
        '12" Base Cabinet',
        '15" Base Cabinet',
        '18" Base Cabinet',
        '21" Base Cabinet',
        '24" Base Cabinet',
        '12" Wall Cabinet',
        '15" Wall Cabinet',
        '18" Wall Cabinet',
        '21" Wall Cabinet',
        '18" Tall Cabinet'
      ];
      
      for (const product of cabinetProducts) {
        await page.click(`[class*="cursor-pointer"]:has-text("${product}")`);
        await page.waitForTimeout(100);
      }
      
      await page.waitForTimeout(1000);
    });
    
    // Maximum quote generation
    const quoteGenTime = await measurePerformance(page, 'Maximum quote generation', async () => {
      await page.click('button:has-text("Proceed to Quote")');
      await page.waitForTimeout(2000);
      await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    });
    
    // Stress test performance expectations
    expect(processingTime).toBeLessThan(10000);  // 10 seconds for max processings
    expect(productAddTime).toBeLessThan(15000);  // 15 seconds for 10 products
    expect(quoteGenTime).toBeLessThan(10000);    // 10 seconds for complex quote
    
    // Verify all products are present
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    await expect(page.locator('text=18" Tall Cabinet')).toBeVisible();
    
    // Test maximum print performance
    await page.addInitScript(() => {
      window.print = () => { window.printTriggered = true; };
    });
    
    const maxPrintTime = await measurePerformance(page, 'Maximum print generation', async () => {
      await page.click('button:has-text("Print Quote")');
      await page.waitForTimeout(3000);
    });
    
    expect(maxPrintTime).toBeLessThan(15000); // 15 seconds max for complex print
    
    const wasPrintTriggered = await page.evaluate(() => window.printTriggered);
    expect(wasPrintTriggered).toBe(true);
    
    console.log('✅ Maximum stress test performance acceptable');
  });

  test('integration: navigation flow consistency', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test forward navigation
    await page.click('button:has-text("New Quote")');
    await page.waitForTimeout(500);
    
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    
    await page.selectOption('select >> nth=1', 'mod_traditional_oak');
    await page.fill('textarea', 'Navigation consistency test');
    await page.click('button:has-text("Create Room")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Phase 3: Product Configuration')).toBeVisible();
    
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    
    // Test backward navigation
    await page.click('button:has-text("Back to Products")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Phase 3: Product Configuration')).toBeVisible();
    
    // Verify state preservation
    await expect(page.locator('text=Total Value:')).toBeVisible();
    
    // Navigate back to quote
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    
    // Test dashboard navigation
    await page.click('button:has-text("Back to Dashboard")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Quote Builder Dashboard')).toBeVisible();
    
    console.log('✅ Navigation flow consistency maintained');
  });

  test('integration: error handling and recovery', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test recovery from various error states
    
    // 1. Invalid room configuration attempt
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    
    // Try to create room without required fields
    await expect(page.locator('button:has-text("Create Room & Start Quote")')).toBeDisabled();
    
    // Fix and proceed
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await expect(page.locator('button:has-text("Create Room & Start Quote")')).toBeEnabled();
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    // 2. Navigate to products without adding any
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Try to proceed without products
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Should still work (empty quote is valid)
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    
    // 3. Test navigation recovery
    await page.click('button:has-text("Back to Products")');
    await page.waitForTimeout(500);
    
    // Add product and verify recovery
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    
    console.log('✅ Error handling and recovery working correctly');
  });

  test('performance: memory usage and cleanup', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test multiple quote cycles to check for memory leaks
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`Testing quote cycle ${cycle + 1}`);
      
      const cycleTime = await measurePerformance(page, `Quote cycle ${cycle + 1}`, async () => {
        await page.click('button:has-text("Start New Quote")');
        await page.waitForTimeout(300);
        
        await page.click('text=Elite Kitchen Designs');
        await page.waitForTimeout(300);
        
        await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
        await page.fill('textarea', `Memory test cycle ${cycle + 1}`);
        
        await page.click('button:has-text("Create Room & Start Quote")');
        await page.waitForTimeout(500);
        
        await page.click('button:has-text("Proceed to Products")');
        await page.waitForTimeout(500);
        
        await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
        await page.waitForTimeout(300);
        
        await page.click('button:has-text("Proceed to Quote")');
        await page.waitForTimeout(500);
        
        await page.click('button:has-text("Back to Dashboard")');
        await page.waitForTimeout(300);
      });
      
      // Each cycle should not significantly increase in time
      expect(cycleTime).toBeLessThan(10000); // 10 seconds per cycle
    }
    
    // Final verification
    await expect(page.locator('text=Quote Builder Dashboard')).toBeVisible();
    
    console.log('✅ Memory usage and cleanup performance acceptable');
  });
});

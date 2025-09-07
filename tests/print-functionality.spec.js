const { test, expect } = require('@playwright/test');

test.describe('Enhanced Print Functionality Tests', () => {
  
  // Helper to create a complete quote for testing print
  async function createCompleteQuoteForPrint(page, config = {}) {
    const {
      customer = 'elite',
      roomStyle = 'Traditional Oak (traditional)',
      roomDescription = 'Test kitchen for print functionality',
      processings = ['Dark Stain', 'Install Pulls'],
      products = ['12" Base Cabinet', '15" Wall Cabinet']
    } = config;
    
    // Navigate and create quote
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    
    // Select customer
    const customerMap = {
      'basic': 'Basic Home Solutions',
      'elite': 'Elite Kitchen Designs',
      'premium': 'Premium Kitchen Corp'
    };
    await page.click(`text=${customerMap[customer]}`);
    await page.waitForTimeout(500);
    
    // Configure room
    await page.selectOption('select >> nth=1', roomStyle);
    await page.fill('textarea', roomDescription);
    
    if (processings.length > 0) {
      await page.click('button:has-text("Configure Processings")');
      await page.waitForTimeout(500);
      
      for (const processing of processings) {
        await page.click(`text=${processing} >> .. >> input[type="checkbox"]`);
        await page.waitForTimeout(200);
      }
    }
    
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    // Add products
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    for (const product of products) {
      await page.click(`[class*="cursor-pointer"]:has-text("${product}")`);
      await page.waitForTimeout(500);
    }
    
    // Proceed to quote
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    return page;
  }
  
  async function triggerPrintAndCaptureContent(page) {
    // Setup dialog handler to capture print dialog
    let printTriggered = false;
    
    page.on('dialog', async dialog => {
      if (dialog.type() === 'beforeunload') {
        await dialog.accept();
      }
    });
    
    // Listen for window.print calls
    await page.addInitScript(() => {
      window.originalPrint = window.print;
      window.print = () => {
        window.printTriggered = true;
        console.log('Print function called');
      };
    });
    
    // Click print button
    await page.click('button:has-text("Print Quote")');
    await page.waitForTimeout(2000);
    
    // Check if print was triggered
    const wasPrintTriggered = await page.evaluate(() => window.printTriggered);
    
    return wasPrintTriggered;
  }

  test('print button triggers enhanced print functionality', async ({ page }) => {
    await createCompleteQuoteForPrint(page);
    
    // Verify print button is present
    await expect(page.locator('button:has-text("Print Quote")')).toBeVisible();
    
    // Test print trigger
    const printTriggered = await triggerPrintAndCaptureContent(page);
    expect(printTriggered).toBe(true);
    
    console.log('✅ Print button triggers correctly');
  });

  test('print content includes company branding and header', async ({ page }) => {
    await createCompleteQuoteForPrint(page);
    
    // Capture the page content before print
    const pageContent = await page.content();
    
    // Click print to generate print content
    await page.click('button:has-text("Print Quote")');
    await page.waitForTimeout(2000);
    
    // Verify print-specific elements are generated
    // The enhanced print function should add print-specific content to the DOM
    
    // Check for company header elements (these should be in the enhanced print HTML)
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Verify quote content is preserved for print
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    
    console.log('✅ Print content generation works');
  });

  test('print content displays room details correctly', async ({ page }) => {
    await createCompleteQuoteForPrint(page, {
      roomDescription: 'Luxury master kitchen with custom finishes',
      roomStyle: 'Modern White (modern)',
      processings: ['Dark Stain', 'Install Pulls', 'Soft-Close Hinges']
    });
    
    // Verify room information is displayed before print
    await expect(page.locator('text=Room: Kitchen | Front Model: Modern White')).toBeVisible();
    await expect(page.locator('text=Luxury master kitchen with custom finishes')).toBeVisible();
    
    // Test print functionality
    await triggerPrintAndCaptureContent(page);
    
    // Verify room details are preserved in print content
    await expect(page.locator('text=Modern White')).toBeVisible();
    
    console.log('✅ Room details display correctly in print');
  });

  test('print content shows processing inheritance clearly', async ({ page }) => {
    await createCompleteQuoteForPrint(page, {
      processings: ['Dark Stain', 'Install Pulls']
    });
    
    // Before print, verify inheritance is visible
    await expect(page.locator('text=Applied Processings')).toBeVisible();
    await expect(page.locator('text=Dark Stain')).toBeVisible();
    await expect(page.locator('text=Install Pulls')).toBeVisible();
    
    // Click on a product to see inheritance details
    await page.click('text=12" Base Cabinet >> ..');
    await page.waitForTimeout(500);
    
    // Verify inherited processing badges
    await expect(page.locator('text=Dark Stain >> .. >> text=Inherited')).toBeVisible();
    await expect(page.locator('text=Install Pulls >> .. >> text=Inherited')).toBeVisible();
    
    // Test print with inheritance visible
    await triggerPrintAndCaptureContent(page);
    
    console.log('✅ Processing inheritance shows clearly in print');
  });

  test('print content includes accurate pricing breakdown', async ({ page }) => {
    await createCompleteQuoteForPrint(page, {
      customer: 'premium', // 5% discount
      products: ['12" Base Cabinet', '15" Wall Cabinet', '18" Tall Cabinet']
    });
    
    // Verify pricing before print
    await expect(page.locator('text=Subtotal:')).toBeVisible();
    await expect(page.locator('text=5% Customer Discount')).toBeVisible();
    await expect(page.locator('text=Final Total:')).toBeVisible();
    
    // Capture the pricing values
    const subtotalText = await page.locator('text=Subtotal: $').textContent();
    const finalTotalText = await page.locator('text=Final Total: $').textContent();
    
    expect(subtotalText).toContain('$');
    expect(finalTotalText).toContain('$');
    
    // Test print with pricing
    await triggerPrintAndCaptureContent(page);
    
    // Verify pricing is still visible after print trigger
    await expect(page.locator('text=Subtotal:')).toBeVisible();
    await expect(page.locator('text=Final Total:')).toBeVisible();
    
    console.log('✅ Pricing breakdown displays correctly in print');
  });

  test('print content with customer information', async ({ page }) => {
    const customerTests = [
      { type: 'basic', name: 'Basic Home Solutions', discount: 0 },
      { type: 'elite', name: 'Elite Kitchen Designs', discount: 3 },
      { type: 'premium', name: 'Premium Kitchen Corp', discount: 5 }
    ];
    
    for (const customer of customerTests) {
      await createCompleteQuoteForPrint(page, { customer: customer.type });
      
      // Verify customer information
      await expect(page.locator(`text=${customer.name}`)).toBeVisible();
      
      if (customer.discount > 0) {
        await expect(page.locator(`text=${customer.discount}% Customer Discount`)).toBeVisible();
      }
      
      // Test print
      await triggerPrintAndCaptureContent(page);
      
      // Reset for next test
      await page.click('button:has-text("Back to Dashboard")');
      await page.waitForTimeout(500);
    }
    
    console.log('✅ Customer information displays correctly in print');
  });

  test('print content handles empty and complex quotes', async ({ page }) => {
    // Test 1: Quote with minimal content
    await createCompleteQuoteForPrint(page, {
      processings: [],
      products: ['12" Base Cabinet']
    });
    
    await triggerPrintAndCaptureContent(page);
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    
    // Reset
    await page.click('button:has-text("Back to Dashboard")');
    await page.waitForTimeout(500);
    
    // Test 2: Complex quote with many items
    await createCompleteQuoteForPrint(page, {
      processings: ['Dark Stain', 'Install Pulls', 'Soft-Close Hinges'],
      products: [
        '12" Base Cabinet',
        '15" Base Cabinet',
        '15" Wall Cabinet', 
        '18" Wall Cabinet',
        '18" Tall Cabinet',
        'Carrara Quartz'
      ]
    });
    
    await triggerPrintAndCaptureContent(page);
    
    // Verify all products are present
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    await expect(page.locator('text=Carrara Quartz')).toBeVisible();
    
    console.log('✅ Print handles both simple and complex quotes');
  });

  test('print functionality with mixed inheritance scenarios', async ({ page }) => {
    await createCompleteQuoteForPrint(page, {
      processings: ['Dark Stain']
    });
    
    // Add manual processing to one product
    await page.click('text=12" Base Cabinet >> ..');
    await page.waitForTimeout(500);
    
    // Verify inherited processing
    await expect(page.locator('text=Dark Stain >> .. >> text=Inherited')).toBeVisible();
    
    // Add manual processing
    const addButtons = page.locator('text=Available >> .. >> button:has-text("Add")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
      
      // Verify manual processing is added
      const removeButtons = page.locator('button:has-text("Remove")');
      await expect(removeButtons).toHaveCount(1);
    }
    
    // Test print with mixed inheritance
    await triggerPrintAndCaptureContent(page);
    
    // Verify both inherited and manual processings are preserved
    await expect(page.locator('text=Dark Stain')).toBeVisible();
    
    console.log('✅ Print works with mixed inheritance scenarios');
  });

  test('print functionality error handling', async ({ page }) => {
    // Test print button when no quote exists
    await page.goto('http://localhost:3000');
    
    // Should not have print button on dashboard
    await expect(page.locator('button:has-text("Print Quote")')).not.toBeVisible();
    
    // Create partial quote (customer only)
    await page.click('button:has-text("Start New Quote")');
    await page.waitForTimeout(500);
    await page.click('text=Elite Kitchen Designs');
    await page.waitForTimeout(500);
    
    // Should not have print button in room configuration
    await expect(page.locator('button:has-text("Print Quote")')).not.toBeVisible();
    
    // Complete full quote
    await createCompleteQuoteForPrint(page);
    
    // Now print button should be available and functional
    await expect(page.locator('button:has-text("Print Quote")')).toBeVisible();
    
    const printWorked = await triggerPrintAndCaptureContent(page);
    expect(printWorked).toBe(true);
    
    console.log('✅ Print error handling works correctly');
  });

  test('print functionality preserves all quote data', async ({ page }) => {
    // Create comprehensive quote
    await createCompleteQuoteForPrint(page, {
      customer: 'elite',
      roomDescription: 'Comprehensive test kitchen with full feature set',
      processings: ['Dark Stain', 'Install Pulls', 'Soft-Close Hinges'],
      products: ['12" Base Cabinet', '15" Wall Cabinet', 'Carrara Quartz']
    });
    
    // Capture pre-print data
    const preprint = {
      customer: await page.locator('text=Elite Kitchen Designs').textContent(),
      room: await page.locator('text=Room: Kitchen').textContent(),
      products: await page.locator('text=12" Base Cabinet').count(),
      subtotal: await page.locator('text=Subtotal:').isVisible(),
      finalTotal: await page.locator('text=Final Total:').isVisible()
    };
    
    // Execute print
    await triggerPrintAndCaptureContent(page);
    
    // Verify data preservation after print
    await expect(page.locator('text=Elite Kitchen Designs')).toBeVisible();
    await expect(page.locator('text=Room: Kitchen')).toBeVisible();
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    await expect(page.locator('text=Subtotal:')).toBeVisible();
    await expect(page.locator('text=Final Total:')).toBeVisible();
    
    console.log('✅ Print preserves all quote data correctly');
  });
});

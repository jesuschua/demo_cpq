const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ Improved Workflow', () => {
  test('complete workflow without redundant model selection', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Phase 1: Customer Selection
    await expect(page.locator('text=Phase 1: Customer Configuration')).toBeVisible();
    await expect(page.locator('text=Select customer to start')).toBeVisible();
    
    // Select Elite Kitchen Designs
    await page.click('text=Elite Kitchen Designs');
    
    // Should show proceed button
    await expect(page.locator('text=Proceed to Room Setup')).toBeVisible();
    await page.click('text=Proceed to Room Setup');
    
    // Phase 2: Room Configuration  
    await expect(page.locator('text=Phase 2: Room Configuration')).toBeVisible();
    await expect(page.locator('text=Elite Kitchen Designs')).toBeVisible(); // Customer name should be visible
    
    // Fill room form
    await page.fill('input[placeholder*="Kitchen, Master Bath"]', 'Test Kitchen');
    
    // Select front model (THE ONLY TIME WE SELECT MODEL)
    await page.selectOption('select', 'mod_traditional_oak');
    
    // Create room
    await page.click('text=Create Room & Start Quote');
    
    // Should show proceed button
    await expect(page.locator('text=Proceed to Products')).toBeVisible();
    await page.click('text=Proceed to Products');
    
    // Phase 3: Product Configuration (CRITICAL TEST)
    await expect(page.locator('text=Phase 3: Product Configuration')).toBeVisible();
    
    // Should show room context
    await expect(page.locator('text=Test Kitchen').first()).toBeVisible();
    await expect(page.locator('text=Traditional Oak').first()).toBeVisible();
    
    // CRITICAL: Should NOT have model selection dropdown
    const modelSelects = await page.locator('select').filter({ hasText: 'Select Front Model' }).count();
    expect(modelSelects).toBe(0); // No model selection in product phase!
    
    // Should show Traditional Oak as selected model (inherited from room)
    await expect(page.locator('.border-blue-500')).toBeVisible(); // Selected model styling
    
    // Should show products filtered by Traditional Oak
    await expect(page.locator('text=Traditional Oak Products')).toBeVisible();
    
    // Add a product
    const addButtons = page.locator('text=Add to Quote');
    await addButtons.first().click();
    
    // Should show proceed button
    await expect(page.locator('text=Proceed to Quote')).toBeVisible();
    await page.click('text=Proceed to Quote');
    
    // Phase 4: Quote Finalization
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    await expect(page.locator('h2:has-text("Finalize Quote")')).toBeVisible();
    
    console.log('✅ Complete workflow test passed - no redundant model selection!');
  });

  test('validates cascading changes when stepping back', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Quick setup to Phase 3
    await page.click('text=Elite Kitchen Designs');
    await page.click('text=Proceed to Room Setup');
    await page.fill('input[placeholder*="Kitchen, Master Bath"]', 'Test Kitchen');
    await page.selectOption('select', 'mod_traditional_oak');
    await page.click('text=Create Room & Start Quote');
    await page.click('text=Proceed to Products');
    
    // Add a product
    const addButtons = page.locator('text=Add to Quote');
    await addButtons.first().click();
    
    // Go back and change room model
    await page.click('text=← Back to Room Setup');
    
    // Wait for room page to load
    await expect(page.locator('text=Configure Room')).toBeVisible();
    
    // Click Edit Room to show the form
    await page.click('text=Edit Room');
    
    // Now change the model select
    const modelSelect = page.locator('select').first();
    await modelSelect.selectOption('mod_modern_euro');
    await page.click('text=Update Room'); // Update room
    
    await page.click('text=Proceed to Products');
    
    // Should now show Modern Euro products, not Traditional Oak
    await expect(page.locator('text=Modern Euro Products')).toBeVisible();
    
    console.log('✅ Cascading changes test passed!');
  });

  test('validates phase progression indicators', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Phase 1 should be active
    await expect(page.locator('.bg-blue-600').filter({ hasText: '1' })).toBeVisible();
    
    // Navigate to Phase 2
    await page.click('text=Elite Kitchen Designs');
    await page.click('text=Proceed to Room Setup');
    
    // Phase 1 should be completed (green), Phase 2 active (blue)
    await expect(page.locator('.bg-green-600').filter({ hasText: '1' })).toBeVisible();
    await expect(page.locator('.bg-blue-600').filter({ hasText: '2' })).toBeVisible();
    
    console.log('✅ Phase progression test passed!');
  });
});

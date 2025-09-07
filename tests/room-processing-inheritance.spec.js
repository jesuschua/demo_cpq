const { test, expect } = require('@playwright/test');

test.describe('Room Processing Inheritance - Core Feature Tests', () => {
  
  // Helper function to navigate through the basic setup
const { test, expect } = require('@playwright/test');
const { setupBasicQuote, setupQuoteWithProcessings, createRoomAndProceed, addProductsToQuote } = require('./helpers/test-helpers');  async function createRoomWithProcessings(page, roomDescription = 'Test kitchen with processing inheritance') {
    // Select Traditional Oak style
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.waitForTimeout(500);
    
    // Add room description
    await page.fill('textarea', roomDescription);
    
    // Configure room processings
    await page.click('button:has-text("Configure Processings")');
    await page.waitForTimeout(500);
    
    // Select Dark Stain (15% processing)
    await page.click('input[type="checkbox"] >> nth=0'); // Dark Stain checkbox
    await page.waitForTimeout(300);
    
    // Select Install Pulls ($12 per unit processing)
    await page.click('input[type="checkbox"] >> nth=5'); // Install Pulls checkbox
    await page.waitForTimeout(300);
    
    // Verify selected processings are shown
    await expect(page.locator('text=Selected Auto-Applied Processings (2):')).toBeVisible();
    await expect(page.locator('text=Dark Stain, Install Pulls')).toBeVisible();
    
    // Create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    // Proceed to products
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Phase 3: Product Configuration')).toBeVisible();
    
    return page;
  }

  async function addProductAndVerifyInheritance(page, expectedBasePrice, expectedTotalPrice) {
    // Add first cabinet product (12" Base Cabinet)
    const productCards = page.locator('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await productCards.first().click();
    await page.waitForTimeout(1000);
    
    // Verify product was added with correct pricing
    await expect(page.locator(`text=Total Value: $${expectedTotalPrice}`)).toBeVisible();
    
    // Proceed to quote
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    
    return page;
  }

test('room creation with activated processings', async ({ page }) => {
  await setupBasicQuote(page);
  
  // Configure processings first
  await page.click('button:has-text("Configure Processings")');
  await page.waitForTimeout(500);
  
  // Verify available processings
  await expect(page.locator('text=Dark Stain')).toBeVisible();
  await expect(page.locator('text=Install Pulls')).toBeVisible();
  await expect(page.locator('h4:has-text("Soft-Close Hinges")')).toBeVisible(); // More specific selector
  
  // Select Dark Stain
  await page.click('text=Dark Stain >> .. >> input[type="checkbox"]');
  await page.waitForTimeout(300);
  
  // Select Install Pulls  
  await page.click('text=Install Pulls >> .. >> input[type="checkbox"]');
  await page.waitForTimeout(300);
  
  // Go back to room setup
  await page.click('button:has-text("← Back to Room Setup")');
  await page.waitForTimeout(500);
  
  // Complete room creation
  await createRoomAndProceed(page);
  
  console.log('✅ Room created with activated processings');
});  test('product automatically inherits room processings', async ({ page }) => {
    await navigateToRoomConfiguration(page);
    await createRoomWithProcessings(page);
    
    // Verify we're in product phase with room info
    await expect(page.locator('text=Room: Kitchen | Front Model: Traditional Oak')).toBeVisible();
    
    // Add a cabinet product (should inherit room processings)
    await addProductAndVerifyInheritance(page, '285.00', '339.75');
    
    // Verify the product has inherited processings applied
    await expect(page.locator('text=$285.00 base')).toBeVisible();
    await expect(page.locator('text=$339.75 each')).toBeVisible();
    await expect(page.locator('text=Applied Processings:')).toBeVisible();
    await expect(page.locator('text=Dark Stain')).toBeVisible();
    await expect(page.locator('text=Install Pulls')).toBeVisible();
    
    console.log('✅ Product inheritance works correctly');
  });

  test('inherited processings are locked and manual processings are removable', async ({ page }) => {
    await navigateToRoomConfiguration(page);
    await createRoomWithProcessings(page);
    await addProductAndVerifyInheritance(page, '285.00', '339.75');
    
    // Click on the product to see processing details
    await page.click('text=12" Base Cabinet >> ..');
    await page.waitForTimeout(500);
    
    // Verify inherited processings section
    await expect(page.locator('text=Applied Processings')).toBeVisible();
    
    // Check for inherited processings with "Inherited" badges and "Locked" buttons
    const darkStainSection = page.locator('text=Dark Stain >> ..');
    await expect(darkStainSection.locator('text=Inherited')).toBeVisible();
    await expect(darkStainSection.locator('button:has-text("Locked")[disabled]')).toBeVisible();
    
    const installPullsSection = page.locator('text=Install Pulls >> ..');
    await expect(installPullsSection.locator('text=Inherited')).toBeVisible();
    await expect(installPullsSection.locator('button:has-text("Locked")[disabled]')).toBeVisible();
    
    // Add a manual processing
    await page.click('button:has-text("Add") >> nth=0'); // Add first available processing
    await page.waitForTimeout(500);
    
    // Verify manual processing can be removed (should have "Remove" button, not "Locked")
    const manualProcessingSection = page.locator('[class*="processing-manual"] >> ..').first();
    if (await manualProcessingSection.count() > 0) {
      await expect(manualProcessingSection.locator('button:has-text("Remove")')).toBeVisible();
      await expect(manualProcessingSection.locator('button:has-text("Remove")[disabled]')).not.toBeVisible();
    }
    
    console.log('✅ Inherited vs manual processing distinction works correctly');
  });

  test('pricing calculations are correct with inheritance', async ({ page }) => {
    await navigateToRoomConfiguration(page);
    await createRoomWithProcessings(page);
    await addProductAndVerifyInheritance(page, '285.00', '339.75');
    
    // Verify detailed pricing breakdown
    // Base: $285.00
    // Dark Stain (15%): $285 * 0.15 = $42.75
    // Install Pulls (per unit): $12.00
    // Total: $285 + $42.75 + $12.00 = $339.75
    
    await expect(page.locator('text=$285.00 base')).toBeVisible();
    await expect(page.locator('text=$339.75 each')).toBeVisible();
    await expect(page.locator('text=$339.75 total')).toBeVisible();
    
    // Check quote summary
    await expect(page.locator('text=Subtotal: $339.75')).toBeVisible();
    
    // Verify customer discount is applied (3% for Elite Kitchen Designs)
    // $339.75 * 0.97 = $329.56
    await expect(page.locator('text=Final Total: $329.56')).toBeVisible();
    
    console.log('✅ Pricing calculations are correct');
  });

  test('multiple products inherit same room processings', async ({ page }) => {
    await navigateToRoomConfiguration(page);
    await createRoomWithProcessings(page);
    
    // Add first cabinet
    const firstCabinet = page.locator('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await firstCabinet.first().click();
    await page.waitForTimeout(500);
    
    // Add second cabinet (15" Base Cabinet)
    const secondCabinet = page.locator('[class*="cursor-pointer"]:has-text("15\\" Base Cabinet")');
    await secondCabinet.first().click();
    await page.waitForTimeout(500);
    
    // Verify both products inherited processings
    // 12" Base Cabinet: $285 + $42.75 + $12 = $339.75
    // 15" Base Cabinet: $315 + $47.25 + $12 = $374.25
    // Total: $714.00
    await expect(page.locator('text=Total Value: $714.00')).toBeVisible();
    
    // Proceed to quote and verify both products have inherited processings
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Both products should show inherited processings
    const productCards = page.locator('[class*="product-row"], [class*="border"]').filter({ hasText: 'Base Cabinet' });
    await expect(productCards).toHaveCount(2);
    
    // Each should have the inherited processings
    await expect(page.locator('text=Dark Stain').first()).toBeVisible();
    await expect(page.locator('text=Install Pulls').first()).toBeVisible();
    
    console.log('✅ Multiple products inherit processings correctly');
  });

  test('products not compatible with room processings are handled correctly', async ({ page }) => {
    await navigateToRoomConfiguration(page);
    await createRoomWithProcessings(page);
    
    // Add a countertop (should not inherit cabinet-specific processings)
    const countertop = page.locator('[class*="cursor-pointer"]:has-text("Carrara Quartz")');
    await countertop.first().click();
    await page.waitForTimeout(500);
    
    // Countertop should be added at base price (no inheritance)
    // We expect only the base price since processings are cabinet-specific
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Find the countertop product card
    const countertopCard = page.locator('text=Carrara Quartz >> ..');
    
    // Verify it shows base price only (no inherited processings)
    await expect(countertopCard.locator('text=$65.00 base')).toBeVisible();
    await expect(countertopCard.locator('text=$65.00 each')).toBeVisible();
    
    console.log('✅ Non-compatible products handled correctly');
  });

  test('room with no activated processings works normally', async ({ page }) => {
    await navigateToRoomConfiguration(page);
    
    // Create room without configuring any processings
    await page.selectOption('select >> nth=1', 'Traditional Oak (traditional)');
    await page.fill('textarea', 'Simple kitchen without auto-processings');
    
    // Skip processing configuration - directly create room
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(1000);
    
    // Add a product
    const productCard = page.locator('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await productCard.first().click();
    await page.waitForTimeout(500);
    
    // Should show base price only (no inheritance)
    await expect(page.locator('text=Total Value: $285.00')).toBeVisible();
    
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify product shows base price
    await expect(page.locator('text=$285.00 base')).toBeVisible();
    await expect(page.locator('text=$285.00 each')).toBeVisible();
    
    console.log('✅ Room without processings works correctly');
  });

  test('complete workflow with inheritance end-to-end', async ({ page }) => {
    // Complete workflow test combining all features
    await navigateToRoomConfiguration(page);
    await createRoomWithProcessings(page, 'Luxury kitchen with comprehensive processing inheritance test');
    
    // Add multiple products of different types
    await page.click('[class*="cursor-pointer"]:has-text("12\\" Base Cabinet")');
    await page.waitForTimeout(300);
    
    await page.click('[class*="cursor-pointer"]:has-text("15\\" Wall Cabinet")');
    await page.waitForTimeout(300);
    
    await page.click('[class*="cursor-pointer"]:has-text("Carrara Quartz")');
    await page.waitForTimeout(300);
    
    // Proceed to quote
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
    
    // Verify comprehensive quote
    await expect(page.locator('text=Phase 4: Quote Finalization')).toBeVisible();
    
    // Verify all products are listed
    await expect(page.locator('text=12" Base Cabinet')).toBeVisible();
    await expect(page.locator('text=15" Wall Cabinet')).toBeVisible();
    await expect(page.locator('text=Carrara Quartz')).toBeVisible();
    
    // Test adding manual processing to inherited product
    await page.click('text=12" Base Cabinet >> ..');
    await page.waitForTimeout(500);
    
    // Should see inherited processings
    await expect(page.locator('text=Dark Stain >> .. >> text=Inherited')).toBeVisible();
    await expect(page.locator('text=Install Pulls >> .. >> text=Inherited')).toBeVisible();
    
    // Add a manual processing
    const availableProcessings = page.locator('text=Available >> .. >> button:has-text("Add")');
    if (await availableProcessings.count() > 0) {
      await availableProcessings.first().click();
      await page.waitForTimeout(500);
      
      // Verify manual processing was added and can be removed
      const removeButtons = page.locator('button:has-text("Remove")');
      await expect(removeButtons).toHaveCount(1); // Only manual processings should have Remove buttons
    }
    
    console.log('✅ Complete end-to-end workflow with inheritance successful');
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Processing Options Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should show processing options for processings that require them', async ({ page }) => {
    // Start a new quote first
    await page.goto('http://localhost:3000');
    await page.click('text=New Quote');
    await page.click('text=Elite Kitchen Designs');
    
    // Fill room details
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8'); 
    await page.fill('input[placeholder*="Depth"]', '15');
    await page.fill('input[type="text"]', 'Main Kitchen');
    await page.selectOption('select >> nth=0', { index: 1 });
    
    // Create room and start quote
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    
    // Add a product to the quote
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    
    // Select a cabinet product
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    
    // Check that processings with options are marked
    await page.waitForSelector('text=Available Processings');
    
    // Look for processings that require options
    const processingWithOptions = page.locator('text=Requires Options').first();
    await expect(processingWithOptions).toBeVisible();
  });

  test('should open option selector modal when clicking processing with options', async ({ page }) => {
    // Start a new quote first
    await page.goto('http://localhost:3000');
    await page.click('text=New Quote');
    await page.click('text=Elite Kitchen Designs');
    
    // Fill room details
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8'); 
    await page.fill('input[placeholder*="Depth"]', '15');
    await page.fill('input[type="text"]', 'Main Kitchen');
    await page.selectOption('select >> nth=0', { index: 1 });
    
    // Create room and start quote
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    
    // Add a product to the quote
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    
    // Click on a processing that requires options
    const processingWithOptions = page.locator('text=Requires Options').first();
    await processingWithOptions.click();
    
    // Check that option selector modal opens
    await expect(page.locator('[data-testid="option-selector-modal"]')).toBeVisible();
  });

  test('should show pending options alert when processings need configuration', async ({ page }) => {
    // Start a new quote first
    await page.goto('http://localhost:3000');
    await page.click('text=New Quote');
    await page.click('text=Elite Kitchen Designs');
    
    // Fill room details
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8'); 
    await page.fill('input[placeholder*="Depth"]', '15');
    await page.fill('input[type="text"]', 'Main Kitchen');
    await page.selectOption('select >> nth=0', { index: 1 });
    
    // Create room and start quote
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    
    // Add a product to the quote
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    
    // Add a processing that requires options but don't configure them
    const processingWithOptions = page.locator('text=Requires Options').first();
    await processingWithOptions.click();
    
    // Close the modal without configuring options
    await page.click('[data-testid="cancel-options-button"]');
    
    // Check that pending options alert appears
    await expect(page.locator('[data-testid="pending-options-alert"]')).toBeVisible();
  });

  test('should allow configuring processing options', async ({ page }) => {
    // Start a new quote first
    await page.goto('http://localhost:3000');
    await page.click('text=New Quote');
    await page.click('text=Elite Kitchen Designs');
    
    // Fill room details
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8'); 
    await page.fill('input[placeholder*="Depth"]', '15');
    await page.fill('input[type="text"]', 'Main Kitchen');
    await page.selectOption('select >> nth=0', { index: 1 });
    
    // Create room and start quote
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    
    // Add a product to the quote
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    
    // Click on a processing that requires options
    const processingWithOptions = page.locator('text=Requires Options').first();
    await processingWithOptions.click();
    
    // Configure the options
    await page.waitForSelector('[data-testid="option-selector-modal"]');
    
    // Fill in the required options (this will depend on the specific processing)
    const optionInput = page.locator('[data-testid="option-input"]').first();
    if (await optionInput.isVisible()) {
      await optionInput.fill('test value');
    }
    
    // Apply the options
    await page.click('[data-testid="apply-options-button"]');
    
    // Check that the processing is added with options
    await expect(page.locator('[data-testid="applied-processing"]:has-text("Options Required")')).not.toBeVisible();
  });

  test('should show option values in applied processings', async ({ page }) => {
    // Start a new quote first
    await page.goto('http://localhost:3000');
    await page.click('text=New Quote');
    await page.click('text=Elite Kitchen Designs');
    
    // Fill room details
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8'); 
    await page.fill('input[placeholder*="Depth"]', '15');
    await page.fill('input[type="text"]', 'Main Kitchen');
    await page.selectOption('select >> nth=0', { index: 1 });
    
    // Create room and start quote
    await page.click('button:has-text("Create Room & Start Quote")');
    await page.waitForLoadState('networkidle');
    
    // Add a product to the quote
    await page.click('text=Add Products');
    await page.waitForSelector('text=Product Catalog');
    await page.click('text=12" Base Cabinet');
    await page.click('button:has-text("Add to Quote")');
    
    // Add and configure a processing with options
    const processingWithOptions = page.locator('text=Requires Options').first();
    await processingWithOptions.click();
    
    await page.waitForSelector('[data-testid="option-selector-modal"]');
    
    // Fill options and apply
    const optionInput = page.locator('[data-testid="option-input"]').first();
    if (await optionInput.isVisible()) {
      await optionInput.fill('test value');
      await page.click('[data-testid="apply-options-button"]');
    }
    
    // Check that option values are displayed
    await expect(page.locator('[data-testid="applied-processing"]:has-text("Options:")')).toBeVisible();
  });
});

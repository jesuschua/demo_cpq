const { test, expect } = require('@playwright/test');

test('debug - investigate room creation flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Start new quote workflow
  await page.click('text=New Quote');
  await page.waitForTimeout(500);
  
  // Select customer
  await page.click('text=Elite Kitchen Designs');
  await page.waitForTimeout(500);
  console.log('✅ Selected customer');
  
  // Fill all required fields
  await page.fill('input[placeholder*="Width"]', '12');
  await page.fill('input[placeholder*="Height"]', '8');
  await page.fill('input[placeholder*="Depth"]', '15');
  await page.selectOption('select >> nth=0', { index: 1 });
  await page.selectOption('select >> nth=1', { index: 1 });
  console.log('✅ Filled all form fields');
  
  // Check button state
  const createButton = page.locator('button:has-text("Create Room & Start Quote")');
  console.log('Button enabled?', !(await createButton.getAttribute('disabled')));
  
  // Click the button
  await createButton.click();
  await page.waitForTimeout(2000);
  console.log('✅ Clicked Create Room button');
  
  // Check what phase we're in
  const phaseIndicators = page.locator('.bg-blue-600, .bg-blue-500');
  const activePhase = await phaseIndicators.count();
  console.log('Active phase indicators:', activePhase);
  
  // Check for phase text - be more specific
  const phase1 = await page.locator('.bg-green-600:has-text("1")').isVisible();
  const phase2 = await page.locator('.bg-green-600:has-text("2")').isVisible();
  const phase3 = await page.locator('.bg-blue-600:has-text("3")').isVisible();
  const phase4 = await page.locator('.bg-gray-300:has-text("4")').isVisible();
  console.log('Phase visibility - 1:', phase1, '2:', phase2, '3:', phase3, '4:', phase4);
  
  // Check for different possible content
  const productCatalog = await page.locator('text=Product Catalog').isVisible();
  const proceedToProducts = await page.locator('button:has-text("Proceed to Products")').isVisible();
  const addToQuote = await page.locator('text=Add to Quote').count();
  const proceedToQuote = await page.locator('text=Proceed to Quote').isVisible();
  
  console.log('Content check:');
  console.log('- Product Catalog visible:', productCatalog);
  console.log('- Proceed to Products button visible:', proceedToProducts);
  console.log('- Add to Quote buttons:', addToQuote);
  console.log('- Proceed to Quote visible:', proceedToQuote);
  
  // If we see the proceed button, click it
  if (proceedToProducts) {
    console.log('🔄 Clicking Proceed to Products...');
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(2000);
    
    // Check again after clicking
    const addToQuoteAfter = await page.locator('text=Add to Quote').count();
    const productCatalogAfter = await page.locator('text=Product Catalog').isVisible();
    const configureProducts = await page.locator('text=Configure Products').isVisible();
    
    console.log('After clicking Proceed to Products:');
    console.log('- Configure Products visible:', configureProducts);
    console.log('- Product Catalog visible:', productCatalogAfter);
    console.log('- Add to Quote buttons:', addToQuoteAfter);
    
    // Check for product cards/items
    const productCards = await page.locator('.bg-white.rounded-lg.shadow').count();
    const productButtons = await page.locator('button').count();
    console.log('- Product cards found:', productCards);
    console.log('- Total buttons found:', productButtons);
    
    // Check phase indicator
    const phase3Active = await page.locator('.bg-blue-600:has-text("3")').isVisible();
    console.log('- Phase 3 active:', phase3Active);
    
    // Look for any text with 'Add' or 'Select' 
    const addButtons = await page.locator('button:has-text("Add")').count();
    const selectButtons = await page.locator('button:has-text("Select")').count();
    console.log('- Buttons with "Add":', addButtons);
    console.log('- Buttons with "Select":', selectButtons);
  }
  
  // Check current URL/state
  const url = page.url();
  console.log('Current URL:', url);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-after-room-creation.png', fullPage: true });
  console.log('📸 Screenshot saved as debug-after-room-creation.png');
});

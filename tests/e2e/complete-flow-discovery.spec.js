const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ - Complete Flow Discovery', () => {
  test('discover complete workflow UI', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    console.log('=== STEP 1: Dashboard ===');
    await page.click('text=New Quote');
    
    console.log('=== STEP 2: Customer Selection ===');
    await page.click('text=Elite Kitchen Designs');
    
    console.log('=== STEP 3: Room Creation ===');
    await page.click('text=Create Room & Start Quote');
    
    // Fill room form
    await page.fill('input[placeholder*="Width"]', '12');
    await page.fill('input[placeholder*="Height"]', '8');
    await page.fill('input[placeholder*="Depth"]', '15');
    await page.selectOption('select >> nth=0', 'Kitchen');
    await page.selectOption('select >> nth=1', { label: 'Traditional Oak (traditional)' });
    
    console.log('=== STEP 4: After filling room form ===');
    await page.screenshot({ path: 'test-results/step4-room-filled.png' });
    
    // Click create room again
    await page.click('text=Create Room & Start Quote');
    await page.waitForTimeout(2000);
    
    console.log('=== STEP 5: After creating room ===');
    await page.screenshot({ path: 'test-results/step5-room-created.png' });
    
    // Check what's on the page now
    const bodyText = await page.locator('body').textContent();
    console.log('Page content after room creation:', bodyText.substring(0, 300) + '...');
    
    // Look for product-related buttons
    const productButtons = [
      'Add to Quote',
      'Add Product',
      'Select Product',
      'Choose Product',
      'Add to Cart',
      'Add Item'
    ];
    
    for (const buttonText of productButtons) {
      const visible = await page.locator(`text=${buttonText}`).isVisible();
      console.log(`"${buttonText}" visible:`, visible);
    }
    
    // Get all button texts
    const allButtons = await page.locator('button').allTextContents();
    console.log('All available buttons:', allButtons);
    
    // Look for product cards or lists
    const products = await page.locator('[class*="product"], [class*="item"], [class*="card"]').count();
    console.log('Product-like elements found:', products);
  });
});

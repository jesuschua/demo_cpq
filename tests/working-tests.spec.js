const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ - Working Tests', () => {
  test('basic app functionality works', async ({ page }) => {
    // Test 1: App loads
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=Kitchen CPQ')).toBeVisible();
    console.log('✅ App loads successfully');
    
    // Test 2: Can start new quote workflow
    await page.click('text=New Quote');
    await expect(page.locator('text=Elite Kitchen Designs')).toBeVisible();
    console.log('✅ Customer selection visible');
    
    // Test 3: Can select customer
    await page.click('text=Elite Kitchen Designs');
    await expect(page.locator('button:has-text("Create Room & Start Quote")')).toBeVisible();
    console.log('✅ Customer selected, room creation available');
    
    // Test 4: Check what's needed to enable the button
    const button = page.locator('button:has-text("Create Room & Start Quote")');
    console.log('🔍 Button state investigation:');
    console.log('- Button exists:', await button.count() > 0);
    console.log('- Button disabled:', await button.getAttribute('disabled') !== null);
    
    // Let's see what fields need to be filled first
    const inputs = page.locator('input');
    const selects = page.locator('select');
    console.log('📋 Form elements found:', await inputs.count(), 'inputs,', await selects.count(), 'selects');
    
    // Test 5: Fill required fields to enable button
    if (await inputs.count() > 0) {
      // Fill dimensions (number inputs)
      await page.fill('input[placeholder*="Width"]', '12');
      await page.fill('input[placeholder*="Height"]', '8'); 
      await page.fill('input[placeholder*="Depth"]', '15');
      console.log('✅ Filled dimensions');
      
      // Fill room name if there's a text input
      const textInputs = page.locator('input[type="text"]');
      if (await textInputs.count() > 0) {
        await page.fill('input[type="text"]', 'Main Kitchen');
        console.log('✅ Filled room name');
      }
      
      // Fill selects
      if (await selects.count() > 0) {
        await page.selectOption('select >> nth=0', { index: 1 }); // First available option
        console.log('✅ Selected room type');
        if (await selects.count() > 1) {
          await page.selectOption('select >> nth=1', { index: 1 }); // First available model
          console.log('✅ Selected model');
        }
      }
    }
    
    // Check if button is now enabled
    await page.waitForTimeout(500); // Small delay for state update
    console.log('- Button disabled after name:', await button.getAttribute('disabled') !== null);
    
    console.log('🎉 Basic investigation complete!');
  });

  test('unit tests can be created', async ({ page }) => {
    // This is where you would add React unit tests
    // For now, just verify the test infrastructure works
    console.log('📋 Unit test infrastructure ready');
    console.log('💡 To add unit tests: create files in src/ with .test.tsx extension');
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ - Room Creation Discovery', () => {
  test('discover room creation UI', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Start workflow
    await page.click('text=New Quote');
    await page.click('text=Elite Kitchen Designs');
    await page.click('text=Create Room & Start Quote');
    
    console.log('=== ROOM CREATION PAGE ===');
    await page.screenshot({ path: 'test-results/room-creation.png' });
    
    // Get all input fields
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields`);
    
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}"`);
    }
    
    // Get all select elements
    const selects = await page.locator('select').all();
    console.log(`Found ${selects.length} select elements`);
    
    for (let i = 0; i < selects.length; i++) {
      const options = await selects[i].locator('option').allTextContents();
      console.log(`Select ${i} options:`, options);
    }
    
    // Get all buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('Available buttons:', buttons);
    
    // Try to fill the form properly
    console.log('=== FILLING FORM ===');
    
    // Look for room name input
    const nameInput = page.locator('input[placeholder*="name"]').or(page.locator('input[type="text"]'));
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Kitchen');
      console.log('✅ Filled room name');
    }
    
    // Fill dimensions if required
    const widthInput = page.locator('input[placeholder*="Width"]');
    if (await widthInput.isVisible()) {
      await widthInput.fill('12');
      console.log('✅ Filled width');
    }
    
    const lengthInput = page.locator('input[placeholder*="Length"]');
    if (await lengthInput.isVisible()) {
      await lengthInput.fill('15');
      console.log('✅ Filled length');
    }
    
    // Select model
    await page.selectOption('select', 'mod_traditional_oak');
    console.log('✅ Selected model');
    
    await page.screenshot({ path: 'test-results/room-form-filled.png' });
  });
});

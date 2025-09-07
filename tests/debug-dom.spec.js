const { test, expect } = require('@playwright/test');

test('Debug DOM state after customer selection', async ({ page }) => {
  console.log('=== Starting DOM debug ===');
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  console.log('✅ Page loaded');
  
  // Click New Quote
  await page.click('text=New Quote');
  await page.waitForTimeout(500);
  console.log('✅ Clicked New Quote');
  
  // Select customer  
  await page.click('text=Elite Kitchen Designs');
  await page.waitForTimeout(1000);
  console.log('✅ Selected customer');
  
  // Take screenshot
  await page.screenshot({ path: 'debug-after-customer-selection.png' });
  console.log('✅ Screenshot taken');
  
  // Check if "Create Room & Start Quote" button is present and its state
  const createButton = page.locator('text=Create Room & Start Quote');
  const isVisible = await createButton.isVisible();
  const isEnabled = await createButton.isEnabled();
  console.log(`Create Room button - Visible: ${isVisible}, Enabled: ${isEnabled}`);
  
  // Count and list all select elements
  const selectElements = page.locator('select');
  const selectCount = await selectElements.count();
  console.log(`Found ${selectCount} select elements`);
  
  for (let i = 0; i < selectCount; i++) {
    const select = selectElements.nth(i);
    const options = await select.locator('option').count();
    const value = await select.inputValue();
    const isVisible = await select.isVisible();
    console.log(`Select ${i}: ${options} options, value="${value}", visible=${isVisible}`);
    
    // List first few options
    for (let j = 0; j < Math.min(options, 3); j++) {
      const optionText = await select.locator('option').nth(j).textContent();
      const optionValue = await select.locator('option').nth(j).getAttribute('value');
      console.log(`  Option ${j}: "${optionText}" (value="${optionValue}")`);
    }
  }
  
  // Check for form elements
  const inputs = await page.locator('input').count();
  const textareas = await page.locator('textarea').count();
  console.log(`Found ${inputs} input elements, ${textareas} textarea elements`);
  
  // Dump visible text content
  console.log('=== Page content ===');
  const bodyText = await page.locator('body').textContent();
  console.log(bodyText.substring(0, 1000) + '...');
  
  // Check if form is actually visible
  const formVisible = await page.locator('div:has-text("Room Type")').isVisible();
  console.log(`Room Type form visible: ${formVisible}`);
  
  console.log('=== DOM debug complete ===');
});

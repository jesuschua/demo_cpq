const { test, expect } = require('@playwright/test');

test('Debug processings in room config', async ({ page }) => {
  // Navigate to room configuration 
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.click('text=New Quote');
  await page.waitForTimeout(500);
  await page.click('text=Elite Kitchen Designs');
  await page.waitForTimeout(1000);
  
  // Select model first
  const modelSelect = page.locator('select').nth(1);
  await modelSelect.selectOption('mod_traditional_oak');
  await page.waitForTimeout(300);
  
  // Click Configure Processings
  await page.click('button:has-text("Configure Processings")');
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-processings.png' });
  
  // List all available checkboxes
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  console.log(`Found ${count} processing checkboxes`);
  
  // List all processing names
  const processingLabels = page.locator('h4');
  const labelCount = await processingLabels.count();
  console.log(`Found ${labelCount} processing labels`);
  
  for (let i = 0; i < labelCount; i++) {
    const text = await processingLabels.nth(i).textContent();
    console.log(`Label ${i}: "${text}"`);
  }
  
  // Check specifically for Dark Stain
  const darkStainVisible = await page.locator('text=Dark Stain').isVisible();
  console.log(`Dark Stain visible: ${darkStainVisible}`);
  
  // Check for Install Pulls
  const installPullsVisible = await page.locator('text=Install Pulls').isVisible();
  console.log(`Install Pulls visible: ${installPullsVisible}`);
  
  // Check for Soft-Close Hinges
  const softCloseVisible = await page.locator('text=Soft-Close Hinges').isVisible();
  console.log(`Soft-Close Hinges visible: ${softCloseVisible}`);
});

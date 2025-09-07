const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ - UI Discovery', () => {
  test('discover the actual UI flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    console.log('=== STEP 1: Landing page ===');
    await page.screenshot({ path: 'test-results/step1-landing.png' });
    
    // Click New Quote
    await page.click('text=New Quote');
    await page.waitForTimeout(1000);
    
    console.log('=== STEP 2: After clicking New Quote ===');
    await page.screenshot({ path: 'test-results/step2-after-new-quote.png' });
    
    // Get all visible text
    const bodyText = await page.locator('body').textContent();
    console.log('Page content after New Quote:', bodyText.substring(0, 500));
    
    // Look for customers
    const customers = await page.locator('text=Elite Kitchen Designs').isVisible();
    console.log('Elite Kitchen Designs visible:', customers);
    
    if (customers) {
      await page.click('text=Elite Kitchen Designs');
      await page.waitForTimeout(1000);
      
      console.log('=== STEP 3: After selecting customer ===');
      await page.screenshot({ path: 'test-results/step3-after-customer.png' });
      
      // Look for next buttons
      const buttons = await page.locator('button').allTextContents();
      console.log('Available buttons:', buttons);
      
      // Check what proceed options exist
      const proceedOptions = [
        'Proceed to Room Setup',
        'Proceed',
        'Next',
        'Continue',
        'Room Setup'
      ];
      
      for (const option of proceedOptions) {
        const visible = await page.locator(`text=${option}`).isVisible();
        console.log(`"${option}" visible:`, visible);
      }
    }
  });
});

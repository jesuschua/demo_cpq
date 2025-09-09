const { test, expect } = require('@playwright/test');

test.describe('Kitchen CPQ - Quick Smoke Tests', () => {
  test('app loads and shows dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if we can see the main title
    await expect(page.locator('text=Kitchen CPQ')).toBeVisible();
    
    // Take a screenshot to see what's actually showing
    await page.screenshot({ path: 'test-results/dashboard-state.png' });
    
    console.log('✅ App loads successfully');
  });

  test('can navigate to customer selection', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any button that might start a new quote
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on the page`);
    
    // Get all text content on the page to see what's available
    const bodyText = await page.locator('body').textContent();
    console.log('Page content includes:', bodyText.substring(0, 200) + '...');
    
    // Look for customer names or selection interface
    const hasCustomers = await page.locator('text=Elite Kitchen Designs').isVisible({ timeout: 2000 });
    console.log('Elite Kitchen Designs visible:', hasCustomers);
    
    if (hasCustomers) {
      await page.click('text=Elite Kitchen Designs');
      console.log('✅ Successfully clicked customer');
    } else {
      // Look for new quote button
      const newQuoteSelectors = [
        'text=New Quote',
        'text=Start New Quote', 
        'text=Create Quote',
        'button:has-text("Start")',
        'button:has-text("New")'
      ];
      
      for (const selector of newQuoteSelectors) {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          await page.click(selector);
          console.log(`✅ Clicked button: ${selector}`);
          break;
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/after-interaction.png' });
  });
});

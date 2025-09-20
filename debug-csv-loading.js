const { test, expect } = require('@playwright/test');

test('Debug CSV loading', async ({ page }) => {
  // Listen to console messages
  page.on('console', msg => {
    console.log('CONSOLE:', msg.text());
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load
  await page.waitForTimeout(5000);
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-csv-loading.png' });
  
  // Check what's on the page
  const bodyText = await page.textContent('body');
  console.log('Page content:', bodyText);
});

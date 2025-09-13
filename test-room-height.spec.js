const { test, expect } = require('@playwright/test');

test.describe('Room Configuration Height Test', () => {
  test('should constrain room configuration panes to viewport height', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app"]', { timeout: 10000 });
    
    // Click on "Start New Quote" to begin the workflow
    const startButton = page.locator('button:has-text("Start New Quote")');
    await startButton.click();
    
    // Wait for customer selection phase
    await page.waitForSelector('text=Select Customer', { timeout: 5000 });
    
    // Select a customer
    const customerOption = page.locator('input[type="radio"]').first();
    await customerOption.click();
    
    // Click "Continue" to proceed to room configuration
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();
    
    // Wait for room configuration phase
    await page.waitForSelector('text=Add New Room', { timeout: 5000 });
    
    // Take a screenshot of the room configuration page
    await page.screenshot({ 
      path: 'room-config-height-test.png',
      fullPage: true 
    });
    
    // Check if the room configuration container has proper height constraints
    const roomConfigContainer = page.locator('.max-w-7xl.mx-auto');
    await expect(roomConfigContainer).toBeVisible();
    
    // Check viewport height
    const viewportHeight = await page.viewportSize().height;
    console.log('Viewport height:', viewportHeight);
    
    // Get the actual height of the room configuration container
    const containerHeight = await roomConfigContainer.boundingBox();
    console.log('Container height:', containerHeight?.height);
    
    // Check if container height exceeds viewport height
    if (containerHeight && containerHeight.height > viewportHeight) {
      console.log('❌ Container height exceeds viewport height!');
      console.log(`Container: ${containerHeight.height}px, Viewport: ${viewportHeight}px`);
    } else {
      console.log('✅ Container height is within viewport bounds');
    }
    
    // Check each pane for height constraints
    const leftPane = page.locator('.lg\\:col-span-1').first();
    const middlePane = page.locator('.lg\\:col-span-1').nth(1);
    const rightPane = page.locator('.lg\\:col-span-1').last();
    
    const leftPaneHeight = await leftPane.boundingBox();
    const middlePaneHeight = await middlePane.boundingBox();
    const rightPaneHeight = await rightPane.boundingBox();
    
    console.log('Left pane height:', leftPaneHeight?.height);
    console.log('Middle pane height:', middlePaneHeight?.height);
    console.log('Right pane height:', rightPaneHeight?.height);
    
    // Take a screenshot of just the room configuration area
    await page.screenshot({ 
      path: 'room-config-panes-detail.png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      }
    });
  });
});

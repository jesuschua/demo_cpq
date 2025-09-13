const { test, expect } = require('@playwright/test');

test.describe('Height Verification Test', () => {
  test('should verify room configuration height constraints', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot of the initial page
    await page.screenshot({ 
      path: 'height-test-initial.png',
      fullPage: true 
    });
    
    // Get viewport height
    const viewportHeight = await page.viewportSize().height;
    console.log('Viewport height:', viewportHeight);
    
    // Look for room configuration elements directly
    const roomConfigContainer = page.locator('.max-w-7xl.mx-auto');
    if (await roomConfigContainer.isVisible()) {
      const containerBox = await roomConfigContainer.boundingBox();
      console.log('Room config container height:', containerBox?.height);
      
      if (containerBox && containerBox.height > viewportHeight) {
        console.log('❌ Container height exceeds viewport!');
        console.log(`Container: ${containerBox.height}px, Viewport: ${viewportHeight}px`);
      } else {
        console.log('✅ Container height is within viewport bounds');
      }
      
      // Take a screenshot of the room configuration
      await page.screenshot({ 
        path: 'height-test-room-config.png',
        fullPage: true 
      });
    } else {
      console.log('Room configuration container not found');
    }
  });
});

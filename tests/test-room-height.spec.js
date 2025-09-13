const { test, expect } = require('@playwright/test');

test.describe('Room Configuration Height Test', () => {
  test('should constrain room configuration panes to viewport height', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait a bit for the app to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot of the initial page
    await page.screenshot({ 
      path: 'initial-page.png',
      fullPage: true 
    });
    
    // Look for any button that might start the workflow
    const buttons = await page.locator('button').all();
    console.log('Found buttons:', await Promise.all(buttons.map(btn => btn.textContent())));
    
    // Click "Create Quote" to start the workflow
    const createQuoteButton = page.locator('button:has-text("Create Quote")');
    if (await createQuoteButton.isVisible()) {
      await createQuoteButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking Create Quote
      await page.screenshot({ 
        path: 'after-create-quote.png',
        fullPage: true 
      });
      
      // Look for customer selection
      const customerSection = page.locator('text=Select Customer');
      if (await customerSection.isVisible()) {
        // Select first customer
        const customerOption = page.locator('input[type="radio"]').first();
        await customerOption.click();
        
        // Click Continue
        const continueButton = page.locator('button:has-text("Continue")');
        await continueButton.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot after customer selection
        await page.screenshot({ 
          path: 'after-customer-selection.png',
          fullPage: true 
        });
      }
      
      // Look for room configuration elements
      const roomElements = await page.locator('text=Add New Room, text=Configured Rooms, text=Available Room Processings').all();
      console.log('Found room elements:', roomElements.length);
      
      if (roomElements.length > 0) {
        // Take a screenshot of the room configuration page
        await page.screenshot({ 
          path: 'room-config-height-test.png',
          fullPage: true 
        });
        
        // Check viewport height
        const viewportHeight = await page.viewportSize().height;
        console.log('Viewport height:', viewportHeight);
        
        // Check if the room configuration container has proper height constraints
        const roomConfigContainer = page.locator('.max-w-7xl.mx-auto');
        if (await roomConfigContainer.isVisible()) {
          const containerHeight = await roomConfigContainer.boundingBox();
          console.log('Container height:', containerHeight?.height);
          
          // Check if container height exceeds viewport height
          if (containerHeight && containerHeight.height > viewportHeight) {
            console.log('❌ Container height exceeds viewport height!');
            console.log(`Container: ${containerHeight.height}px, Viewport: ${viewportHeight}px`);
          } else {
            console.log('✅ Container height is within viewport bounds');
          }
        }
      }
    }
  });
});

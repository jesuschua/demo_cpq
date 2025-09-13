const { test, expect } = require('@playwright/test');

test.describe('Room Height Actual Test', () => {
  test('should navigate to room configuration and check height overflow', async ({ page }) => {
    // Set a smaller viewport to test overflow
    await page.setViewportSize({ width: 1200, height: 600 });
    // Follow the exact regression test path to get to room configuration quickly
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 1: Start new quote and select customer
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    
    // Click on John Smith Construction in the customer selection modal
    await page.click('text=John Smith Construction');
    // Click "Create Order" button for the selected customer
    await page.click('button:has-text("Create Order")');

    // Step 2: Create a room (this should take us to room configuration)
    await page.waitForTimeout(2000);
    
    // Check what's actually on the page
    const allButtons = await page.locator('button').all();
    console.log('Available buttons:', await Promise.all(allButtons.map(btn => btn.textContent())));
    
    // Look for room type and style selects
    const selects = await page.locator('select').all();
    console.log('Available selects:', selects.length);
    
    if (selects.length >= 2) {
      const roomTypeSelect = page.locator('select').first();
      await roomTypeSelect.selectOption('Kitchen');
      const styleSelect = page.locator('select').nth(1);
      await styleSelect.selectOption('mod_traditional_oak');
    }
    
    // Look for any button that might create a room
    const createButtons = await page.locator('button').all();
    for (const button of createButtons) {
      const text = await button.textContent();
      if (text && (text.includes('Create') || text.includes('Add') || text.includes('Start'))) {
        console.log('Found button:', text);
        await button.click();
        break;
      }
    }

    // Wait for room configuration to load
    await page.waitForTimeout(3000);

    // Take a full page screenshot to see the actual state
    await page.screenshot({ 
      path: 'room-config-actual-state.png',
      fullPage: true 
    });

    // Get viewport height
    const viewportHeight = await page.viewportSize().height;
    console.log('Viewport height:', viewportHeight);

    // Look for the room configuration container specifically - use the grid container
    const roomConfigContainer = page.locator('.grid.grid-cols-1.lg\\:grid-cols-3');
    if (await roomConfigContainer.isVisible()) {
      const containerBox = await roomConfigContainer.boundingBox();
      console.log('Room config grid container height:', containerBox?.height);
      
      if (containerBox && containerBox.height > viewportHeight) {
        console.log('❌ Grid container height exceeds viewport!');
        console.log(`Container: ${containerBox.height}px, Viewport: ${viewportHeight}px`);
      } else {
        console.log('✅ Grid container height is within viewport bounds');
      }
    }

    // Check the main container that should have the height constraints
    const mainContainer = page.locator('.max-w-7xl.mx-auto').last();
    if (await mainContainer.isVisible()) {
      const mainBox = await mainContainer.boundingBox();
      console.log('Main container height:', mainBox?.height);
      
      if (mainBox && mainBox.height > viewportHeight) {
        console.log('❌ Main container height exceeds viewport!');
        console.log(`Main: ${mainBox.height}px, Viewport: ${viewportHeight}px`);
      } else {
        console.log('✅ Main container height is within viewport bounds');
      }
    }

    // Check each pane individually using the grid columns
    const leftPane = page.locator('.lg\\:col-span-1').first();
    const middlePane = page.locator('.lg\\:col-span-1').nth(1);
    const rightPane = page.locator('.lg\\:col-span-1').last();

    if (await leftPane.isVisible()) {
      const leftBox = await leftPane.boundingBox();
      console.log('Left pane height:', leftBox?.height);
    }

    if (await middlePane.isVisible()) {
      const middleBox = await middlePane.boundingBox();
      console.log('Middle pane height:', middleBox?.height);
    }

    if (await rightPane.isVisible()) {
      const rightBox = await rightPane.boundingBox();
      console.log('Right pane height:', rightBox?.height);
    }

    // Check the actual CSS styles applied
    const gridContainer = page.locator('.grid.grid-cols-1.lg\\:grid-cols-3');
    const computedStyle = await gridContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        height: styles.height,
        maxHeight: styles.maxHeight,
        overflow: styles.overflow,
        position: styles.position
      };
    });
    console.log('Grid container computed styles:', computedStyle);

    // Check the main container styles
    const mainContainerElement = page.locator('.max-w-7xl.mx-auto').last();
    const mainComputedStyle = await mainContainerElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        height: styles.height,
        maxHeight: styles.maxHeight,
        overflow: styles.overflow,
        position: styles.position
      };
    });
    console.log('Main container computed styles:', mainComputedStyle);

    // Take a screenshot of just the room configuration area
    await page.screenshot({ 
      path: 'room-config-detail.png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      }
    });
  });
});

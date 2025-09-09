const { test, expect } = require('@playwright/test');

test.describe('Verify Debug Button and Processing Options', () => {
  test('quick verification test', async ({ page }) => {
    console.log('=== Quick Verification Test ===');
    
    // Navigate to app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verify-1-initial.png' });
    
    // Check for debug panel immediately
    const debugPanel = page.locator('text=DEBUG PANEL - ALWAYS VISIBLE');
    if (await debugPanel.isVisible()) {
      console.log('✅ DEBUG PANEL FOUND ON INITIAL LOAD!');
      await page.screenshot({ path: 'verify-1a-debug-panel-initial.png' });
    } else {
      console.log('❌ DEBUG PANEL NOT FOUND ON INITIAL LOAD');
    }
    
    // Start new quote
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-2-customers.png' });
    
    // Select customer
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-3-room-config.png' });
    
    // Fill room form
    await page.locator('select').filter({ hasText: 'Select a style' }).selectOption({ index: 1 });
    await page.fill('textarea', 'Test room');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verify-4-products.png' });
    
    // Add a product
    const addButtons = await page.locator('button').filter({ hasText: 'Add to Quote' }).all();
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'verify-5-after-add-product.png' });
    }
    
    // Go to quote builder
    const configureButton = page.locator('button').filter({ hasText: 'Configure Items' });
    if (await configureButton.isVisible()) {
      await configureButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'verify-6-quote-builder.png' });
      
      // Check for debug panel
      const debugPanel = page.locator('text=DEBUG PANEL');
      if (await debugPanel.isVisible()) {
        console.log('✅ DEBUG PANEL FOUND!');
        await page.screenshot({ path: 'verify-7-debug-panel-found.png' });
        
        // Test debug buttons
        const testButton = page.locator('button').filter({ hasText: 'TEST CUSTOM PAINT' });
        const forceButton = page.locator('button').filter({ hasText: 'FORCE MODAL' });
        
        if (await testButton.isVisible()) {
          console.log('✅ TEST CUSTOM PAINT button found');
        } else {
          console.log('❌ TEST CUSTOM PAINT button NOT found');
        }
        
        if (await forceButton.isVisible()) {
          console.log('✅ FORCE MODAL button found');
        } else {
          console.log('❌ FORCE MODAL button NOT found');
        }
        
        // Test force modal
        if (await forceButton.isVisible()) {
          await forceButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'verify-8-force-modal-clicked.png' });
          
          // Check if modal appeared
          const modal = page.locator('text=Configure Custom Paint Color');
          if (await modal.isVisible()) {
            console.log('✅ PROCESSING OPTIONS MODAL APPEARED!');
            await page.screenshot({ path: 'verify-9-modal-appeared.png' });
          } else {
            console.log('❌ Processing options modal did NOT appear');
          }
        }
        
      } else {
        console.log('❌ DEBUG PANEL NOT FOUND!');
        
        // Check what's actually on the page
        const pageContent = await page.textContent('body');
        console.log('Page content:', pageContent.substring(0, 500));
        
        // Look for any red elements
        const redElements = await page.locator('[class*="red"]').all();
        console.log(`Found ${redElements.length} red elements`);
      }
      
      // Check for available processings
      const availableProcessings = page.locator('text=Available Processings:');
      if (await availableProcessings.isVisible()) {
        console.log('✅ Available processings section found');
        await page.screenshot({ path: 'verify-10-available-processings.png' });
        
        // Look for custom paint
        const customPaint = page.locator('text=Custom Paint Color');
        if (await customPaint.isVisible()) {
          console.log('✅ Custom Paint Color processing found');
        } else {
          console.log('❌ Custom Paint Color processing NOT found');
        }
      } else {
        console.log('❌ Available processings section NOT found');
      }
      
    } else {
      console.log('❌ Configure Items button NOT found');
    }
    
    console.log('=== Verification Complete ===');
  });
});

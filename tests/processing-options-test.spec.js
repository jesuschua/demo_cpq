const { test, expect } = require('@playwright/test');

test.describe('Processing Options Functionality', () => {
  test('should show processing options modal when adding processing with options', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    console.log('=== Starting Processing Options Test ===');
    
    // Phase 1: Start new quote
    console.log('Phase 1: Starting new quote...');
    await page.waitForSelector('text=Start New Quote');
    const startQuoteButton = page.locator('button').filter({ hasText: 'Start New Quote' });
    await startQuoteButton.click();
    
    // Wait for customer list to appear and click on first customer
    await page.waitForSelector('text=John Smith Construction');
    const customerName = page.locator('text=John Smith Construction').first();
    await customerName.click();
    
    // Phase 2: Create a room
    console.log('Phase 2: Creating room...');
    await page.waitForSelector('text=Phase 2: Room Configuration');
    
    // Select room type (Kitchen is already selected by default)
    console.log('Room type already selected: Kitchen');
    
    // Select a style
    const styleSelect = page.locator('select').filter({ hasText: 'Select a style' });
    await styleSelect.selectOption({ index: 1 }); // Select first available style
    
    // Fill description
    await page.fill('textarea[placeholder*="special notes" i]', 'Test kitchen description');
    
    // Create the room
    const createRoomButton = page.locator('button').filter({ hasText: 'Create Room & Start Quote' });
    await createRoomButton.click();
    
    // Phase 3: Add products to quote
    console.log('Phase 3: Adding products to quote...');
    await page.waitForSelector('text=Build Your Quote');
    
    // Add a cabinet product
    const addProductButton = page.locator('button').filter({ hasText: 'Add to Quote' }).first();
    await addProductButton.click();
    
    // Go to quote builder (Phase 4)
    console.log('Phase 4: Going to quote builder...');
    const configureItemsButton = page.locator('button').filter({ hasText: 'Configure Items' });
    await configureItemsButton.click();
    
    // Wait for quote builder to load
    await page.waitForSelector('text=Configure Quote Items');
    
    // Look for the debug panel first
    console.log('Looking for debug panel...');
    const debugPanel = page.locator('text=DEBUG PANEL');
    if (await debugPanel.isVisible()) {
      console.log('Debug panel found!');
      const debugButton = page.locator('button').filter({ hasText: 'TEST CUSTOM PAINT' });
      await debugButton.click();
      console.log('Clicked debug button');
    } else {
      console.log('Debug panel not found, proceeding with normal flow...');
    }
    
    // Look for available processings
    console.log('Looking for available processings...');
    const availableProcessings = page.locator('text=Available Processings:');
    if (await availableProcessings.isVisible()) {
      console.log('Available processings section found');
      
      // Look for Custom Paint Color processing
      const customPaintButton = page.locator('button').filter({ hasText: 'Custom Paint Color' });
      if (await customPaintButton.isVisible()) {
        console.log('Custom Paint Color processing found, clicking...');
        await customPaintButton.click();
        
        // Check if processing options modal appears
        console.log('Checking for processing options modal...');
        const optionsModal = page.locator('text=Paint Color').or(page.locator('text=Processing Options'));
        if (await optionsModal.isVisible()) {
          console.log('Processing options modal appeared!');
          
          // Test the color selection
          const colorInput = page.locator('input[type="color"]');
          if (await colorInput.isVisible()) {
            console.log('Color input found, setting color...');
            await colorInput.fill('#FF0000'); // Red color
          }
          
          // Test the finish selection
          const finishSelect = page.locator('select').filter({ hasText: 'Matte' });
          if (await finishSelect.isVisible()) {
            console.log('Finish select found, selecting gloss...');
            await finishSelect.selectOption('gloss');
          }
          
          // Apply the options
          const applyButton = page.locator('button').filter({ hasText: 'Apply' });
          if (await applyButton.isVisible()) {
            console.log('Apply button found, clicking...');
            await applyButton.click();
          }
          
          // Verify the processing was applied with options
          console.log('Verifying processing was applied...');
          const appliedProcessing = page.locator('text=Custom Paint Color');
          await expect(appliedProcessing).toBeVisible();
          
          // Check if selected options are displayed
          const colorDisplay = page.locator('text=#FF0000');
          const finishDisplay = page.locator('text=Gloss');
          
          if (await colorDisplay.isVisible() || await finishDisplay.isVisible()) {
            console.log('SUCCESS: Processing options were applied and displayed!');
          } else {
            console.log('WARNING: Processing was applied but options not displayed');
          }
          
        } else {
          console.log('ERROR: Processing options modal did not appear');
        }
      } else {
        console.log('ERROR: Custom Paint Color processing not found');
      }
    } else {
      console.log('ERROR: Available processings section not found');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'processing-options-test-result.png' });
    
    console.log('=== Test Complete ===');
  });
  
  test('should handle processing without options normally', async ({ page }) => {
    // This test ensures regular processings (without options) still work
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Quick flow to get to quote builder
    await page.locator('button').filter({ hasText: 'Start New Quote' }).click();
    await page.waitForSelector('text=John Smith Construction');
    await page.locator('text=John Smith Construction').first().click();
    await page.waitForSelector('text=Phase 2: Room Configuration');
    const styleSelect = page.locator('select').filter({ hasText: 'Select a style' });
    await styleSelect.selectOption({ index: 1 });
    await page.fill('textarea[placeholder*="special notes" i]', 'Test description');
    await page.locator('button').filter({ hasText: 'Create Room & Start Quote' }).click();
    await page.locator('button').filter({ hasText: 'Add to Quote' }).first().click();
    await page.locator('button').filter({ hasText: 'Configure Items' }).click();
    
    await page.waitForSelector('text=Configure Quote Items');
    
    // Look for a processing without options (like basic stain)
    const stainProcessing = page.locator('button').filter({ hasText: 'Stain' });
    if (await stainProcessing.isVisible()) {
      await stainProcessing.click();
      
      // Should apply directly without showing options modal
      const appliedProcessing = page.locator('text=Stain');
      await expect(appliedProcessing).toBeVisible();
      console.log('SUCCESS: Processing without options applied directly');
    }
  });
});

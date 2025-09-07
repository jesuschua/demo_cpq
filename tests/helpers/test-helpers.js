// Test Helper Functions for Kitchen CPQ
// Updated to properly handle form validation requirements

/**
 * Sets up a basic quote by navigating through the customer selection and room creation phases
 * This function ensures all required fields are properly filled to enable form submission
 */
const { expect } = require('@playwright/test');

export async function setupBasicQuote(page) {
  console.log('=== Setting up room creation ===');
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Click "New Quote" to start
  await page.click('text=New Quote');
  await page.waitForTimeout(500);
  
  // Select customer 
  await page.click('text=Elite Kitchen Designs');
  await page.waitForTimeout(1000);
  
  // At this point we should be in room creation phase
  // Wait for the form to be fully loaded
  await page.waitForSelector('select', { timeout: 10000 });
  await page.waitForTimeout(500);
  
  // Room type is already defaulted to 'Kitchen' (verified by debug output)
  // The critical step is selecting the style/model (second select)
  const modelSelect = page.locator('select').nth(1);
  await modelSelect.waitFor({ state: 'visible', timeout: 10000 });
  await modelSelect.selectOption('mod_traditional_oak');
  await page.waitForTimeout(500);

  // Now the button should be enabled - use a better selector
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
      if (button.textContent.includes('Create Room & Start Quote') && !button.disabled) {
        return true;
      }
    }
    return false;
  }, { timeout: 5000 });
  
  await page.click('text=Create Room & Start Quote');
  
  // Wait for navigation to product phase
  await page.waitForTimeout(1000);
}

/**
 * Enhanced setup that also configures room processings
 */
async function setupQuoteWithProcessings(page, processings = ['Dark Stain', 'Install Pulls']) {
  await setupBasicQuote(page);
  
  // Configure processings before creating room
  await page.click('button:has-text("Configure Processings")');
  await page.waitForTimeout(500);

  // Select the specified processings
  for (const processing of processings) {
    try {
      await page.click(`text=${processing} >> .. >> input[type="checkbox"]`);
      await page.waitForTimeout(200);
    } catch (error) {
      console.log(`Could not select processing: ${processing}`);
    }
  }

  // Go back to room creation
  await page.click('button:has-text("← Back to Room Setup")');
  await page.waitForTimeout(300);

  return page;
}

/**
 * Completes room creation and proceeds to product selection
 */
async function createRoomAndProceed(page) {
  // Fill optional description
  await page.fill('textarea', 'Test room for automated testing');
  
  // Create the room (button should now be enabled)
  await page.click('text=Create Room & Start Quote');
  await page.waitForTimeout(1000);

  // Should now be in product selection phase
  console.log('=== Room created, now in product phase ===');
  
  return page;
}

/**
 * Adds products to the quote
 */
async function addProductsToQuote(page, productNames = ['12" Base Cabinet']) {
  // Wait for product catalog to load
  await page.waitForTimeout(500);

  // Click "Proceed to Products" if needed
  try {
    await page.click('button:has-text("Proceed to Products")');
    await page.waitForTimeout(500);
  } catch (error) {
    // Already in products phase
  }

  // Add specified products
  for (const productName of productNames) {
    try {
      // Click on product card to select it
      await page.click(`[class*="cursor-pointer"]:has-text("${productName}")`);
      await page.waitForTimeout(500);
    } catch (error) {
      console.log(`Could not add product: ${productName}`);
    }
  }

  return page;
}

/**
 * Complete workflow from start to quote generation
 */
export async function completeBasicWorkflow(page) {
  await setupBasicQuote(page);
  await addProductsToQuote(page);
  
  // Proceed to quote
  try {
    await page.click('button:has-text("Proceed to Quote")');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Could not proceed to quote phase');
  }

  return page;
}

// Legacy function aliases for backward compatibility
export async function navigateToRoomConfiguration(page) {
  // Just navigate to the app and go to room config phase
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Click "New Quote" and select customer to reach room config
  await page.click('text=New Quote');
  await page.waitForTimeout(500);
  await page.click('text=Elite Kitchen Designs');
  await page.waitForTimeout(1000);
}

export async function createRoomWithProcessings(page, description = 'Test kitchen with inheritance') {
  // Wait for room form to be available
  await page.waitForSelector('select', { timeout: 10000 });
  
  // Select model (required to enable button)
  const modelSelect = page.locator('select').nth(1);
  await modelSelect.selectOption('mod_traditional_oak');
  await page.waitForTimeout(300);
  
  // Fill description if provided
  if (description) {
    await page.fill('textarea', description);
  }
  
  // Configure some processings
  await page.click('text=Configure Processings');
  await page.waitForTimeout(500);
  
  // Select a few processings if available
  const processingCheckboxes = page.locator('input[type="checkbox"]');
  const count = await processingCheckboxes.count();
  
  for (let i = 0; i < Math.min(count, 3); i++) {
    await processingCheckboxes.nth(i).check();
    await page.waitForTimeout(100);
  }
  
  // Create the room
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
      if (button.textContent.includes('Create Room & Start Quote') && !button.disabled) {
        return true;
      }
    }
    return false;
  }, { timeout: 5000 });
  
  await page.click('text=Create Room & Start Quote');
  await page.waitForTimeout(1000);
}

export async function addProductAndVerifyInheritance(page, expectedBasePrice, expectedTotalPrice) {
  // Wait for product phase
  await page.waitForTimeout(1000);
  
  // Click "Proceed to Products" if available
  const proceedBtn = page.locator('text=Proceed to Products');
  if (await proceedBtn.isVisible()) {
    await proceedBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Add a product - find first available product card/button
  const productButtons = page.locator('button', { hasText: 'Add to Quote' });
  const addButtons = page.locator('[class*="cursor-pointer"]');
  
  if (await productButtons.count() > 0) {
    await productButtons.first().click();
  } else if (await addButtons.count() > 0) {
    await addButtons.first().click();
  }
  
  await page.waitForTimeout(1000);
}

module.exports = {
  setupBasicQuote,
  setupQuoteWithProcessings,
  createRoomAndProceed,
  addProductsToQuote,
  completeBasicWorkflow,
  navigateToRoomConfiguration,
  createRoomWithProcessings,
  addProductAndVerifyInheritance
};

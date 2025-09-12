const { test, expect } = require('@playwright/test');

test.describe('Complete Processing Workflow Test', () => {
  test('Complete workflow: add product → select product → configure processing → apply → check print preview', async ({ page }) => {
    // Set up console log capturing
    await page.evaluate(() => {
      window.consoleLogs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        window.consoleLogs.push(args.join(' '));
        originalLog.apply(console, args);
      };
    });

    // Step 1: Navigate to the app
    await page.goto('http://localhost:3000');
    console.log('✅ Navigated to localhost:3000');

    // Wait for the app to load
    await page.waitForTimeout(2000);

    // Debug: Check what's on the page
    const pageTitle = await page.title();
    console.log(`🔧 Page title: ${pageTitle}`);

    // Check for any buttons on the page
    const allButtons = await page.locator('button').all();
    console.log(`🔧 Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`🔧 Button ${i}: "${buttonText}"`);
    }

    // Check for any text that might indicate the current state
    const allText = await page.locator('body').textContent();
    console.log(`🔧 Page content: ${allText.substring(0, 500)}...`);

    // Step 2: Start new quote and select customer
    const startNewQuoteButton = page.locator('button:has-text("Start New Quote")');
    if (await startNewQuoteButton.isVisible()) {
      await startNewQuoteButton.click();
      console.log('✅ Clicked Start New Quote');
      
      // Wait for customer selection to appear
      await page.waitForTimeout(2000);
      
      // Check what's on the page after clicking Start New Quote
      const buttonsAfterStart = await page.locator('button').all();
      console.log(`🔧 Found ${buttonsAfterStart.length} buttons after Start New Quote`);
      
      for (let i = 0; i < buttonsAfterStart.length; i++) {
        const buttonText = await buttonsAfterStart[i].textContent();
        console.log(`🔧 Button ${i}: "${buttonText}"`);
      }
      
      // Look for customer names
      const customerText = await page.locator('text=/John|Smith|Construction/').all();
      console.log(`🔧 Found ${customerText.length} customer-related text elements`);
      
      for (let i = 0; i < customerText.length; i++) {
        const text = await customerText[i].textContent();
        console.log(`🔧 Customer text ${i}: "${text}"`);
      }
    } else {
      console.log('❌ Start New Quote button not found');
    }

    // Click on John Smith Construction
    await page.click('text=John Smith Construction');
    console.log('✅ Selected John Smith Construction');

    // Wait for the page to transition after customer selection
    await page.waitForTimeout(2000);

    // Debug: Check what's on the page after customer selection
    const buttonsAfterCustomer = await page.locator('button').all();
    console.log(`🔧 Found ${buttonsAfterCustomer.length} buttons after customer selection`);
    
    for (let i = 0; i < buttonsAfterCustomer.length; i++) {
      const buttonText = await buttonsAfterCustomer[i].textContent();
      console.log(`🔧 Button ${i}: "${buttonText}"`);
    }

    // Check for form inputs
    const inputs = await page.locator('input').all();
    console.log(`🔧 Found ${inputs.length} input fields`);
    
    for (let i = 0; i < inputs.length; i++) {
      const inputName = await inputs[i].getAttribute('name');
      const inputType = await inputs[i].getAttribute('type');
      console.log(`🔧 Input ${i}: name="${inputName}", type="${inputType}"`);
    }

    // Check for select elements
    const selects = await page.locator('select').all();
    console.log(`🔧 Found ${selects.length} select elements`);
    
    for (let i = 0; i < selects.length; i++) {
      const selectName = await selects[i].getAttribute('name');
      console.log(`🔧 Select ${i}: name="${selectName}"`);
    }

    // Check the page content
    const pageContentAfterCustomer = await page.locator('body').textContent();
    console.log(`🔧 Page content after customer selection: ${pageContentAfterCustomer.substring(0, 500)}...`);

    // Step 3: Create a room
    // Debug: Check what options are available in the select elements
    const roomTypeSelect = page.locator('select').first();
    const roomTypeOptions = await roomTypeSelect.locator('option').all();
    console.log(`🔧 Found ${roomTypeOptions.length} room type options`);
    
    for (let i = 0; i < roomTypeOptions.length; i++) {
      const optionText = await roomTypeOptions[i].textContent();
      const optionValue = await roomTypeOptions[i].getAttribute('value');
      console.log(`🔧 Room type option ${i}: "${optionText}" (value: "${optionValue}")`);
    }

    const styleSelect = page.locator('select').nth(1);
    const styleOptions = await styleSelect.locator('option').all();
    console.log(`🔧 Found ${styleOptions.length} style options`);
    
    for (let i = 0; i < styleOptions.length; i++) {
      const optionText = await styleOptions[i].textContent();
      const optionValue = await styleOptions[i].getAttribute('value');
      console.log(`🔧 Style option ${i}: "${optionText}" (value: "${optionValue}")`);
    }

    // Select room type (Kitchen) - use the correct value
    await roomTypeSelect.selectOption('Kitchen');
    console.log('✅ Selected room type: Kitchen');

    // Select style (Traditional Oak) - use the correct value
    await styleSelect.selectOption('mod_traditional_oak');
    console.log('✅ Selected style: mod_traditional_oak');

    // Click Create Room & Start Quote button
    await page.click('button:has-text("Create Room & Start Quote")');
    console.log('✅ Created room and started quote');

    // Step 4: Move to product configuration
    await page.click('button:has-text("Continue →")');
    console.log('✅ Moved to product configuration');

    // Add a product
    await page.click('text=12" Base Cabinet');
    console.log('✅ Added 12" Base Cabinet');

    // Step 5: Select the product in the order to show Available Processing
    // Wait a bit for the product to appear in the order
    await page.waitForTimeout(2000);
    
    // Look for the correct "Your Order" section (the one with "1 product selected")
    const yourOrderSection = page.locator('text=Your Order').filter({ hasText: '1 product selected' }).locator('..');
    const orderContent = await yourOrderSection.textContent();
    console.log(`🔧 Your Order section content: ${orderContent.substring(0, 500)}...`);
    
    // Look for any products in the order section
    const allOrderProducts = yourOrderSection.locator('div').all();
    const orderProductsArray = await allOrderProducts;
    console.log(`🔧 Found ${orderProductsArray.length} divs in Your Order section`);
    
    // Look for any text containing "12" Base Cabinet" in the order section
    const productText = yourOrderSection.locator('text=/12" Base Cabinet/');
    const productTextCount = await productText.count();
    console.log(`🔧 Found ${productTextCount} text elements containing "12" Base Cabinet" in order`);
    
    // Try to find the product in the order
    const productInOrder = yourOrderSection.locator('div.cursor-pointer').filter({ hasText: '12" Base Cabinet' });
    const productVisible = await productInOrder.isVisible();
    console.log(`🔧 Product in order visible: ${productVisible}`);

    if (productVisible) {
      await productInOrder.click();
      console.log('✅ Clicked on product in order');
      await page.waitForTimeout(1000);
    } else {
      // Try a different approach - look for any clickable element with the product name
      const anyProductElement = yourOrderSection.locator('*:has-text("12" Base Cabinet")').first();
      const anyProductVisible = await anyProductElement.isVisible();
      console.log(`🔧 Any product element visible: ${anyProductVisible}`);
      
      if (anyProductVisible) {
        await anyProductElement.click();
        console.log('✅ Clicked on any product element in order');
        await page.waitForTimeout(1000);
      } else {
        throw new Error('❌ Product not found in order - cannot proceed');
      }
    }

    // Step 6: Check Available Processing section
    const availableProcessingSection = page.locator('text=Available Processing');
    const isVisible = await availableProcessingSection.isVisible();
    console.log(`🔧 Available Processing section visible: ${isVisible}`);
    
    if (isVisible) {
      // Get the full HTML of the Available Processing section
      const processingContainer = page.locator('div:has-text("Available Processing")').first();
      const containerHTML = await processingContainer.innerHTML();
      console.log('🔍 Available Processing container HTML:');
      console.log(containerHTML);
      
      // Look for any buttons in the processing section
      const buttons = processingContainer.locator('button');
      const buttonCount = await buttons.count();
      console.log(`🔘 Found ${buttonCount} buttons in Available Processing section`);
      
      // Look for Dark Stain specifically
      const darkStainButton = processingContainer.locator('button:has-text("Configure")').filter({ hasText: 'Dark Stain' });
      const darkStainCount = await darkStainButton.count();
      console.log(`🔧 Found ${darkStainCount} Dark Stain Configure buttons`);
      
      // Look for processing items
      const processingItems = processingContainer.locator('text=/Dark Stain|Cut to Size|Medium Stain/');
      const processingCount = await processingItems.count();
      console.log(`🔧 Found ${processingCount} processing items`);
      
      // Check if we see the "Select a Product" message
      const selectProductMessage = processingContainer.locator('text=Select a Product');
      const hasSelectMessage = await selectProductMessage.isVisible();
      console.log(`🔧 Has "Select a Product" message: ${hasSelectMessage}`);
      
      if (hasSelectMessage) {
        throw new Error('❌ Available Processing shows "Select a Product" message - product selection failed');
      }
      
      // Check if there are any processing items at all
      const allProcessingItems = processingContainer.locator('div').all();
      const allProcessingItemsArray = await allProcessingItems;
      console.log(`🔧 Found ${allProcessingItemsArray.length} divs in Available Processing section`);
      
      // Look for any text that might indicate processing items
      const processingText = processingContainer.locator('text=/Processing|Configure|Add/');
      const processingTextCount = await processingText.count();
      console.log(`🔧 Found ${processingTextCount} processing-related text elements`);
      
      // Capture browser console logs
      const consoleLogs = await page.evaluate(() => window.consoleLogs || []);
      console.log('🔧 Browser console logs:', consoleLogs);
      
      // If no buttons are found, wait a bit longer
      if (buttonCount === 0) {
        console.log('🔧 No buttons found, waiting longer for processing items to render...');
        await page.waitForTimeout(3000);
        
        const buttonsAfterWait = processingContainer.locator('button');
        const buttonCountAfterWait = await buttonsAfterWait.count();
        console.log(`🔘 Found ${buttonCountAfterWait} buttons after waiting`);
        
        if (buttonCountAfterWait === 0) {
          throw new Error('❌ No processing buttons found in Available Processing section - cannot proceed to print preview');
        }
      }
      
      // Find all Configure buttons and click the Dark Stain one (index 1)
      const allConfigureButtons = processingContainer.locator('button:has-text("Configure")');
      const configureButtonCount = await allConfigureButtons.count();
      console.log(`🔧 Found ${configureButtonCount} Configure buttons total`);

      // Log all configure buttons to see what we have
      for (let i = 0; i < configureButtonCount; i++) {
        const buttonText = await allConfigureButtons.nth(i).textContent();
        const parentText = await allConfigureButtons.nth(i).locator('..').textContent();
        console.log(`🔧 Configure button ${i}: "${buttonText}" (parent: "${parentText.substring(0, 50)}...")`);
      }

      // Click the Dark Stain Configure button (index 1 based on test output)
      if (configureButtonCount >= 2) {
        console.log('🔧 Attempting to click Dark Stain Configure button (index 1)');
        await allConfigureButtons.nth(1).click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicked Dark Stain Configure button');
      } else {
        throw new Error('❌ Not enough Configure buttons found');
      }
      
      // Wait for modal to appear
      await page.waitForTimeout(2000);
      
      // Check for modal heading
      const modalHeadings = await page.locator('h3:has-text("Configure")').all();
      console.log(`🔧 Found ${modalHeadings.length} modal headings with "Configure"`);

      // Check for any headings on the page
      const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      console.log(`🔧 Found ${allHeadings.length} headings on page`);

      // Log the text of all headings to see what's available
      for (let i = 0; i < allHeadings.length; i++) {
        const headingText = await allHeadings[i].textContent();
        console.log(`🔧 Heading ${i}: "${headingText}"`);
      }

      const modalVisible = modalHeadings.length > 0;
      console.log(`🔧 Modal visible: ${modalVisible}`);

      if (modalVisible) {
        // Check what options are available in the select
        const selectElements = await page.locator('select').all();
        console.log(`🔧 Found ${selectElements.length} select elements`);

        if (selectElements.length > 0) {
          // Get all available options
          const options = await selectElements[0].locator('option').all();
          console.log(`🔧 Found ${options.length} options in select`);

          for (let i = 0; i < options.length; i++) {
            const optionText = await options[i].textContent();
            const optionValue = await options[i].getAttribute('value');
            console.log(`🔧 Option ${i}: "${optionText}" (value: "${optionValue}")`);
          }

          // Select the first available option
          if (options.length > 1) {
            const firstOptionValue = await options[1].getAttribute('value');
            console.log(`🔧 Selecting option with value: "${firstOptionValue}"`);
            await selectElements[0].selectOption(firstOptionValue);
            console.log('✅ Selected option in modal');
          } else if (options.length > 0) {
            const firstOptionValue = await options[0].getAttribute('value');
            console.log(`🔧 Selecting first option with value: "${firstOptionValue}"`);
            await selectElements[0].selectOption(firstOptionValue);
            console.log('✅ Selected option in modal');
          }
        }

        const applyButton = page.locator('button:has-text("Apply Processing")');
        if (await applyButton.isVisible()) {
          await applyButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Applied processing');
        }
      } else {
        // Check if there are any console errors
        const consoleLogs = await page.evaluate(() => window.consoleLogs || []);
        console.log('🔧 Console logs after button click:', consoleLogs);
      }
    } else {
      console.log('❌ Available Processing section not visible');
    }
    
    // Step 7: Verify that a processing was actually applied
    const orderSection = page.locator('text=Your Order');
    const hasProcessingInOrder = await orderSection.locator('..').locator('text=/Dark Stain|Processing/').isVisible();
    console.log(`🔧 Has processing in order: ${hasProcessingInOrder}`);
    
    if (!hasProcessingInOrder) {
      throw new Error('❌ No processing found in order - cannot proceed to print preview');
    }
    
    // Step 8: Go to Fees phase and check print preview
    await page.click('button:has-text("Continue →")');
    console.log('✅ Moved to Fees phase');

    // Click Preview Print button
    const printButton = page.locator('button:has-text("Print"), button:has-text("Preview"), button:has-text("Generate")');
    await printButton.click();
    console.log('✅ Clicked print preview button');

    // Wait for print preview to load
    await page.waitForTimeout(2000);

    // Check if Dark Stain appears in the print preview
    const printPreview = page.locator('text=/Dark Stain|Processing/');
    const hasDarkStainInPreview = await printPreview.isVisible();
    console.log(`🔧 Dark Stain in print preview: ${hasDarkStainInPreview}`);

    if (hasDarkStainInPreview) {
      console.log('✅ SUCCESS: Dark Stain processing appears in print preview!');
    } else {
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/print-preview-debug.png' });
      throw new Error('❌ Dark Stain processing does not appear in print preview');
    }
  });
});
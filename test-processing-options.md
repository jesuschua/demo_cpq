# Processing Options Feature Test

## Manual Testing Steps

1. **Start the application**
   - Navigate to http://localhost:3000
   - Click "Start New Quote"

2. **Create a room**
   - Select "Elite Kitchen Designs" as customer
   - Fill in room dimensions (e.g., 12x8x15)
   - Enter room name "Main Kitchen"
   - Select room type
   - Click "Create Room & Start Quote"

3. **Add a product**
   - Click "Add Products"
   - Select a cabinet product (e.g., "12" Base Cabinet")
   - Click "Add to Quote"

4. **Test processing options**
   - Look for processings with "Requires Options" badge
   - Click on a processing that requires options (e.g., "Cut to Size", "Custom Paint Color")
   - Verify the option selector modal opens
   - Fill in the required options
   - Click "Apply"
   - Verify the processing is added with the configured options

5. **Test pending options alert**
   - Add a processing that requires options
   - Close the modal without configuring options
   - Verify the yellow alert appears at the top showing pending options

6. **Test option values display**
   - Configure a processing with options
   - Verify the option values are displayed in the applied processings section
   - Verify price modifiers are shown correctly

## Expected Results

- Processings with options should show "Requires Options" badge
- Clicking them should open a modal with option inputs
- Option values should be saved and displayed
- Pending options should be flagged with alerts
- Price calculations should include option modifiers

## Sample Processings with Options

1. **Cut to Size** - requires numeric input (cut amount in inches)
2. **Custom Paint Color** - requires color selection from dropdown
3. **Undermount Sink Cutout** - requires sink size selection
4. **Cooktop Cutout** - requires cooktop size selection
5. **Under-Cabinet LED** - requires LED color temperature selection

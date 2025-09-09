import { Model, Product, Processing, ProcessingRule, ProductDependency, Customer, Contract } from '../types';

export const models: Model[] = [
  { id: 'mod_traditional_oak', name: 'Traditional Oak', description: 'Classic raised panel oak cabinetry', category: 'traditional' },
  { id: 'mod_modern_euro', name: 'Modern Euro', description: 'Sleek flat panel European style', category: 'modern' },
  { id: 'mod_shaker_white', name: 'Shaker White', description: 'Timeless shaker style in white', category: 'transitional' },
  { id: 'mod_contemporary_walnut', name: 'Contemporary Walnut', description: 'Rich walnut with clean lines', category: 'modern' },
  { id: 'mod_farmhouse_gray', name: 'Farmhouse Gray', description: 'Rustic farmhouse style in gray', category: 'traditional' },
  { id: 'mod_industrial_black', name: 'Industrial Black', description: 'Bold industrial design in black', category: 'modern' },
  { id: 'mod_classic_cherry', name: 'Classic Cherry', description: 'Elegant cherry wood traditional', category: 'traditional' },
  { id: 'mod_minimalist_white', name: 'Minimalist White', description: 'Ultra-clean minimalist design', category: 'modern' },
  { id: 'mod_transitional_maple', name: 'Transitional Maple', description: 'Versatile maple transitional style', category: 'transitional' },
  { id: 'mod_luxury_mahogany', name: 'Luxury Mahogany', description: 'Premium mahogany with ornate details', category: 'traditional' }
];

export const products: Product[] = [
  // Base Cabinets for Traditional Oak
  { id: 'prod_trad_oak_base_12', modelId: 'mod_traditional_oak', name: '12" Base Cabinet', category: 'cabinet', subCategory: 'base', basePrice: 285, unit: 'each', dimensions: { width: 12, height: 34.5, depth: 24 }, inStock: true, leadTimeDays: 14, description: 'Standard 12" base cabinet with raised panel door' },
  { id: 'prod_trad_oak_base_15', modelId: 'mod_traditional_oak', name: '15" Base Cabinet', category: 'cabinet', subCategory: 'base', basePrice: 315, unit: 'each', dimensions: { width: 15, height: 34.5, depth: 24 }, inStock: true, leadTimeDays: 14, description: 'Standard 15" base cabinet with raised panel door' },
  { id: 'prod_trad_oak_base_18', modelId: 'mod_traditional_oak', name: '18" Base Cabinet', category: 'cabinet', subCategory: 'base', basePrice: 345, unit: 'each', dimensions: { width: 18, height: 34.5, depth: 24 }, inStock: false, leadTimeDays: 21, description: 'Standard 18" base cabinet with raised panel door' },
  { id: 'prod_trad_oak_base_21', modelId: 'mod_traditional_oak', name: '21" Base Cabinet', category: 'cabinet', subCategory: 'base', basePrice: 375, unit: 'each', dimensions: { width: 21, height: 34.5, depth: 24 }, inStock: true, leadTimeDays: 14, description: 'Standard 21" base cabinet with raised panel door' },
  { id: 'prod_trad_oak_base_24', modelId: 'mod_traditional_oak', name: '24" Base Cabinet', category: 'cabinet', subCategory: 'base', basePrice: 395, unit: 'each', dimensions: { width: 24, height: 34.5, depth: 24 }, inStock: true, leadTimeDays: 14, description: 'Standard 24" base cabinet with raised panel door' },
  
  // Wall Cabinets for Traditional Oak
  { id: 'prod_trad_oak_wall_12', modelId: 'mod_traditional_oak', name: '12" Wall Cabinet', category: 'cabinet', subCategory: 'wall', basePrice: 225, unit: 'each', dimensions: { width: 12, height: 30, depth: 12 }, inStock: true, leadTimeDays: 14, description: 'Standard 12" wall cabinet with raised panel door' },
  { id: 'prod_trad_oak_wall_15', modelId: 'mod_traditional_oak', name: '15" Wall Cabinet', category: 'cabinet', subCategory: 'wall', basePrice: 245, unit: 'each', dimensions: { width: 15, height: 30, depth: 12 }, inStock: true, leadTimeDays: 14, description: 'Standard 15" wall cabinet with raised panel door' },
  { id: 'prod_trad_oak_wall_18', modelId: 'mod_traditional_oak', name: '18" Wall Cabinet', category: 'cabinet', subCategory: 'wall', basePrice: 265, unit: 'each', dimensions: { width: 18, height: 30, depth: 12 }, inStock: false, leadTimeDays: 28, description: 'Standard 18" wall cabinet with raised panel door' },
  
  // Specialty Cabinets for Traditional Oak
  { id: 'prod_trad_oak_pantry_24', modelId: 'mod_traditional_oak', name: '24" Pantry Cabinet', category: 'cabinet', subCategory: 'pantry', basePrice: 685, unit: 'each', dimensions: { width: 24, height: 84, depth: 24 }, inStock: true, leadTimeDays: 21, description: 'Full height pantry cabinet with adjustable shelves' },
  { id: 'prod_trad_oak_corner_36', modelId: 'mod_traditional_oak', name: '36" Corner Base', category: 'cabinet', subCategory: 'corner', basePrice: 485, unit: 'each', dimensions: { width: 36, height: 34.5, depth: 24 }, inStock: false, leadTimeDays: 35, description: 'Corner base cabinet with lazy susan option' },
  
  // Hardware for Traditional Oak
  { id: 'prod_trad_oak_knob_bronze', modelId: 'mod_traditional_oak', name: 'Bronze Cabinet Knob', category: 'hardware', subCategory: 'knob', basePrice: 8.50, unit: 'each', inStock: true, leadTimeDays: 3, description: 'Oil-rubbed bronze cabinet knob' },
  { id: 'prod_trad_oak_pull_bronze', modelId: 'mod_traditional_oak', name: 'Bronze Cabinet Pull', category: 'hardware', subCategory: 'pull', basePrice: 12.75, unit: 'each', inStock: true, leadTimeDays: 3, description: '4" oil-rubbed bronze cabinet pull' },
  { id: 'prod_trad_oak_hinge_euro', modelId: 'mod_traditional_oak', name: 'European Hinge', category: 'hardware', subCategory: 'hinge', basePrice: 4.25, unit: 'each', inStock: true, leadTimeDays: 7, description: 'Soft-close European hinge' },
  
  // Countertops (compatible with multiple models)
  { id: 'prod_quartz_carrara', modelId: 'mod_traditional_oak', name: 'Carrara Quartz', category: 'countertop', subCategory: 'quartz', basePrice: 65, unit: 'sqft', inStock: true, leadTimeDays: 14, description: 'White quartz with gray veining' },
  { id: 'prod_granite_black', modelId: 'mod_traditional_oak', name: 'Black Granite', category: 'countertop', subCategory: 'granite', basePrice: 55, unit: 'sqft', inStock: true, leadTimeDays: 21, description: 'Absolute black granite' },
  
  // Modern Euro Products
  { id: 'prod_mod_euro_base_12', modelId: 'mod_modern_euro', name: '12" Euro Base', category: 'cabinet', subCategory: 'base', basePrice: 325, unit: 'each', dimensions: { width: 12, height: 34.5, depth: 24 }, inStock: true, leadTimeDays: 10, description: 'Handleless European base cabinet' },
  { id: 'prod_mod_euro_base_18', modelId: 'mod_modern_euro', name: '18" Euro Base', category: 'cabinet', subCategory: 'base', basePrice: 385, unit: 'each', dimensions: { width: 18, height: 34.5, depth: 24 }, inStock: true, leadTimeDays: 10, description: 'Handleless European base cabinet' },
  { id: 'prod_mod_euro_wall_12', modelId: 'mod_modern_euro', name: '12" Euro Wall', category: 'cabinet', subCategory: 'wall', basePrice: 275, unit: 'each', dimensions: { width: 12, height: 30, depth: 12 }, inStock: true, leadTimeDays: 10, description: 'Handleless European wall cabinet' },
  
  // Hardware for Modern Euro
  { id: 'prod_mod_euro_push_open', modelId: 'mod_modern_euro', name: 'Push-to-Open Hardware', category: 'hardware', subCategory: 'mechanism', basePrice: 15.50, unit: 'each', inStock: true, leadTimeDays: 7, description: 'Push-to-open mechanism for handleless cabinets' },
  { id: 'prod_mod_euro_led_strip', modelId: 'mod_modern_euro', name: 'LED Under-Cabinet Strip', category: 'hardware', subCategory: 'lighting', basePrice: 25.00, unit: 'linft', inStock: true, leadTimeDays: 5, description: 'Integrated LED strip lighting' },
  
  // Appliances (cross-model compatible)
  { id: 'prod_appliance_dishwasher', modelId: 'mod_traditional_oak', name: 'Built-in Dishwasher', category: 'appliance', subCategory: 'dishwasher', basePrice: 895, unit: 'each', dimensions: { width: 24, height: 34, depth: 24 }, inStock: true, leadTimeDays: 7, description: 'Stainless steel built-in dishwasher' },
  { id: 'prod_appliance_range', modelId: 'mod_traditional_oak', name: 'Gas Range', category: 'appliance', subCategory: 'range', basePrice: 1285, unit: 'each', dimensions: { width: 30, height: 36, depth: 25 }, inStock: false, leadTimeDays: 14, description: '30" gas range with convection oven' },
  
  // Accessories
  { id: 'prod_acc_lazy_susan', modelId: 'mod_traditional_oak', name: 'Lazy Susan', category: 'accessory', subCategory: 'organizer', basePrice: 85, unit: 'each', inStock: true, leadTimeDays: 7, description: 'Two-tier lazy susan for corner cabinets' },
  { id: 'prod_acc_drawer_slides', modelId: 'mod_traditional_oak', name: 'Soft-Close Drawer Slides', category: 'accessory', subCategory: 'slide', basePrice: 22, unit: 'each', inStock: true, leadTimeDays: 3, description: 'Full extension soft-close drawer slides' }
];

export const processings: Processing[] = [
  // Cutting/Sizing Processings
  { 
    id: 'proc_cut_to_size', 
    name: 'Cut to Size', 
    description: 'Custom cut cabinet to specified dimensions', 
    category: 'fabrication', 
    pricingType: 'per_unit', 
    price: 45, 
    applicableProductCategories: ['cabinet'], 
    calculationFormula: 'basePrice + 45',
    options: [
      {
        id: 'custom_dimensions',
        name: 'Custom Dimensions',
        type: 'dimensions',
        required: true,
        description: 'Enter the custom dimensions for cutting',
        dimensionFields: ['width', 'height', 'depth'],
        defaultValue: { width: 24, height: 34.5, depth: 24 }
      },
      {
        id: 'cut_precision',
        name: 'Cut Precision',
        type: 'select',
        required: false,
        description: 'Select the precision level for cutting',
        choices: [
          { value: 'standard', label: 'Standard (±1/8")', priceModifier: 0 },
          { value: 'precise', label: 'Precise (±1/16")', priceModifier: 10 },
          { value: 'exact', label: 'Exact (±1/32")', priceModifier: 20 }
        ],
        defaultValue: 'standard'
      }
    ]
  },
  { id: 'proc_notch_plumbing', name: 'Plumbing Notch', description: 'Cut notch for plumbing access', category: 'fabrication', pricingType: 'per_unit', price: 25, applicableProductCategories: ['cabinet'] },
  { id: 'proc_drill_holes', name: 'Drill Custom Holes', description: 'Drill holes for specific hardware placement', category: 'fabrication', pricingType: 'per_unit', price: 15, applicableProductCategories: ['cabinet', 'door'] },
  
  // Finishing Processings
  { 
    id: 'proc_stain_dark', 
    name: 'Dark Stain', 
    description: 'Apply dark walnut stain finish', 
    category: 'finishing', 
    pricingType: 'percentage', 
    price: 0.15, 
    applicableProductCategories: ['cabinet', 'door'],
    options: [
      {
        id: 'stain_color',
        name: 'Stain Color',
        type: 'select',
        required: true,
        description: 'Choose the stain color',
        choices: [
          { value: 'walnut', label: 'Dark Walnut', priceModifier: 0 },
          { value: 'cherry', label: 'Cherry', priceModifier: 0.02 },
          { value: 'mahogany', label: 'Mahogany', priceModifier: 0.03 },
          { value: 'ebony', label: 'Ebony', priceModifier: 0.01 }
        ]
      }
    ]
  },
  { 
    id: 'proc_stain_medium', 
    name: 'Medium Stain', 
    description: 'Apply medium oak stain finish', 
    category: 'finishing', 
    pricingType: 'percentage', 
    price: 0.10, 
    applicableProductCategories: ['cabinet', 'door'] 
  },
  { 
    id: 'proc_paint_white', 
    name: 'White Paint', 
    description: 'Custom white paint finish', 
    category: 'finishing', 
    pricingType: 'percentage', 
    price: 0.20, 
    applicableProductCategories: ['cabinet', 'door'] 
  },
  { 
    id: 'proc_paint_custom', 
    name: 'Custom Paint Color', 
    description: 'Custom color paint finish', 
    category: 'finishing', 
    pricingType: 'percentage', 
    price: 0.25, 
    applicableProductCategories: ['cabinet', 'door'],
    options: [
      {
        id: 'paint_color',
        name: 'Paint Color',
        type: 'color',
        required: true,
        description: 'Select the paint color',
        colorPalette: ['#FFFFFF', '#F5F5F5', '#E5E5E5', '#D3D3D3', '#A9A9A9', '#808080', '#696969', '#2F4F4F', '#000000'],
        defaultValue: '#FFFFFF'
      },
      {
        id: 'paint_finish',
        name: 'Paint Finish',
        type: 'select',
        required: true,
        description: 'Choose the paint finish type',
        choices: [
          { value: 'matte', label: 'Matte', priceModifier: 0 },
          { value: 'satin', label: 'Satin', priceModifier: 0.01 },
          { value: 'semi_gloss', label: 'Semi-Gloss', priceModifier: 0.02 },
          { value: 'high_gloss', label: 'High-Gloss', priceModifier: 0.03 }
        ]
      }
    ]
  },
  
  // Hardware Installation
  { id: 'proc_install_knobs', name: 'Install Knobs', description: 'Install cabinet knobs', category: 'hardware_install', pricingType: 'per_unit', price: 8, applicableProductCategories: ['cabinet'] },
  { id: 'proc_install_pulls', name: 'Install Pulls', description: 'Install cabinet pulls', category: 'hardware_install', pricingType: 'per_unit', price: 12, applicableProductCategories: ['cabinet'] },
  { id: 'proc_install_push_open', name: 'Install Push-Open', description: 'Install push-to-open mechanism', category: 'hardware_install', pricingType: 'per_unit', price: 35, applicableProductCategories: ['cabinet'] },
  
  // Countertop Processings
  { id: 'proc_edge_bullnose', name: 'Bullnose Edge', description: 'Rounded bullnose edge profile', category: 'countertop_edge', pricingType: 'per_dimension', price: 8, applicableProductCategories: ['countertop'], calculationFormula: 'perimeter * 8' },
  { id: 'proc_edge_beveled', name: 'Beveled Edge', description: 'Angled beveled edge profile', category: 'countertop_edge', pricingType: 'per_dimension', price: 12, applicableProductCategories: ['countertop'], calculationFormula: 'perimeter * 12' },
  { id: 'proc_undermount_sink', name: 'Undermount Sink Cutout', description: 'Cut and polish undermount sink opening', category: 'countertop_cutout', pricingType: 'per_unit', price: 125, applicableProductCategories: ['countertop'] },
  { id: 'proc_cooktop_cutout', name: 'Cooktop Cutout', description: 'Cut opening for cooktop installation', category: 'countertop_cutout', pricingType: 'per_unit', price: 85, applicableProductCategories: ['countertop'] },
  
  // Specialty Processings
  { id: 'proc_soft_close_hinges', name: 'Soft-Close Hinges', description: 'Upgrade to soft-close hinges', category: 'upgrade', pricingType: 'per_unit', price: 18, applicableProductCategories: ['cabinet'] },
  { id: 'proc_full_ext_slides', name: 'Full Extension Slides', description: 'Upgrade to full extension drawer slides', category: 'upgrade', pricingType: 'per_unit', price: 28, applicableProductCategories: ['cabinet'] },
  { id: 'proc_lazy_susan_install', name: 'Lazy Susan Installation', description: 'Install lazy susan mechanism', category: 'mechanism', pricingType: 'per_unit', price: 65, applicableProductCategories: ['cabinet'] },
  
  // Glass and Panel Options
  { id: 'proc_glass_door', name: 'Glass Door Insert', description: 'Add glass insert to cabinet door', category: 'door_option', pricingType: 'per_unit', price: 75, applicableProductCategories: ['cabinet'] },
  { id: 'proc_mesh_door', name: 'Mesh Door Insert', description: 'Add decorative mesh insert', category: 'door_option', pricingType: 'per_unit', price: 45, applicableProductCategories: ['cabinet'] },
  
  // Lighting
  { id: 'proc_led_interior', name: 'Interior LED Lighting', description: 'Install interior cabinet LED lighting', category: 'lighting', pricingType: 'per_unit', price: 55, applicableProductCategories: ['cabinet'] },
  { id: 'proc_led_under_cabinet', name: 'Under-Cabinet LED', description: 'Install under-cabinet LED strip', category: 'lighting', pricingType: 'per_dimension', price: 18, applicableProductCategories: ['cabinet'], calculationFormula: 'width * 18' }
];

export const processingRules: ProcessingRule[] = [
  // Mutual Exclusions
  {
    id: 'rule_handle_exclusion',
    type: 'mutual_exclusion',
    conditions: { processingIds: ['proc_install_knobs', 'proc_install_pulls'] },
    actions: { excludeProcessings: ['proc_install_push_open'] },
    description: 'Cannot have push-to-open with traditional handles'
  },
  // Temporarily disabled for testing
  // {
  //   id: 'rule_stain_paint_exclusion',
  //   type: 'mutual_exclusion',
  //   conditions: { processingIds: ['proc_stain_dark', 'proc_stain_medium'] },
  //   actions: { excludeProcessings: ['proc_paint_white', 'proc_paint_custom'] },
  //   description: 'Cannot stain and paint the same item'
  // },
  {
    id: 'rule_edge_exclusion',
    type: 'mutual_exclusion',
    conditions: { processingIds: ['proc_edge_bullnose'] },
    actions: { excludeProcessings: ['proc_edge_beveled'] },
    description: 'Can only have one edge profile per countertop'
  },
  
  // Requirements
  {
    id: 'rule_push_open_requirement',
    type: 'requirement',
    conditions: { processingIds: ['proc_install_push_open'] },
    actions: { requireProcessings: ['proc_soft_close_hinges'] },
    description: 'Push-to-open requires soft-close hinges'
  },
  {
    id: 'rule_glass_door_requirement',
    type: 'requirement',
    conditions: { processingIds: ['proc_glass_door'] },
    actions: { requireProcessings: ['proc_led_interior'] },
    description: 'Glass doors should have interior lighting'
  },
  
  // Room-level inheritance
  {
    id: 'rule_room_stain_inheritance',
    type: 'inheritance',
    conditions: { productCategories: ['cabinet'] },
    actions: { inheritFromRoom: true },
    description: 'All cabinets inherit room-level stain/paint processing'
  },
  {
    id: 'rule_room_hardware_inheritance',
    type: 'inheritance',
    conditions: { productCategories: ['cabinet'] },
    actions: { inheritFromRoom: true },
    description: 'All cabinets inherit room-level hardware selection'
  }
];

export const productDependencies: ProductDependency[] = [
  // Hinge Requirements
  {
    id: 'dep_cabinet_hinges',
    productId: 'prod_trad_oak_base_12',
    requiredProductId: 'prod_trad_oak_hinge_euro',
    quantityFormula: '2', // 2 hinges per door
    isAutomatic: true,
    description: '12" base cabinet requires 2 hinges'
  },
  {
    id: 'dep_cabinet_hinges_15',
    productId: 'prod_trad_oak_base_15',
    requiredProductId: 'prod_trad_oak_hinge_euro',
    quantityFormula: '2',
    isAutomatic: true,
    description: '15" base cabinet requires 2 hinges'
  },
  
  // Hardware Requirements
  {
    id: 'dep_cabinet_hardware_trad',
    productId: 'prod_trad_oak_base_12',
    requiredProductId: 'prod_trad_oak_knob_bronze',
    quantityFormula: '1', // 1 knob per door
    isAutomatic: false,
    description: '12" base cabinet needs hardware - knob or pull'
  },
  
  // Appliance Dependencies
  {
    id: 'dep_dishwasher_cabinet',
    productId: 'prod_appliance_dishwasher',
    requiredProductId: 'prod_trad_oak_base_24',
    quantityFormula: '1',
    isAutomatic: false,
    description: 'Dishwasher requires 24" base cabinet opening'
  },
  
  // Corner Cabinet Dependencies
  {
    id: 'dep_corner_lazy_susan',
    productId: 'prod_trad_oak_corner_36',
    requiredProductId: 'prod_acc_lazy_susan',
    quantityFormula: '1',
    isAutomatic: false,
    description: 'Corner cabinet works best with lazy susan'
  },
  
  // Countertop Support Requirements
  {
    id: 'dep_countertop_support',
    productId: 'prod_quartz_carrara',
    requiredProductId: 'prod_trad_oak_base_24',
    quantityFormula: 'Math.ceil(counterLength / 24)',
    isAutomatic: false,
    description: 'Countertop needs base cabinet support every 24 inches'
  }
];

export const contracts: Contract[] = [
  { id: 'contract_builder_pro', name: 'Builder Pro Contract', discountPercentage: 15 },
  { id: 'contract_designer_elite', name: 'Designer Elite Contract', discountPercentage: 20 },
  { id: 'contract_contractor_plus', name: 'Contractor Plus Contract', discountPercentage: 12 },
  { id: 'contract_retail_standard', name: 'Retail Standard', discountPercentage: 0 }
];

export const customers: Customer[] = [
  { id: 'cust_01', name: 'John Smith Construction', contractId: 'contract_builder_pro', discountPercentage: 5 },
  { id: 'cust_02', name: 'Elite Kitchen Designs', contractId: 'contract_designer_elite', discountPercentage: 3 },
  { id: 'cust_03', name: 'Mike Johnson (Homeowner)', contractId: 'contract_retail_standard', discountPercentage: 0 },
  { id: 'cust_04', name: 'Premier Remodeling Co', contractId: 'contract_contractor_plus', discountPercentage: 8 },
  { id: 'cust_05', name: 'Sarah Wilson (Homeowner)', contractId: 'contract_retail_standard', discountPercentage: 2 }
];

// Configuration Constants
export const APPROVAL_THRESHOLD = 5000; // Quotes over $5000 need approval
export const DEFAULT_QUOTE_VALIDITY_DAYS = 30;

import { 
  Opportunity, Account, Contact, SalesActivity, ProductRecommendation, 
  SalesPlaybook, PricingRule, ApprovalProcess 
} from '../types/enterprise';

export const accounts: Account[] = [
  {
    id: 'acc_1',
    name: 'Luxury Home Builders LLC',
    type: 'customer',
    industry: 'Construction',
    revenue: 25000000,
    employees: 150,
    website: 'www.luxuryhomebuilders.com',
    address: {
      street: '1234 Builder Ave',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    primaryContact: 'contact_1',
    salesRep: 'user_1',
    contractTerms: {
      discountTier: 15,
      paymentTerms: 'Net 30',
      creditLimit: 500000,
      preferredShipping: 'Standard',
      contractStartDate: new Date('2024-01-01'),
      contractEndDate: new Date('2024-12-31')
    },
    creditRating: 'excellent',
    paymentTerms: 'Net 30'
  },
  {
    id: 'acc_2',
    name: 'Elite Kitchen Designs',
    type: 'customer',
    industry: 'Interior Design',
    revenue: 8000000,
    employees: 45,
    website: 'www.elitekitchens.com',
    address: {
      street: '5678 Design Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    },
    primaryContact: 'contact_2',
    salesRep: 'user_1',
    contractTerms: {
      discountTier: 20,
      paymentTerms: 'Net 15',
      creditLimit: 250000,
      preferredShipping: 'Express'
    },
    creditRating: 'excellent',
    paymentTerms: 'Net 15'
  },
  {
    id: 'acc_3',
    name: 'Metro Property Development',
    type: 'prospect',
    industry: 'Real Estate',
    revenue: 50000000,
    employees: 300,
    website: 'www.metroproperty.com',
    address: {
      street: '9999 Development Dr',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA'
    },
    primaryContact: 'contact_3',
    salesRep: 'user_2',
    contractTerms: {
      discountTier: 0,
      paymentTerms: 'Net 45',
      creditLimit: 1000000,
      preferredShipping: 'Standard'
    },
    creditRating: 'good',
    paymentTerms: 'Net 45'
  }
];

export const contacts: Contact[] = [
  {
    id: 'contact_1',
    accountId: 'acc_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'VP of Operations',
    email: 'sarah.johnson@luxuryhomebuilders.com',
    phone: '(555) 123-4567',
    role: 'decision_maker',
    department: 'Operations'
  },
  {
    id: 'contact_2',
    accountId: 'acc_2',
    firstName: 'Michael',
    lastName: 'Chen',
    title: 'Principal Designer',
    email: 'michael.chen@elitekitchens.com',
    phone: '(555) 234-5678',
    role: 'decision_maker',
    department: 'Design'
  },
  {
    id: 'contact_3',
    accountId: 'acc_3',
    firstName: 'Jennifer',
    lastName: 'Rodriguez',
    title: 'Project Manager',
    email: 'jennifer.rodriguez@metroproperty.com',
    phone: '(555) 345-6789',
    role: 'influencer',
    department: 'Project Management'
  },
  {
    id: 'contact_4',
    accountId: 'acc_1',
    firstName: 'David',
    lastName: 'Thompson',
    title: 'Procurement Director',
    email: 'david.thompson@luxuryhomebuilders.com',
    phone: '(555) 456-7890',
    role: 'decision_maker',
    department: 'Procurement'
  }
];

export const opportunities: Opportunity[] = [
  {
    id: 'opp_1',
    name: 'Luxury Estates Kitchen Package - Q1 2025',
    accountId: 'acc_1',
    contactId: 'contact_1',
    stage: 'proposal',
    probability: 65,
    expectedValue: 285000,
    closeDate: new Date('2025-02-15'),
    source: 'Referral',
    description: 'Complete kitchen package for 12 luxury homes in Phoenix development',
    createdBy: 'user_1',
    createdAt: new Date('2024-11-01'),
    lastModified: new Date('2024-12-01')
  },
  {
    id: 'opp_2',
    name: 'Elite Showroom Refresh',
    accountId: 'acc_2',
    contactId: 'contact_2',
    stage: 'negotiation',
    probability: 80,
    expectedValue: 95000,
    closeDate: new Date('2025-01-30'),
    source: 'Existing Customer',
    description: 'Showroom kitchen displays and demo installations',
    createdBy: 'user_1',
    createdAt: new Date('2024-10-15'),
    lastModified: new Date('2024-12-05')
  },
  {
    id: 'opp_3',
    name: 'Metro Towers - Bulk Kitchen Order',
    accountId: 'acc_3',
    contactId: 'contact_3',
    stage: 'qualification',
    probability: 30,
    expectedValue: 750000,
    closeDate: new Date('2025-04-01'),
    source: 'Cold Outreach',
    description: 'Potential large order for 50-unit apartment complex',
    createdBy: 'user_2',
    createdAt: new Date('2024-11-20'),
    lastModified: new Date('2024-12-03')
  },
  {
    id: 'opp_4',
    name: 'Custom Villa Project',
    accountId: 'acc_1',
    contactId: 'contact_4',
    stage: 'needs_analysis',
    probability: 45,
    expectedValue: 165000,
    closeDate: new Date('2025-03-20'),
    source: 'Website',
    description: 'High-end custom kitchen for luxury villa project',
    createdBy: 'user_1',
    createdAt: new Date('2024-11-25'),
    lastModified: new Date('2024-12-02')
  }
];

export const salesActivities: SalesActivity[] = [
  {
    id: 'activity_1',
    opportunityId: 'opp_1',
    type: 'meeting',
    subject: 'Kitchen Design Review Meeting',
    description: 'Reviewed final kitchen designs with Sarah Johnson and procurement team',
    scheduledDate: new Date('2024-12-01'),
    completedDate: new Date('2024-12-01'),
    status: 'completed',
    outcome: 'Positive - minor modifications requested',
    nextSteps: 'Send revised designs and updated pricing',
    createdBy: 'user_1'
  },
  {
    id: 'activity_2',
    opportunityId: 'opp_2',
    type: 'call',
    subject: 'Contract Terms Discussion',
    description: 'Discussed payment terms and delivery schedule',
    scheduledDate: new Date('2024-12-05'),
    completedDate: new Date('2024-12-05'),
    status: 'completed',
    outcome: 'Agreement on payment terms, minor discount requested',
    nextSteps: 'Prepare final contract with agreed terms',
    createdBy: 'user_1'
  },
  {
    id: 'activity_3',
    opportunityId: 'opp_3',
    type: 'demo',
    subject: 'Product Demonstration',
    description: 'Showcase kitchen solutions at our showroom',
    scheduledDate: new Date('2024-12-10'),
    status: 'planned',
    outcome: '',
    nextSteps: 'Prepare comprehensive product demo',
    createdBy: 'user_2'
  },
  {
    id: 'activity_4',
    opportunityId: 'opp_1',
    type: 'proposal',
    subject: 'Final Proposal Presentation',
    description: 'Present complete proposal to decision-making committee',
    scheduledDate: new Date('2024-12-15'),
    status: 'planned',
    outcome: '',
    nextSteps: 'Prepare presentation materials and pricing breakdown',
    createdBy: 'user_1'
  }
];

export const productRecommendations: ProductRecommendation[] = [
  {
    productId: 'prod_trad_oak_base_24',
    reason: 'Based on similar luxury home projects, 24" base cabinets are frequently upgraded to soft-close mechanisms',
    confidence: 85,
    type: 'up_sell',
    additionalRevenue: 1200
  },
  {
    productId: 'prod_quartz_carrara',
    reason: 'Customers who buy premium cabinets often choose quartz countertops for durability',
    confidence: 78,
    type: 'cross_sell',
    additionalRevenue: 8500
  },
  {
    productId: 'prod_mod_euro_led_strip',
    reason: 'LED lighting complements modern kitchen designs and increases perceived value',
    confidence: 72,
    type: 'cross_sell',
    additionalRevenue: 2400
  },
  {
    productId: 'prod_appliance_dishwasher',
    reason: 'Integrated appliances create a cohesive luxury look that matches the cabinet selection',
    confidence: 80,
    type: 'complementary',
    additionalRevenue: 3200
  }
];

export const salesPlaybooks: SalesPlaybook[] = [
  {
    id: 'playbook_luxury_homes',
    name: 'Luxury Home Builder Playbook',
    industry: 'Construction',
    useCase: 'High-end residential kitchen projects',
    discoveryQuestions: [
      'What is the target price point for the homes in this development?',
      'How many kitchens are planned for this project phase?',
      'What are the key design themes or styles you\'re targeting?',
      'What timeline are you working with for kitchen installations?',
      'Do you have preferred suppliers or are you open to new partnerships?'
    ],
    valuePropositions: [
      'Consistent quality across all units with our standardized processes',
      'Volume pricing discounts for bulk orders',
      'Dedicated project management for large developments',
      'Flexible delivery scheduling to match construction timelines',
      'Premium finishes that increase home values and sales velocity'
    ],
    objectionHandling: [
      'Price concerns: Emphasize long-term value and buyer appeal',
      'Timeline worries: Show our proven delivery track record',
      'Quality questions: Offer references from similar projects',
      'Customization limits: Explain our flexible design options'
    ],
    nextSteps: [
      'Schedule site visit to understand project scope',
      'Provide sample kitchen designs with pricing',
      'Connect with project timeline and delivery requirements',
      'Arrange meetings with decision-making team'
    ]
  },
  {
    id: 'playbook_interior_design',
    name: 'Interior Design Partnership Playbook',
    industry: 'Interior Design',
    useCase: 'Designer collaboration and showroom partnerships',
    discoveryQuestions: [
      'What types of clients do you typically work with?',
      'What\'s your average project value range?',
      'How do you currently source kitchen products?',
      'What are your biggest challenges with current suppliers?',
      'Are you interested in exclusive or preferred partnerships?'
    ],
    valuePropositions: [
      'Designer discount program with competitive margins',
      'Dedicated design support and technical assistance',
      'Marketing co-op opportunities for mutual promotion',
      'Priority scheduling and expedited delivery',
      'Exclusive access to new products and finishes'
    ],
    objectionHandling: [
      'Existing relationships: Position as complementary, not replacement',
      'Margin concerns: Show total value including support services',
      'Product availability: Demonstrate our inventory depth',
      'Service questions: Provide designer testimonials'
    ],
    nextSteps: [
      'Schedule showroom visit to see full product range',
      'Discuss partnership terms and discount structure',
      'Provide sample materials and product catalogs',
      'Set up trial project to demonstrate service quality'
    ]
  }
];

export const pricingRules: PricingRule[] = [
  {
    id: 'rule_volume_discount',
    name: 'Volume Discount - 10+ Units',
    type: 'volume_discount',
    conditions: [
      { field: 'quantity', operator: 'greater_than', value: 10 }
    ],
    actions: [
      { type: 'percentage_discount', value: 8, applyTo: 'line_item' }
    ],
    priority: 1,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: 'rule_luxury_bundle',
    name: 'Luxury Kitchen Bundle Discount',
    type: 'bundle_discount',
    conditions: [
      { field: 'category', operator: 'in', value: ['cabinet', 'countertop', 'appliance'] }
    ],
    actions: [
      { type: 'percentage_discount', value: 12, applyTo: 'total' }
    ],
    priority: 2,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: 'rule_seasonal_promo',
    name: 'Q4 Year-End Promotion',
    type: 'seasonal',
    conditions: [
      { field: 'quote_date', operator: 'greater_than', value: '2024-10-01' }
    ],
    actions: [
      { type: 'percentage_discount', value: 5, applyTo: 'total' }
    ],
    priority: 3,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    isActive: true
  }
];

export const approvalProcesses: ApprovalProcess[] = [
  {
    id: 'approval_large_deals',
    name: 'Large Deal Approval Process',
    triggerConditions: [
      { field: 'total_value', operator: 'greater_than', value: 100000 }
    ],
    steps: [
      {
        id: 'step_1',
        name: 'Sales Manager Review',
        approverRole: 'sales_manager',
        approverIds: ['user_manager_1'],
        isRequired: true,
        timeoutDays: 2,
        escalationRules: [
          { condition: 'timeout', escalateTo: ['user_director_1'], afterDays: 2 }
        ]
      },
      {
        id: 'step_2',
        name: 'Finance Director Approval',
        approverRole: 'finance_director',
        approverIds: ['user_finance_1'],
        isRequired: true,
        timeoutDays: 3,
        escalationRules: [
          { condition: 'timeout', escalateTo: ['user_cfo_1'], afterDays: 3 }
        ]
      }
    ],
    isActive: true
  }
];

// Sample users for the system
export const users = [
  { id: 'user_1', name: 'Alex Rodriguez', role: 'Sales Rep', email: 'alex.rodriguez@company.com' },
  { id: 'user_2', name: 'Maria Gonzalez', role: 'Sales Rep', email: 'maria.gonzalez@company.com' },
  { id: 'user_manager_1', name: 'John Smith', role: 'Sales Manager', email: 'john.smith@company.com' },
  { id: 'user_director_1', name: 'Lisa Wang', role: 'Sales Director', email: 'lisa.wang@company.com' },
  { id: 'user_finance_1', name: 'Robert Brown', role: 'Finance Director', email: 'robert.brown@company.com' }
];

// Enterprise CPQ Types inspired by SAP CPQ and Salesforce CPQ

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  contactId: string;
  stage: 'prospecting' | 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedValue: number;
  closeDate: Date;
  source: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface Account {
  id: string;
  name: string;
  type: 'prospect' | 'customer' | 'partner';
  industry: string;
  revenue: number;
  employees: number;
  website: string;
  address: Address;
  primaryContact: string;
  salesRep: string;
  contractTerms: ContractTerms;
  creditRating: 'excellent' | 'good' | 'fair' | 'poor';
  paymentTerms: string;
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  role: 'decision_maker' | 'influencer' | 'end_user' | 'technical_buyer';
  department: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContractTerms {
  discountTier: number;
  paymentTerms: string;
  creditLimit: number;
  preferredShipping: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
}

export interface SalesStage {
  id: string;
  name: string;
  probability: number;
  duration: number; // days
  requiredActivities: string[];
  nextSteps: string[];
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'volume_discount' | 'bundle_discount' | 'seasonal' | 'competitive' | 'loyalty';
  conditions: PricingCondition[];
  actions: PricingAction[];
  priority: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface PricingCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'contains';
  value: any;
}

export interface PricingAction {
  type: 'percentage_discount' | 'fixed_discount' | 'fixed_price' | 'markup';
  value: number;
  applyTo: 'line_item' | 'category' | 'total';
}

export interface ApprovalProcess {
  id: string;
  name: string;
  triggerConditions: ApprovalCondition[];
  steps: ApprovalStep[];
  isActive: boolean;
}

export interface ApprovalCondition {
  field: string;
  operator: string;
  value: any;
}

export interface ApprovalStep {
  id: string;
  name: string;
  approverRole: string;
  approverIds: string[];
  isRequired: boolean;
  timeoutDays: number;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  escalateTo: string[];
  afterDays: number;
}

export interface ApprovalRequest {
  id: string;
  quoteId: string;
  processId: string;
  currentStepId: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  requestedBy: string;
  requestedAt: Date;
  approvals: ApprovalAction[];
  comments: ApprovalComment[];
}

export interface ApprovalAction {
  stepId: string;
  approverId: string;
  action: 'approved' | 'rejected' | 'delegated';
  timestamp: Date;
  comments: string;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  isInternal: boolean;
}

export interface ProductRecommendation {
  productId: string;
  reason: string;
  confidence: number;
  type: 'cross_sell' | 'up_sell' | 'substitute' | 'complementary';
  savings?: number;
  additionalRevenue?: number;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultProducts: string[];
  defaultTerms: string;
  isActive: boolean;
  createdBy: string;
  lastModified: Date;
}

export interface SalesActivity {
  id: string;
  opportunityId: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow_up';
  subject: string;
  description: string;
  scheduledDate?: Date;
  completedDate?: Date;
  status: 'planned' | 'completed' | 'cancelled';
  outcome: string;
  nextSteps: string;
  createdBy: string;
}

export interface CompetitorInfo {
  id: string;
  name: string;
  strengths: string[];
  weaknesses: string[];
  pricing: 'higher' | 'similar' | 'lower';
  marketShare: number;
}

export interface BattleCard {
  id: string;
  competitorId: string;
  scenario: string;
  ourAdvantages: string[];
  theirAdvantages: string[];
  suggestedResponses: string[];
  winningStrategies: string[];
}

export interface SalesPlaybook {
  id: string;
  name: string;
  industry: string;
  useCase: string;
  discoveryQuestions: string[];
  valuePropositions: string[];
  objectionHandling: string[];
  nextSteps: string[];
}

export interface QuoteConfiguration {
  id: string;
  quoteId: string;
  configuratorData: any;
  rules: ConfigurationRule[];
  validationResults: ValidationResult[];
}

export interface ConfigurationRule {
  id: string;
  type: 'requirement' | 'exclusion' | 'recommendation' | 'validation';
  condition: string;
  action: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  ruleId: string;
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  affectedItems: string[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'quote' | 'proposal' | 'contract' | 'presentation';
  template: string;
  variables: TemplateVariable[];
  isActive: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  required: boolean;
  defaultValue?: any;
}

export interface Territory {
  id: string;
  name: string;
  type: 'geographic' | 'industry' | 'account_size';
  criteria: TerritoryCriteria[];
  assignments: TerritoryAssignment[];
}

export interface TerritoryCriteria {
  field: string;
  operator: string;
  value: any;
}

export interface TerritoryAssignment {
  userId: string;
  role: 'owner' | 'support' | 'overlay';
  startDate: Date;
  endDate?: Date;
}

import React, { useState } from 'react';
import { Quote, Model } from './types';
import { Opportunity, Account, SalesActivity } from './types/enterprise';
import { opportunities, accounts, contacts, salesActivities, productRecommendations, salesPlaybooks } from './data/enterpriseData';
import { models, products, processings, processingRules, productDependencies } from './data/sampleData';
import SalesDashboard from './components/enterprise/SalesDashboard';
import OpportunityManager from './components/enterprise/OpportunityManager';
import ProductCatalog from './components/ProductCatalog';
import CreateOpportunityModal from './components/enterprise/CreateOpportunityModal';
import EnterpriseQuoteBuilder from './components/enterprise/EnterpriseQuoteBuilder';

type ViewType = 'dashboard' | 'opportunity' | 'quote_builder';

interface EnterpriseAppState {
  currentView: ViewType;
  selectedOpportunity: Opportunity | null;
  selectedAccount: Account | null;
  currentQuote: Quote | null;
  savedQuotes: Quote[];
}

function EnterpriseApp() {
  const [state, setState] = useState<EnterpriseAppState>({
    currentView: 'dashboard',
    selectedOpportunity: null,
    selectedAccount: null,
    currentQuote: null,
    savedQuotes: []
  });

  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>(opportunities);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const handleViewOpportunity = (opportunity: Opportunity) => {
    const account = accounts.find(a => a.id === opportunity.accountId);
    setState(prev => ({
      ...prev,
      currentView: 'opportunity',
      selectedOpportunity: opportunity,
      selectedAccount: account || null
    }));
  };

  const handleCreateOpportunity = () => {
    setShowCreateModal(true);
  };

  const handleCreateOpportunitySubmit = (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'lastModified'>) => {
    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: `opp_${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date()
    };

    setAllOpportunities(prev => [...prev, newOpportunity]);
    setShowCreateModal(false);
    
    // Automatically navigate to the new opportunity
    setTimeout(() => {
      handleViewOpportunity(newOpportunity);
    }, 100);
  };

  const handleUpdateOpportunity = (opportunity: Opportunity) => {
    // In a real app, this would update the backend
    console.log('Updating opportunity:', opportunity);
    setState(prev => ({
      ...prev,
      selectedOpportunity: opportunity
    }));
  };

  const handleCreateQuote = () => {
    if (!state.selectedOpportunity || !state.selectedAccount) return;

    // Convert account to customer format for the quote system
    const customer = {
      id: state.selectedAccount.id,
      name: state.selectedAccount.name,
      contractId: 'contract_builder_pro', // Map based on account tier
      discountPercentage: state.selectedAccount.contractTerms.discountTier
    };

    const newQuote: Quote = {
      id: `quote_${Date.now()}`,
      customerId: customer.id,
      items: [],
      contractDiscount: state.selectedAccount.contractTerms.discountTier,
      customerDiscount: 0,
      orderDiscount: 0,
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requiresApproval: false,
      approvalThreshold: 100000, // Enterprise threshold
      quoteNumber: `Q-${state.selectedOpportunity.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      notes: `Quote for ${state.selectedOpportunity.name} - ${state.selectedAccount.name}`
    };

    setState(prev => ({
      ...prev,
      currentView: 'quote_builder',
      currentQuote: newQuote
    }));
  };

  const handleScheduleActivity = (activity: Partial<SalesActivity>) => {
    // In a real app, this would create the activity
    console.log('Scheduling activity:', activity);
    alert('Activity scheduled successfully');
  };

  const handleAddProductToQuote = (product: any, quantity: number = 1) => {
    if (!state.currentQuote) return;

    const quoteItem = {
      id: `item_${Date.now()}`,
      productId: product.id,
      quantity,
      appliedProcessings: [],
      basePrice: product.basePrice,
      totalPrice: product.basePrice * quantity
    };

    const updatedQuote = {
      ...state.currentQuote,
      items: [...state.currentQuote.items, quoteItem]
    };

    // Recalculate totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const contractDiscount = subtotal * (updatedQuote.contractDiscount / 100);
    const customerDiscount = (subtotal - contractDiscount) * (updatedQuote.customerDiscount / 100);
    const totalDiscount = contractDiscount + customerDiscount + updatedQuote.orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    updatedQuote.subtotal = subtotal;
    updatedQuote.totalDiscount = totalDiscount;
    updatedQuote.finalTotal = finalTotal;
    updatedQuote.requiresApproval = finalTotal > updatedQuote.approvalThreshold;

    setState(prev => ({
      ...prev,
      currentQuote: updatedQuote
    }));
  };

  const handleBackToDashboard = () => {
    setState(prev => ({
      ...prev,
      currentView: 'dashboard',
      selectedOpportunity: null,
      selectedAccount: null,
      currentQuote: null
    }));
  };

  const handleBackToOpportunity = () => {
    setState(prev => ({
      ...prev,
      currentView: 'opportunity',
      currentQuote: null
    }));
  };

  const getOpportunityContacts = (opportunityId: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId);
    if (!opportunity) return [];
    return contacts.filter(c => c.accountId === opportunity.accountId);
  };

  const getOpportunityActivities = (opportunityId: string) => {
    return salesActivities.filter(a => a.opportunityId === opportunityId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <span className="text-2xl font-bold text-blue-600">🏢</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Kitchen CPQ Enterprise</h1>
                  <p className="text-xs text-gray-600">Sales Management Platform</p>
                </div>
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>→</span>
                {state.currentView === 'dashboard' && <span>Sales Dashboard</span>}
                {state.currentView === 'opportunity' && (
                  <>
                    <button onClick={handleBackToDashboard} className="hover:text-blue-600">Dashboard</button>
                    <span>→ {state.selectedOpportunity?.name}</span>
                  </>
                )}
                {state.currentView === 'quote_builder' && (
                  <>
                    <button onClick={handleBackToDashboard} className="hover:text-blue-600">Dashboard</button>
                    <span>→</span>
                    <button onClick={handleBackToOpportunity} className="hover:text-blue-600">
                      {state.selectedOpportunity?.name}
                    </button>
                    <span>→ Quote Builder</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {state.selectedAccount && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{state.selectedAccount.name}</p>
                  <p className="text-xs text-gray-500">
                    {state.selectedAccount.industry} • {state.selectedAccount.contractTerms.discountTier}% tier
                  </p>
                </div>
              )}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {state.currentView === 'dashboard' && (
        <SalesDashboard
          opportunities={allOpportunities}
          accounts={accounts}
          quotes={state.savedQuotes}
          activities={salesActivities}
          onCreateOpportunity={handleCreateOpportunity}
          onViewOpportunity={handleViewOpportunity}
        />
      )}

      {state.currentView === 'opportunity' && state.selectedOpportunity && state.selectedAccount && (
        <OpportunityManager
          opportunity={state.selectedOpportunity}
          account={state.selectedAccount}
          contacts={getOpportunityContacts(state.selectedOpportunity.id)}
          activities={getOpportunityActivities(state.selectedOpportunity.id)}
          recommendations={productRecommendations}
          playbooks={salesPlaybooks}
          onUpdateOpportunity={handleUpdateOpportunity}
          onCreateQuote={handleCreateQuote}
          onScheduleActivity={handleScheduleActivity}
        />
      )}

      {state.currentView === 'quote_builder' && state.currentQuote && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Quote Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {state.currentQuote.quoteNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  {state.selectedOpportunity?.name} • {state.selectedAccount?.name}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Expected Value: ${state.selectedOpportunity?.expectedValue.toLocaleString()}</span>
                  <span>Probability: {state.selectedOpportunity?.probability}%</span>
                  <span>Close Date: {state.selectedOpportunity?.closeDate.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ${state.currentQuote.finalTotal.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">{state.currentQuote.items.length} items</p>
              </div>
            </div>
          </div>

          {/* Quote Builder Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <ProductCatalog
                models={models}
                products={products}
                processings={processings}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                onAddToQuote={handleAddProductToQuote}
                hasQuote={true}
                onCreateQuote={() => {}}
              />
            </div>
            
            <div className="lg:col-span-2">
              <EnterpriseQuoteBuilder
                quote={state.currentQuote}
                products={products}
                processings={processings}
                processingRules={processingRules}
                productDependencies={productDependencies}
                onQuoteUpdate={(updatedQuote) => setState(prev => ({ ...prev, currentQuote: updatedQuote }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      <CreateOpportunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateOpportunity={handleCreateOpportunitySubmit}
        accounts={accounts}
        contacts={contacts}
      />
    </div>
  );
}

export default EnterpriseApp;

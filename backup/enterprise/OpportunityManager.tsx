import React, { useState } from 'react';
import { Opportunity, Account, Contact, SalesActivity, ProductRecommendation, SalesPlaybook } from '../../types/enterprise';

interface OpportunityManagerProps {
  opportunity: Opportunity;
  account: Account;
  contacts: Contact[];
  activities: SalesActivity[];
  recommendations: ProductRecommendation[];
  playbooks: SalesPlaybook[];
  onUpdateOpportunity: (opportunity: Opportunity) => void;
  onCreateQuote: () => void;
  onScheduleActivity: (activity: Partial<SalesActivity>) => void;
}

const OpportunityManager: React.FC<OpportunityManagerProps> = ({
  opportunity,
  account,
  contacts,
  activities,
  recommendations,
  playbooks,
  onUpdateOpportunity,
  onCreateQuote,
  onScheduleActivity
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'playbook' | 'recommendations'>('overview');
  // Modal states for future implementation
  // const [showStageModal, setShowStageModal] = useState(false);
  // const [showActivityModal, setShowActivityModal] = useState(false);

  const stages = [
    { id: 'prospecting', name: 'Prospecting', probability: 10, color: 'bg-gray-500' },
    { id: 'qualification', name: 'Qualification', probability: 25, color: 'bg-blue-500' },
    { id: 'needs_analysis', name: 'Needs Analysis', probability: 40, color: 'bg-yellow-500' },
    { id: 'proposal', name: 'Proposal', probability: 60, color: 'bg-orange-500' },
    { id: 'negotiation', name: 'Negotiation', probability: 80, color: 'bg-red-500' },
    { id: 'closed_won', name: 'Closed Won', probability: 100, color: 'bg-green-500' },
    { id: 'closed_lost', name: 'Closed Lost', probability: 0, color: 'bg-gray-400' },
  ];

  const currentStage = stages.find(s => s.id === opportunity.stage);
  const nextStage = stages[stages.findIndex(s => s.id === opportunity.stage) + 1];

  const primaryContact = contacts.find(c => c.id === account.primaryContact);
  const decisionMakers = contacts.filter(c => c.role === 'decision_maker');

  const upcomingActivities = activities
    .filter(a => a.status === 'planned' && new Date(a.scheduledDate || '') > new Date())
    .sort((a, b) => new Date(a.scheduledDate || '').getTime() - new Date(b.scheduledDate || '').getTime());

  const recentActivities = activities
    .filter(a => a.status === 'completed')
    .sort((a, b) => new Date(b.completedDate || '').getTime() - new Date(a.completedDate || '').getTime())
    .slice(0, 5);

  const relevantPlaybook = playbooks.find(p => 
    p.industry === account.industry || p.useCase.toLowerCase().includes('kitchen')
  );

  const handleStageChange = (newStage: string) => {
    const stage = stages.find(s => s.id === newStage);
    if (stage) {
      onUpdateOpportunity({
        ...opportunity,
        stage: newStage as any,
        probability: stage.probability,
        lastModified: new Date()
      });
      // setShowStageModal(false); // Modal functionality coming soon
    }
  };

  const getHealthScore = () => {
    let score = 0;
    
    // Recent activity
    const recentActivity = activities.find(a => 
      new Date(a.completedDate || a.scheduledDate || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    if (recentActivity) score += 25;
    
    // Decision maker engagement
    if (decisionMakers.length > 0) score += 25;
    
    // Stage progression
    if (opportunity.stage !== 'prospecting') score += 25;
    
    // Timeline
    const daysToClose = Math.ceil((new Date(opportunity.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToClose > 0 && daysToClose < 90) score += 25;
    
    return score;
  };

  const healthScore = getHealthScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{opportunity.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">{account.name}</span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${currentStage?.color} text-white`}>
                  {currentStage?.name}
                </span>
                <span className={`text-sm font-medium ${
                  healthScore >= 75 ? 'text-green-600' : 
                  healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Health: {healthScore}%
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => alert('Activity scheduling modal - coming soon')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                + Activity
              </button>
              <button
                onClick={onCreateQuote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Create Quote
              </button>
              <button
                onClick={() => alert('Stage advancement modal - coming soon')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Advance Stage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Sales Process</span>
            <span className="text-sm text-gray-600">{opportunity.probability}% probability</span>
          </div>
          <div className="flex space-x-2">
            {stages.slice(0, -1).map((stage, index) => (
              <div key={stage.id} className="flex-1">
                <div className={`h-2 rounded-full ${
                  stages.findIndex(s => s.id === opportunity.stage) >= index
                    ? stage.color
                    : 'bg-gray-200'
                }`}></div>
                <div className="text-xs text-gray-600 mt-1">{stage.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'activities', name: 'Activities', icon: '📅' },
              { id: 'playbook', name: 'Sales Playbook', icon: '📚' },
              { id: 'recommendations', name: 'Recommendations', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opportunity Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expected Value</label>
                    <p className="text-2xl font-bold text-green-600">${opportunity.expectedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Close Date</label>
                    <p className="text-lg text-gray-900">{new Date(opportunity.closeDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Source</label>
                    <p className="text-gray-900">{opportunity.source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Days to Close</label>
                    <p className="text-gray-900">
                      {Math.ceil((new Date(opportunity.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <p className="text-gray-900">{account.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Revenue</label>
                    <p className="text-gray-900">${(account.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Employees</label>
                    <p className="text-gray-900">{account.employees.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Credit Rating</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      account.creditRating === 'excellent' ? 'bg-green-100 text-green-800' :
                      account.creditRating === 'good' ? 'bg-blue-100 text-blue-800' :
                      account.creditRating === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {account.creditRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                {nextStage ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Ready to advance to: {nextStage.name}</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      This will increase probability to {nextStage.probability}%
                    </p>
                    <button
                      onClick={() => handleStageChange(nextStage.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                    >
                      Advance to {nextStage.name}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">Opportunity is in final stage</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contacts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Contacts</h3>
                <div className="space-y-3">
                  {primaryContact && (
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="font-medium text-gray-900">{primaryContact.firstName} {primaryContact.lastName}</p>
                      <p className="text-sm text-gray-600">{primaryContact.title}</p>
                      <p className="text-sm text-blue-600">Primary Contact</p>
                    </div>
                  )}
                  {decisionMakers.map((contact) => (
                    <div key={contact.id} className="border-l-4 border-green-500 pl-3">
                      <p className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</p>
                      <p className="text-sm text-gray-600">{contact.title}</p>
                      <p className="text-sm text-green-600">Decision Maker</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {recentActivities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="border-l-4 border-gray-300 pl-3">
                      <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                      <p className="text-xs text-gray-600">
                        {activity.type} • {new Date(activity.completedDate || '').toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Activities */}
              {upcomingActivities.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
                  <div className="space-y-3">
                    {upcomingActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="border-l-4 border-yellow-500 pl-3">
                        <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                        <p className="text-xs text-gray-600">
                          {activity.type} • {new Date(activity.scheduledDate || '').toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">
                    {rec.type === 'cross_sell' ? '🔗' : 
                     rec.type === 'up_sell' ? '📈' : 
                     rec.type === 'substitute' ? '🔄' : '🧩'}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">{rec.type.replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-600">Confidence: {rec.confidence}%</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{rec.reason}</p>
                {rec.additionalRevenue && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      Potential additional revenue: ${rec.additionalRevenue.toLocaleString()}
                    </p>
                  </div>
                )}
                {rec.savings && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      Customer savings: ${rec.savings.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'playbook' && relevantPlaybook && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{relevantPlaybook.name}</h3>
            <p className="text-gray-600 mb-6">{relevantPlaybook.useCase}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Discovery Questions</h4>
                <ul className="space-y-2">
                  {relevantPlaybook.discoveryQuestions.map((question, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Value Propositions</h4>
                <ul className="space-y-2">
                  {relevantPlaybook.valuePropositions.map((value, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-700">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityManager;

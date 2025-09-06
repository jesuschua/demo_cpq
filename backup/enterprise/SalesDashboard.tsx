import React, { useState } from 'react';
import { Opportunity, Account, SalesActivity } from '../../types/enterprise';
import { Quote } from '../../types';

interface SalesDashboardProps {
  opportunities: Opportunity[];
  accounts: Account[];
  quotes: Quote[];
  activities: SalesActivity[];
  onCreateOpportunity: () => void;
  onViewOpportunity: (opportunity: Opportunity) => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({
  opportunities,
  accounts,
  quotes,
  activities,
  onCreateOpportunity,
  onViewOpportunity
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate metrics
  const totalPipelineValue = opportunities
    .filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + opp.expectedValue, 0);

  const weightedPipelineValue = opportunities
    .filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + (opp.expectedValue * opp.probability / 100), 0);

  const wonThisMonth = opportunities
    .filter(opp => opp.stage === 'closed_won' && 
      new Date(opp.lastModified).getMonth() === new Date().getMonth())
    .reduce((sum, opp) => sum + opp.expectedValue, 0);

  const quotesThisMonth = quotes
    .filter(q => new Date(q.createdAt).getMonth() === new Date().getMonth())
    .length;

  const stageMetrics = [
    { stage: 'prospecting', label: 'Prospecting', color: 'bg-gray-500' },
    { stage: 'qualification', label: 'Qualification', color: 'bg-blue-500' },
    { stage: 'needs_analysis', label: 'Needs Analysis', color: 'bg-yellow-500' },
    { stage: 'proposal', label: 'Proposal', color: 'bg-orange-500' },
    { stage: 'negotiation', label: 'Negotiation', color: 'bg-red-500' },
    { stage: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
  ].map(stage => ({
    ...stage,
    count: opportunities.filter(opp => opp.stage === stage.stage).length,
    value: opportunities
      .filter(opp => opp.stage === stage.stage)
      .reduce((sum, opp) => sum + opp.expectedValue, 0)
  }));

  const topOpportunities = opportunities
    .filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage))
    .sort((a, b) => b.expectedValue - a.expectedValue)
    .slice(0, 5);

  const recentActivities = activities
    .sort((a, b) => new Date(b.completedDate || b.scheduledDate || 0).getTime() - 
                    new Date(a.completedDate || a.scheduledDate || 0).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Kitchen CPQ - Enterprise Sales Management</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button
            onClick={onCreateOpportunity}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            + New Opportunity
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(totalPipelineValue / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Weighted: ${(weightedPipelineValue / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Won This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(wonThisMonth / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {opportunities.filter(o => o.stage === 'closed_won').length} deals closed
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
              <p className="text-2xl font-semibold text-gray-900">
                {opportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).length}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Avg. value: ${(totalPipelineValue / Math.max(1, opportunities.length) / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📝</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quotes This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{quotesThisMonth}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {quotes.filter(q => q.status === 'pending_approval').length} pending approval
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline by Stage */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
            <p className="text-sm text-gray-600">Opportunities by stage</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stageMetrics.map((stage) => (
                <div key={stage.stage} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                      <span className="text-sm text-gray-500">
                        {stage.count} deals • ${(stage.value / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${stage.color} h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.max(5, (stage.value / Math.max(1, totalPipelineValue)) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Opportunities</h3>
            <p className="text-sm text-gray-600">Highest value active deals</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onViewOpportunity(opp)}
                  className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{opp.name}</h4>
                    <span className="text-sm font-semibold text-green-600">
                      ${(opp.expectedValue / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="capitalize">{opp.stage.replace('_', ' ')}</span>
                    <span>{opp.probability}% • {new Date(opp.closeDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${opp.probability}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales Activities</h3>
          <p className="text-sm text-gray-600">Latest customer interactions and follow-ups</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">
                    {activity.type === 'call' ? '📞' : 
                     activity.type === 'email' ? '✉️' : 
                     activity.type === 'meeting' ? '🤝' : 
                     activity.type === 'demo' ? '🖥️' : 
                     activity.type === 'proposal' ? '📄' : '📋'}
                  </span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{activity.subject}</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                  <span>
                    {new Date(activity.completedDate || activity.scheduledDate || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;

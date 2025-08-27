import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid
} from 'recharts';
import apiClient from "../../app/axiosConfig";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#ff6b6b', '#4ecdc4'];

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [quotationAnalytics, setQuotationAnalytics] = useState(null);
  const [financialAnalytics, setFinancialAnalytics] = useState(null);
  const [clientAnalytics, setClientAnalytics] = useState(null);
  const [agentAnalytics, setAgentAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all analytics data in parallel
      const [
        dashboardResponse,
        quotationResponse,
        financialResponse,
        clientResponse,
        agentResponse,
        trendsResponse,
        performanceResponse
      ] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/analytics/quotations/analytics?period=12'),
        apiClient.get('/analytics/financial/analytics'),
        apiClient.get('/analytics/clients/analytics'),
        apiClient.get('/analytics/agents/analytics'),
        apiClient.get('/analytics/trends?months=12'),
        apiClient.get('/analytics/performance/summary')
      ]);

      setDashboardData(dashboardResponse.data);
      setQuotationAnalytics(quotationResponse.data);
      setFinancialAnalytics(financialResponse.data);
      setClientAnalytics(clientResponse.data);
      setAgentAnalytics(agentResponse.data);
      setTrends(trendsResponse.data);
      setPerformanceSummary(performanceResponse.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts
  const transformStatusDistribution = (data) => {
    if (!data) return [];
    return Object.entries(data).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const transformMonthlyData = (data) => {
    if (!data) return [];
    return Object.entries(data).map(([month, value]) => ({
      month,
      value: typeof value === 'number' ? value : parseFloat(value)
    }));
  };

  const transformPaymentMethods = (data) => {
    if (!data) return [];
    return Object.entries(data).map(([method, count]) => ({
      name: method.replace('_', ' '),
      value: count
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex-shrink-0 mb-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Business Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Comprehensive business intelligence and performance metrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {dashboardData && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                👥
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Agents</p>
                <p className="text-lg font-bold text-gray-900">{dashboardData.totalAgents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                🏢
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Clients</p>
                <p className="text-lg font-bold text-gray-900">{dashboardData.totalClients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                📋
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Quotations</p>
                <p className="text-lg font-bold text-gray-900">{dashboardData.totalQuotations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                💰
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Transactions</p>
                <p className="text-lg font-bold text-gray-900">{dashboardData.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                💵
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900">${dashboardData.totalRevenue?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
                📈
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Quotation Value</p>
                <p className="text-lg font-bold text-gray-900">${dashboardData.totalQuotationValue?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-auto">
        {/* Quotation Status Distribution */}
        {quotationAnalytics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-sm text-white">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Quotation Status Distribution</h3>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transformStatusDistribution(quotationAnalytics.statusDistribution)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {transformStatusDistribution(quotationAnalytics.statusDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Payment Method Distribution */}
        {financialAnalytics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <span className="text-sm text-white">💳</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Payment Method Distribution</h3>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformPaymentMethods(financialAnalytics.paymentMethodDistribution)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly Revenue Trend */}
        {trends && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                <span className="text-sm text-white">📈</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Monthly Revenue Trend</h3>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transformMonthlyData(trends.revenueTrends)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Clients */}
        {clientAnalytics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center">
                <span className="text-sm text-white">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Top Clients by Value</h3>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={clientAnalytics.topClients} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="clientName" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Quotation Value']} />
                  <Bar dataKey="totalQuotationValue" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Agents */}
        {agentAnalytics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-sm text-white">👨‍💼</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Top Agents Performance</h3>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={agentAnalytics.topAgents} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="agentName" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Quotation Value']} />
                  <Bar dataKey="totalQuotationValue" fill="#a4de6c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {performanceSummary && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center">
                <span className="text-sm text-white">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Performance Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Quotations/Client</p>
                <p className="text-xl font-bold text-blue-600">{performanceSummary.avgQuotationsPerClient?.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Quotations/Agent</p>
                <p className="text-xl font-bold text-green-600">{performanceSummary.avgQuotationsPerAgent?.toFixed(1)}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Revenue/Client</p>
                <p className="text-xl font-bold text-purple-600">${performanceSummary.avgRevenuePerClient?.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-orange-600">${performanceSummary.totalRevenue?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
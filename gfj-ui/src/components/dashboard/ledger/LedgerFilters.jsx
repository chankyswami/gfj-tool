import React from 'react';

const LedgerFilters = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterPaymentStatus,
  setFilterPaymentStatus,
  dateRange,
  setDateRange,
  onClearFilters
}) => {
  const categories = {
    income: ['sales', 'refunds', 'investments', 'other_income'],
    expense: ['inventory', 'operational', 'marketing', 'salary', 'rent', 'utilities', 'other_expenses']
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Transactions
          </label>
                      <input
              type="text"
              placeholder="Search by ID, description, customer, or reference"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 !text-gray-900 bg-gray-50 hover:bg-white transition-all duration-200"
              style={{ color: '#111827' }}
            />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
                      <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 !text-gray-900 bg-gray-50 hover:bg-white transition-all duration-200"
              style={{ color: '#111827' }}
            >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
                      <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 !text-gray-900 bg-gray-50 hover:bg-white transition-all duration-200"
              style={{ color: '#111827' }}
            >
            <option value="all">All Categories</option>
            {filterType === 'all' || filterType === 'income' ? (
              <>
                <option value="sales">Sales</option>
                <option value="refunds">Refunds</option>
                <option value="investments">Investments</option>
                <option value="other_income">Other Income</option>
              </>
            ) : null}
            {filterType === 'all' || filterType === 'expense' ? (
              <>
                <option value="inventory">Inventory</option>
                <option value="operational">Operational</option>
                <option value="marketing">Marketing</option>
                <option value="salary">Salary</option>
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="other_expenses">Other Expenses</option>
              </>
            ) : null}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 !text-gray-900 bg-gray-50 hover:bg-white transition-all duration-200"
            style={{ color: '#111827' }}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
                      <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 !text-gray-900 bg-gray-50 hover:bg-white transition-all duration-200"
              style={{ color: '#111827' }}
            />
        </div>
        

      </div>
      
      <div className="flex justify-end mt-4">
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default LedgerFilters; 
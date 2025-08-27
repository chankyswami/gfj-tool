import React, { useEffect } from 'react';

const TransactionModal = ({ transaction, setTransaction, onSave, onClose, mode }) => {
  // Reset category when type changes
  useEffect(() => {
    if (transaction.type && transaction.category) {
      // Check if current category is valid for the selected type
      const incomeCategories = ['sales', 'refunds', 'investments', 'other_income'];
      const expenseCategories = ['inventory', 'operational', 'marketing', 'salary', 'rent', 'utilities', 'other_expenses'];
      
      const isValidCategory = transaction.type === 'income' 
        ? incomeCategories.includes(transaction.category)
        : expenseCategories.includes(transaction.category);
      
      if (!isValidCategory) {
        setTransaction({ ...transaction, category: '' });
      }
    }
  }, [transaction.type]);
  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    console.log('Current transaction state:', transaction);
    setTransaction({ ...transaction, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
            </h2>
            <p className="text-gray-600">Transaction details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={transaction.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                required
              >
                <option value="">Select Type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category * {transaction.type && <span className="text-xs text-gray-500">({transaction.type})</span>}
              </label>
              <select
                value={transaction.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900 ${
                  !transaction.type ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                style={{ color: '#111827' }}
                required
                disabled={!transaction.type}
              >
                <option value="">{transaction.type ? 'Select Category' : 'Select Type First'}</option>
                {transaction.type === 'income' ? (
                  <>
                    <option value="sales">Sales</option>
                    <option value="refunds">Refunds</option>
                    <option value="investments">Investments</option>
                    <option value="other_income">Other Income</option>
                  </>
                ) : transaction.type === 'expense' ? (
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

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={transaction.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                placeholder="0.00"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                value={transaction.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                required
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online_payment">Online Payment</option>
                <option value="check">Check</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status *
              </label>
              <select
                value={transaction.paymentStatus}
                onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                required
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference
              </label>
              <input
                type="text"
                value={transaction.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                placeholder="Invoice number, receipt, etc."
              />
            </div>

            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={transaction.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                placeholder="GFJ-2024-XXX"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={transaction.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent text-gray-900 !text-gray-900"
                style={{ color: '#111827' }}
                rows="3"
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[var(--brand-gold)] hover:bg-[var(--brand-yellow)] text-black rounded-lg font-semibold transition-colors"
            >
              {mode === 'add' ? 'Add Transaction' : 'Update Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal; 
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TransactionModal from './TransactionModal';
import LedgerStats from './LedgerStats';
import LedgerFilters from './LedgerFilters';
import apiClient from '../../../app/axiosConfig';

const LedgerTracker = () => {
  const { token, id } = useSelector((state) => state.user.userDetails || {});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '' });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    category: '',
    amount: '',
    paymentMethod: 'cash',
    paymentStatus: '',
    reference: '',
    notes: '',
    orderId: ''
  });

  // API function to fetch transactions
  const fetchTransactions = useCallback(async (currentPage = 1, reset = false) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const offset = (currentPage - 1) * 20; // 20 is the page size
      const response = await apiClient.get(`/ledger/?offset=${offset}&size=20`);
      
      if (response?.data) {
        const newTransactions = response.data.data || [];
        
        // Transform API data to match component structure
        const transformedTransactions = newTransactions.map(transaction => {
          // Determine transaction type based on transactionType field
          let transactionType = 'expense'; // default
          
          if (transaction.transactionType) {
            transactionType = transaction.transactionType.toLowerCase() === 'income' ? 'income' : 'expense';
          } else if (transaction.type) {
            transactionType = transaction.type.toLowerCase() === 'income' ? 'income' : 'expense';
          } else if (transaction.category) {
            // Fallback: check if category indicates income
            const incomeCategories = ['sales', 'refunds', 'investments', 'other_income'];
            transactionType = incomeCategories.includes(transaction.category.toLowerCase()) ? 'income' : 'expense';
          }
          
          return {
            id: transaction.id,
            transactionId: transaction.transactionId,
            date: new Date(transaction.createdAt).toISOString().split('T')[0],
            description: transaction.description,
            type: transactionType,
            category: transaction.category?.toLowerCase() || 'other',
            amount: parseFloat(transaction.amount) || 0,
            paymentMethod: transaction.paymentMethod?.toLowerCase().replace(' ', '_') || 'cash',
            reference: transaction.reference || '',
            notes: transaction.note || '',
            customerName: transaction.clientName || '',
            orderId: transaction.orderId || '',
            paymentStatus: transaction.paymentStatus,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
          };
        });

        if (reset) {
          setTransactions(transformedTransactions);
        } else {
          setTransactions(prev => [...prev, ...transformedTransactions]);
        }
        
        setTotalRecords(response.data.totalRecords || 0);
        setHasMore(response.data.hasMore || false);
        setPage(currentPage);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions. Please try again.');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTransactions(1, true);
    }
  }, [fetchTransactions]);

  const getTypeColor = (type) => {
    return type === 'income' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getTypeIcon = (type) => {
    return type === 'income' ? '💰' : '💸';
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'credit_card':
        return '💳';
      case 'bank_transfer':
        return '🏦';
      case 'online_payment':
        return '🌐';
      case 'check':
        return '📄';
      default:
        return '💰';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sales':
        return '🛍️';
      case 'inventory':
        return '📦';
      case 'operational':
        return '⚙️';
      case 'marketing':
        return '📢';
      case 'salary':
        return '👥';
      case 'rent':
        return '🏢';
      case 'utilities':
        return '⚡';
      default:
        return '📋';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'overdue':
        return '⚠️';
      case 'cancelled':
        return '❌';
      case 'refunded':
        return '↩️';
      default:
        return '❓';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.paymentStatus && transaction.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesPaymentStatus = filterPaymentStatus === 'all' || transaction.paymentStatus === filterPaymentStatus;
    
    const matchesDateRange = 
      (!dateRange.start || transaction.date >= dateRange.start);
    
    return matchesSearch && matchesType && matchesCategory && matchesPaymentStatus && matchesDateRange;
  });

  const handleAddTransaction = async () => {
    if (!newTransaction.amount) {
      toast.error('Amount is required');
      return;
    }

    try {
      const requestBody = {
        clientId: 2, // You can make this dynamic based on selected client
        amount: parseFloat(newTransaction.amount),
        paymentMethod: newTransaction.paymentMethod.replace('_', ' '),
        orderId: newTransaction.orderId || '',
        transactionType: newTransaction.type === 'income' ? 'Income' : 'Expense',
        category: newTransaction.category.charAt(0).toUpperCase() + newTransaction.category.slice(1),
        reference: newTransaction.reference || '',
        paymentStatus: newTransaction.paymentStatus || 'paid',
        note: newTransaction.notes || ''
      };

      const response = await apiClient.post('/ledger/createTransaction', requestBody);
      
      if (response?.status === 200) {
        toast.success(response.data?.message || 'Transaction added successfully!');
        setShowAddTransaction(false);
        // Refresh the transactions list
        fetchTransactions(1, true);
        
        // Reset form
        setNewTransaction({
          type: '',
          category: '',
          amount: '',
          paymentMethod: 'cash',
          paymentStatus: '',
          reference: '',
          notes: '',
          orderId: ''
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    }
  };

  const updateTransaction = async (transactionId, updatedData) => {
    try {
      console.log('Updating transaction:', transactionId);
      console.log('Updated data:', updatedData);
      
      const requestBody = {
        amount: parseFloat(updatedData.amount),
        paymentMethod: updatedData.paymentMethod.replace('_', ' '),
        orderId: updatedData.orderId || '',
        transactionType: updatedData.type === 'income' ? 'Income' : 'Expense',
        category: updatedData.category.charAt(0).toUpperCase() + updatedData.category.slice(1),
        reference: updatedData.reference || '',
        paymentStatus: updatedData.paymentStatus || 'paid',
        note: updatedData.notes || ''
      };

      console.log('Request body:', requestBody);
      console.log('API endpoint:', `/ledger/updateTransaction/${transactionId}`);
      
      const response = await apiClient.put(`/ledger/updateTransaction/${transactionId}`, requestBody);
      
      console.log('Update response:', response);
      
      if (response?.status === 200 || response?.status === 204) {
        toast.success('Transaction updated successfully');
        // Refresh the transactions list
        fetchTransactions(1, true);
      } else {
        toast.error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to update transaction. Please try again.');
    }
  };

  const deleteTransaction = (transactionId) => {
    setPendingDeleteId(transactionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const transactionId = pendingDeleteId;
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    setIsDeleting(true);
    setDeletingTransactionId(transactionId);
    
    try {
      console.log('Deleting transaction:', transactionId);
      console.log('API endpoint:', `/ledger/deleteTransaction/${transactionId}`);
      
      const response = await apiClient.delete(`/ledger/deleteTransaction/${transactionId}`);
      
      console.log('Delete response:', response);
      
      if (response?.status === 200 || response?.status === 204) {
        toast.success('Transaction deleted successfully');
        // Refresh the transactions list
        fetchTransactions(1, true);
      } else {
        toast.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to delete transaction. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingTransactionId(null);
    }
  };

  const handleEditTransaction = async () => {
    if (editingTransaction && selectedTransaction) {
      await updateTransaction(selectedTransaction.transactionId, editingTransaction);
      setSelectedTransaction(null);
      setEditingTransaction(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterPaymentStatus('all');
    setDateRange({ start: '' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Sticky Header Section */}
      <div className="flex-shrink-0 space-y-6 pb-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-2xl text-white">💰</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Ledger Tracker
                </h1>
                <p className="text-gray-600 mt-1">Track all financial transactions and maintain accurate records</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddTransaction(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg">💰</span>
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Statistics */}
        <LedgerStats transactions={transactions} />

        {/* Filters */}
        <LedgerFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterPaymentStatus={filterPaymentStatus}
          setFilterPaymentStatus={setFilterPaymentStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Scrollable Table Section */}
      <div className="flex-1 min-h-0">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
          <div className="overflow-x-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                                 <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 shadow-sm">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Transaction Details
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Type & Category
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Amount
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Payment Method
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Payment Status
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Reference
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Notes
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Date
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Actions
                     </th>
                   </tr>
                 </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                                             <td className="px-6 py-4">
                         <div>
                           <div className="text-sm font-medium text-gray-900">
                             {transaction.transactionId}
                           </div>
                           <div className="text-sm text-gray-500">
                             {transaction.description}
                           </div>
                           {transaction.customerName && (
                             <div className="text-xs text-gray-500">
                               Customer: {transaction.customerName}
                             </div>
                           )}
                         </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(transaction.type)}`}>
                            <span className="mr-1">{getTypeIcon(transaction.type)}</span>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-1">{getCategoryIcon(transaction.category)}</span>
                            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <span className="mr-2">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                          {transaction.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + 
                           transaction.paymentMethod.replace('_', ' ').slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(transaction.paymentStatus)}`}>
                            <span className="mr-1">{getPaymentStatusIcon(transaction.paymentStatus)}</span>
                            {transaction.paymentStatus ? transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1) : 'Unknown'}
                          </span>
                        </div>
                      </td>
                                             <td className="px-6 py-4">
                         <div className="text-sm text-gray-900 font-mono">
                           {transaction.reference}
                         </div>
                         {transaction.orderId && (
                           <div className="text-xs text-gray-500">
                             Order: {transaction.orderId}
                           </div>
                         )}
                       </td>
                       <td className="px-6 py-4">
                         <div className="text-sm text-gray-600 max-w-xs">
                           {transaction.notes ? (
                             <div className="truncate" title={transaction.notes}>
                               {transaction.notes}
                             </div>
                           ) : (
                             <span className="text-gray-400 italic">No notes</span>
                           )}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="text-sm text-gray-900">
                           {transaction.date}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex space-x-2">
                           <button
                             onClick={() => {
                               setSelectedTransaction(transaction);
                               setEditingTransaction({...transaction});
                             }}
                             className="text-blue-600 hover:text-blue-800 text-xs px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
                           >
                             👁️ View
                           </button>
                           <button
                             onClick={() => deleteTransaction(transaction.transactionId)}
                             className="text-red-600 hover:text-red-800 text-xs"
                           >
                             🗑️
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => fetchTransactions(page + 1, false)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Load More Transactions
              </button>
            </div>
          )}
          
          {filteredTransactions.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <TransactionModal
          transaction={newTransaction}
          setTransaction={setNewTransaction}
          onSave={handleAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          mode="add"
        />
      )}

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={editingTransaction || selectedTransaction}
          setTransaction={setEditingTransaction}
          onSave={handleEditTransaction}
          onClose={() => {
            setSelectedTransaction(null);
            setEditingTransaction(null);
          }}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🗑️</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Transaction
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete transaction <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{pendingDeleteId}</span>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPendingDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Processing Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Deleting Transaction
              </h3>
              <p className="text-gray-600 mb-4">
                Please wait while we delete transaction <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{deletingTransactionId}</span>
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>🗑️</span>
                <span>Processing deletion...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerTracker;
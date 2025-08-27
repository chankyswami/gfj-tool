import React from 'react';

const LedgerStats = ({ ledgers }) => {
  const getStats = () => {
    console.log(ledgers);
    const total = ledgers.length;
    const shipped = ledgers.filter(ledger => ledger?.status === 'shipped').length;
    const delivered = ledgers.filter(ledger => ledger?.status === 'delivered').length;
    const returned = ledgers.filter(ledger => ledger?.status === 'returned').length;
    const cancelled = ledgers.filter(ledger => ledger?.status === 'cancelled').length;

    return {
      total,
      pending,
      shipped,
      delivered,
      returned,
      cancelled,
      completionRate: total > 0 ? Math.round((delivered / total) * 100) : 0
    };
  };

  const stats = getStats();

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: '📦',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: '⏳',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Shipped',
      value: stats.shipped,
      icon: '🚚',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: '✅',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Returned',
      value: stats.returned,
      icon: '🔙',
      color: 'bg-sky-500',
      textColor: 'text-sky-600'
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: '❌',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat?.title}</p>
              <p className={`text-2xl font-bold ${stat?.textColor}`}>{stat?.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${stat?.color} flex items-center justify-center text-white text-xl`}>
              {stat?.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LedgerStats; 
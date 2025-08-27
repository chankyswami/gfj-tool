import React from 'react';

const QuotationStats = ({ quotations }) => {
  const getStats = () => {
    console.log(quotations);
    const total = quotations.length;
    const newQuotation = quotations.filter(quotation => quotation?.quotationStatus === 'new').length;
    const pending = quotations.filter(quotation => quotation?.quotationStatus === 'pending').length;
    const approved = quotations.filter(quotation => quotation?.quotationStatus === 'approved').length;
    const declined = quotations.filter(quotation => quotation?.quotationStatus === 'declined').length;
    const sentforshipping = quotations.filter(quotation => quotation?.quotationStatus === 'sentforshipping').length;

    return {
      total,
      newQuotation,
      pending,
      approved,
      declined,
      sentforshipping,
    };
  };

  const stats = getStats();

  const statCards = [
    {
      title: 'Total Quotations',
      value: stats.total,
      icon: '📦',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'New',
      value: stats.newQuotation,
      icon: '❕',
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: '⏳',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: '✅',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Declined',
      value: stats.declined,
      icon: '🚫',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Sent for Shipping',
      value: stats.sentforshipping,
      icon: '🚚',
      color: 'bg-green-500',
      textColor: 'text-green-600'
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

export default QuotationStats; 
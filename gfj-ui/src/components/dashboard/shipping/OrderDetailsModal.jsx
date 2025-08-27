import React from 'react';

const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const getStatusTimeline = (status) => {
    const timeline = [
      { step: 'Order Placed', status: 'completed', date: order.createdAt, icon: '📋' },
      { step: 'Processing', status: status === 'pending' ? 'pending' : 'completed', date: order.createdAt, icon: '⚙️' },
      { step: 'Shipped', status: ['shipped', 'delivered'].includes(status) ? 'completed' : 'pending', date: order.updatedAt, icon: '📦' },
      { step: 'Delivered', status: status === 'delivered' ? 'completed' : 'pending', date: order.estimatedDelivery, icon: '✅' }
    ];

    if (status === 'cancelled') {
      timeline.push({ step: 'Cancelled', status: 'completed', date: order.updatedAt, icon: '❌' });
    }

    return timeline;
  };

  const timeline = getStatusTimeline(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-600">Order ID: {order.orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{order.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{order.updatedAt}</span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Delivery:</span>
                      <span className="font-medium">{order.estimatedDelivery}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Shipping Address:</span>
                    <p className="font-medium">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{order.items}</p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Timeline</h3>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      item.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : item.status === 'pending'
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        item.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {item.step}
                      </p>
                      {item.date && (
                        <p className="text-xs text-gray-400">
                          {item.date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Number</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg">{order.trackingNumber}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.trackingNumber);
                          // You can add a toast notification here
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="flex space-x-2">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 
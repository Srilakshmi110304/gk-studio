// pages/OrderConfirmation.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Clock } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';
import { formatPrice } from '../lib/utils';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrder, loading } = useOrders();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    const orderData = await getOrder(id!);
    setOrder(orderData);
  };

  if (loading || !order) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded max-w-md mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">Order Confirmed!</h1>
        <p className="text-text-secondary mb-2">Thank you for shopping with GK Studio.</p>
        <p className="text-sm font-bold text-primary mb-8">Order ID: {order.order_number}</p>

        <div className="bg-white p-6 rounded-card shadow-sm border border-gray-100 mb-8 text-left">
          <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Package size={18} className="text-accent" />
            Order Summary
          </h4>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                <img src={item.product_image} alt={item.product_name} className="w-16 h-20 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-bold text-primary">{item.product_name}</p>
                  <p className="text-xs text-text-secondary">Qty: {item.quantity} | {item.variant}</p>
                  <p className="text-sm font-bold mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Subtotal</span>
              <span>{formatPrice(order.total_amount - order.delivery_charge)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Delivery</span>
              <span>{order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-accent">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-card shadow-sm border border-gray-100 mb-8 text-left">
          <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Truck size={18} className="text-accent" />
            Shipping Address
          </h4>
          <p className="text-sm text-text-secondary">
            {order.shipping_address?.name}<br />
            {order.shipping_address?.phone}<br />
            {order.shipping_address?.address_line}, {order.shipping_address?.city}<br />
            {order.shipping_address?.state} - {order.shipping_address?.pincode}
          </p>
        </div>

        <div className="bg-white p-6 rounded-card shadow-sm border border-gray-100 mb-8 text-left">
          <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            Estimated Delivery
          </h4>
          <p className="text-text-secondary text-sm">
            Your order will be delivered within 3-5 business days.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/account" className="btn-secondary">View Orders</Link>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
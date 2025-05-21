
import React from 'react';
import { motion } from 'framer-motion';

const DriverPaymentHistory = ({ payments }) => {
  return (
    <motion.div
      className="glass-effect p-4 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <h3 className="text-xl font-bold mb-4">Payment History</h3>
      <div className="max-h-[300px] overflow-y-auto pr-2">
        {payments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="py-2 px-1">Date</th>
                <th className="py-2 px-1">Amount</th>
                <th className="py-2 px-1">Period</th>
                <th className="py-2 px-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-1">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="py-2 px-1 font-semibold text-green-400">${Number(payment.amount).toFixed(2)}</td>
                  <td className="py-2 px-1 text-xs">{new Date(payment.period_start).toLocaleDateString()} - {new Date(payment.period_end).toLocaleDateString()}</td>
                  <td className="py-2 px-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'Paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground text-center pt-10">No payment history found.</p>
        )}
      </div>
    </motion.div>
  );
};

export default DriverPaymentHistory;

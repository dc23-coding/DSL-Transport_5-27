
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DriverEarningsChart = ({ payments }) => {
  const chartData = payments
    .sort((a,b) => new Date(a.payment_date) - new Date(b.payment_date))
    .map(payment => ({
    date: new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: Number(payment.amount)
  }));

  return (
    <motion.div
      className="lg:col-span-2 glass-effect p-4 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4">Earnings Trend</h3>
      <div className="h-[300px]">
        {payments.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: 'none', borderRadius: '0.5rem' }} 
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="amount" stroke="#34D399" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center pt-10">No payment data available to display chart.</p>
        )}
      </div>
    </motion.div>
  );
};

export default DriverEarningsChart;

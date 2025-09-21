import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartData {
  name: string;
  amount: number;
}

interface CustomBarChartProps {
  data: BarChartData[];
  title?: string;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, title }) => {
  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="amount" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
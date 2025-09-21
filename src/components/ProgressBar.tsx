import React from 'react';

interface ProgressBarProps {
  percentage: number;
  title: string;
  spent: number;
  budget: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  title,
  spent,
  budget,
  color = 'bg-green-500'
}) => {
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return color;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}% used</span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>₹0</span>
        <span>₹{budget.toFixed(2)}</span>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ₹{spent.toFixed(2)} spent of ₹{budget.toFixed(2)} budget
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
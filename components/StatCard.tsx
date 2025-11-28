import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, description }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-xl ${colorClass} bg-opacity-20`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default StatCard;
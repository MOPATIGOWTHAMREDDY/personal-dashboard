import React from 'react';
import { CONTENT_CONFIGS } from '../../utils/constants';

const ContentTabs = ({ activeType, onTypeChange }) => {
  return (
    <div className="flex items-center justify-center space-x-4 p-6">
      {CONTENT_CONFIGS.map(config => (
        <button
          key={config.id}
          onClick={() => onTypeChange(config.id)}
          className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            activeType === config.id
              ? `bg-gradient-to-r ${config.gradient} text-white shadow-2xl`
              : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 hover:text-white'
          }`}
        >
          {/* Icon */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{config.icon}</span>
            <span>{config.name}</span>
          </div>

          {/* Active Indicator */}
          {activeType === config.id && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50 animate-pulse"></div>
          )}

          {/* Hover Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      ))}
    </div>
  );
};

export default ContentTabs;
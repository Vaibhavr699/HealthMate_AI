"use client";

import React from 'react';

const InlineLoader = ({ size = 'md', color = 'indigo' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    indigo: 'border-indigo-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
};

export default InlineLoader;




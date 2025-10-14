"use client";

import Image from "next/image";
import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute w-32 h-32 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="w-20 h-20 relative">
          <Image
            src="/icon5.svg"
            alt="Loading"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
      </div>
    </div>
  );
};

export default LoadingSpinner;

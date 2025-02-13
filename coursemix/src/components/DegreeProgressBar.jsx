import React from 'react';

const DegreeProgressBar = () => {
  const progress = 85; // This will be dynamic later

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Degree Progress</span>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        You're almost there! Keep up the great work!
      </p>
    </div>
  );
};

export default DegreeProgressBar; 
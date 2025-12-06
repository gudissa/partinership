import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorDisplay = ({ 
  error, 
  message = 'Something went wrong',
  onRetry,
  showBackButton = true,
  backPath = '/',
  className = ''
}) => {
  const navigate = useNavigate();
  
  const errorMessage = error?.response?.data?.message || 
                       error?.message || 
                       message;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg 
              className="h-8 w-8 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! An Error Occurred</h2>
          <p className="text-gray-600 text-sm">{errorMessage}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-[#1f88d8] text-white rounded-lg hover:bg-[#116ab8] transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          )}
          {showBackButton && (
            <button
              onClick={() => navigate(backPath)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;


import React, { useState, useEffect } from 'react';
import { X, LogIn, User, AlertCircle, Loader2 } from 'lucide-react';

const SignInModal = ({ isOpen, onClose, onSignIn, isLoading = false }) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUserIdInput('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate input
    if (!userIdInput.trim()) {
      setError('Please enter a User ID');
      return;
    }

    // Validate User ID format (basic validation)
    const trimmedUserId = userIdInput.trim();
    if (trimmedUserId.length < 3) {
      setError('User ID must be at least 3 characters long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSignIn(trimmedUserId);
      // Modal will be closed by parent component on success
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setUserIdInput(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isSubmitting && !isLoading) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const isProcessing = isSubmitting || isLoading;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sign In
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your User ID to access your roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* User ID Input */}
            <div>
              <label 
                htmlFor="userId" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="userId"
                  type="text"
                  value={userIdInput}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  placeholder="Enter your User ID"
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg
                    focus:ring-2 focus:ring-green-500 focus:border-green-500
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
                    dark:focus:ring-green-400 dark:focus:border-green-400
                    ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  `}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Info Message */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Don't have a User ID? Contact your administrator or create a new roadmap to get started.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !userIdInput.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
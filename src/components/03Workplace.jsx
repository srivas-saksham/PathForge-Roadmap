import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  BookOpen,
  Target,
  Calendar,
  Trophy,
  RefreshCw,
  TrendingUp,
  Play,
  Pause,
  X,
  UserX,
  Home,
  Wifi,
  WifiOff
} from 'lucide-react';
import RoadmapService from '../services/RoadmapService';
import RoadmapWarningModal from './06RoadmapWarningModal';

// --- ERROR TYPES (MATCHING MAINAPP) ---
const ERROR_TYPES = {
  USER_NOT_FOUND: 'user_not_found',
  NO_ROADMAP_DATA: 'no_roadmap_data',
  SERVER_ERROR: 'server_error',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
};

// --- UI COMPONENTS ---
const Button = ({ children, onClick, disabled, variant = 'primary', className = '', size = 'md' }) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 transform hover:scale-[1.02] active:scale-[0.98]';
  const variants = {
    primary: 'bg-[#5c946d] hover:bg-[#4b7f5b] disabled:bg-gray-400 text-white focus:ring-[#5c946d] shadow-lg hover:shadow-xl',
    secondary: 'bg-[#4b7f5b] hover:bg-[#3c6a4b] text-white focus:ring-[#5c946d] shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
    success: 'bg-[#5c946d] hover:bg-green-700 disabled:bg-gray-400 text-white focus:ring-green-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'transform-none cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const StatusCard = ({ icon: Icon, title, message, variant = 'info', className = '', showSpinner = false }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
  };

  return (
    <div className={`p-4 border rounded-lg ${variants[variant]} ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {showSpinner ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-current ${className}`}></div>
  );
};

const ProgressBar = ({ current, total, className = '' }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <div 
        className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// --- INVALID USER MODAL COMPONENT (ENHANCED) ---
const InvalidUserModal = ({ 
  isOpen, 
  onClose, 
  onTryAgain, 
  onGoHome, 
  message, 
  userID, 
  modalType = ERROR_TYPES.UNKNOWN_ERROR,
  connectionStatus = 'online'
}) => {
  if (!isOpen) return null;

  // Determine modal properties based on error type
  const getModalProperties = () => {
    switch (modalType) {
      case ERROR_TYPES.USER_NOT_FOUND:
        return {
          icon: UserX,
          title: 'User ID Not Found',
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        };
      case ERROR_TYPES.NO_ROADMAP_DATA:
        return {
          icon: BookOpen,
          title: 'No Roadmap Data',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
        };
      case ERROR_TYPES.NETWORK_ERROR:
        return {
          icon: connectionStatus === 'offline' ? WifiOff : Wifi,
          title: 'Connection Error',
          iconColor: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        };
      case ERROR_TYPES.SERVER_ERROR:
        return {
          icon: AlertCircle,
          title: 'Server Error',
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Error',
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        };
    }
  };

  const { icon: Icon, title, iconColor, bgColor } = getModalProperties();

  const getTroubleshootingTips = () => {
    switch (modalType) {
      case ERROR_TYPES.USER_NOT_FOUND:
        return [
          'The roadmap data was cleared from the database',
          'You\'re using an old or invalid user ID',
          'There was a server issue during data storage',
          'The roadmap expired or was deleted'
        ];
      case ERROR_TYPES.NO_ROADMAP_DATA:
        return [
          'The roadmap generation was incomplete',
          'Data corruption occurred during storage',
          'The roadmap was partially deleted',
          'There was an error during the initial save'
        ];
      case ERROR_TYPES.NETWORK_ERROR:
        return [
          'Your internet connection is unstable',
          'The server is temporarily unreachable',
          'There\'s a firewall or proxy blocking the request',
          'DNS resolution issues'
        ];
      case ERROR_TYPES.SERVER_ERROR:
        return [
          'The server is experiencing high load',
          'There\'s a temporary database issue',
          'Server maintenance is in progress',
          'An internal server error occurred'
        ];
      default:
        return [
          'An unexpected error occurred',
          'Please try again later',
          'Contact support if the issue persists'
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="p-6">
            {/* Icon */}
            <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 ${bgColor} rounded-full`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {message}
              </p>
              
              {userID && (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    <strong>User ID:</strong> {userID}
                  </p>
                </div>
              )}

              {/* Connection Status */}
              {connectionStatus === 'offline' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2 text-red-800 dark:text-red-200">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">You're currently offline</span>
                  </div>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200 text-center mb-2">
                  This could happen if:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 text-left">
                  {getTroubleshootingTips().map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
            <Button
                onClick={onTryAgain}
                variant="primary"
                className="w-full flex items-center justify-center"
                size="md"
                disabled={connectionStatus === 'offline' && modalType === ERROR_TYPES.NETWORK_ERROR}
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>{connectionStatus === 'offline' && modalType === ERROR_TYPES.NETWORK_ERROR ? 'Waiting for Connection' : 'Try Again'}</span>
            </Button>
            
            <Button
                onClick={onGoHome}
                variant="outline"
                className="w-full flex items-center justify-center"
                size="md"
            >
                <Home className="w-4 h-4 mr-2" />
                <span>Create New Roadmap</span>
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN WORKPLACE COMPONENT (ENHANCED) ---
const Workplace = ({ 
  roadmapData = null, 
  userID = null, 
  onCreateNewRoadmap,
  onRefreshData,
  isLoading = false,
  error = null,
  errorType = null,
  // Modal props from MainApp
  showInvalidUserModal = false,
  modalMessage = '',
  modalType = ERROR_TYPES.UNKNOWN_ERROR,
  onModalClose,
  onModalTryAgain,
  onModalGoHome,
  // Additional props
  connectionStatus = 'online',
  isPageRefresh = false
}) => {
  // Component state
  const [localRoadmapData, setLocalRoadmapData] = useState(roadmapData);
  const [updatingTasks, setUpdatingTasks] = useState(new Set());
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [selectedWeek, setSelectedWeek] = useState('all'); // 'all', or week number
  const [localError, setLocalError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [hideWarningPreference, setHideWarningPreference] = useState(false);

  // Initialize and update data
  useEffect(() => {
    if (roadmapData) {
      setLocalRoadmapData(roadmapData);
      setLastUpdated(new Date());
      setLocalError(null);
    }
  }, [roadmapData]);

  // Clear local error when main error changes
  useEffect(() => {
    if (!error) {
      setLocalError(null);
    }
  }, [error]);

  // Initialize "don't show again" preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('hideRoadmapWarning');
    if (savedPreference === 'true') {
      setHideWarningPreference(true);
    }
  }, []);

  // Handle task status toggle
  const handleToggleTaskStatus = async (task) => {
    if (!task || !task.id) return;
    
    // Check connection status
    if (connectionStatus === 'offline') {
      setLocalError('Cannot update tasks while offline. Please check your connection and try again.');
      return;
    }
    
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    setUpdatingTasks(prev => new Set(prev).add(task.id));
    setLocalError(null);

    try {
      await RoadmapService.updateTaskStatus(task.id, newStatus);
      
      // Update local state optimistically
      setLocalRoadmapData(prev => {
        if (!prev) return prev;
        
        const updatedTasks = prev.tasks.map(t => 
          t.id === task.id 
            ? { ...t, status: newStatus }
            : t
        );
        
        const completedCount = updatedTasks.filter(t => t.status === 'Completed').length;
        
        return {
          ...prev,
          tasks: updatedTasks,
          completedTasks: completedCount
        };
      });

      console.log(`✅ Task status changed to ${newStatus}:`, task.description);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      
      // Determine error type and show appropriate message
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setLocalError('Network error: Unable to update task. Please check your connection and try again.');
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        setLocalError('Server error: Unable to update task. Please try again later.');
      } else {
        setLocalError(`Failed to update task: ${error.message}`);
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setLocalError(null), 5000);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  // Handle resource dropdown toggle
  const toggleResourceDropdown = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    if (!localRoadmapData?.tasks) return [];

    let filteredTasks = [...localRoadmapData.tasks];

    // Filter by status
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        if (filterStatus === 'completed') return task.status === 'Completed';
        if (filterStatus === 'pending') return task.status !== 'Completed';
        return true;
      });
    }

    // Filter by week
    if (selectedWeek !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.week === parseInt(selectedWeek));
    }

    return filteredTasks;
  };

  // Get unique weeks for filter
  const getAvailableWeeks = () => {
    if (!localRoadmapData?.tasks) return [];
    return [...new Set(localRoadmapData.tasks.map(t => t.week))].sort((a, b) => a - b);
  };

  // Calculate progress statistics
  const getProgressStats = () => {
    if (!localRoadmapData?.tasks) {
      return { total: 0, completed: 0, pending: 0, percentage: 0 };
    }

    const total = localRoadmapData.tasks.length;
    const completed = localRoadmapData.tasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, percentage };
  };

  const stats = getProgressStats();
  const filteredTasks = getFilteredTasks();
  const availableWeeks = getAvailableWeeks();

  // Group filtered tasks by week
  const tasksByWeek = filteredTasks.reduce((acc, task) => {
    if (!acc[task.week]) {
      acc[task.week] = [];
    }
    acc[task.week].push(task);
    return acc;
  }, {});

  // Enhanced refresh handler
  const handleRefresh = async () => {
    setLocalError(null);
    if (connectionStatus === 'offline') {
      setLocalError('Cannot refresh while offline. Please check your connection and try again.');
      return;
    }
    
    if (onRefreshData) {
      try {
        await onRefreshData();
      } catch (error) {
        console.error('Failed to refresh from parent:', error);
        // Parent will handle the error display
      }
    }
  };

  // Check if should show warning modal
  const shouldShowWarning = () => {
    return localRoadmapData && !hideWarningPreference;
  };

  // Handle create new roadmap with warning check
  const handleCreateNewRoadmap = () => {
    if (shouldShowWarning()) {
      setShowWarningModal(true);
      return;
    }
    
    // Proceed directly if no warning needed
    if (onCreateNewRoadmap) {
      onCreateNewRoadmap();
    }
  };

  // Modal handlers
  const handleModalProceed = () => {
    setShowWarningModal(false);
    if (onCreateNewRoadmap) {
      onCreateNewRoadmap();
    }
  };

  const handleModalCancel = () => {
    setShowWarningModal(false);
  };

  const handleModalClose = () => {
    setShowWarningModal(false);
  };

  const handleDontShowAgain = (hide) => {
    setHideWarningPreference(hide);
    localStorage.setItem('hideRoadmapWarning', hide.toString());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-20">
            <LoadingSpinner size="xl" className="mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Your Roadmap
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch your learning path...
            </p>
            {connectionStatus === 'offline' && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">You're offline - this may take longer</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state without modal (fallback)
  if (error && !showInvalidUserModal && !localRoadmapData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-20">
            <StatusCard
              icon={AlertCircle}
              title="Unable to Load Roadmap"
              message={error}
              variant="error"
              className="max-w-md mx-auto mb-6"
            />
            <div className="space-x-4">
              <Button 
                onClick={handleRefresh} 
                disabled={isLoading || connectionStatus === 'offline'}
              >
                {isLoading ? 'Retrying...' : 'Try Again'}
              </Button>
              {onCreateNewRoadmap && (
                <Button variant="secondary" onClick={handleCreateNewRoadmap}>
                  Create New Roadmap
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!localRoadmapData && !showInvalidUserModal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Roadmap Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {userID 
                ? "We couldn't find a roadmap for this User ID. It may have been deleted or doesn't exist."
                : "You don't have a learning roadmap yet. Create one to get started!"
              }
            </p>
            {onCreateNewRoadmap && (
              <Button onClick={handleCreateNewRoadmap} size="lg">
                Create Your First Roadmap
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      {/* Add the Warning Modal */}
      <RoadmapWarningModal
        isOpen={showWarningModal}
        onClose={handleModalClose}
        onProceed={handleModalProceed}
        onCancel={handleModalCancel}
        onDontShowAgain={handleDontShowAgain}
      />

      {/* Enhanced Invalid User Modal */}
      <InvalidUserModal
        isOpen={showInvalidUserModal}
        onClose={onModalClose}
        onTryAgain={onModalTryAgain}
        onGoHome={onModalGoHome}
        message={modalMessage}
        userID={userID}
        modalType={modalType}
        connectionStatus={connectionStatus}
      />

      <div className="container mx-auto max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Target className="h-8 w-8 text-[#5c946d]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {localRoadmapData?.skill || 'Learning Roadmap'}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your personalized learning roadmap
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
            {connectionStatus === 'offline' && (
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                <WifiOff className="h-4 w-4" />
                <span>Offline</span>
              </div>
            )}
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
            *If the roadmap is not completely loaded, click the refresh button below
          </p>
        </div>

        {/* Local Error Display */}
        {localError && (
          <div className="mb-6">
            <StatusCard
              icon={AlertCircle}
              title="Update Error"
              message={localError}
              variant="error"
            />
          </div>
        )}

        {/* Show rest of component only if we have roadmap data */}
        {localRoadmapData && (
          <>
            {/* Progress Overview */}
            <div className="bg-[#e3eee6] dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Progress Overview</span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading || connectionStatus === 'offline'}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </div>
              
              {/* Progress Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{stats.pending}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{localRoadmapData.totalWeeks || availableWeeks.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Weeks</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.percentage}%
                  </span>
                </div>
                <ProgressBar current={stats.completed} total={stats.total} />
              </div>

              {/* Achievement Badge */}
              {stats.percentage === 100 && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
                    <Trophy className="h-5 w-5" />
                    <span className="font-medium">Congratulations! Roadmap Completed! 🎉</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-[#e3eee6] dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 bg-[#e3eee6] dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending Tasks</option>
                    <option value="completed">Completed Tasks</option>
                  </select>
                </div>

                {/* Week Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Week
                  </label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 bg-[#e3eee6] dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Weeks</option>
                    {availableWeeks.map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Weekly Tasks */}
            <div className="space-y-6">
              {Object.keys(tasksByWeek)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(week => {
                  const weekTasks = tasksByWeek[week];
                  const weekTheme = weekTasks[0]?.theme || 'Learning Phase';
                  const weekCompleted = weekTasks.filter(t => t.status === 'Completed').length;
                  const weekTotal = weekTasks.length;
                  const weekProgress = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;
                  
                  return (
                    <div key={week} className="bg-[#e3eee6] dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                      {/* Week Header */}
                      <div className="bg-[#5c946d] text-white p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-6 w-6" />
                            <div>
                              <h3 className="text-xl font-semibold">
                                Week {week}: {weekTheme}
                              </h3>
                              <p className="text-blue-100">
                                {weekCompleted} of {weekTotal} tasks completed
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#e6fff0]">{Math.round(weekProgress)}%</div>
                            <div className="text-sm text-blue-100">Complete</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <ProgressBar current={weekCompleted} total={weekTotal} />
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {weekTasks.map(task => {
                            const isCompleted = task.status === 'Completed';
                            const isUpdating = updatingTasks.has(task.id);
                            const isExpanded = expandedTasks.has(task.id);
                            const hasResources = task.link && task.link.trim();
                            
                            return (
                              <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4">
                                  <div className="flex items-start space-x-4">
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                      <CheckCircle 
                                        className={`h-6 w-6 transition-colors ${
                                          isCompleted ? 'text-green-500' : 'text-gray-400'
                                        }`} 
                                      />
                                    </div>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className={`text-sm font-medium transition-colors ${
                                            isCompleted 
                                              ? 'text-gray-500 dark:text-gray-400 line-through' 
                                              : 'text-gray-900 dark:text-white'
                                          }`}>
                                            {task.description}
                                          </p>
                                          
                                          {/* Resources Button */}
                                          {hasResources && (
                                            <button
                                              onClick={() => toggleResourceDropdown(task.id)}
                                              className="flex items-center space-x-2 mt-3 text-sm text-[#5c946d] hover:text-[#4b7f5b] dark:text-[#5c946d] dark:hover:text-[#76b089] transition-colors"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                              <span>Learning Resources</span>
                                              {isExpanded ? (
                                                <ChevronUp className="h-4 w-4" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4" />
                                              )}
                                            </button>
                                          )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex-shrink-0 ml-4">
                                          <Button
                                            size="sm"
                                            variant={isCompleted ? "outline" : "success"}
                                            onClick={() => handleToggleTaskStatus(task)}
                                            disabled={isUpdating || connectionStatus === 'offline'}
                                            className="min-w-max flex items-center space-x-2"
                                          >
                                            {isUpdating ? (
                                              <>
                                                <LoadingSpinner size="sm" />
                                                <span>Updating...</span>
                                              </>
                                            ) : connectionStatus === 'offline' ? (
                                              <>
                                                <WifiOff className="h-4 w-4" />
                                                <span>Offline</span>
                                              </>
                                            ) : (
                                              <>
                                                {isCompleted ? (
                                                  <>
                                                    <Pause className="h-4 w-4" />
                                                    <span>Mark Pending</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Play className="h-4 w-4" />
                                                    <span>Mark Complete</span>
                                                  </>
                                                )}
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Expandable Resources Section */}
                                {hasResources && isExpanded && (
                                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="p-4">
                                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Learning Resources</span>
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {task.link.split(',').map((link, index) => {
                                          const trimmedLink = link.trim();
                                          if (!trimmedLink) return null;
                                          
                                          // Extract domain name for display
                                          let displayName = trimmedLink;
                                          let domain = '';
                                          try {
                                            const url = new URL(trimmedLink);
                                            domain = url.hostname.replace('www.', '');
                                            displayName = url.pathname === '/' ? domain : `${domain}${url.pathname}`;
                                            if (displayName.length > 40) {
                                              displayName = displayName.substring(0, 40) + '...';
                                            }
                                          } catch (e) {
                                            if (displayName.length > 40) {
                                              displayName = displayName.substring(0, 40) + '...';
                                            }
                                          }
                                          
                                          return (
                                            <a
                                              key={index}
                                              href={trimmedLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center space-x-3 p-3 rounded-lg bg-[#e3eee6] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-[#5c946d] dark:hover:border-[#5c946d] hover:shadow-sm transition-all group"
                                            >
                                              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#5c946d] flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                  {displayName}
                                                </div>
                                                {domain && (
                                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {domain}
                                                  </div>
                                                )}
                                              </div>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* No Tasks Message */}
            {filteredTasks.length === 0 && (
              <div className="bg-[#e3eee6] dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  {filterStatus === 'all' && selectedWeek === 'all' ? (
                    <>
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Tasks Available
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your roadmap appears to be empty. Try refreshing the data or create a new roadmap.
                      </p>
                      <div className="space-x-4">
                        <Button 
                          onClick={handleRefresh}
                          disabled={connectionStatus === 'offline'}
                        >
                          Refresh Data
                        </Button>
                        {onCreateNewRoadmap && (
                          <Button variant="secondary" onClick={handleCreateNewRoadmap}>
                            Create New Roadmap
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Tasks Match Your Filters
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Try adjusting your filters to see more tasks.
                      </p>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setFilterStatus('all');
                          setSelectedWeek('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRefresh}
                disabled={isLoading || connectionStatus === 'offline'}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh Data'}</span>
              </Button>
              
              {onCreateNewRoadmap && (
                <Button onClick={handleCreateNewRoadmap} className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Create New Roadmap</span>
                </Button>
              )}
            </div>

            {/* Connection Status Notice */}
            {connectionStatus === 'offline' && (
              <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-orange-800 dark:text-orange-200">
                  <WifiOff className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">You're currently offline</h4>
                    <p className="text-sm mt-1">
                      Some features like task updates and data refresh are disabled until your connection is restored.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info (Development only) - Enhanced */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Debug Information
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div><strong>User ID:</strong> {userID || 'Not provided'}</div>
                  <div><strong>Loading State:</strong> {isLoading ? 'Loading' : 'Idle'}</div>
                  <div><strong>Connection:</strong> {connectionStatus}</div>
                  <div><strong>Total Tasks:</strong> {localRoadmapData?.tasks?.length || 0}</div>
                  <div><strong>Filtered Tasks:</strong> {filteredTasks.length}</div>
                  <div><strong>Active Filters:</strong> Status: {filterStatus}, Week: {selectedWeek}</div>
                  <div><strong>Last Updated:</strong> {lastUpdated.toISOString()}</div>
                  <div><strong>Show Modal:</strong> {showInvalidUserModal ? 'Yes' : 'No'}</div>
                  <div><strong>Modal Type:</strong> {modalType}</div>
                  <div><strong>Error Type:</strong> {errorType || 'None'}</div>
                  <div><strong>Local Error:</strong> {localError ? 'Yes' : 'No'}</div>
                  <div><strong>Page Refresh:</strong> {isPageRefresh ? 'Yes' : 'No'}</div>
                  <div><strong>Updating Tasks:</strong> {updatingTasks.size}</div>
                  <div><strong>Expanded Tasks:</strong> {expandedTasks.size}</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                Keep going! Every completed task brings you closer to mastering{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {localRoadmapData.skill}
                </span>
              </p>
              {connectionStatus === 'offline' && (
                <p className="mt-2 text-orange-600 dark:text-orange-400">
                  Remember to sync your progress when you're back online!
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Workplace;
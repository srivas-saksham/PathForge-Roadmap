import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Home from './02Home';
import Workplace from './03Workplace';
import Navbar from './00Navbar';
import RoadmapService from '../services/RoadmapService';

// --- UI COMPONENTS ---
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

// --- ROUTE COMPONENTS HASHMAP ---
// This hashmap defines all available routes and their corresponding components
const ROUTE_COMPONENTS = {
  'home': Home,
  'workplace': Workplace,
  // Future routes can be added here
  'dashboard': null, // Placeholder for future dashboard component
  'assignments': null, // Placeholder for assignments component
  'analytics': null, // Placeholder for analytics component
  'reports': null, // Placeholder for reports component
  'settings': null, // Placeholder for settings component
  'profile': null, // Placeholder for profile component
};

// Available tabs for navigation
const NAVIGATION_TABS = [
  { id: 'home', label: 'Home', description: 'Create new roadmaps' },
  { id: 'workplace', label: 'Workplace', description: 'Track your progress' },
  // Future tabs
  // { id: 'dashboard', label: 'Dashboard', description: 'Overview and insights' },
  // { id: 'analytics', label: 'Analytics', description: 'Learning analytics' },
];

// --- MAIN APP COMPONENT ---
const MainApp = () => {
  // === NAVIGATION STATE ===
  const [activeRoute, setActiveRoute] = useState('home');
  const [previousRoute, setPreviousRoute] = useState(null);

  // === USER SESSION STATE ===
  const [currentUserID, setCurrentUserID] = useState(null);
  const [currentFormData, setCurrentFormData] = useState(null);
  const [sessionStartTime] = useState(new Date());

  // === ROADMAP DATA STATE ===
  const [roadmapData, setRoadmapData] = useState(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState(null);

  // === APP STATE ===
  const [appState, setAppState] = useState('initializing'); // 'initializing', 'ready', 'error'
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());

  // === GENERATION STATE ===
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // === INITIALIZATION ===
  useEffect(() => {
    initializeApp();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  // === URL HASH MANAGEMENT ===
  useEffect(() => {
    // Read initial route from URL hash
    const hash = window.location.hash.slice(1); // Remove #
    if (hash && ROUTE_COMPONENTS[hash] !== undefined) {
      setActiveRoute(hash);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash && ROUTE_COMPONENTS[newHash] !== undefined) {
        handleRouteChange(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // === APP INITIALIZATION ===
  const initializeApp = async () => {
    console.log('🚀 Initializing MainApp...');
    
    try {
      // Check if there's existing session data in sessionStorage (fallback for navigation)
      const savedUserID = sessionStorage.getItem('currentUserID');
      const savedFormData = sessionStorage.getItem('currentFormData');
      
      if (savedUserID) {
        console.log('📱 Restored session:', savedUserID);
        setCurrentUserID(savedUserID);
        
        if (savedFormData) {
          try {
            const parsedFormData = JSON.parse(savedFormData);
            setCurrentFormData(parsedFormData);
            console.log('📋 Restored form data:', parsedFormData);
          } catch (e) {
            console.warn('⚠️ Failed to parse saved form data:', e);
          }
        }

        // Try to load existing roadmap data
        await loadRoadmapData(savedUserID, true); // Silent load
      }

      setAppState('ready');
      console.log('✅ MainApp initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      setAppState('error');
    }
  };

  // === EVENT LISTENERS ===
  const setupEventListeners = () => {
    // Online/offline detection
    const handleOnline = () => {
      setConnectionStatus('online');
      console.log('🌐 Connection restored');
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
      console.log('📡 Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial connection status
    setConnectionStatus(navigator.onLine ? 'online' : 'offline');
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
  };

  // === NAVIGATION METHODS ===
  const handleRouteChange = useCallback((newRoute) => {
    if (newRoute === activeRoute) return;
    
    console.log(`🧭 Navigating from ${activeRoute} to ${newRoute}`);
    setPreviousRoute(activeRoute);
    setActiveRoute(newRoute);
    
    // Update URL hash
    window.location.hash = newRoute;
    
    // Clear any route-specific errors
    if (roadmapError) {
      setRoadmapError(null);
    }
  }, [activeRoute, roadmapError]);

  const switchToHome = useCallback(() => {
    handleRouteChange('home');
  }, [handleRouteChange]);

  const switchToWorkplace = useCallback(() => {
    handleRouteChange('workplace');
  }, [handleRouteChange]);

  // === ROADMAP DATA MANAGEMENT ===
  const loadRoadmapData = async (userID, silent = false) => {
    if (!userID) {
      console.log('⚠️ No userID provided for roadmap loading');
      return;
    }

    if (!silent) {
      setIsRoadmapLoading(true);
      setRoadmapError(null);
    }

    try {
      console.log(`📊 Loading roadmap data for user: ${userID}`);
      const data = await RoadmapService.fetchRoadmapData(userID);
      
      if (data) {
        setRoadmapData(data);
        setLastDataRefresh(new Date());
        console.log('✅ Roadmap data loaded successfully:', data);
        
        if (!silent) {
          setIsRoadmapLoading(false);
        }
        return data;
      } else {
        console.log('📝 No roadmap data found');
        if (!silent) {
          setRoadmapError('No roadmap found. Please generate a new roadmap.');
          setIsRoadmapLoading(false);
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load roadmap data:', error);
      setRoadmapError(error.message);
      if (!silent) {
        setIsRoadmapLoading(false);
      }
      throw error;
    }
  };

  const refreshRoadmapData = async () => {
    if (!currentUserID) {
      console.log('⚠️ No current user to refresh data for');
      return;
    }

    try {
      await loadRoadmapData(currentUserID, false);
    } catch (error) {
      console.error('❌ Failed to refresh roadmap data:', error);
    }
  };

  // === ROADMAP GENERATION HANDLERS ===
  const handleRoadmapGenerated = useCallback((formData, generatedRoadmapData = null) => {
    console.log('🎯 Roadmap generation initiated:', formData);
    
    // Update session state
    setCurrentUserID(formData.userID);
    setCurrentFormData(formData);
    setIsGeneratingRoadmap(true);
    setRoadmapError(null);
    
    // Save to sessionStorage for navigation persistence
    sessionStorage.setItem('currentUserID', formData.userID);
    sessionStorage.setItem('currentFormData', JSON.stringify(formData));
    
    // If we already have the generated data, use it
    if (generatedRoadmapData) {
      console.log('📋 Using provided roadmap data');
      setRoadmapData(generatedRoadmapData);
      setIsGeneratingRoadmap(false);
      setLastDataRefresh(new Date());
    }
  }, []);

  const handleGenerationProgress = useCallback((progress) => {
    setGenerationProgress(progress);
  }, []);

  const handleGenerationComplete = useCallback((finalRoadmapData) => {
    console.log('🎉 Roadmap generation completed!', finalRoadmapData);
    setRoadmapData(finalRoadmapData);
    setIsGeneratingRoadmap(false);
    setGenerationProgress('');
    setLastDataRefresh(new Date());
  }, []);

  const handleGenerationError = useCallback((error) => {
    console.error('❌ Roadmap generation failed:', error);
    setRoadmapError(error);
    setIsGeneratingRoadmap(false);
    setGenerationProgress('');
  }, []);

  // === RESET METHODS ===
  const handleCreateNewRoadmap = useCallback(() => {
    console.log('🔄 Creating new roadmap - resetting state');
    
    // Clear all roadmap-related state
    setRoadmapData(null);
    setCurrentUserID(null);
    setCurrentFormData(null);
    setIsGeneratingRoadmap(false);
    setGenerationProgress('');
    setRoadmapError(null);
    setIsRoadmapLoading(false);
    
    // Clear session storage
    sessionStorage.removeItem('currentUserID');
    sessionStorage.removeItem('currentFormData');
    
    // Navigate to home
    switchToHome();
  }, [switchToHome]);

  const resetAppState = useCallback(() => {
    console.log('🔄 Resetting complete app state');
    handleCreateNewRoadmap();
    setAppState('ready');
  }, [handleCreateNewRoadmap]);

  // === COMPONENT RENDERING LOGIC ===
  const renderActiveComponent = () => {
    const ActiveComponent = ROUTE_COMPONENTS[activeRoute];
    
    // Handle unimplemented routes
    if (!ActiveComponent) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center py-20">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The {activeRoute} feature is currently under development.
              </p>
              <button
                onClick={switchToHome}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render Home component
    if (activeRoute === 'home') {
      return (
        <ActiveComponent
          onRoadmapGenerated={handleRoadmapGenerated}
          onSwitchToWorkplace={switchToWorkplace}
          existingFormData={currentFormData}
          isGenerating={isGeneratingRoadmap}
          onProgress={handleGenerationProgress}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
        />
      );
    }

    // Render Workplace component
    if (activeRoute === 'workplace') {
      return (
        <ActiveComponent
          roadmapData={roadmapData}
          userID={currentUserID}
          onCreateNewRoadmap={handleCreateNewRoadmap}
          onRefreshData={refreshRoadmapData}
          isLoading={isRoadmapLoading}
          error={roadmapError}
        />
      );
    }

    // Future components will be handled here
    return <ActiveComponent />;
  };

  // === ERROR BOUNDARIES ===
  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center py-20">
            <StatusCard
              icon={AlertCircle}
              title="Application Error"
              message="The application failed to initialize properly. Please refresh the page or try again later."
              variant="error"
              className="max-w-md mx-auto mb-6"
            />
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={resetAppState}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === LOADING STATE ===
  if (appState === 'initializing') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center py-20">
            <LoadingSpinner size="xl" className="mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Initializing Application
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we set up your learning environment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeRoute}
        onTabChange={handleRouteChange}
        tabs={NAVIGATION_TABS}
        userID={currentUserID}
        connectionStatus={connectionStatus}
        lastUpdate={lastDataRefresh}
        hasRoadmap={!!roadmapData}
        isGenerating={isGeneratingRoadmap}
        generationProgress={generationProgress}
      />

      {/* Connection Status Banner */}
      {connectionStatus === 'offline' && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-red-800 dark:text-red-200">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                You're offline. Some features may not work properly.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Generation Progress Banner */}
      {isGeneratingRoadmap && generationProgress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center space-x-3 text-blue-800 dark:text-blue-200">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium">{generationProgress}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative">
        {renderActiveComponent()}
      </main>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-sm">
          <div className="space-y-1">
            <div><strong>Route:</strong> {activeRoute}</div>
            <div><strong>User:</strong> {currentUserID ? currentUserID.substring(0, 15) + '...' : 'None'}</div>
            <div><strong>Has Roadmap:</strong> {roadmapData ? 'Yes' : 'No'}</div>
            <div><strong>Generating:</strong> {isGeneratingRoadmap ? 'Yes' : 'No'}</div>
            <div><strong>Connection:</strong> {connectionStatus}</div>
            <div><strong>App State:</strong> {appState}</div>
            <div><strong>Session:</strong> {Math.round((new Date() - sessionStartTime) / 1000)}s</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;
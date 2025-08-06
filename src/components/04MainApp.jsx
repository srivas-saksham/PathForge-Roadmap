import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Home from './02Home';
import Workplace from './03Workplace';
import Navbar from './00Navbar';
import Footer from './01Footer';
import RoadmapService from '../services/RoadmapService';
import UserSetupModal from './05UserSetupModal';
import SignInModal from './07SignInModal';
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
  'assignments': null,
  'analytics': null,
  'reports': null,
  'settings': null,
  'profile': null,
};

// Available tabs for navigation
const NAVIGATION_TABS = [
  { id: 'home', label: 'Home', description: 'Create new roadmaps' },
  { id: 'workplace', label: 'Workplace', description: 'Track your progress' },
  // Future tabs
  // { id: 'dashboard', label: 'Dashboard', description: 'Overview and insights' },
  // { id: 'analytics', label: 'Analytics', description: 'Learning analytics' },
];

// --- ERROR TYPES ---
const ERROR_TYPES = {
  USER_NOT_FOUND: 'user_not_found',
  NO_ROADMAP_DATA: 'no_roadmap_data',
  SERVER_ERROR: 'server_error',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
};

// --- MAIN APP COMPONENT ---
const MainApp = () => {
  // === NAVIGATION STATE ===
  const [activeRoute, setActiveRoute] = useState('home');
  const [previousRoute, setPreviousRoute] = useState(null);

  // === USER SESSION STATE ===
  const [currentUserID, setCurrentUserID] = useState(null);
  const [currentFormData, setCurrentFormData] = useState(null);
  const [sessionStartTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [showUserSetupModal, setShowUserSetupModal] = useState(false);

  // === ROADMAP DATA STATE ===
  const [roadmapData, setRoadmapData] = useState(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState(null);
  const [roadmapErrorType, setRoadmapErrorType] = useState(null);

  // === APP STATE ===
  const [appState, setAppState] = useState('ready'); // 'initializing', 'ready', 'error'
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());
  const [totalUsers, setTotalUsers] = useState(null);

  // === GENERATION STATE ===
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // === MODAL STATE ===
  const [pendingOverwriteData, setPendingOverwriteData] = useState(null);
  const [showInvalidUserModal, setShowInvalidUserModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(ERROR_TYPES.UNKNOWN_ERROR);

  // === SIGN IN MODAL ===
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [isInitialPageLoad, setIsInitialPageLoad] = useState(true);
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
    
    // Check if this is a page refresh/reload
    const isPageRefreshCheck = performance.navigation?.type === 1 || 
                              performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    try {
      // Set app as ready immediately - no loading state
      setAppState('ready');
      
      // Handle initial page load skeleton timing
      if (isPageRefreshCheck) {
        setIsInitialPageLoad(true);
        setTimeout(() => {
          setIsInitialPageLoad(false);
        }, 2000); // 2 seconds skeleton loading
      } else {
        // For fresh loads, show skeleton briefly
        setIsInitialPageLoad(true);
        setTimeout(() => {
          setIsInitialPageLoad(false);
        }, 1000); // Shorter delay for fresh loads
      }
      
      // Restore session data from sessionStorage
      const savedUserID = sessionStorage.getItem('currentUserID');
      const savedFormData = sessionStorage.getItem('currentFormData');
      const savedUserProfile = sessionStorage.getItem('userProfile');
      
      if (savedUserID) {
        console.log('🔄 Restoring user session:', savedUserID);
        setCurrentUserID(savedUserID);
        
        // Restore user profile if available
        if (savedUserProfile) {
          try {
            const profile = JSON.parse(savedUserProfile);
            setUserProfile(profile);
            setIsFirstTimeUser(!profile.username || profile.username === 'New User');
            console.log('👤 Restored user profile:', profile);
          } catch (e) {
            console.warn('⚠️ Failed to parse saved user profile:', e);
            sessionStorage.removeItem('userProfile');
            // Fallback: check user profile from server
            await checkUserProfile(savedUserID);
          }
        } else {
          // No saved profile - check from server
          await checkUserProfile(savedUserID);
        }
        
        if (savedFormData) {
          try {
            const parsedFormData = JSON.parse(savedFormData);
            setCurrentFormData(parsedFormData);
            console.log('📋 Restored form data:', parsedFormData);
          } catch (e) {
            console.warn('⚠️ Failed to parse saved form data:', e);
            sessionStorage.removeItem('currentFormData');
          }
        }

        // If we're on workplace route, load roadmap data
        const currentRoute = window.location.hash.slice(1) || 'home';
        if (currentRoute === 'workplace') {
          try {
            await loadRoadmapData(savedUserID, false);
          } catch (error) {
            console.warn('⚠️ Failed to load roadmap data during initialization:', error);
            // Don't throw - let the workplace component handle the error
          }
        }
      } else {
        // No saved user - definitely first time user
        console.log('👤 No saved user - setting as first time user');
        setIsFirstTimeUser(true);
        setUserProfile(null);
      }
      
      // Fetch total users count
      try {
        const usersCount = await RoadmapService.getTotalUsersCount();
        setTotalUsers(usersCount);
      } catch (error) {
        console.warn('⚠️ Failed to fetch users count:', error);
        setTotalUsers(21); // Fallback value
      }

      console.log('✅ MainApp initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      setAppState('error');
      setIsInitialPageLoad(false);
    }
  };

  // === EVENT LISTENERS ===
  const setupEventListeners = () => {
    // Online/offline detection
    const handleOnline = () => {
      setConnectionStatus('online');
      console.log('🌐 Connection restored');
      
      // Auto-refresh data if we have a current user and we're on workplace
      if (currentUserID && activeRoute === 'workplace') {
        loadRoadmapData(currentUserID, true);
      }
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

  // === ERROR ANALYSIS ===
  const analyzeError = (error) => {
    const errorMessage = error.message.toLowerCase();
    const errorCode = error.code;
    
    console.log('🔍 Analyzing error:', { message: errorMessage, code: errorCode, error });
    
    // Check for specific error codes first
    if (errorCode === 404 || errorCode === 'USER_NOT_FOUND') {
      return {
        type: ERROR_TYPES.USER_NOT_FOUND,
        message: 'User ID not found in the database. The roadmap may have been deleted or the User ID is invalid.'
      };
    }
    
    if (errorCode === 'NO_DATA' || errorCode === 'EMPTY_ROADMAP') {
      return {
        type: ERROR_TYPES.NO_ROADMAP_DATA,
        message: 'User found but no roadmap data exists. The roadmap may be empty or corrupted.'
      };
    }
    
    // Check error message content
    if (errorMessage.includes('user not found') || 
        errorMessage.includes('invalid user') || 
        errorMessage.includes('404') ||
        errorMessage.includes('not found')) {
      return {
        type: ERROR_TYPES.USER_NOT_FOUND,
        message: 'User ID not found in the database. Please check your User ID or create a new roadmap.'
      };
    }
    
    if (errorMessage.includes('no data') || 
        errorMessage.includes('empty') ||
        errorMessage.includes('no roadmap') ||
        errorMessage.includes('no tasks')) {
      return {
        type: ERROR_TYPES.NO_ROADMAP_DATA,
        message: 'User found but no roadmap data exists. Please create a new roadmap.'
      };
    }
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('fetch')) {
      return {
        type: ERROR_TYPES.NETWORK_ERROR,
        message: 'Unable to connect to the server. Please check your internet connection and try again.'
      };
    }
    
    if (errorMessage.includes('server') ||
        errorMessage.includes('500') ||
        errorMessage.includes('503') ||
        errorMessage.includes('502')) {
      return {
        type: ERROR_TYPES.SERVER_ERROR,
        message: 'Server error occurred. Please try again later.'
      };
    }
    
    // Default to unknown error
    return {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: `Failed to load roadmap data: ${error.message}`
    };
  };

  // === NAVIGATION METHODS ===
  const handleRouteChange = useCallback((newRoute) => {
    if (newRoute === activeRoute) return;
    
    console.log(`🧭 Navigating from ${activeRoute} to ${newRoute}`);
    setPreviousRoute(activeRoute);
    setActiveRoute(newRoute);
    
    // Update URL hash
    window.location.hash = newRoute;
    
    // Clear any route-specific errors when changing routes
    if (roadmapError) {
      setRoadmapError(null);
      setRoadmapErrorType(null);
    }
    
    // Close any open modals
    if (showInvalidUserModal) {
      setShowInvalidUserModal(false);
    }
    
    // Auto-load data when switching to workplace
    if (newRoute === 'workplace' && currentUserID && !roadmapData && !isRoadmapLoading) {
      loadRoadmapData(currentUserID, false);
    }
  }, [activeRoute, roadmapError, showInvalidUserModal, currentUserID, roadmapData, isRoadmapLoading]);

  const switchToHome = useCallback(() => {
    handleRouteChange('home');
  }, [handleRouteChange]);

  const switchToWorkplace = useCallback(() => {
    handleRouteChange('workplace');
  }, [handleRouteChange]);

  // === ROADMAP DATA MANAGEMENT (ENHANCED) ===
  const loadRoadmapData = async (userID, silent = false) => {
    if (!userID) {
      console.log('⚠️ No userID provided for roadmap loading');
      const errorInfo = {
        type: ERROR_TYPES.NO_ROADMAP_DATA,
        message: 'No User ID provided. Please create a new roadmap.'
      };
      
      setRoadmapErrorType(errorInfo.type);
      setModalMessage(errorInfo.message);
      setModalType(errorInfo.type);
      
      if (!silent) {
        setShowInvalidUserModal(true);
      }
      return;
    }

    if (!silent) {
      setIsRoadmapLoading(true);
      setRoadmapError(null);
      setRoadmapErrorType(null);
      setShowInvalidUserModal(false);
    }

    try {
      console.log(`📊 Loading roadmap data for user: ${userID}`);
      const data = await RoadmapService.fetchRoadmapData(userID);
      
      if (data && data.tasks && data.tasks.length > 0) {
        // Successfully found valid roadmap data
        console.log('✅ Roadmap data loaded successfully:', data);
        setRoadmapData(data);
        setLastDataRefresh(new Date());
        setRoadmapError(null);
        setRoadmapErrorType(null);
        setShowInvalidUserModal(false);
        
        if (!silent) {
          setIsRoadmapLoading(false);
        }
        return data;
      } else if (data && (!data.tasks || data.tasks.length === 0)) {
        // User exists but has no roadmap tasks
        console.log('📝 User found but no roadmap tasks available');
        const errorInfo = {
          type: ERROR_TYPES.NO_ROADMAP_DATA,
          message: 'User found but no roadmap data exists. The roadmap may be empty or corrupted.'
        };
        
        setRoadmapErrorType(errorInfo.type);
        setModalMessage(errorInfo.message);
        setModalType(errorInfo.type);
        setShowInvalidUserModal(true);
        
        if (!silent) {
          setIsRoadmapLoading(false);
        }
        return null;
      } else {
        // No data returned at all - likely user not found
        console.log('❌ No roadmap data found for user');
        const errorInfo = {
          type: ERROR_TYPES.USER_NOT_FOUND,
          message: 'User ID not found in the database. The roadmap may have been deleted or the User ID is invalid.'
        };
        
        setRoadmapErrorType(errorInfo.type);
        setModalMessage(errorInfo.message);
        setModalType(errorInfo.type);
        setShowInvalidUserModal(true);
        
        if (!silent) {
          setIsRoadmapLoading(false);
        }
        return null;
      }
    } catch (err) {
      console.error('❌ Failed to fetch roadmap data:', err);
      
      // Analyze the error to determine the type
      const errorInfo = analyzeError(err);
      
      setRoadmapError(errorInfo.message);
      setRoadmapErrorType(errorInfo.type);
      setModalMessage(errorInfo.message);
      setModalType(errorInfo.type);
      setShowInvalidUserModal(true);
      
      if (!silent) {
        setIsRoadmapLoading(false);
      }
      
      throw err;
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
      // Error handling is done in loadRoadmapData
    }
  };

  // === MODAL HANDLERS (ENHANCED) ===
  const handleModalClose = useCallback(() => {
    setShowInvalidUserModal(false);
  }, []);

  const handleModalTryAgain = useCallback(async () => {
    setShowInvalidUserModal(false);
    setRoadmapError(null);
    setRoadmapErrorType(null);
    
    if (currentUserID) {
      await loadRoadmapData(currentUserID, false);
    }
  }, [currentUserID]);

  const handleModalGoHome = useCallback(() => {
    setShowInvalidUserModal(false);
    handleCreateNewRoadmap();
  }, []);

  // === ROADMAP GENERATION HANDLERS ===
  const handleRoadmapGenerated = useCallback(async (formData, generatedRoadmapData = null) => {
    console.log('🎯 Roadmap generation initiated:', formData);
    
    // Clear any pending overwrite data
    setPendingOverwriteData(null);
    setShowInvalidUserModal(false);
    
    // Update session state
    setCurrentUserID(formData.userID);
    setCurrentFormData(formData);
    setIsGeneratingRoadmap(true);
    setRoadmapError(null);
    setRoadmapErrorType(null);
    
    // Check user profile status
    await checkUserProfile(formData.userID);
    
    // Save to sessionStorage for navigation persistence
    sessionStorage.setItem('currentUserID', formData.userID);
    sessionStorage.setItem('currentFormData', JSON.stringify(formData));
    
    // If we already have the generated data, use it
    if (generatedRoadmapData) {
      console.log('📋 Using provided roadmap data');
      setRoadmapData(generatedRoadmapData);
      setIsGeneratingRoadmap(false);
      setLastDataRefresh(new Date());
      
      // Check if this is a first-time user and show username setup modal
      if (isFirstTimeUser) {
        console.log('🎯 First-time user detected - showing username setup modal');
        setShowUserSetupModal(true);
      }
    }
  }, []);

  const handleGenerationProgress = useCallback((progress) => {
    setGenerationProgress(progress);
  }, []);

  const handleGenerationComplete = useCallback(async (finalRoadmapData) => {
    console.log('🎉 Roadmap generation completed!', finalRoadmapData);
    setRoadmapData(finalRoadmapData);
    setIsGeneratingRoadmap(false);
    setGenerationProgress('');
    setLastDataRefresh(new Date());
    setRoadmapError(null);
    setRoadmapErrorType(null);
    setShowInvalidUserModal(false);
    
    // Check if this is a first-time user and show username setup modal
    if (currentUserID && isFirstTimeUser) {
      console.log('🎯 First-time user detected - showing username setup modal');
      setShowUserSetupModal(true);
    }
  }, [currentUserID, isFirstTimeUser]);

  const handleGenerationError = useCallback((error) => {
    console.error('❌ Roadmap generation failed:', error);
    const errorInfo = analyzeError(error);
    
    setRoadmapError(errorInfo.message);
    setRoadmapErrorType(errorInfo.type);
    setIsGeneratingRoadmap(false);
    setGenerationProgress('');
    
    // Show modal for generation errors
    setModalMessage(errorInfo.message);
    setModalType(errorInfo.type);
    setShowInvalidUserModal(true);
  }, []);

  // === MODAL OVERWRITE HANDLERS ===
  const handleModalProceed = useCallback(() => {
    console.log('✅ User confirmed roadmap overwrite');
    
    if (pendingOverwriteData) {
      // Clear existing roadmap data before proceeding
      setRoadmapData(null);
      setRoadmapError(null);
      setRoadmapErrorType(null);
      setShowInvalidUserModal(false);
      
      // Proceed with the new roadmap generation
      handleRoadmapGenerated(pendingOverwriteData);
      
      // Clear pending data
      setPendingOverwriteData(null);
    }
  }, [pendingOverwriteData, handleRoadmapGenerated]);

  const handleModalCancel = useCallback(() => {
    console.log('❌ User cancelled roadmap overwrite');
    
    // Clear pending data and stay on current state
    setPendingOverwriteData(null);
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
    setRoadmapErrorType(null);
    setIsRoadmapLoading(false);
    setPendingOverwriteData(null);
    setShowInvalidUserModal(false);
    
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

  // === FORCE RESET FIRST TIME USER ===
  const forceResetToFirstTimeUser = useCallback(() => {
    console.log('🔄 Force resetting to first time user');
    
    // Clear all user-related state
    setIsFirstTimeUser(true);
    setUserProfile(null);
    setShowUserSetupModal(false);
    
    // Clear storage
    sessionStorage.removeItem('currentUserID');
    sessionStorage.removeItem('currentFormData');
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('isFirstTimeUser');
    
    localStorage.removeItem('currentUserID');
    localStorage.removeItem('currentFormData');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isFirstTimeUser');
    
    // Clear roadmap data
    setRoadmapData(null);
    setCurrentUserID(null);
    setCurrentFormData(null);
    setIsGeneratingRoadmap(false);
    setGenerationProgress('');
    setRoadmapError(null);
    setRoadmapErrorType(null);
    setIsRoadmapLoading(false);
    setPendingOverwriteData(null);
    setShowInvalidUserModal(false);
    
    console.log('✅ Reset to first time user completed');
    
    // Navigate to home
    switchToHome();
  }, [switchToHome]);

  // === UTILITY METHODS ===
  const hasExistingRoadmap = useCallback(() => {
    return !!roadmapData && !isGeneratingRoadmap;
  }, [roadmapData, isGeneratingRoadmap]);

  const shouldShowWorkplaceData = useCallback(() => {
    return roadmapData && !isGeneratingRoadmap;
  }, [roadmapData, isGeneratingRoadmap]);

  // === USERNAME MANAGEMENT ===
  const checkUserProfile = async (userID) => {
    try {
      console.log('👤 Checking user profile for:', userID);
      
      // Always start by assuming first time user
      setIsFirstTimeUser(true);
      setUserProfile(null);
      
      const profile = await RoadmapService.fetchUserProfile(userID);
      
      if (profile && profile.username && profile.username.trim() !== '' && profile.username !== 'New User') {
        console.log('✅ Existing user profile found:', profile);
        setUserProfile(profile);
        setIsFirstTimeUser(false);
        return profile;
      } else if (profile && (profile.username === 'New User' || !profile.username)) {
        console.log('👤 User found but with "New User" placeholder - treating as first time user');
        setUserProfile(profile);
        setIsFirstTimeUser(true);
        return profile;
      } else {
        console.log('👤 No user profile found - confirmed first time user');
        setIsFirstTimeUser(true);
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to check user profile:', error);
      // Always default to first time user on error
      console.log('👤 Error checking profile - defaulting to first time user');
      setIsFirstTimeUser(true);
      setUserProfile(null);
      return null;
    }
  };

  const handleUsernameSetup = async (username) => {
    try {
      console.log('👤 Setting up username:', username);
      
      if (!currentUserID) {
        throw new Error('No current user ID available');
      }

      // ✅ UPDATE EXISTING "New User" RECORD INSTEAD OF CREATING NEW ONE
      const updatedRecord = await RoadmapService.updateNewUserToActualName(currentUserID, username);
      
      // Update local state
      const newProfile = {
        recordId: updatedRecord.id,
        userID: currentUserID,
        username: username,
      };
      
      setUserProfile(newProfile);
      setIsFirstTimeUser(false);
      setShowUserSetupModal(false);
      
      console.log('✅ Username setup completed:', newProfile);
      return newProfile;
      
    } catch (error) {
      console.error('❌ Failed to setup username:', error);
      throw new Error(`Failed to save username: ${error.message}`);
    }
  };

  const handleUsernameUpdate = async (newUsername) => {
    try {
      console.log('✏️ Updating username to:', newUsername);
      
      if (!currentUserID) {
        throw new Error('No current user ID available');
      }

      // Update username in Airtable
      const updatedRecord = await RoadmapService.updateUsername(currentUserID, newUsername);
      
      // Update local state
      const updatedProfile = {
        ...userProfile,
        username: newUsername,
      };
      
      setUserProfile(updatedProfile);
      
      console.log('✅ Username updated successfully:', updatedProfile);
      return updatedProfile;
      
    } catch (error) {
      console.error('❌ Failed to update username:', error);
      throw new Error(`Failed to update username: ${error.message}`);
    }
  };

  const handleClearSession = useCallback(() => {
    console.log('🔄 Clearing complete session data - LOGOUT');
    console.log('📝 handleClearSession called');
    
    try {
      // Clear ALL localStorage items (not just pathforge ones)
      localStorage.clear();
      console.log('🗑️ localStorage cleared');
      
      // Clear session storage
      sessionStorage.removeItem('currentUserID');
      sessionStorage.removeItem('currentFormData');
      sessionStorage.removeItem('userProfile');
      console.log('🗑️ Session data cleared');
      
      // Reset all React states to initial values
      setActiveRoute('home');
      setPreviousRoute(null);
      setCurrentUserID(null);
      setCurrentFormData(null);
      setUserProfile(null);
      setIsFirstTimeUser(true);
      setShowUserSetupModal(false);
      setRoadmapData(null);
      setIsRoadmapLoading(false);
      setRoadmapError(null);
      setRoadmapErrorType(null);
      setAppState('ready');
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
      setLastDataRefresh(new Date());
      setIsGeneratingRoadmap(false);
      setGenerationProgress('');
      setPendingOverwriteData(null);
      setShowInvalidUserModal(false);
      setModalMessage('');
      setModalType(ERROR_TYPES.UNKNOWN_ERROR);
      
      // Clear URL hash
      window.location.hash = 'home';
      
      console.log('✅ Session cleared successfully - user logged out');
      
      // Force a small delay to ensure all state updates are processed
      setTimeout(() => {
        console.log('🔄 Post-logout state verification complete');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error during session clear:', error);
    }
  }, []);

  const handleSignIn = async (inputUserID) => {
    setIsSigningIn(true);
    setRoadmapError(null);
    setRoadmapErrorType(null);
    
    try {
      console.log('🔑 Attempting to sign in with User ID:', inputUserID);
      
      // Step 1: Check if user exists
      const userProfile = await RoadmapService.fetchUserProfile(inputUserID);
      
      if (!userProfile) {
        throw new Error('User ID not found. Please check your User ID and try again.');
      }
      
      console.log('✅ User profile found:', userProfile);
      
      // Step 2: Update user session state
      setCurrentUserID(inputUserID);
      setUserProfile(userProfile);
      setIsFirstTimeUser(!userProfile.username || userProfile.username === 'New User');
      
      // Save to sessionStorage
      sessionStorage.setItem('currentUserID', inputUserID);
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Step 3: Try to fetch roadmap data
      try {
        const roadmapData = await RoadmapService.fetchRoadmapData(inputUserID);
        
        if (roadmapData && roadmapData.tasks && roadmapData.tasks.length > 0) {
          console.log('📊 Roadmap data found, switching to workplace');
          setRoadmapData(roadmapData);
          setLastDataRefresh(new Date());
          handleRouteChange('workplace');
        } else {
          console.log('📝 No roadmap data found, staying on home');
          handleRouteChange('home');
        }
      } catch (roadmapError) {
        console.log('📝 No roadmap found for user, staying on home');
        handleRouteChange('home');
        // Don't throw here - user exists but just doesn't have a roadmap yet
      }
      
      console.log('✅ User signed in successfully');
      setShowSignInModal(false);
      
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      throw error; // Re-throw for modal to handle
    } finally {
      setIsSigningIn(false);
    }
  };

  // === PAGE REFRESH DETECTION ===
  const checkIfPageRefresh = () => {
    return performance.navigation && performance.navigation.type === 1;
  };

  // === COMPONENT RENDERING LOGIC ===
  const renderActiveComponent = () => {
    const ActiveComponent = ROUTE_COMPONENTS[activeRoute];
    
    // Handle unimplemented routes
    if (!ActiveComponent) {
      return (
        <div className="py-12 px-4">
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
          isGenerating={isGeneratingRoadmap}
          onProgress={handleGenerationProgress}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
          hasExistingRoadmap={hasExistingRoadmap()}
          currentUserID={currentUserID}
          roadmapData={roadmapData}
          onModalProceed={handleModalProceed}
          onModalCancel={handleModalCancel}
          roadmapError={roadmapError}
          roadmapErrorType={roadmapErrorType}
          // Add this new prop
          isInitialPageLoad={isInitialPageLoad}
        />
      );
    }

    // Render Workplace component with enhanced props
    if (activeRoute === 'workplace') {
      return (
        <ActiveComponent
          roadmapData={shouldShowWorkplaceData() ? roadmapData : null}
          userID={currentUserID}
          onCreateNewRoadmap={handleCreateNewRoadmap}
          onRefreshData={refreshRoadmapData}
          isLoading={isRoadmapLoading}
          error={roadmapError}
          errorType={roadmapErrorType}
          // Modal state and handlers
          showInvalidUserModal={showInvalidUserModal}
          modalMessage={modalMessage}
          modalType={modalType}
          onModalClose={handleModalClose}
          onModalTryAgain={handleModalTryAgain}
          onModalGoHome={handleModalGoHome}
          // Connection status
          connectionStatus={connectionStatus}
          // Page refresh detection
          isPageRefresh={checkIfPageRefresh()}
          isInitialPageLoad={isInitialPageLoad}
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 inline-flex"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Page</span>
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
  // if (appState === 'initializing') {
  //   return (
  //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
  //       <div className="container mx-auto max-w-2xl">
  //         <div className="text-center py-20">
  //           <LoadingSpinner size="xl" className="mx-auto mb-4 text-blue-600" />
  //           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
  //             Initializing Application
  //           </h2>
  //           <p className="text-gray-600 dark:text-gray-400">
  //             Please wait while we set up your learning environment...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // === MAIN RENDER WITH PROPER LAYOUT ===
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeRoute}
        onTabChange={handleRouteChange}
        isInitialPageLoad={isInitialPageLoad}
        tabs={NAVIGATION_TABS}
        userID={currentUserID}
        username={userProfile?.username}
        onUsernameUpdate={handleUsernameUpdate}
        onClearSession={handleClearSession}
        connectionStatus={connectionStatus}
        lastUpdate={lastDataRefresh}
        hasRoadmap={!!roadmapData}
        isGenerating={isGeneratingRoadmap}
        generationProgress={generationProgress}
        // Sign-in related props
        showSignInModal={showSignInModal}
        onShowSignInModal={() => setShowSignInModal(true)}
        onSignIn={handleSignIn}
        isSigningIn={isSigningIn}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col overflow-hidden">
        {/* Connection Status Banner */}
        {connectionStatus === 'offline' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex-shrink-0">
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex-shrink-0">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-center space-x-3 text-blue-800 dark:text-blue-200">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium">{generationProgress}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner (for non-modal errors) */}
        {roadmapError && !showInvalidUserModal && activeRoute === 'workplace' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex-shrink-0">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{roadmapError}</span>
                </div>
                <button
                  onClick={handleModalTryAgain}
                  className="text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 text-sm font-medium flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveComponent()}
        </main>

        {/* Footer */}
        <Footer 
          onNavigate={handleRouteChange}
          currentRoute={activeRoute}
          totalRoadmaps={totalUsers}
          userEmail={currentFormData?.email}
          showStats={true}
          className="mt-auto"
        />

        {/* User Setup Modal */}
        {showUserSetupModal && (
          <UserSetupModal
            isOpen={showUserSetupModal}
            userID={currentUserID}
            onSave={handleUsernameSetup}
            onSkip={() => setShowUserSetupModal(false)}
            onClose={() => setShowUserSetupModal(false)}
          />
        )}

        {/* Sign In Modal*/}
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSignIn={handleSignIn}
          isLoading={isSigningIn}
        />

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-sm z-50">
            <div className="space-y-1">
              <div><strong>Route:</strong> {activeRoute}</div>
              <div><strong>User:</strong> {currentUserID ? currentUserID.substring(0, 15) + '...' : 'None'}</div>
              <div><strong>Has Roadmap:</strong> {roadmapData ? 'Yes' : 'No'}</div>
              <div><strong>Generating:</strong> {isGeneratingRoadmap ? 'Yes' : 'No'}</div>
              <div><strong>Connection:</strong> {connectionStatus}</div>
              <div><strong>App State:</strong> {appState}</div>
              <div><strong>Initial Load:</strong> {isInitialPageLoad ? 'Yes' : 'No'}</div>
              <div><strong>Session:</strong> {Math.round((new Date() - sessionStartTime) / 1000)}s</div>
              <div><strong>Error Type:</strong> {roadmapErrorType || 'None'}</div>
              <div><strong>Modal Open:</strong> {showInvalidUserModal ? 'Yes' : 'No'}</div>
              <div><strong>Modal Type:</strong> {modalType}</div>
              <div><strong>Pending Overwrite:</strong> {pendingOverwriteData ? 'Yes' : 'No'}</div>
              <div><strong>Page Refresh:</strong> {checkIfPageRefresh() ? 'Yes' : 'No'}</div>
              <div><strong>User Profile:</strong> {userProfile?.username || 'None'}</div>
              <div><strong>First Time:</strong> {isFirstTimeUser ? 'Yes' : 'No'}</div>
              <div><strong>Setup Modal:</strong> {showUserSetupModal ? 'Yes' : 'No'}</div>

              {/* Debug Reset Button */}
              <button
                onClick={forceResetToFirstTimeUser}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded w-full"
              >
                🔄 Reset to First Time User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;
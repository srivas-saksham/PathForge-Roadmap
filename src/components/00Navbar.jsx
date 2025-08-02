import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Briefcase, 
  BarChart3, 
  FileText, 
  Settings, 
  User, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// --- ICON MAPPING FOR ROUTES ---
const ROUTE_ICONS = {
  'home': Home,
  'workplace': Briefcase,
  'dashboard': BarChart3,
  'assignments': FileText,
  'analytics': BarChart3,
  'reports': FileText,
  'settings': Settings,
  'profile': User,
};

// --- TOOLTIP COMPONENT ---
const Tooltip = ({ children, content, isVisible }) => {
  if (!isVisible) return children;

  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
        {content}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
      </div>
    </div>
  );
};

// --- STATUS INDICATOR COMPONENT ---
const StatusIndicator = ({ 
  connectionStatus, 
  isGenerating, 
  generationProgress, 
  hasRoadmap, 
  lastUpdate,
  isExpanded 
}) => {
  if (!isExpanded) return null;

  const getStatusColor = () => {
    if (connectionStatus === 'offline') return 'text-red-400';
    if (isGenerating) return 'text-blue-400';
    if (hasRoadmap) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (connectionStatus === 'offline') return WifiOff;
    if (isGenerating) return RefreshCw;
    if (hasRoadmap) return CheckCircle;
    return Clock;
  };

  const getStatusText = () => {
    if (connectionStatus === 'offline') return 'Offline';
    if (isGenerating) return generationProgress || 'Generating...';
    if (hasRoadmap) return 'Roadmap Ready';
    return 'No Roadmap';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="px-3 py-2 border-t border-gray-800">
      <div className="flex items-center space-x-2 text-xs">
        <StatusIcon 
          className={`h-3 w-3 ${getStatusColor()} ${isGenerating ? 'animate-spin' : ''}`} 
        />
        <span className={`${getStatusColor()} truncate flex-1`}>
          {getStatusText()}
        </span>
      </div>
      {lastUpdate && hasRoadmap && !isGenerating && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

// --- PROFILE DROPDOWN COMPONENT ---
const ProfileDropdown = ({ isOpen, onClose, isExpanded, userID }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate user initials from userID
  const getUserInitials = () => {
    if (!userID) return 'AI';
    // Extract readable part from userID (remove timestamps/random)
    const parts = userID.split('_');
    return parts[0] ? parts[0].substring(0, 2).toUpperCase() : 'AI';
  };

  const getDisplayName = () => {
    if (!userID) return 'AI User';
    return `User ${userID.split('_')[1] || 'Anonymous'}`;
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${isExpanded ? 'left-0 right-0' : 'left-full ml-2'} bottom-full mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50 min-w-48`}
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">{getUserInitials()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium text-sm truncate">{getDisplayName()}</p>
            <p className="text-gray-400 text-xs truncate">
              {userID ? `ID: ${userID.substring(0, 12)}...` : 'Guest User'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <User className="h-4 w-4 flex-shrink-0" />
          <span>Profile Settings</span>
        </button>
        <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Preferences</span>
        </button>
        <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          <span>Help & Support</span>
        </button>
        <hr className="my-1 border-gray-700" />
        <button className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors duration-150 flex items-center space-x-3">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Clear Session</span>
        </button>
      </div>
    </div>
  );
};

// --- MAIN NAVBAR COMPONENT ---
const Navbar = ({ 
  activeTab = 'home',
  onTabChange,
  tabs = [],
  userID = null,
  connectionStatus = 'online',
  lastUpdate = null,
  hasRoadmap = false,
  isGenerating = false,
  generationProgress = ''
}) => {
  // Component state
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Handle tab navigation
  const handleTabClick = (tabId) => {
    if (onTabChange && typeof onTabChange === 'function') {
      onTabChange(tabId);
    }
    // Close profile dropdown when navigating
    setIsProfileDropdownOpen(false);
  };

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setIsProfileDropdownOpen(false);
  };

  // Handle profile dropdown
  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userID) return 'AI';
    const parts = userID.split('_');
    return parts[0] ? parts[0].substring(0, 2).toUpperCase() : 'AI';
  };

  // Get display name
  const getDisplayName = () => {
    if (!userID) return 'AI Assistant';
    return `Learning Session`;
  };

  // Get user role/status
  const getUserRole = () => {
    if (isGenerating) return 'Generating...';
    if (hasRoadmap) return 'Active Learner';
    return 'Getting Started';
  };

  return (
    <div
      className={`fixed left-0 top-0 z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      } bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col h-screen`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-lg truncate">Roadmap AI</h1>
                <p className="text-gray-400 text-xs truncate">Learning Platform</p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-3">
          {tabs.map((tab) => {
            const IconComponent = ROUTE_ICONS[tab.id] || FileText;
            const isActive = activeTab === tab.id;
            
            return (
              <Tooltip key={tab.id} content={`${tab.label} - ${tab.description || ''}`} isVisible={!isExpanded}>
                <button
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={!isExpanded ? `${tab.label} - ${tab.description || ''}` : undefined}
                >
                  <IconComponent 
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} 
                  />
                  {isExpanded && (
                    <div className="min-w-0 flex-1">
                      <span className="font-medium truncate block">{tab.label}</span>
                      {tab.description && (
                        <span className="text-xs opacity-75 truncate block">
                          {tab.description}
                        </span>
                      )}
                    </div>
                  )}
                  {isActive && isExpanded && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Coming Soon Items (if expanded) */}
        {isExpanded && tabs.length < 6 && (
          <div className="mt-6 px-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
              Coming Soon
            </div>
            <div className="space-y-1">
              {['dashboard', 'analytics', 'reports'].filter(id => !tabs.find(t => t.id === id)).map((id) => {
                const IconComponent = ROUTE_ICONS[id];
                const labels = {
                  dashboard: 'Dashboard',
                  analytics: 'Analytics', 
                  reports: 'Reports'
                };
                
                return (
                  <div
                    key={id}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-500 cursor-not-allowed"
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate">{labels[id]}</span>
                    <div className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded">Soon</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Status Section */}
      <StatusIndicator
        connectionStatus={connectionStatus}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        hasRoadmap={hasRoadmap}
        lastUpdate={lastUpdate}
        isExpanded={isExpanded}
      />

      {/* Bottom Section - User Profile */}
      <div className="border-t border-gray-800 p-3 relative">
        {/* Profile Button */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white group ${
              isProfileDropdownOpen ? 'bg-gray-800 text-white' : ''
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{getUserInitials()}</span>
            </div>
            {isExpanded && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                  <p className="text-xs text-gray-400 truncate">{getUserRole()}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onClose={() => setIsProfileDropdownOpen(false)}
            isExpanded={isExpanded}
            userID={userID}
          />
        </div>

        {/* Version Info */}
        {isExpanded && (
          <div className="mt-3 px-3">
            <div className="text-xs text-gray-500 text-center">
              Roadmap AI v2.1.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
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
  RefreshCw,
  Sun,
  Moon,
  Palette,
  Monitor,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

// --- THEME CONTEXT ---
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: 'light'
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- ICON MAPPING FOR ROUTES ---
const ROUTE_ICONS = {
  'home': Home,
  'workplace': Briefcase,
  'dashboard': BarChart3,
  'assignments': FileText,
  'analytics': BarChart3,
  'reports': FileText,
  'roadmap': Target,
  'progress': TrendingUp,
  'settings': Settings,
  'profile': User,
};

// --- TOOLTIP COMPONENT ---
const Tooltip = ({ children, content, isVisible }) => {
  if (!isVisible) return children;

  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700 dark:border-gray-600">
        {content}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800 dark:border-r-gray-700"></div>
      </div>
    </div>
  );
};

// --- THEME TOGGLE SECTION COMPONENT ---
const ThemeToggleSection = ({ isExpanded }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-3">
      <Tooltip content={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`} isVisible={!isExpanded}>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white group"
          title={!isExpanded ? `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode` : undefined}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors duration-200" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors duration-200" />
          )}
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <span className="font-medium truncate block">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
              <span className="text-xs opacity-75 truncate block">
                {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              </span>
            </div>
          )}
          {isExpanded && (
            <div className="flex-shrink-0">
              <Palette className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
        </button>
      </Tooltip>
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
    if (connectionStatus === 'offline') return 'text-red-500 dark:text-red-400';
    if (isGenerating) return 'text-blue-600 dark:text-blue-400';
    if (hasRoadmap) return 'text-green-600 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
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
    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-2 text-xs">
        <StatusIcon 
          className={`h-3 w-3 ${getStatusColor()} ${isGenerating ? 'animate-spin' : ''} transition-colors duration-200`} 
        />
        <span className={`${getStatusColor()} truncate flex-1 transition-colors duration-200`}>
          {getStatusText()}
        </span>
      </div>
      {lastUpdate && hasRoadmap && !isGenerating && (
        <div className="text-xs text-gray-500 dark:text-gray-600 mt-1 truncate transition-colors duration-200">
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
      className={`absolute ${isExpanded ? 'left-0 right-0' : 'left-full ml-2'} bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-48 transition-colors duration-200`}
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#5C946E] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">{getUserInitials()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-800 dark:text-white font-medium text-sm truncate transition-colors duration-200">{getDisplayName()}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate transition-colors duration-200">
              {userID ? `ID: ${userID.substring(0, 12)}...` : 'Guest User'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <User className="h-4 w-4 flex-shrink-0" />
          <span>Profile Settings</span>
        </button>
        <button className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Preferences</span>
        </button>
        <button className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          <span>Help & Support</span>
        </button>
        <hr className="my-1 border-gray-200 dark:border-gray-700" />
        <button className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-150 flex items-center space-x-3">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Clear Session</span>
        </button>
      </div>
    </div>
  );
};

// --- MAIN NAVBAR/SIDEBAR COMPONENT ---
const Navbar = ({ 
  activeTab = 'home',
  onTabChange,
  tabs = [
    { id: 'home', label: 'Home', description: 'Generate new roadmaps' },
    { id: 'roadmap', label: 'My Roadmap', description: 'View current learning path' },
    { id: 'progress', label: 'Progress', description: 'Track your learning' },
    { id: 'workplace', label: 'Workplace', description: 'Learning workspace' }
  ],
  userID = null,
  connectionStatus = 'online',
  lastUpdate = null,
  hasRoadmap = false,
  isGenerating = false,
  generationProgress = ''
}) => {
  // Get theme from context
  const { isDarkMode } = useTheme();
  
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
    <ThemeProvider>
      <div className={`${isExpanded ? 'w-64' : 'w-16'} bg-[#c7dccd] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col h-screen flex-shrink-0 sticky top-0`}>
        {/* Header Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 bg-[#5C946E] rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {isExpanded && (
                <div className="min-w-0 flex-1">
                  <h1 className="text-gray-800 dark:text-white font-bold text-lg truncate transition-colors duration-200">PathForge</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-xs truncate transition-colors duration-200">Learning Platform</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
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
                <Tooltip key={tab.id} content={`${tab.label}${tab.description ? ' - ' + tab.description : ''}`} isVisible={!isExpanded}>
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#5C946E] text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white'
                    }`}
                    title={!isExpanded ? `${tab.label}${tab.description ? ' - ' + tab.description : ''}` : undefined}
                  >
                    <IconComponent 
                      className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white'
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
              <div className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3 px-3 transition-colors duration-200">
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
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed transition-colors duration-200"
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium truncate">{labels[id]}</span>
                      <div className="ml-auto text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded transition-colors duration-200">Soon</div>
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

        {/* Theme Toggle Section */}
        <ThemeToggleSection isExpanded={isExpanded} />

        {/* Bottom Section - User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 relative transition-colors duration-200">
          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white group ${
                isProfileDropdownOpen ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white' : ''
              }`}
            >
              <div className="w-8 h-8 bg-[#5C946E] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">{getUserInitials()}</span>
              </div>
              {isExpanded && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-200">{getUserRole()}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
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
              <div className="text-xs text-gray-500 dark:text-gray-600 text-center transition-colors duration-200">
                PathForge v2.1.0 • Theme: {isDarkMode ? 'Dark' : 'Light'}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Navbar;
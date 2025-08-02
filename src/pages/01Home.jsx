import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const HomeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
  </svg>
);

const DashboardIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const WorkplaceIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const AssignmentsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10,9 9,9 8,9"></polyline>
  </svg>
);

const AnalyticsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"></path>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
  </svg>
);

const ReportsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const SettingsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2.18l.12 1.46a2 2 0 0 1-.44 1.73l-1.1 1.11a2 2 0 0 1-1.73.44l-1.46-.12a2 2 0 0 0-2.18 2v.44a2 2 0 0 0 2.18 2l1.46.12a2 2 0 0 1 1.73.44l1.1 1.1a2 2 0 0 1 .44 1.73l-.12 1.46a2 2 0 0 0 2 2.18h.44a2 2 0 0 0 2-2.18l-.12-1.46a2 2 0 0 1 .44-1.73l1.1-1.1a2 2 0 0 1 1.73-.44l1.46.12a2 2 0 0 0 2.18-2v-.44a2 2 0 0 0-2.18-2l-1.46-.12a2 2 0 0 1-1.73-.44L13.9 6.45a2 2 0 0 1-.44-1.73l.12-1.46a2 2 0 0 0-2-2.18Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const ProfileIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const HelpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <path d="M12 17h.01"></path>
  </svg>
);

const LogOutIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ChevronLeftIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"></path>
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"></path>
  </svg>
);

const SparkleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.064a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"></path>
  </svg>
);

// Landing page icons
const Sparkles = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>
);

const BookOpen = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const Target = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const User = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Mail = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const Zap = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
  </svg>
);

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

// --- PROFILE DROPDOWN COMPONENT ---
const ProfileDropdown = ({ isOpen, onClose, isExpanded }) => {
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

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${isExpanded ? 'left-0 right-0' : 'left-full ml-2'} bottom-full mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50 min-w-48`}
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">JD</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium text-sm truncate">John Doe</p>
            <p className="text-gray-400 text-xs truncate">john.doe@example.com</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <ProfileIcon className="h-4 w-4 flex-shrink-0" />
          <span>Profile Settings</span>
        </button>
        <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <SettingsIcon className="h-4 w-4 flex-shrink-0" />
          <span>Preferences</span>
        </button>
        <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center space-x-3">
          <HelpIcon className="h-4 w-4 flex-shrink-0" />
          <span>Help & Support</span>
        </button>
        <hr className="my-1 border-gray-700" />
        <button className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors duration-150 flex items-center space-x-3">
          <LogOutIcon className="h-4 w-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

// --- SIDEBAR COMPONENT ---
const ProfessionalSidebar = ({ isExpanded, setIsExpanded }) => {
  const [activeItem, setActiveItem] = useState('home');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const mainMenuItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'workplace', label: 'Workplace', icon: WorkplaceIcon },
    { id: 'assignments', label: 'Assignments', icon: AssignmentsIcon },
    { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
    { id: 'reports', label: 'Reports', icon: ReportsIcon },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setIsProfileDropdownOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
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
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <SparkleIcon className="h-5 w-5 text-white" />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-lg truncate">Roadmap AI</h1>
                <p className="text-gray-400 text-xs truncate">Agent Platform</p>
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
              <ChevronLeftIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-3">
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <Tooltip key={item.id} content={item.label} isVisible={!isExpanded}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <IconComponent 
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} 
                  />
                  {isExpanded && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  {isActive && isExpanded && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </nav>

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
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">JD</span>
            </div>
            {isExpanded && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">John Doe</p>
                  <p className="text-xs text-gray-400 truncate">Administrator</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onClose={() => setIsProfileDropdownOpen(false)}
            isExpanded={isExpanded}
          />
        </div>

        {/* Version Info */}
        {isExpanded && (
          <div className="mt-3 px-3">
            <div className="text-xs text-gray-500 text-center">
              Version 2.1.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- LANDING PAGE COMPONENTS ---

// Loading spinner component
const LoadingSpinner = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800 rounded-lg w-full max-w-md mx-auto border border-gray-700">
    <svg className="animate-spin h-8 w-8 text-green-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-sm font-medium text-white">{message}</p>
  </div>
);

// Feature card component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <div className="flex items-center mb-2">
      <div className="bg-green-500 p-2 rounded-md mr-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
  </div>
);

// Stats component
const StatItem = ({ number, label }) => (
  <div className="text-center">
    <div className="text-lg font-bold text-green-500">{number}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

// Input field component
const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-gray-300">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500">
          {icon}
        </span>
      </div>
      <input 
        {...props}
        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors" 
      />
    </div>
  </div>
);

// Select field component
const SelectField = ({ label, icon, children, ...props }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-gray-300">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500">
          {icon}
        </span>
      </div>
      <select 
        {...props}
        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2.5 pl-10 pr-8 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors appearance-none"
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  </div>
);

// Main form component
const OnboardingForm = ({ setUserID, setLoading, setError }) => {
  const [formData, setFormData] = useState({
    email: '',
    skill: '',
    level: 'Beginner',
    goal: 'Get a Job',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.skill || !formData.email) {
      setError('Please fill in both your email and the skill you want to learn.');
      return;
    }
    setLoading(true);
    setError(null);

    const RELAY_WEBHOOK_URL = 'https://hook.relay.app/api/v1/playbook/cmdrkgwbk0b950pm8bdz1ga7c/trigger/Q_Vxfia_VDicN_DDe1bBbQ';

    try {
      const response = await fetch(RELAY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`The AI agent returned an error. Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.userID) {
        setUserID(data.userID);
      } else {
        throw new Error("The response from the agent was missing a userID.");
      }

    } catch (err) {
      setError(err.message || 'An unknown error occurred. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Target className="text-white" />,
      title: "Personalized Learning Path",
      description: "AI-crafted roadmaps tailored to your current skill level and career goals."
    },
    {
      icon: <Zap className="text-white" />,
      title: "Smart Progress Tracking",
      description: "Monitor your advancement with intelligent milestones and achievements."
    },
    {
      icon: <BookOpen className="text-white" />,
      title: "Curated Resources",
      description: "Access hand-picked tutorials, courses, and projects for each skill level."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-4">
          <Sparkles className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Roadmap AI Agent</h1>
        <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          Transform your learning journey with AI-powered roadmaps designed specifically for your goals and experience level.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center items-center space-x-8 mt-6 mb-8">
          <StatItem number="10K+" label="Students" />
          <StatItem number="500+" label="Skills" />
          <StatItem number="95%" label="Success Rate" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-1">Create Your Learning Path</h2>
              <p className="text-xs text-gray-400">Tell us about your goals and we'll build a personalized roadmap.</p>
            </div>
            
            <div className="space-y-4">
              <InputField
                label="What skill do you want to master?"
                icon={<BookOpen />}
                type="text"
                name="skill"
                value={formData.skill}
                onChange={handleChange}
                placeholder="e.g., Python for Data Science, React Development"
              />
              
              <InputField
                label="Your Email Address"
                icon={<Mail />}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Used to save and track your progress"
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <SelectField
                  label="Current Experience Level"
                  icon={<User />}
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </SelectField>
                
                <SelectField
                  label="Primary Learning Goal"
                  icon={<Target />}
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                >
                  <option>Get a Job</option>
                  <option>Build a Project</option>
                  <option>Personal Growth</option>
                  <option>Start a Business</option>
                </SelectField>
              </div>
              
              <button 
                onClick={handleSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                <Sparkles className="text-white" />
                <span>Generate My Roadmap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3">Why Choose Our AI Agent?</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard component
const Dashboard = ({ userID, setUserID }) => {
  const handleLogout = () => {
    setUserID(null);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto text-center p-6 bg-gray-800 rounded-xl border border-gray-700">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-xl mb-4">
        <BookOpen className="text-white w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
      <p className="text-sm text-gray-300 mb-4">Your personalized dashboard is ready.</p>
      
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <p className="text-xs text-gray-400 mb-1">Your unique User ID:</p>
        <p className="text-green-500 font-mono text-sm bg-gray-800 rounded-md p-2 inline-block border border-gray-700">{userID}</p>
      </div>
      
      <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
        The next step is to build a new Relay playbook to fetch your roadmap from Airtable using this ID and display it here.
      </p>
      
      <button 
        onClick={handleLogout} 
        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
      >
        Start Over
      </button>
    </div>
  );
};

// Main landing page component
const LandingPage = () => {
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-sans flex items-center justify-center p-4">
      <div className="w-full">
        {loading ? (
          <LoadingSpinner message="Checking for saved progress..." />
        ) : error ? (
          <div className="w-full max-w-md mx-auto text-center p-6 bg-red-900 rounded-lg border border-red-700">
            <h3 className="text-lg font-bold text-white mb-2">An Error Occurred</h3>
            <p className="text-sm text-red-200 mb-4">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : userID ? (
          <Dashboard userID={userID} setUserID={setUserID} />
        ) : (
          <OnboardingForm setUserID={setUserID} setLoading={setLoading} setError={setError} />
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const Home = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <ProfessionalSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <LandingPage />
      </div>
    </div>
  );
};

export default Home;
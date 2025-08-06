import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Heart
} from 'lucide-react';

const Footer = ({ 
  onNavigate = null, 
  currentRoute = 'home',
  totalRoadmaps = null,
  className = '' 
}) => {
  // State for dropdown
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  
  // State for stats animation
  const [animatedStats, setAnimatedStats] = useState({
    roadmaps: 0
  });

  // Sample stats - replace with real data
  const stats = {
    roadmaps: totalRoadmaps || 21
  };

  // Animate stats on mount
  useEffect(() => {
    const animateValue = (start, end, duration, callback) => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + (end - start) * progress);
        callback(value);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Animate roadmaps stat
    animateValue(0, stats.roadmaps, 2000, (value) => 
      setAnimatedStats(prev => ({ ...prev, roadmaps: value }))
    );
  }, [stats.roadmaps]);

  // Team members data
  const teamMembers = [
    { name: 'Saksham Srivastava', role: 'Lead Developer' },
    { name: 'Mohit', role: 'AI Integration' },
    { name: 'Peeyush Tiwari', role: 'Backend Developer' },
    { name: 'Darshil Khandelwal', role: 'Frontend Developer' }
  ];

  // Handle navigation
  const handleNavigation = (route) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  // Handle dropdown toggle
  const toggleTeamDropdown = () => {
    setIsTeamDropdownOpen(!isTeamDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.team-dropdown')) {
        setIsTeamDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <footer className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Branding & Stats */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#5C946E] mb-2">
                  PathForge
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200">
                  AI-powered personalized learning roadmaps
                </p>
              </div>
              
              {/* Stats */}
              <div className="pt-2">
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-bold text-[#5C946E]">
                    {animatedStats.roadmaps.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Roadmaps Created
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links & Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider transition-colors duration-200">
                Quick Links
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => handleNavigation('home')}
                  className={`block text-sm transition-colors duration-200 text-left ${
                    currentRoute === 'home' 
                      ? 'text-[#5C946E] font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-[#5C946E] dark:hover:text-[#5C946E]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigation('workplace')}
                  className={`block text-sm transition-colors duration-200 text-left ${
                    currentRoute === 'workplace' 
                      ? 'text-[#5C946E] font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-[#5C946E] dark:hover:text-[#5C946E]'
                  }`}
                >
                  Workplace
                </button>
                
                {/* Contact Info */}
                <div className="pt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    <Mail className="w-4 h-4 text-[#5C946E]" />
                    <a 
                      href="mailto:pathforge.roadmap@gmail.com" 
                      className="hover:text-[#5C946E] transition-colors duration-200"
                    >
                      pathforge.roadmap@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Team Dropdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider transition-colors duration-200">
                Development Team
              </h4>
              <div className="relative team-dropdown">
                <button
                  onClick={toggleTeamDropdown}
                  className="flex items-center justify-between w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      TryCatchUs Group
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      VIPS New Delhi • IBM Summer Internship
                    </div>
                  </div>
                  {isTeamDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                
                {isTeamDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10 transition-all duration-200">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                        Development Team
                      </div>
                    </div>
                    {teamMembers.map((member, index) => (
                      <div key={index} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                          {member.role}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            
            {/* Copyright & Legal */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                © 2025 PathForge. All rights reserved.
              </p>
            </div>

            {/* Powered By & Version */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                <Zap className="w-3 h-3 text-[#5C946E]" />
                <span>Powered by AI</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Made with care</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-200">
                v1.1.3
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
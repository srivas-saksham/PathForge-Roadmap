import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Mail, Target, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// Configuration - Replace with your actual values
const CONFIG = {
  RELAY_PLANNER_WEBHOOK: 'https://hook.relay.app/api/v1/playbook/cmdu377i51l5o0nkt40wdamac/trigger/y7X62S7EioiHox_2_pcGAA',
  AIRTABLE_BASE_ID: 'appQjqTJK6ZBf7lU0',
  AIRTABLE_PROGRESS_TABLE: 'Progress',
  AIRTABLE_API_KEY: 'patPmofh3T03hQTgW.607bbdc2898f5cc93c1314a406ee95f05faf6f3755d886a313fd424668d65c42',
  POLLING_INTERVAL: 8000, // 8 seconds - increased from 5 seconds
  MAX_POLLING_ATTEMPTS: 75, // 10 minutes total (75 * 8 seconds)
  INITIAL_POLLING_DELAY: 10000 // 10 seconds initial delay
};

// Utility function to generate random User ID
const generateUserID = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
};

// Simple UI Components
const Button = ({ children, onClick, disabled, variant = 'primary', className = '', size = 'md' }) => {
  const baseClasses = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white focus:ring-green-500'
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
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <input
        {...props}
        className={`w-full border rounded-lg py-2 px-3 ${Icon ? 'pl-10' : ''} 
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      />
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const Select = ({ label, icon: Icon, options, error, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <select
        {...props}
        className={`w-full border rounded-lg py-2 px-3 ${Icon ? 'pl-10' : ''} 
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const StatusCard = ({ icon: Icon, title, message, variant = 'info' }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
  };

  return (
    <div className={`p-4 border rounded-lg ${variants[variant]}`}>
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Backend Service Class
class RoadmapService {
  static async submitToPlanner(formData) {
    console.log('🚀 Submitting to Relay Planner:', formData);
    
    try {
      const response = await fetch(CONFIG.RELAY_PLANNER_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Planner webhook failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      console.log('✅ Planner response:', result);
      
      // Check if the response indicates completion
      const isCompleted = result.toLowerCase().includes('completed') || 
                         result.toLowerCase().includes('done') || 
                         result.toLowerCase().includes('finished') ||
                         result.toLowerCase().includes('success');
      
      return { 
        success: true, 
        flag: result,
        isCompleted: isCompleted
      };
    } catch (error) {
      console.error('❌ Planner submission failed:', error);
      throw new Error(`Failed to submit to planner: ${error.message}`);
    }
  }

  static async updateTaskStatus(recordId, status) {
    console.log('🔄 Updating task status:', { recordId, status });
    
    try {
      const url = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_PROGRESS_TABLE}/${recordId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            Status: status
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Airtable update error:', errorText);
        throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Task updated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  static async fetchRoadmapData(userID) {
    console.log('📊 Fetching roadmap data for user:', userID);
    
    try {
      // Build URL with proper parameters
      const baseUrl = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_PROGRESS_TABLE}`;
      const params = new URLSearchParams();
      
      // Add filter formula - single quotes for string comparison
      params.append('filterByFormula', `{UserID} = '${userID}'`);
      
      // Add sort parameters - primary sort by Week, secondary by TaskID for consistent ordering
      params.append('sort[0][field]', 'Week');
      params.append('sort[0][direction]', 'asc');
      params.append('sort[1][field]', 'TaskID');
      params.append('sort[1][direction]', 'asc');
      
      // Add page size to ensure we get all records
      params.append('pageSize', '100');
      
      const url = `${baseUrl}?${params.toString()}`;
      console.log('📡 Airtable URL:', url);

      // Fetch all records (handle pagination if needed)
      let allRecords = [];
      let offset = null;
      
      do {
        const paginatedUrl = offset ? `${url}&offset=${offset}` : url;
        console.log('📡 Fetching from:', paginatedUrl);
        
        const response = await fetch(paginatedUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Airtable error response:', errorText);
          throw new Error(`Airtable API failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📋 Airtable response batch:', data);
        
        if (data.records) {
          allRecords = allRecords.concat(data.records);
        }
        
        offset = data.offset;
      } while (offset);

      console.log('📋 Total records fetched:', allRecords.length);

      if (!allRecords || allRecords.length === 0) {
        console.log('📝 No records found for user:', userID);
        return null; // No data yet
      }

      // Transform Airtable records to our format with better field handling
      const tasks = allRecords.map((record, index) => {
        const fields = record.fields;
        
        // Get the task description from the "Task Description" field (as shown in your screenshot)
        let description = fields['Task Description'] || fields.Description || fields.Task || fields.Topic || fields.Title || '';
        
        // If still empty, try to construct from available data
        if (!description && fields.Theme) {
          description = `Learn ${fields.Theme}`;
        }
        
        // Final fallback
        if (!description) {
          description = `Week ${fields.Week || (index + 1)} Task`;
        }

        return {
          id: record.id,
          taskId: fields.TaskID || index + 1,
          week: fields.Week || 1,
          theme: fields.Theme || fields.Topic || 'Learning Phase',
          description: description,
          link: fields.Link || fields.Resource || null,
          status: fields.Status || 'Pending'
        };
      });

      // Additional client-side sorting to ensure proper order
      tasks.sort((a, b) => {
        if (a.week !== b.week) {
          return a.week - b.week;
        }
        return a.taskId - b.taskId;
      });

      console.log('📋 Processed tasks:', tasks);

      return {
        skill: allRecords[0]?.fields?.Skill || 'Your Skill',
        userID: userID,
        tasks: tasks
      };

    } catch (error) {
      console.error('❌ Failed to fetch roadmap data:', error);
      throw new Error(`Failed to fetch roadmap: ${error.message}`);
    }
  }

  static async pollForData(userID, onProgress, onSuccess, onError) {
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      console.log(`🔄 Polling attempt ${attempts}/${CONFIG.MAX_POLLING_ATTEMPTS}`);
      
      try {
        onProgress(`Fetching your roadmap data... (${attempts}/${CONFIG.MAX_POLLING_ATTEMPTS})`);
        
        const roadmapData = await this.fetchRoadmapData(userID);
        
        if (roadmapData && roadmapData.tasks && roadmapData.tasks.length > 0) {
          console.log(`🎉 Roadmap data found! (${roadmapData.tasks.length} tasks)`);
          onSuccess(roadmapData);
          return;
        }

        if (attempts >= CONFIG.MAX_POLLING_ATTEMPTS) {
          throw new Error('Timeout: Could not fetch roadmap data. Please try again.');
        }

        // Schedule next poll
        setTimeout(poll, CONFIG.POLLING_INTERVAL);
        
      } catch (error) {
        console.error('❌ Polling error:', error);
        onError(error.message);
      }
    };

    // Start polling immediately when called
    console.log('🚀 Starting roadmap data polling...');
    poll();
  }
}

// Main Landing Page Component
const LandingPage = () => {
  const [formData, setFormData] = useState({
    skill: '',
    userID: '', // Will be auto-generated
    email: '',
    goal: 'Get a Job',
    level: 'Beginner'
  });

  const [formErrors, setFormErrors] = useState({});
  const [appState, setAppState] = useState('form'); // 'form', 'submitting', 'polling', 'dashboard', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);
  const [updatingTasks, setUpdatingTasks] = useState(new Set()); // Track which tasks are being updated
  const [expandedTasks, setExpandedTasks] = useState(new Set()); // Track which tasks have expanded resources

  // Generate userID on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userID: generateUserID()
    }));
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.skill.trim()) {
      errors.skill = 'Skill is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle task status toggle
  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    setUpdatingTasks(prev => new Set(prev).add(task.id));

    try {
      await RoadmapService.updateTaskStatus(task.id, newStatus);
      
      // Update local state
      setRoadmapData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === task.id 
            ? { ...t, status: newStatus }
            : t
        )
      }));

      console.log(`✅ Task status changed to ${newStatus}:`, task.description);
      
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      // You could show a toast notification here
      alert(`Failed to update task: ${error.message}`);
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setAppState('submitting');
    setStatusMessage('Submitting your request to AI planner...');
    setError(null);

    try {
      // Generate a new userID if it's empty for some reason
      const userID = formData.userID || generateUserID();
      const submissionData = { ...formData, userID };
      
      // Submit to Relay Planner and wait for completion flag
      const plannerResult = await RoadmapService.submitToPlanner(submissionData);
      console.log('📤 Planner result:', plannerResult);

      if (plannerResult.isCompleted) {
        // Planner indicates completion, start polling immediately
        console.log('✅ Planner reported completion, starting data fetch...');
        setAppState('polling');
        setStatusMessage('Planner completed! Fetching your roadmap data...');

        // Start polling for data immediately
        RoadmapService.pollForData(
          userID,
          (message) => setStatusMessage(message),
          (roadmapData) => {
            setRoadmapData(roadmapData);
            setAppState('dashboard');
            setStatusMessage('Roadmap loaded successfully!');
          },
          (errorMessage) => {
            setError(errorMessage);
            setAppState('error');
          }
        );
      } else {
        // Planner hasn't completed yet, wait and check status
        console.log('⏳ Planner still processing, waiting for completion...');
        setStatusMessage('AI is processing your request...');
        
        // You could implement a status check loop here if needed
        // For now, we'll start polling after a short delay
        setTimeout(() => {
          setAppState('polling');
          setStatusMessage('Checking for completion and fetching data...');
          
          RoadmapService.pollForData(
            userID,
            (message) => setStatusMessage(message),
            (roadmapData) => {
              setRoadmapData(roadmapData);
              setAppState('dashboard');
              setStatusMessage('Roadmap loaded successfully!');
            },
            (errorMessage) => {
              setError(errorMessage);
              setAppState('error');
            }
          );
        }, 3000); // 3 second delay if not completed
      }

    } catch (err) {
      console.error('💥 Submission error:', err);
      setError(err.message);
      setAppState('error');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Reset to form
  const resetToForm = () => {
    setAppState('form');
    setError(null);
    setStatusMessage('');
    setRoadmapData(null);
    setUpdatingTasks(new Set());
    setExpandedTasks(new Set());
    // Generate new userID for new submission
    setFormData(prev => ({
      ...prev,
      userID: generateUserID()
    }));
  };

  // Render form
  const renderForm = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Roadmap AI Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a personalized learning roadmap powered by AI
        </p>
      </div>

      <div className="space-y-6">
        <Input
          label="Skill to Learn"
          icon={BookOpen}
          name="skill"
          value={formData.skill}
          onChange={handleInputChange}
          placeholder="e.g., Python for Data Science"
          error={formErrors.skill}
          required
        />

        <Input
          label="Email Address"
          icon={Mail}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
          error={formErrors.email}
          required
        />

        <Select
          label="Current Level"
          icon={Target}
          name="level"
          value={formData.level}
          onChange={handleInputChange}
          options={[
            { value: 'Beginner', label: 'Beginner' },
            { value: 'Intermediate', label: 'Intermediate' },
            { value: 'Advanced', label: 'Advanced' }
          ]}
          error={formErrors.level}
        />

        <Select
          label="Learning Goal"
          icon={Target}
          name="goal"
          value={formData.goal}
          onChange={handleInputChange}
          options={[
            { value: 'Get a Job', label: 'Get a Job' },
            { value: 'Build a Project', label: 'Build a Project' },
            { value: 'Personal Growth', label: 'Personal Growth' },
            { value: 'Start a Business', label: 'Start a Business' }
          ]}
          error={formErrors.goal}
        />

        {/* Show generated User ID for debugging */}
        {formData.userID && (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            Generated ID: {formData.userID}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={appState !== 'form'}
        >
          Generate My Roadmap
        </Button>
      </div>
    </div>
  );

  // Render status
  const renderStatus = () => {
    const isSubmitting = appState === 'submitting';
    const isPolling = appState === 'polling';
    
    return (
      <div className="max-w-md mx-auto">
        <StatusCard
          icon={isSubmitting ? Clock : isPolling ? Clock : CheckCircle}
          title={isSubmitting ? 'Processing Request' : isPolling ? 'Generating Roadmap' : 'Processing'}
          message={statusMessage}
          variant="info"
        />
        
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={resetToForm}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  // Render error
  const renderError = () => (
    <div className="max-w-md mx-auto">
      <StatusCard
        icon={AlertCircle}
        title="Error"
        message={error}
        variant="error"
      />
      
      <div className="mt-4 text-center space-x-2">
        <Button onClick={resetToForm}>
          Try Again
        </Button>
      </div>
    </div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Roadmap: {roadmapData.skill}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow this personalized learning path to achieve your goals
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{roadmapData.tasks.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {roadmapData.tasks.filter(t => t.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...roadmapData.tasks.map(t => t.week))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Weeks</div>
          </div>
        </div>
      </div>

      {/* Weekly Tasks */}
      <div className="space-y-6">
        {Array.from(new Set(roadmapData.tasks.map(t => t.week)))
          .sort((a, b) => a - b)
          .map(week => {
            const weekTasks = roadmapData.tasks.filter(t => t.week === week);
            const weekTheme = weekTasks[0]?.theme || 'Learning Phase';
            
            return (
              <div key={week} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Week {week}: {weekTheme}
                </h3>
                <div className="space-y-3">
                  {weekTasks.map(task => {
                    const isCompleted = task.status === 'Completed';
                    const isUpdating = updatingTasks.has(task.id);
                    const isExpanded = expandedTasks.has(task.id);
                    const hasResources = task.link && task.link.trim();
                    
                    return (
                      <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div className="flex items-start space-x-3 p-3">
                          <CheckCircle 
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              isCompleted ? 'text-green-500' : 'text-gray-400'
                            }`} 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  isCompleted 
                                    ? 'text-gray-500 dark:text-gray-400 line-through' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.description}
                                </p>
                                {hasResources && (
                                  <button
                                    onClick={() => toggleResourceDropdown(task.id)}
                                    className="flex items-center space-x-1 mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Resources</span>
                                    {isExpanded ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="flex-shrink-0 ml-3">
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "secondary" : "success"}
                                  onClick={() => handleToggleTaskStatus(task)}
                                  disabled={isUpdating}
                                  className="min-w-max"
                                >
                                  {isUpdating 
                                    ? 'Updating...' 
                                    : isCompleted 
                                      ? 'Mark Pending' 
                                      : 'Mark Complete'
                                  }
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expandable Resources Section */}
                        {hasResources && isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <div className="pt-3">
                              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Learning Resources
                              </h4>
                              <div className="space-y-2">
                                {task.link.split(',').map((link, index) => {
                                  const trimmedLink = link.trim();
                                  if (!trimmedLink) return null;
                                  
                                  // Extract domain name for display
                                  let displayName = trimmedLink;
                                  try {
                                    const url = new URL(trimmedLink);
                                    displayName = url.hostname.replace('www.', '') + url.pathname;
                                    if (displayName.length > 50) {
                                      displayName = displayName.substring(0, 50) + '...';
                                    }
                                  } catch (e) {
                                    // If URL parsing fails, use the original link
                                    if (displayName.length > 50) {
                                      displayName = displayName.substring(0, 50) + '...';
                                    }
                                  }
                                  
                                  return (
                                    <a
                                      key={index}
                                      href={trimmedLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                                    >
                                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                        {displayName}
                                      </span>
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
            );
          })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="secondary" onClick={resetToForm}>
          Create New Roadmap
        </Button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto">
        {appState === 'form' && renderForm()}
        {(appState === 'submitting' || appState === 'polling') && renderStatus()}
        {appState === 'error' && renderError()}
        {appState === 'dashboard' && renderDashboard()}
      </div>
    </div>
  );
};

export default LandingPage;
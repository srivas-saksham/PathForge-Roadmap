import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import RoadmapService, { generateUserID } from '../services/RoadmapService';

// --- UI COMPONENTS ---
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
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`}
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
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`}
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

const StatusCard = ({ icon: Icon, title, message, variant = 'info', showSpinner = false }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
  };

  return (
    <div className={`p-4 border rounded-lg ${variants[variant]}`}>
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

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-current`}></div>
  );
};

// --- MAIN HOME COMPONENT ---
const Home = ({ 
  onRoadmapGenerated, 
  onSwitchToWorkplace, 
  existingFormData = null,
  isGenerating = false 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    skill: '',
    userID: '',
    email: '',
    goal: 'Get a Job',
    level: 'Beginner'
  });

  // UI state
  const [formErrors, setFormErrors] = useState({});
  const [generationState, setGenerationState] = useState('idle'); // 'idle', 'submitting', 'polling', 'completed', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  // Options for select fields
  const levelOptions = [
    { value: 'Beginner', label: 'Beginner - Just starting out' },
    { value: 'Intermediate', label: 'Intermediate - Some experience' },
    { value: 'Advanced', label: 'Advanced - Experienced learner' }
  ];

  const goalOptions = [
    { value: 'Get a Job', label: 'Get a Job - Career focused' },
    { value: 'Build a Project', label: 'Build a Project - Hands-on learning' },
    { value: 'Personal Growth', label: 'Personal Growth - Self improvement' },
    { value: 'Start a Business', label: 'Start a Business - Entrepreneurial' },
    { value: 'Academic Study', label: 'Academic Study - Educational' },
    { value: 'Skill Upgrade', label: 'Skill Upgrade - Professional development' }
  ];

  // Initialize form data
  useEffect(() => {
    if (existingFormData) {
      // Use existing form data if provided
      setFormData(existingFormData);
    } else {
      // Generate new userID for new session
      setFormData(prev => ({
        ...prev,
        userID: generateUserID()
      }));
    }
  }, [existingFormData]);

  // Sync generation state with parent
  useEffect(() => {
    if (isGenerating && generationState === 'idle') {
      setGenerationState('submitting');
      setStatusMessage('Processing your request...');
    }
  }, [isGenerating, generationState]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.skill.trim()) {
      errors.skill = 'Skill is required';
    } else if (formData.skill.trim().length < 2) {
      errors.skill = 'Skill must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.goal.trim()) {
      errors.goal = 'Learning goal is required';
    }

    if (!formData.level.trim()) {
      errors.level = 'Current level is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if already generating
    if (generationState !== 'idle') {
      return;
    }

    setGenerationState('submitting');
    setStatusMessage('Submitting your request to AI planner...');
    setError(null);
    setSubmissionCount(prev => prev + 1);

    try {
      // Ensure userID is present
      const userID = formData.userID || generateUserID();
      const submissionData = { ...formData, userID };
      
      console.log('🎯 Starting roadmap generation process...', submissionData);

      // Submit to Relay Planner
      const plannerResult = await RoadmapService.submitToPlanner(submissionData);
      console.log('📤 Planner result:', plannerResult);

      // Update status based on planner response
      if (plannerResult.isCompleted) {
        console.log('✅ Planner reported completion, starting data fetch...');
        setGenerationState('polling');
        setStatusMessage('Planner completed! Fetching your roadmap data...');
        startDataPolling(userID);
      } else {
        console.log('⏳ Planner still processing, waiting for completion...');
        setStatusMessage('AI is processing your request...');
        
        // Start polling after a short delay
        setTimeout(() => {
          setGenerationState('polling');
          setStatusMessage('Checking for completion and fetching data...');
          startDataPolling(userID);
        }, 3000);
      }

      // Notify parent component about the submission
      if (onRoadmapGenerated) {
        onRoadmapGenerated(submissionData);
      }

    } catch (err) {
      console.error('💥 Submission error:', err);
      setError(err.message);
      setGenerationState('error');
      setStatusMessage('');
    }
  };

  // Start polling for roadmap data
  const startDataPolling = (userID) => {
    RoadmapService.pollForData(
      userID,
      // Progress callback
      (message) => {
        setStatusMessage(message);
      },
      // Success callback
      (roadmapData) => {
        console.log('🎉 Roadmap generation completed!', roadmapData);
        setGenerationState('completed');
        setStatusMessage('Roadmap generated successfully!');
        
        // Notify parent and switch to workplace
        if (onRoadmapGenerated) {
          onRoadmapGenerated(formData, roadmapData);
        }
        
        // Auto-switch to workplace after a brief delay
        setTimeout(() => {
          if (onSwitchToWorkplace) {
            onSwitchToWorkplace();
          }
        }, 2000);
      },
      // Error callback
      (errorMessage) => {
        console.error('❌ Polling failed:', errorMessage);
        setError(errorMessage);
        setGenerationState('error');
        setStatusMessage('');
      }
    );
  };

  // Reset form and state
  const resetForm = () => {
    setGenerationState('idle');
    setError(null);
    setStatusMessage('');
    setFormErrors({});
    setSubmissionCount(0);
    // Generate new userID for fresh start
    setFormData(prev => ({
      skill: '',
      email: prev.email, // Keep email for convenience
      goal: 'Get a Job',
      level: 'Beginner',
      userID: generateUserID()
    }));
  };

  // Cancel generation process
  const cancelGeneration = () => {
    setGenerationState('idle');
    setStatusMessage('');
    setError(null);
  };

  // Check if form is in a processing state
  const isProcessing = ['submitting', 'polling'].includes(generationState);
  const isCompleted = generationState === 'completed';
  const hasError = generationState === 'error';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto">
        <div className="max-w-md mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Roadmap AI Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a personalized learning roadmap powered by AI
            </p>
            {submissionCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Attempt #{submissionCount}
              </p>
            )}
          </div>

          {/* Status Messages */}
          {isProcessing && (
            <div className="mb-6">
              <StatusCard
                icon={Clock}
                title={generationState === 'submitting' ? 'Processing Request' : 'Generating Roadmap'}
                message={statusMessage}
                variant="info"
                showSpinner={true}
              />
            </div>
          )}

          {isCompleted && (
            <div className="mb-6">
              <StatusCard
                icon={CheckCircle}
                title="Success!"
                message="Your roadmap has been generated successfully. Redirecting to workplace..."
                variant="success"
              />
            </div>
          )}

          {hasError && (
            <div className="mb-6">
              <StatusCard
                icon={AlertCircle}
                title="Error"
                message={error}
                variant="error"
              />
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              
              {/* Skill Input */}
              <Input
                label="Skill to Learn"
                icon={BookOpen}
                name="skill"
                value={formData.skill}
                onChange={handleInputChange}
                placeholder="e.g., Python for Data Science, React Development, Digital Marketing"
                error={formErrors.skill}
                disabled={isProcessing}
                required
              />

              {/* Email Input */}
              <Input
                label="Email Address"
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                error={formErrors.email}
                disabled={isProcessing}
                required
              />

              {/* Current Level Select */}
              <Select
                label="Current Level"
                icon={Target}
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                options={levelOptions}
                error={formErrors.level}
                disabled={isProcessing}
              />

              {/* Learning Goal Select */}
              <Select
                label="Learning Goal"
                icon={Target}
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                options={goalOptions}
                error={formErrors.goal}
                disabled={isProcessing}
              />

              {/* Debug Info (Development only) */}
              {process.env.NODE_ENV === 'development' && formData.userID && (
                <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <strong>Debug Info:</strong><br />
                  User ID: {formData.userID}<br />
                  State: {generationState}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isProcessing && !isCompleted && (
                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate My Roadmap'
                    )}
                  </Button>
                )}

                {isProcessing && (
                  <Button
                    onClick={cancelGeneration}
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    Cancel
                  </Button>
                )}

                {(hasError || isCompleted) && (
                  <div className="space-y-2">
                    <Button
                      onClick={resetForm}
                      className="w-full"
                      size="lg"
                    >
                      Generate New Roadmap
                    </Button>
                    
                    {isCompleted && onSwitchToWorkplace && (
                      <Button
                        onClick={onSwitchToWorkplace}
                        variant="secondary"
                        className="w-full"
                      >
                        View My Roadmap
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          {!isProcessing && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 Tips for better results:
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Be specific about the skill (e.g., "React for Web Development" vs "Programming")</li>
                <li>• Choose the level that best matches your current knowledge</li>
                <li>• Select a goal that aligns with your learning motivation</li>
                <li>• The generation process may take 1-2 minutes</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
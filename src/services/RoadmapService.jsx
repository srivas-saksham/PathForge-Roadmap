// RoadmapService.js
// Centralized service for handling all roadmap-related API calls and data management

/**
 * Configuration object containing all API endpoints and settings
 * Replace these values with your actual configuration
 */
const CONFIG = {
  // Relay Planner Webhook URL - handles roadmap generation requests
  RELAY_PLANNER_WEBHOOK: 'https://hook.relay.app/api/v1/playbook/cmdu377i51l5o0nkt40wdamac/trigger/y7X62S7EioiHox_2_pcGAA',
  
  // Airtable configuration for storing and retrieving roadmap data
  AIRTABLE_BASE_ID: 'appQjqTJK6ZBf7lU0',
  AIRTABLE_PROGRESS_TABLE: 'Progress',
  AIRTABLE_API_KEY: 'patPmofh3T03hQTgW.607bbdc2898f5cc93c1314a406ee95f05faf6f3755d886a313fd424668d65c42',
  
  // Polling configuration for checking roadmap generation status
  POLLING_INTERVAL: 8000, // 8 seconds between polling attempts
  MAX_POLLING_ATTEMPTS: 75, // Maximum 75 attempts (10 minutes total)
  INITIAL_POLLING_DELAY: 10000 // 10 seconds delay before starting to poll
};

/**
 * Utility function to generate a unique User ID
 * Creates a timestamp-based ID with random component for uniqueness
 * @returns {string} Unique user ID in format: user_timestamp_random
 */
export const generateUserID = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
};

/**
 * Main service class for handling roadmap operations
 * All methods are static for easy importing and usage
 */
class RoadmapService {
  
  /**
   * Submit form data to the Relay Planner for roadmap generation
   * @param {Object} formData - User form data containing skill, email, goal, level, userID
   * @param {string} formData.skill - The skill to learn
   * @param {string} formData.email - User's email address
   * @param {string} formData.goal - Learning goal (Get a Job, Build a Project, etc.)
   * @param {string} formData.level - Current skill level (Beginner, Intermediate, Advanced)
   * @param {string} formData.userID - Unique user identifier
   * @returns {Promise<Object>} Response object with success status and completion flag
   * @throws {Error} If the submission fails
   */
  static async submitToPlanner(formData) {
    console.log('🚀 Submitting to Relay Planner:', formData);
    
    try {
      // Validate required fields
      if (!formData.skill || !formData.email || !formData.userID) {
        throw new Error('Missing required fields: skill, email, or userID');
      }

      // Make POST request to Relay Planner webhook
      const response = await fetch(CONFIG.RELAY_PLANNER_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // Check if request was successful
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Planner webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Parse response
      const result = await response.text();
      console.log('✅ Planner response:', result);
      
      // Check if the response indicates completion
      // Look for common completion keywords in the response
      const completionKeywords = ['completed', 'done', 'finished', 'success', 'generated', 'ready'];
      const isCompleted = completionKeywords.some(keyword => 
        result.toLowerCase().includes(keyword)
      );
      
      return { 
        success: true, 
        flag: result,
        isCompleted: isCompleted,
        message: 'Successfully submitted to planner'
      };
      
    } catch (error) {
      console.error('❌ Planner submission failed:', error);
      throw new Error(`Failed to submit to planner: ${error.message}`);
    }
  }

  /**
   * Update the status of a specific task in Airtable
   * @param {string} recordId - Airtable record ID of the task
   * @param {string} status - New status ('Completed', 'Pending', 'In Progress')
   * @returns {Promise<Object>} Updated Airtable record
   * @throws {Error} If the update fails
   */
  static async updateTaskStatus(recordId, status) {
    console.log('🔄 Updating task status:', { recordId, status });
    
    try {
      // Validate inputs
      if (!recordId || !status) {
        throw new Error('Missing required parameters: recordId or status');
      }

      // Construct Airtable API URL
      const url = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_PROGRESS_TABLE}/${recordId}`;
      
      // Make PATCH request to update the record
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

      // Check if request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Airtable update error:', errorText);
        throw new Error(`Failed to update task: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Parse and return the updated record
      const result = await response.json();
      console.log('✅ Task updated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  /**
   * Fetch roadmap data for a specific user from Airtable
   * @param {string} userID - Unique user identifier
   * @returns {Promise<Object|null>} Roadmap data object or null if no data found
   * @throws {Error} If the fetch operation fails
   */
  static async fetchRoadmapData(userID) {
    console.log('📊 Fetching roadmap data for user:', userID);
    
    try {
      // Validate userID
      if (!userID) {
        throw new Error('UserID is required');
      }

      // Build URL with proper parameters
      const baseUrl = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_PROGRESS_TABLE}`;
      const params = new URLSearchParams();
      
      // Add filter formula - single quotes for string comparison in Airtable
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

      // Return null if no records found
      if (!allRecords || allRecords.length === 0) {
        console.log('📝 No records found for user:', userID);
        return null;
      }

      // Transform Airtable records to our application format
      const tasks = allRecords.map((record, index) => {
        const fields = record.fields;
        
        // Get the task description from various possible field names
        // Try different field names that might contain the task description
        let description = fields['Task Description'] || 
                         fields.Description || 
                         fields.Task || 
                         fields.Topic || 
                         fields.Title || 
                         '';
        
        // If still empty, try to construct from available data
        if (!description && fields.Theme) {
          description = `Learn ${fields.Theme}`;
        }
        
        // Final fallback to prevent empty descriptions
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

      // Return structured roadmap data
      return {
        skill: allRecords[0]?.fields?.Skill || 'Your Skill',
        userID: userID,
        tasks: tasks,
        totalWeeks: Math.max(...tasks.map(t => t.week)),
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'Completed').length
      };

    } catch (error) {
      console.error('❌ Failed to fetch roadmap data:', error);
      throw new Error(`Failed to fetch roadmap: ${error.message}`);
    }
  }

  /**
   * Poll for roadmap data until it's available or timeout is reached
   * @param {string} userID - Unique user identifier
   * @param {Function} onProgress - Callback function for progress updates
   * @param {Function} onSuccess - Callback function when data is successfully fetched
   * @param {Function} onError - Callback function when an error occurs
   */
  static async pollForData(userID, onProgress, onSuccess, onError) {
    let attempts = 0;
    
    // Internal polling function
    const poll = async () => {
      attempts++;
      console.log(`🔄 Polling attempt ${attempts}/${CONFIG.MAX_POLLING_ATTEMPTS}`);
      
      try {
        // Update progress callback
        onProgress(`Fetching your roadmap data... (${attempts}/${CONFIG.MAX_POLLING_ATTEMPTS})`);
        
        // Attempt to fetch roadmap data
        const roadmapData = await this.fetchRoadmapData(userID);
        
        // Check if we have valid data
        if (roadmapData && roadmapData.tasks && roadmapData.tasks.length > 0) {
          console.log(`🎉 Roadmap data found! (${roadmapData.tasks.length} tasks)`);
          onSuccess(roadmapData);
          return;
        }

        // Check if we've reached the maximum attempts
        if (attempts >= CONFIG.MAX_POLLING_ATTEMPTS) {
          throw new Error('Timeout: Could not fetch roadmap data. Please try again or contact support.');
        }

        // Schedule next poll attempt
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

  /**
   * Poll for roadmap data with initial delay
   * Useful when you want to wait before starting to poll
   * @param {string} userID - Unique user identifier
   * @param {Function} onProgress - Callback function for progress updates
   * @param {Function} onSuccess - Callback function when data is successfully fetched
   * @param {Function} onError - Callback function when an error occurs
   * @param {number} initialDelay - Delay in milliseconds before starting to poll
   */
  static async pollForDataWithDelay(userID, onProgress, onSuccess, onError, initialDelay = CONFIG.INITIAL_POLLING_DELAY) {
    console.log(`⏰ Waiting ${initialDelay}ms before starting to poll...`);
    onProgress('AI is processing your request...');
    
    setTimeout(() => {
      this.pollForData(userID, onProgress, onSuccess, onError);
    }, initialDelay);
  }

  /**
   * Get configuration values (useful for debugging or external access)
   * @returns {Object} Current configuration object
   */
  static getConfig() {
    return { ...CONFIG };
  }

  /**
   * Update configuration values
   * @param {Object} newConfig - New configuration values to merge
   */
  static updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    console.log('🔧 Configuration updated:', CONFIG);
  }

  /**
   * Validate form data before submission
   * @param {Object} formData - Form data to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  static validateFormData(formData) {
    const errors = [];
    
    if (!formData.skill || formData.skill.trim().length === 0) {
      errors.push('Skill is required');
    }
    
    if (!formData.email || formData.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!formData.userID || formData.userID.trim().length === 0) {
      errors.push('User ID is required');
    }
    
    if (!formData.goal || formData.goal.trim().length === 0) {
      errors.push('Learning goal is required');
    }
    
    if (!formData.level || formData.level.trim().length === 0) {
      errors.push('Current level is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

export default RoadmapService;
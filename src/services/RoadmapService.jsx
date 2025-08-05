// RoadmapService.js
// Centralized service for handling all roadmap-related API calls and data management

/**
 * Configuration object containing all API endpoints and settings
 * Replace these values with your actual configuration
 */
const CONFIG = {
  // Relay Planner Webhook URL - handles roadmap generation requests
  RELAY_PLANNER_WEBHOOK: 'https://hook.relay.app/api/v1/playbook/cmdxah9ve0af70plz622me4wd/trigger/tVZskzx09-uRTLYoBrWUpA',

  // Airtable configuration for storing and retrieving roadmap data
  AIRTABLE_BASE_ID: 'appQjqTJK6ZBf7lU0',
  AIRTABLE_PROGRESS_TABLE: 'Progress',
  AIRTABLE_USER_TABLE: 'Users',
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
   * Create a new user record in Airtable User table
   * @param {string} userID - Unique user identifier
   * @param {string} username - Username to save
   * @returns {Promise<Object>} Created Airtable record
   * @throws {Error} If the creation fails
   */
  static async createUserRecord(userID, username) {
    console.log('👤 Creating user record:', { userID, username });
    
    try {
      // Validate inputs
      if (!userID || !username) {
        throw new Error('Missing required parameters: userID or username');
      }

      // Construct Airtable API URL for User table
      const url = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_USER_TABLE}`;
      
      // Make POST request to create the record
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            "User ID": userID,
            "UserName": username,
          }
        })
      });

      // Check if request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Airtable user creation error:', errorText);
        throw new Error(`Failed to create user: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Parse and return the created record
      const result = await response.json();
      console.log('✅ User created successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to create user record:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Update username for an existing user in Airtable
   * @param {string} userID - Unique user identifier
   * @param {string} newUsername - New username to set
   * @returns {Promise<Object>} Updated Airtable record
   * @throws {Error} If the update fails
   */
  static async updateUsername(userID, newUsername) {
    console.log('✏️ Updating username:', { userID, newUsername });
    
    try {
      // Validate inputs
      if (!userID || !newUsername) {
        throw new Error('Missing required parameters: userID or newUsername');
      }

      // First, find the user record by filtering with User ID
      const baseUrl = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_USER_TABLE}`;
      const params = new URLSearchParams();
      params.append('filterByFormula', `{User ID} = '${userID}'`);
      params.append('maxRecords', '1');
      
      const fetchUrl = `${baseUrl}?${params.toString()}`;
      
      const fetchResponse = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`
        }
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('❌ Failed to find user record:', errorText);
        throw new Error(`Failed to find user: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }

      const fetchData = await fetchResponse.json();
      
      if (!fetchData.records || fetchData.records.length === 0) {
        throw new Error('User not found. Cannot update username for non-existent user.');
      }

      const recordId = fetchData.records[0].id;
      console.log('📝 Found user record ID:', recordId);

      // Now update the username using the record ID
      const updateUrl = `${baseUrl}/${recordId}`;
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            UserName: newUsername,
          }
        })
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ Airtable username update error:', errorText);
        throw new Error(`Failed to update username: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`);
      }

      const result = await updateResponse.json();
      console.log('✅ Username updated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to update username:', error);
      throw new Error(`Failed to update username: ${error.message}`);
    }
  }

  /**
   * Update all "New User" entries to actual username
   * Specifically designed to replace "New User" placeholder with real names
   * @param {string} userID - Unique user identifier
   * @param {string} actualUsername - The real username to replace "New User" with
   * @returns {Promise<Object>} Updated Airtable record
   * @throws {Error} If the update fails
   */
  static async updateNewUserToActualName(userID, actualUsername) {
    console.log('🔄 Replacing "New User" with actual name:', { userID, actualUsername });
    
    try {
      // Validate inputs
      if (!userID || !actualUsername) {
        throw new Error('Missing required parameters: userID or actualUsername');
      }

      // Trim the username to avoid whitespace issues
      const cleanUsername = actualUsername.trim();
      
      if (cleanUsername.length === 0) {
        throw new Error('Username cannot be empty or just whitespace');
      }

      // First, verify the user exists and currently has "New User"
      const userProfile = await this.fetchUserProfile(userID);
      
      if (!userProfile) {
        throw new Error('User not found. Cannot update username for non-existent user.');
      }

      console.log('👤 Current user profile:', userProfile);
      
      // Check if current username is "New User" (case-insensitive check)
      const currentUsername = userProfile.username || '';
      if (currentUsername.toLowerCase() !== 'new user') {
        console.log('ℹ️ Username is not "New User", updating anyway:', currentUsername);
      }

      // Update the username
      const result = await this.updateUsername(userID, cleanUsername);
      console.log('✅ Successfully updated "New User" to:', cleanUsername);
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to update New User to actual name:', error);
      throw new Error(`Failed to update username: ${error.message}`);
    }
  }

  /**
   * Fetch user profile data from Airtable User table
   * @param {string} userID - Unique user identifier
   * @returns {Promise<Object|null>} User profile data or null if not found
   * @throws {Error} If the fetch operation fails
   */
  static async fetchUserProfile(userID) {
    console.log('👤 Fetching user profile for:', userID);
    
    try {
      // Validate userID
      if (!userID) {
        throw new Error('UserID is required');
      }

      // Build URL with filter parameters
      const baseUrl = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_USER_TABLE}`;
      const params = new URLSearchParams();
      
      // Add filter formula for UserID
      params.append('filterByFormula', `{User ID} = '${userID}'`);
      params.append('maxRecords', '1'); // We only expect one user record
      
      const url = `${baseUrl}?${params.toString()}`;
      console.log('📡 Fetching user from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Airtable user fetch error:', errorText);
        throw new Error(`Airtable API failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 User fetch response:', data);

      // Return null if no user found
      if (!data.records || data.records.length === 0) {
        console.log('👤 No user found for userID:', userID);
        return null;
      }

      // Transform the first record to our application format
      const record = data.records[0];
      const userProfile = {
        recordId: record.id,
        userID: record.fields["User ID"],
        username: record.fields.UserName
      };

      console.log('✅ User profile fetched:', userProfile);
      return userProfile;

    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  /**
   * Fetch skill name for a specific user from Airtable User table
   * @param {string} userID - Unique user identifier
   * @returns {Promise<string|null>} Skill name or null if not found
   * @throws {Error} If the fetch operation fails
   */
  static async fetchUserSkill(userID) {
    console.log('🎯 Fetching user skill for:', userID);
    
    try {
      // Validate userID
      if (!userID) {
        throw new Error('UserID is required');
      }

      // Build URL with filter parameters
      const baseUrl = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.AIRTABLE_USER_TABLE}`;
      const params = new URLSearchParams();
      
      // Add filter formula for UserID
      params.append('filterByFormula', `{User ID} = '${userID}'`);
      params.append('maxRecords', '1'); // We only expect one user record
      
      const url = `${baseUrl}?${params.toString()}`;
      console.log('📡 Fetching user skill from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Airtable user skill fetch error:', errorText);
        throw new Error(`Airtable API failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 User skill fetch response:', data);

      // Return null if no user found
      if (!data.records || data.records.length === 0) {
        console.log('🎯 No user found for skill fetch, userID:', userID);
        return null;
      }

      // Extract skill from the user record
      const record = data.records[0];
      const skill = record.fields.Skill || null;

      console.log('✅ User skill fetched:', skill);
      return skill;

    } catch (error) {
      console.error('❌ Failed to fetch user skill:', error);
      throw new Error(`Failed to fetch user skill: ${error.message}`);
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
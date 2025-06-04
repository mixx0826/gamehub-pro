/**
 * Storage utility for managing game scores and user data using localStorage
 */

/**
 * Save a game score to localStorage
 * @param {string} gameId - The identifier for the game
 * @param {Object} scoreData - Score data object with username, score, and date
 */
export const saveScore = (gameId, scoreData) => {
  try {
    // Get existing scores
    const existingScores = getScores(gameId);
    
    // Add new score
    const updatedScores = [...existingScores, scoreData];
    
    // Sort scores by highest first
    updatedScores.sort((a, b) => b.score - a.score);
    
    // Save back to localStorage
    localStorage.setItem(`game_${gameId}_scores`, JSON.stringify(updatedScores));
    
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
};

/**
 * Get scores for a specific game
 * @param {string} gameId - The identifier for the game
 * @param {number} limit - Maximum number of scores to return (optional)
 * @returns {Array} Array of score objects
 */
export const getScores = (gameId, limit = 0) => {
  try {
    const scores = JSON.parse(localStorage.getItem(`game_${gameId}_scores`) || '[]');
    return limit > 0 ? scores.slice(0, limit) : scores;
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
};

/**
 * Get the current user's best score for a game
 * @param {string} gameId - The identifier for the game
 * @param {string} username - The username to look for
 * @returns {Object|null} The user's best score or null if not found
 */
export const getUserBestScore = (gameId, username) => {
  if (!username) return null;
  
  try {
    const scores = getScores(gameId);
    const userScores = scores.filter(score => score.username === username);
    
    if (userScores.length === 0) return null;
    
    // Sort by score (highest first) and return the first one
    userScores.sort((a, b) => b.score - a.score);
    return userScores[0];
  } catch (error) {
    console.error('Error getting user best score:', error);
    return null;
  }
};

/**
 * Delete all scores for a specific game
 * @param {string} gameId - The identifier for the game
 * @returns {boolean} True if successful
 */
export const clearScores = (gameId) => {
  try {
    localStorage.removeItem(`game_${gameId}_scores`);
    return true;
  } catch (error) {
    console.error('Error clearing scores:', error);
    return false;
  }
};

/**
 * Save game settings to localStorage
 * @param {string} gameId - The identifier for the game
 * @param {Object} settings - Settings object
 */
export const saveSettings = (gameId, settings) => {
  try {
    localStorage.setItem(`game_${gameId}_settings`, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Get settings for a specific game
 * @param {string} gameId - The identifier for the game
 * @returns {Object} Settings object or default empty object
 */
export const getSettings = (gameId) => {
  try {
    return JSON.parse(localStorage.getItem(`game_${gameId}_settings`) || '{}');
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
};
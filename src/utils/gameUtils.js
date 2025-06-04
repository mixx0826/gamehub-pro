// Utility functions for games
import { categories } from '../data/categories';

/**
 * Get category name by ID
 * @param {number} categoryId - The category ID
 * @returns {string} The category name or "Unknown" if not found
 */
export const getCategoryName = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : "Unknown";
};

/**
 * Format a number with commas for thousands
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format date to a readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If less than a day ago, show hours/minutes
  if (now - date < 24 * 60 * 60 * 1000) {
    const hours = Math.floor((now - date) / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor((now - date) / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Otherwise show the date
  return date.toLocaleDateString();
};

/**
 * Generate a random color
 * @returns {string} A random hex color
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Check if a device is mobile based on screen size
 * @returns {boolean} True if device is likely mobile
 */
export const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

/**
 * Check collision between two objects
 * @param {Object} obj1 - First object with x, y, width, height
 * @param {Object} obj2 - Second object with x, y, width, height
 * @returns {boolean} True if objects are colliding
 */
export const checkCollision = (obj1, obj2) => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
};
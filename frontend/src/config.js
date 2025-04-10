export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Function to get the base URL without /api for static files
export const getBaseUrl = () => {
  return API_URL.replace('/api', '');
};

// Function to construct the correct URL for static files
export const getStaticFileUrl = (path) => {
  if (!path) return null;
  
  // If it's a data URL (base64), return it directly
  if (path.startsWith('data:')) {
    return path;
  }
  
  // If it's a relative URL, add the base URL
  if (path.startsWith('/')) {
    return `${getBaseUrl()}${path}`;
  }
  
  // If it's already a full URL, return it
  return path;
}; 
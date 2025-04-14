export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Function to get the base URL without /api for static files
export const getBaseUrl = () => {
  return API_URL.replace('/api', '');
};

// Function to construct the correct URL for static files
export const getStaticFileUrl = (path) => {
  if (!path) return '/default-avatar.png';
  
  // If it's a data URL (base64), return it directly
  if (path.startsWith('data:')) {
    return path;
  }
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }
  
  // Clean the path
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  
  // If it's a relative URL, ensure it starts with uploads/profiles
  const normalizedPath = cleanPath.startsWith('uploads/') ? `/${cleanPath}` : `/uploads/profiles/${cleanPath}`;
  
  // Add cache-busting parameter to prevent caching issues
  const timestamp = new Date().getTime();
  const url = `${getBaseUrl()}${normalizedPath}?t=${timestamp}`;
  
  // Validate the URL
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid URL:', url, 'for path:', path);
    return '/default-avatar.png';
  }
}; 
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful! You are now logged in.');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Determine if this is a file upload or a data update
      const isFileUpload = formData instanceof FormData && formData.has('profilePicture');
      
      // Set the appropriate content type
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      // Convert FormData to JSON if it's not a file upload
      let data = formData;
      if (!isFileUpload && formData instanceof FormData) {
        const jsonData = {};
        for (const [key, value] of formData.entries()) {
          jsonData[key] = value;
        }
        data = jsonData;
        headers['Content-Type'] = 'application/json';
      }
      
      console.log('Updating profile with data:', isFileUpload ? 'FormData with file' : data);
      
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        data,
        { headers }
      );
      
      console.log('Profile update response:', response.data);
      
      // Update the user state with the new data
      setUser({
        ...response.data,
        interests: response.data.interests || [],
        skills: response.data.skills || [],
        endorsements: response.data.endorsements || []
      });
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
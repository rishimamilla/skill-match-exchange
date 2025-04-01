import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePictureUpload = ({ onUpload, previewUrl: initialPreviewUrl }) => {
  const [preview, setPreview] = useState(initialPreviewUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Update preview when initialPreviewUrl changes
  useEffect(() => {
    setPreview(initialPreviewUrl);
  }, [initialPreviewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setSelectedFile(file);
        onUpload(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const getProfilePictureUrl = () => {
    if (preview) {
      return preview;
    }
    if (user?.profilePicture) {
      return user.profilePicture.startsWith('data:') 
        ? user.profilePicture 
        : `${process.env.REACT_APP_API_URL}${user.profilePicture}`;
    }
    return '/default-avatar.png';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div
          className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200"
          onClick={handleClick}
        >
          <img
            src={getProfilePictureUrl()}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        </div>
        <button
          onClick={handleClick}
          className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Click to upload a new profile picture
      </p>
    </div>
  );
};

export default ProfilePictureUpload; 
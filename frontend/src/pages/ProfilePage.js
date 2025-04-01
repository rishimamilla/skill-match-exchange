import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfilePictureUpload from '../components/profile/ProfilePictureUpload';
import SocialLinks from '../components/profile/SocialLinks';
import Achievements from '../components/profile/Achievements';
import SkillsAndEndorsements from '../components/profile/SkillsAndEndorsements';
import { updateProfile } from '../api/authAPI';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    interests: user?.interests || [],
    socialLinks: user?.socialLinks || {},
    achievements: user?.achievements || [],
    skills: user?.skills || [],
    endorsements: user?.endorsements || [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: user.interests || [],
        socialLinks: user.socialLinks || {},
        achievements: user.achievements || [],
        skills: user.skills || [],
        endorsements: user.endorsements || [],
      });
      setPreviewUrl(user.profilePicture || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map((interest) => interest.trim());
    setFormData((prev) => ({
      ...prev,
      interests,
    }));
  };

  const handleProfilePictureUpload = (file, preview) => {
    setProfilePicture(file);
    setPreviewUrl(preview);
  };

  const handleSkillsUpdate = (action) => {
    switch (action.type) {
      case 'ADD_SKILL':
        setFormData((prev) => ({
          ...prev,
          skills: [...(prev.skills || []), action.payload],
        }));
        break;
      case 'DELETE_SKILL':
        setFormData((prev) => ({
          ...prev,
          skills: (prev.skills || []).filter((skill) => skill._id !== action.payload),
        }));
        break;
      case 'ADD_ENDORSEMENT':
        setFormData((prev) => ({
          ...prev,
          endorsements: [...(prev.endorsements || []), action.payload],
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('location', formData.location);
      
      // Add arrays as JSON strings
      formDataToSend.append('interests', JSON.stringify(formData.interests));
      formDataToSend.append('skills', JSON.stringify(formData.skills || []));
      formDataToSend.append('endorsements', JSON.stringify(formData.endorsements || []));
      
      // Add profile picture if changed
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const success = await updateProfile(formDataToSend);
      if (success) {
        setProfilePicture(null);
        setPreviewUrl(user?.profilePicture || null);
        setIsEditing(false);
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <ProfilePictureUpload 
              onUpload={handleProfilePictureUpload}
              previewUrl={previewUrl}
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="interests"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Interests (comma-separated)
            </label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={formData.interests.join(', ')}
              onChange={handleInterestsChange}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <SocialLinks
            links={formData.socialLinks}
            onUpdate={(links) =>
              setFormData((prev) => ({ ...prev, socialLinks: links }))
            }
          />

          <Achievements
            achievements={formData.achievements}
            onUpdate={(achievements) =>
              setFormData((prev) => ({ ...prev, achievements }))
            }
          />

          <SkillsAndEndorsements
            skills={formData.skills}
            endorsements={formData.endorsements}
            onUpdate={handleSkillsUpdate}
          />

          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setProfilePicture(null);
                  setPreviewUrl(user?.profilePicture || null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 
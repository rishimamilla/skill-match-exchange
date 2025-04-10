import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiMapPin, FiEdit2, FiSave, FiX, FiAward, FiStar } from 'react-icons/fi';
import SkillsSection from '../components/SkillsSection';
import ProfilePictureUpload from '../components/profile/ProfilePictureUpload';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [skillsChanged, setSkillsChanged] = useState(false);
  const [stats, setStats] = useState({
    skillsOffering: 0,
    skillsNeeded: 0,
    totalExchanges: 0,
    rating: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || ''
      });
      
      updateStats();
    }
  }, [user]);

  const updateStats = () => {
    if (!user) return;

    const skillsOffering = user.skills?.filter(skill => skill.status === 'teaching').length || 0;
    const skillsNeeded = user.skills?.filter(skill => skill.status === 'learning').length || 0;
    
    setStats({
      skillsOffering,
      skillsNeeded,
      totalExchanges: user.totalExchanges || 0,
      rating: user.rating || 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await updateProfile({
        ...formData
      });

      if (!updatedUser) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = (updatedSkills) => {
    setSkillsChanged(true);
    // The user context will be updated by the SkillsSection component
    // We just need to update the stats
    updateStats();
  };

  const handleProfilePictureUpload = async (file) => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Log the file being uploaded
      console.log('Uploading file:', file.name, file.type, file.size);
      
      const success = await updateProfile(formData);
      
      if (success) {
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <FiEdit2 className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  <FiSave className="mr-2" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  <FiX className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <ProfilePictureUpload 
                  onUpload={handleProfilePictureUpload}
                  previewUrl={user?.profilePicture || null}
                />
                {loading && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Uploading...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm ${
                      !isEditing
                        ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm ${
                      !isEditing
                        ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm ${
                      !isEditing
                        ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm ${
                      !isEditing
                        ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Skills Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Skills
          </h2>
          <SkillsSection onSkillsChange={handleSkillsChange} />
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {stats.skillsOffering}
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-300">Skills Offering</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                {stats.skillsNeeded}
              </div>
              <div className="text-sm text-green-600 dark:text-green-300">Skills Needed</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                {stats.totalExchanges}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-300">Total Exchanges</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                {stats.rating.toFixed(1)}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-300">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
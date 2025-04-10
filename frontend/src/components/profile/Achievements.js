import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const AchievementForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    icon: '🏆',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      date: new Date(formData.date),
    });
    setFormData({
      title: '',
      description: '',
      date: '',
      icon: '🏆',
    });
    toast.success('Achievement added successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="icon"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Icon
        </label>
        <input
          type="text"
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Achievement
        </button>
      </div>
    </form>
  );
};

const Achievements = ({ achievements, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (achievement) => {
    onUpdate([...achievements, achievement]);
    setIsAdding(false);
  };

  const handleDelete = (index) => {
    const newAchievements = achievements.filter((_, i) => i !== index);
    onUpdate(newAchievements);
    toast.success('Achievement removed successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Achievements
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Achievement
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <AchievementForm
            onAdd={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {new Date(achievement.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(index)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements; 
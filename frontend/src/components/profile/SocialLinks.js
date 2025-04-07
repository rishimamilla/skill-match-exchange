import React from 'react';
import { toast } from 'react-hot-toast';

const SocialLinks = ({ links, onUpdate }) => {
  const handleChange = (platform, value) => {
    onUpdate({
      ...links,
      [platform]: value,
    });
    toast.success(`${platform} link updated successfully`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Social Media Links
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="github"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            GitHub
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
              github.com/
            </span>
            <input
              type="text"
              id="github"
              value={links.github || ''}
              onChange={(e) => handleChange('github', e.target.value)}
              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="username"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="linkedin"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            LinkedIn
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
              linkedin.com/in/
            </span>
            <input
              type="text"
              id="linkedin"
              value={links.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="username"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="twitter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Twitter
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
              twitter.com/
            </span>
            <input
              type="text"
              id="twitter"
              value={links.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="username"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Website
          </label>
          <div className="mt-1">
            <input
              type="url"
              id="website"
              value={links.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks; 
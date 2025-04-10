import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import skillAPI from '../api/skillAPI';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const SkillSearch = ({ onSelect, placeholder = "Search skills...", disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await skillAPI.searchSkills(debouncedSearchTerm);
        setSuggestions(result.skills || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError(error.message || 'Failed to fetch suggestions');
        setSuggestions([]);
        toast.error(error.message || 'Failed to fetch suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    if (!disabled) {
      fetchSuggestions();
    }
  }, [debouncedSearchTerm, disabled]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setError(null);
  };

  const handleSuggestionClick = (skill) => {
    if (disabled) return;
    
    onSelect(skill);
    setSearchTerm('');
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-md border px-3 py-2 pl-10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-300 dark:border-gray-600' 
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
          } ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {isLoading ? (
          <FiLoader className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
        ) : (
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
        {searchTerm && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {showDropdown && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((skill, index) => (
                <li
                  key={skill._id || index}
                  onClick={() => handleSuggestionClick(skill)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                >
                  <div className="font-medium">{skill.name}</div>
                  {skill.category && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {skill.category}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No skills found matching "{searchTerm}"
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Start typing to search for skills
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillSearch; 
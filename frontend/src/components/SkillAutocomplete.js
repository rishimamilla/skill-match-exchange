import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import skillAPI from '../api/skillAPI';
import { debounce } from 'lodash';

const SkillAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Search for a skill...", 
  disabled = false,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Debounced search function
  const searchSkills = debounce(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await skillAPI.searchSkills(query);
      setSuggestions(response.skills || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching skills:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    if (newValue.trim().length >= 2) {
      searchSkills(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion.name);
    onSelect(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {inputValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearInput}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              type="button"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (inputValue.length >= 2) && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {isLoading ? (
              <li className="px-4 py-2 text-gray-500 dark:text-gray-400">Loading...</li>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <li
                  key={suggestion._id || index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <span className="ml-3 block truncate text-gray-900 dark:text-white">
                      {suggestion.name}
                    </span>
                    {suggestion.category && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({suggestion.category})
                      </span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500 dark:text-gray-400">No skills found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkillAutocomplete; 
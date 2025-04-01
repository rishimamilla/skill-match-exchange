import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import searchAPI from '../api/searchAPI';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'users');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    skills: searchParams.get('skills') || '',
    location: searchParams.get('location') || '',
    minRating: searchParams.get('minRating') || '',
    skillLevel: searchParams.get('skillLevel') || '',
    category: searchParams.get('category') || '',
    page: searchParams.get('page') || 1
  });
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState({ skills: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !filters.skills && !filters.location) return;

      setLoading(true);
      setError(null);

      try {
        const response = searchType === 'users'
          ? await searchAPI.searchUsers({ ...filters, q: query })
          : await searchAPI.searchSkills({ ...filters, q: query });

        setResults(response[searchType]);
        setPagination(response.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [query, filters, searchType]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) return;

      try {
        const response = await searchAPI.getSuggestions(query);
        setSuggestions(response.suggestions);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams({
      type: searchType,
      q: query,
      ...filters
    });
    setSearchParams(newParams);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              searchType === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSearchType('users')}
          >
            Search Users
          </button>
          <button
            className={`px-4 py-2 rounded ${
              searchType === 'skills'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSearchType('skills')}
          >
            Search Skills
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${searchType}...`}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {suggestions[searchType].length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1">
                {suggestions[searchType].map((item) => (
                  <div
                    key={item._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setQuery(item.name)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {searchType === 'users' ? (
              <>
                <input
                  type="text"
                  name="skills"
                  value={filters.skills}
                  onChange={handleFilterChange}
                  placeholder="Skills (comma-separated)"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Location"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  placeholder="Minimum Rating"
                  className="px-4 py-2 border rounded-lg"
                />
                <select
                  name="skillLevel"
                  value={filters.skillLevel}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </>
            ) : (
              <>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="business">Business</option>
                </select>
                <select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </>
            )}
          </div>

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}

      {!loading && !error && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                {searchType === 'users' ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {item.location}
                    </p>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{item.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill._id}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                        {item.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                        {item.level}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage; 
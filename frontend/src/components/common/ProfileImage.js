import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getStaticFileUrl } from '../../config';

const ProfileImage = ({ src, alt, className, size = 'full' }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const loadImage = useCallback(async () => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      
      // Get the URL with cache-busting parameter
      const url = getStaticFileUrl(src);
      
      // Create a new image object to preload
      const img = new Image();
      
      img.onload = () => {
        setImgSrc(url);
        setIsLoading(false);
        setHasError(false);
      };
      
      img.onerror = () => {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          // Retry after a short delay with a new cache-busting parameter
          setTimeout(() => loadImage(), 500);
        } else {
          setHasError(true);
          setIsLoading(false);
          // Set default avatar on error
          setImgSrc('/default-avatar.png');
        }
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error loading image:', error);
      setHasError(true);
      setIsLoading(false);
      // Set default avatar on error
      setImgSrc('/default-avatar.png');
    }
  }, [src]);

  useEffect(() => {
    loadImage();
    return () => {
      imgRef.current = null;
    };
  }, [loadImage]);

  const sizeClasses = {
    'xs': 'w-8 h-8',
    'sm': 'w-12 h-12',
    'md': 'w-16 h-16',
    'lg': 'w-24 h-24',
    'xl': 'w-32 h-32',
    'full': 'w-full h-full'
  };

  const containerSize = sizeClasses[size] || sizeClasses['full'];

  return (
    <div 
      ref={imgRef}
      className={`relative ${containerSize} ${className || ''} overflow-hidden rounded-full bg-gray-100`}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 animate-pulse">
          <div className="w-1/2 h-1/2 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </div>
      )}

      {/* Image */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt || 'Profile'}
          className={`w-full h-full object-cover ${hasError ? 'opacity-50' : ''}`}
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            if (!hasError) {
              setHasError(true);
              e.target.src = '/default-avatar.png';
            }
          }}
        />
      )}

      {/* Error state with default avatar */}
      {hasError && !imgSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <div className="w-1/2 h-1/2 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImage; 
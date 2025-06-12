import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, X, MapPin, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';

export function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createPost, isLoading, error } = usePostStore();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]); // Track hashtags for UI feedback
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup media preview URLs on component unmount
  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaPreviewUrls]);

  // Update hashtags when content changes
  useEffect(() => {
    const extractedHashtags = content.match(/#[^\s#]+/g) || [];
    setHashtags(extractedHashtags);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleMediaSelect = () => {
    if (mediaFiles.length >= 4) {
      alert('You can upload a maximum of 4 files.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
      const newFiles = Array.from(e.target.files).filter(
        file => allowedFormats.includes(file.type) && file.size <= 10 * 1024 * 1024
      );
      if (newFiles.length !== e.target.files.length) {
        alert('Some files were invalid. Only JPG, PNG, JPEG, MP4 files up to 10MB are allowed.');
      }
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setMediaFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, 4));
      setMediaPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls].slice(0, 4));
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleLocationTag = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
      },
      (error) => {
        let message = 'Failed to get location. Please allow location access.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access denied. Please enable location permissions in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'The request to get location timed out.';
        }
        alert(message);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) {
      alert('Please provide content or media to create a post.');
      return;
    }

    try {
      await createPost(content, mediaFiles, location);
      navigate(`/profile/${user?.username}`, { state: { fromCreatePost: true } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create post';
      console.error('Failed to create post:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert(errorMessage);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 mb-16 md:mb-0">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Create New Post</h1>
        <div className="w-8"></div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-3 mb-4">
          <Avatar src={user.avatar} alt={user.displayName} size="md" />
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{user.displayName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
        </div>
        <textarea
          className="w-full p-2 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none resize-none min-h-[150px] text-lg border-0 focus:ring-0"
          placeholder="What's on your mind? Add hashtags with # (e.g., #photography)"
          value={content}
          onChange={handleContentChange}
          rows={6}
        />
        {mediaPreviewUrls.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {mediaPreviewUrls.map((url, index) => (
              <div key={index} className="relative rounded-md overflow-hidden aspect-square">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1.5"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        {hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {hashtags.map((hashtag, index) => (
              <span
                key={index}
                className="text-sm text-blue-500 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded"
              >
                {hashtag}
              </span>
            ))}
          </div>
        )}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,video/mp4"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="flex items-center text-gray-500 dark:text-gray-300 hover:text-blue-500"
                onClick={handleMediaSelect}
              >
                <Image size={20} />
              </button>
              <button
                type="button"
                className="flex items-center text-gray-500 dark:text-gray-300 hover:text-blue-500"
                onClick={handleLocationTag}
              >
                <MapPin size={20} />
              </button>
              <button
                type="button"
                className="flex items-center text-gray-500 dark:text-gray-300 hover:text-blue-500"
                onClick={() => alert('User tagging not implemented yet')}
              >
                <Tag size={20} />
              </button>
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || (!content.trim() && mediaFiles.length === 0)}
              className="px-5"
            >
              Post
            </Button>
          </div>
          {location && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <MapPin size={14} className="mr-1" />
              {location}
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Add hashtags with # to categorize your post (e.g., #photography)
          </div>
        </div>
      </form>
    </div>
  );
}
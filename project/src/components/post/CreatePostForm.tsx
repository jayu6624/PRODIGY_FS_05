import React, { useState, useRef, useEffect } from 'react';
import { Image, X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';

export function CreatePostForm() {
  const { user } = useAuthStore();
  const { createPost, isLoading, error } = usePostStore();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaPreviewUrls]);

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
      const newFiles = Array.from(e.target.files).filter(file => file.size <= 10 * 1024 * 1024);
      if (newFiles.length !== e.target.files.length) {
        alert('Some files were too large (max 10MB per file).');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    try {
      await createPost(content, mediaFiles);
      setContent('');
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaFiles([]);
      setMediaPreviewUrls([]);
    } catch (error: any) {
      console.error('Failed to create post:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Avatar src={user.avatar} alt={user.displayName} size="sm" />
        <div className="flex-1">
          <textarea
            className="w-full p-2 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none resize-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
            rows={2}
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
                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMediaSelect}
              >
                <Image size={20} className="text-blue-500" />
              </Button>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              disabled={isLoading || (!content.trim() && mediaFiles.length === 0)}
              rightIcon={<Send size={16} />}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
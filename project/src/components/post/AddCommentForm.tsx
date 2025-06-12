import React, { useState } from 'react';
import { Post } from '../../types';
import { usePostStore } from '../../store/postStore';
import { Button } from '../ui/Button';

interface AddCommentFormProps {
  post: Post;
}

export function AddCommentForm({ post }: AddCommentFormProps) {
  const { addComment } = usePostStore();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      await addComment(post.id, content);
      setContent('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-800 dark:text-gray-200"
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" variant="primary" size="sm">
          Post
        </Button>
      </div>
    </form>
  );
}
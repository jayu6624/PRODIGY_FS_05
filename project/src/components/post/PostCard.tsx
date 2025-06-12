import React from 'react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { MessageCircle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onCommentClick: (post: Post) => void;
}

export function PostCard({ post, onCommentClick }: PostCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={post.author.avatar} alt={post.author.username} size="sm" />
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">{post.author.username}</p>
          {post.location && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <span className="mr-1">📍</span> {post.location}
            </p>
          )}
        </div>
      </div>
      {post.content && (
        <p className="mb-3 text-gray-800 dark:text-gray-200">
          {post.content}
        </p>
      )}
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={post.media[0].url}
            alt={post.content}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map((tag, index) => (
            <span key={index} className="text-sm text-blue-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
        <button
          onClick={() => onCommentClick(post)}
          className="flex items-center gap-1 hover:text-blue-500"
        >
          <MessageCircle size={18} />
          <span>{post.comments.length} Comments</span>
        </button>
      </div>
    </div>
  );
}
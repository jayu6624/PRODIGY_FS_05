import React from 'react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';

interface CommentListProps {
  post: Post;
}

export function CommentList({ post }: CommentListProps) {
  return (
    <div className="space-y-3">
      {post.comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No comments yet.
        </p>
      ) : (
        post.comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar
              src={comment.author.avatar}
              alt={comment.author.username}
              size="xs"
            />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{comment.author.username}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
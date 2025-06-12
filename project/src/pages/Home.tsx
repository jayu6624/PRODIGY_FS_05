import React, { useEffect, useState } from 'react';
import { usePostStore } from '../store/postStore';
import { CreatePostForm } from '../components/post/CreatePostForm';
import { PostCard } from '../components/post/PostCard';
import { CommentList } from '../components/post/CommentList';
import { AddCommentForm } from '../components/post/AddCommentForm';
import { Post } from '../types';
import { X } from 'lucide-react';

export function Home() {
  const { posts, fetchPosts, isLoading } = usePostStore();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
  };

  return (
    <div className="container-app py-4 mb-16 md:mb-0">
      <CreatePostForm />
      
      {isLoading && posts.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-r-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onCommentClick={handleCommentClick}
            />
          ))}
        </div>
      )}
      
      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Comments</h3>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              <CommentList post={selectedPost} />
            </div>
            
            <div className="border-t p-4">
              <AddCommentForm post={selectedPost} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
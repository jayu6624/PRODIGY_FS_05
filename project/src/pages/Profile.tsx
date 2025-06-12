import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import { ProfileHeader } from '../components/user/ProfileHeader';
import { PostCard } from '../components/post/PostCard';
import { CommentList } from '../components/post/CommentList';
import { AddCommentForm } from '../components/post/AddCommentForm';
import { Post } from '../types';
import { X, Grid, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';

export function Profile() {
  const { user } = useAuthStore();
  const { posts, fetchPosts } = usePostStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  useEffect(() => {
    // Re-fetch posts if coming from create-post or on mount
    const fromCreatePost = location.state?.fromCreatePost;
    fetchPosts();
  }, [fetchPosts, location]);
  
  const userPosts = posts.filter(post => post.author.username === user?.username);
  
  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
  };
  
  if (!user) return null;
  
  return (
    <div className="pb-16 md:pb-0">
      <ProfileHeader user={user} />
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'posts' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'saved' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            Saved
          </button>
          <button 
            onClick={() => setActiveTab('tagged')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'tagged' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            Tagged
          </button>
        </div>
        
        {/* View Type Switcher */}
        <div className="flex justify-end mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-1.5 rounded ${
                viewType === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500'
              }`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={`p-1.5 rounded ${
                viewType === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500'
              }`}
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        {activeTab === 'posts' && (
          <>
            {userPosts.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="font-medium text-lg mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  When you create posts, they'll appear here.
                </p>
                <Button variant="primary" onClick={() => navigate('/create-post')}>
                  Create your first post
                </Button>
              </div>
            ) : viewType === 'grid' ? (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map(post => (
                  <div 
                    key={post.id} 
                    className="aspect-square cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.media && post.media[0] ? (
                      <img 
                        src={post.media[0].url} 
                        alt={post.content}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 p-2 text-center line-clamp-4">
                          {post.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onCommentClick={handleCommentClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'saved' && (
          <div className="text-center py-8">
            <h3 className="font-medium text-lg mb-2">No saved posts</h3>
            <p className="text-gray-500 dark:text-gray-400">
              When you save posts, they'll appear here.
            </p>
          </div>
        )}
        
        {activeTab === 'tagged' && (
          <div className="text-center py-8">
            <h3 className="font-medium text-lg mb-2">No tagged posts</h3>
            <p className="text-gray-500 dark:text-gray-400">
              When you're tagged in posts, they'll appear here.
            </p>
          </div>
        )}
      </div>
      
      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white dark:bg-gray-900 max-w-3xl w-full max-h-[90vh] rounded-lg overflow-hidden flex flex-col md:flex-row">
            {/* Media Section */}
            {selectedPost.media && selectedPost.media.length > 0 ? (
              <div className="md:w-1/2 bg-black flex items-center justify-center">
                <img 
                  src={selectedPost.media[0].url} 
                  alt={selectedPost.content}
                  className="max-h-[50vh] md:max-h-[90vh] w-full object-contain"
                />
              </div>
            ) : (
              <div className="md:w-1/2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedPost.content}
                </p>
              </div>
            )}
            
            {/* Comments Section */}
            <div className="md:w-1/2 flex flex-col max-h-[50vh] md:max-h-[90vh]">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Post Details</h3>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-1 text-gray-500 hover:text-gray-700"
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
        </div>
      )}
    </div>
  );
}
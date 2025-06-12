import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { usePostStore } from '../store/postStore';
import { Post } from '../types';

export function Explore() {
  const { posts, fetchPosts, isLoading } = usePostStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  
  const popularTags = [
    'photography', 'travel', 'food', 'fitness', 
    'fashion', 'design', 'music', 'art', 'technology'
  ];
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = posts.filter(post => 
        post.content.toLowerCase().includes(lowercaseQuery) || 
        post.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        post.author.displayName.toLowerCase().includes(lowercaseQuery) ||
        post.author.username.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);
  
  return (
    <div className="container-app py-4 mb-16 md:mb-0">
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search posts, tags, or users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {!searchQuery && (
        <>
          <h2 className="text-lg font-semibold mb-4">Popular tags</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </>
      )}
      
      <h2 className="text-lg font-semibold mb-4">
        {searchQuery ? `Search results for "${searchQuery}"` : 'Explore posts'}
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-r-transparent" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {filteredPosts.map(post => (
            <div key={post.id} className="aspect-square relative group cursor-pointer">
              {post.media && post.media[0] ? (
                <img 
                  src={post.media[0].url} 
                  alt={post.content}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
                  <p className="text-sm text-center line-clamp-4">{post.content}</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 fill-current" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                    <span>{post.commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>{searchQuery ? 'No results found' : 'No posts to explore'}</p>
        </div>
      )}
    </div>
  );
}
import { create } from 'zustand';
import axios from 'axios';
import { Post } from '../types';

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  createPost: (content: string, mediaFiles: File[], location?: string) => Promise<void>;
  fetchPosts: () => Promise<void>;
  fetchUserPosts: (username: string) => Promise<Post[]>;
  addComment: (postId: string, content: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  createPost: async (content: string, mediaFiles: File[], location?: string) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (location) formData.append('location', location);
      mediaFiles.forEach(file => formData.append('media', file));

      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Normalize _id to id
      const newPost = {
        ...response.data,
        id: response.data._id,
      };

      set((state) => ({
        posts: [newPost, ...state.posts],
        isLoading: false,
      }));
    } catch (error: any) {
      let errorMessage = 'Failed to create post. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.error || 'Invalid request data.';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data.error || 'Server error. Please try again later.';
        }
      }
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const normalizedPosts = response.data.map((post: any) => ({
        ...post,
        id: post._id,
      }));
      set({ posts: normalizedPosts, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to fetch posts. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchUserPosts: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/user/${username}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const normalizedPosts = response.data.map((post: any) => ({
        ...post,
        id: post._id,
      }));
      set({ isLoading: false });
      return normalizedPosts;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || `Failed to fetch posts for ${username}.`;
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  addComment: async (postId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedPost = {
        ...response.data,
        id: response.data._id,
      };
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? updatedPost : post
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to add comment. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));
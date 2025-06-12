export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  isCurrentUser?: boolean;
  createdAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string | Date;
}

export interface Post {
  id: string;
  content: string;
  media?: { url: string; type: string }[];
  location?: string;
  hashtags?: string[];
  author: User;
  comments: Comment[];
  createdAt: string | Date;
}

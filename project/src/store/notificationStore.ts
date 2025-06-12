import { create } from 'zustand';
import { Notification, User } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

// Mock user data
const users = {
  sophia: {
    id: '2',
    username: 'sophia_j',
    displayName: 'Sophia Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    followerCount: 3420,
    followingCount: 356,
    createdAt: new Date(2022, 5, 20).toISOString()
  },
  mike: {
    id: '3',
    username: 'mike_design',
    displayName: 'Mike Chen',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    followerCount: 5892,
    followingCount: 420,
    createdAt: new Date(2022, 3, 10).toISOString()
  },
  emma: {
    id: '4',
    username: 'travel_emma',
    displayName: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    followerCount: 12893,
    followingCount: 552,
    createdAt: new Date(2021, 11, 5).toISOString()
  }
};

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    actor: users.sophia as User,
    post: {
      id: '101',
      author: {
        id: '1',
        username: 'johndoe',
        displayName: 'John Doe',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        followerCount: 1250,
        followingCount: 348,
        isCurrentUser: true,
        createdAt: '2023-01-15T00:00:00Z'
      },
      content: 'Just shared my latest photography project!',
      likeCount: 24,
      commentCount: 3,
      isLiked: true,
      createdAt: '2023-09-10T12:00:00Z'
    },
    read: false,
    createdAt: '2023-09-10T12:30:00Z'
  },
  {
    id: '2',
    type: 'comment',
    actor: users.mike as User,
    post: {
      id: '102',
      author: {
        id: '1',
        username: 'johndoe',
        displayName: 'John Doe',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        followerCount: 1250,
        followingCount: 348,
        isCurrentUser: true,
        createdAt: '2023-01-15T00:00:00Z'
      },
      content: 'Visited the new art exhibition today',
      likeCount: 42,
      commentCount: 7,
      isLiked: false,
      createdAt: '2023-09-08T15:45:00Z'
    },
    comment: {
      id: 'c101',
      author: users.mike as User,
      content: 'Great shots! What camera did you use?',
      createdAt: '2023-09-10T14:20:00Z',
      likeCount: 2,
      isLiked: false
    },
    read: false,
    createdAt: '2023-09-10T14:20:00Z'
  },
  {
    id: '3',
    type: 'follow',
    actor: users.emma as User,
    read: true,
    createdAt: '2023-09-09T09:15:00Z'
  }
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const unreadCount = mockNotifications.filter(n => !n.read).length;
      
      set({ 
        notifications: mockNotifications,
        unreadCount,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch notifications:', error);
    }
  },
  
  markAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: state.unreadCount - 1
    }));
  },
  
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  }
}));
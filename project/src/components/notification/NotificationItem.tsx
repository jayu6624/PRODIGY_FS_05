import React from 'react';
import { Notification } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { getTimeAgo } from '../../lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };
  
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart size={16} className="text-accent-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-primary-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-success-500" />;
      case 'mention':
        return <AtSign size={16} className="text-warning-500" />;
      default:
        return null;
    }
  };
  
  const getNotificationText = () => {
    const name = <b>{notification.actor.displayName}</b>;
    
    switch (notification.type) {
      case 'like':
        return <span>{name} liked your post</span>;
      case 'comment':
        return <span>{name} commented on your post</span>;
      case 'follow':
        return <span>{name} started following you</span>;
      case 'mention':
        return <span>{name} mentioned you in a post</span>;
      default:
        return null;
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.read ? 'bg-primary-50 dark:bg-gray-800/50' : ''
      }`}
    >
      <div className="relative">
        <Avatar
          src={notification.actor.avatar}
          alt={notification.actor.displayName}
          size="md"
          className="mr-3"
        />
        <div className="absolute -right-1 bottom-0 rounded-full p-1 bg-white dark:bg-gray-900">
          {getNotificationIcon()}
        </div>
      </div>
      
      <div className="ml-2 flex-1">
        <div className="text-sm">
          {getNotificationText()}
          {notification.post && (
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              "{notification.post.content.length > 30 
                ? notification.post.content.substring(0, 30) + '...' 
                : notification.post.content}"
            </span>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {getTimeAgo(notification.createdAt)}
        </div>
      </div>
      
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-primary-500 ml-2 mt-2" />
      )}
    </div>
  );
}
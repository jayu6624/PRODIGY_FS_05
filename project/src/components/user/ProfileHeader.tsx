import React from 'react';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar src={user.avatar} alt={user.displayName} size="lg" />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h2 className="text-xl font-bold">@{user.username}</h2>
            {user.isCurrentUser && (
              <Button variant="secondary" size="sm">
                Edit Profile
              </Button>
            )}
          </div>
          <p className="text-lg font-medium mb-2">{user.displayName}</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>
          <div className="flex justify-center md:justify-start gap-6">
            <div>
              <span className="font-medium">{user.followerCount || 0}</span> Followers
            </div>
            <div>
              <span className="font-medium">{user.followingCount || 0}</span> Following
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
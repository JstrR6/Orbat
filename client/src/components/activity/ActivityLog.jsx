import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '../../utils/formatters';

export default function ActivityLog({ activities }) {
  const getActivityIcon = (type) => {
    const icons = {
      unit_update: '🔄',
      form_submission: '📝',
      promotion: '⭐',
      training: '📚',
      order: '📢'
    };
    return icons[type] || '📋';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-gray-500">
                  {activity.user?.username} • {formatDate(activity.createdAt)} at{' '}
                  {formatTime(activity.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Users, FileText, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Your Unit',
      value: user?.unit?.name || 'Unassigned',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Pending Forms',
      value: '3',
      icon: FileText,
      color: 'text-green-500'
    },
    {
      title: 'Recent Activities',
      value: '12',
      icon: Activity,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome, {user?.username}</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <span>{stat.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add activity items here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

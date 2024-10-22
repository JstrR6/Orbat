import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FormCard({ form, onOpen }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'in-review': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{form.type}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(form.status)}`}>
            {form.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Submitted: {new Date(form.createdAt).toLocaleDateString()}
          </div>
          <Button onClick={() => onOpen(form)} className="w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
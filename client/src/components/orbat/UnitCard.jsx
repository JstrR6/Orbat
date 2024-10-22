import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function UnitCard({ unit, onEdit, onDelete, onAssignMember }) {
  const { user } = useAuth();
  const isHighCommand = user?.roles.includes('High Command');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{unit.name}</CardTitle>
          {isHighCommand && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(unit)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(unit._id)}>
                <Trash className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onAssignMember(unit)}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Positions</h3>
            <div className="mt-2 space-y-2">
              {unit.positions.map((position) => (
                <div key={position._id} className="flex justify-between items-center">
                  <span>{position.title}</span>
                  <span className="text-gray-500">
                    {position.discordId ? `@${position.discordId}` : 'Vacant'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
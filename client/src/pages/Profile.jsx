import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`/api/users/${user?._id}/profile`);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${user?._id}/profile`, profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Profile Information</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block mb-1">Discord Username</label>
              <Input
                value={profile.username}
                disabled
              />
            </div>
            <div>
              <label className="block mb-1">Rank</label>
              <Input
                value={profile.rank}
                disabled={!isEditing}
                onChange={(e) => setProfile({ ...profile, rank: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Unit</label>
              <Input
                value={profile.unit?.name || 'Unassigned'}
                disabled
              />
            </div>
            {isEditing && (
              <Button type="submit">Save Changes</Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Join Date</label>
              <div>{new Date(profile.joinDate).toLocaleDateString()}</div>
            </div>
            <div>
              <label className="block mb-1">Current Role</label>
              <div>{profile.roles.join(', ')}</div>
            </div>
            {/* Add more service record information */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
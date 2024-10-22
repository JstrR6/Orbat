import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UnitCard from '../components/orbat/UnitCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import axios from 'axios';

export default function Orbat() {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const { data } = await axios.get('/api/units');
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleCreateUnit = async () => {
    try {
      await axios.post('/api/units', newUnit);
      setIsCreateOpen(false);
      fetchUnits();
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleSearch = async (query) => {
    try {
      const { data } = await axios.get(`/api/users/search?q=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ORBAT Management</h2>
        {user?.roles.includes('High Command') && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Unit
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <UnitCard
            key={unit._id}
            unit={unit}
            onEdit={() => {/* Handle edit */}}
            onDelete={async (id) => {
              await axios.delete(`/api/units/${id}`);
              fetchUnits();
            }}
            onAssignMember={() => {/* Handle assign */}}
          />
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Unit Name"
              value={newUnit.name}
              onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
            />
            <Input
              placeholder="Unit Type"
              value={newUnit.type}
              onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
            />
            <Button onClick={handleCreateUnit}>Create Unit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
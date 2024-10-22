import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormCard from '../components/forms/FormCard';
import axios from 'axios';

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data } = await axios.get('/api/forms/my-forms');
        setForms(data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const formTypes = [
    { id: 'training', label: 'Training' },
    { id: 'promotion', label: 'Promotion' },
    { id: 'officer-promotion', label: 'Officer Promotion' },
    { id: 'discharge', label: 'Discharge' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Forms</h2>
      
      <Tabs defaultValue="submit">
        <TabsList>
          <TabsTrigger value="submit">Submit Form</TabsTrigger>
          <TabsTrigger value="my-forms">My Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formTypes.map((type) => (
              <FormCard
                key={type.id}
                form={{
                  type: type.label,
                  status: 'new'
                }}
                onOpen={() => {/* Handle form opening */}}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-forms">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <FormCard
                  key={form._id}
                  form={form}
                  onOpen={() => {/* Handle form opening */}}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
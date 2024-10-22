import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

export default function TrainingForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post('/api/forms/submit', {
        type: 'training',
        content: data
      });
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Request Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Training Type</label>
            <Input {...register('trainingType')} required />
          </div>
          <div>
            <label className="block mb-1">Reason for Training</label>
            <Textarea {...register('reason')} required />
          </div>
          <div>
            <label className="block mb-1">Preferred Date</label>
            <Input type="date" {...register('preferredDate')} required />
          </div>
          <Button type="submit">Submit Request</Button>
        </form>
      </CardContent>
    </Card>
  );
}
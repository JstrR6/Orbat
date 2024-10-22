import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

export default function PromotionForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post('/api/forms/submit', {
        type: 'promotion',
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
        <CardTitle>Promotion Request Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Current Rank</label>
            <Input {...register('currentRank')} required />
          </div>
          <div>
            <label className="block mb-1">Time in Current Rank</label>
            <Input {...register('timeInRank')} required />
          </div>
          <div>
            <label className="block mb-1">Achievements</label>
            <Textarea {...register('achievements')} required />
          </div>
          <div>
            <label className="block mb-1">Justification</label>
            <Textarea {...register('justification')} required />
          </div>
          <Button type="submit">Submit Request</Button>
        </form>
      </CardContent>
    </Card>
  );
}
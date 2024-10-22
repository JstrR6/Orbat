import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '../../hooks/useApi';
import websocket from '../../services/websocket';

export default function FormReviewDialog({ form, open, onClose }) {
  const [comment, setComment] = useState('');
  const { request } = useApi();

  const handleReview = async (status) => {
    try {
      const response = await request({
        method: 'PUT',
        url: `/api/forms/${form._id}/review`,
        data: { status, comment }
      });

      // Notify form submitter through WebSocket
      websocket.send({
        type: 'form_update',
        formId: form._id,
        status,
        notifyUser: form.submittedBy
      });

      onClose();
    } catch (error) {
      console.error('Error reviewing form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Form Details</h3>
            <div className="mt-2">
              <p><strong>Type:</strong> {form.type}</p>
              <p><strong>Submitted By:</strong> {form.submittedBy.username}</p>
              <p><strong>Date:</strong> {new Date(form.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Content</h3>
            <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(form.content, null, 2)}</pre>
          </div>
          <div>
            <label className="block font-medium">Comment</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => handleReview('rejected')}>
            Reject
          </Button>
          <Button onClick={() => handleReview('approved')}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useForms = () => {
  const [forms, setForms] = useState([]);
  const { request, loading, error } = useApi();

  const fetchForms = async () => {
    const data = await request({
      method: 'GET',
      url: '/api/forms/my-forms'
    });
    setForms(data);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const submitForm = async (formData) => {
    const data = await request({
      method: 'POST',
      url: '/api/forms/submit',
      data: formData
    });
    await fetchForms();
    return data;
  };

  const reviewForm = async (formId, reviewData) => {
    const data = await request({
      method: 'PUT',
      url: `/api/forms/${formId}/review`,
      data: reviewData
    });
    await fetchForms();
    return data;
  };

  return {
    forms,
    loading,
    error,
    submitForm,
    reviewForm,
    refreshForms: fetchForms
  };
};
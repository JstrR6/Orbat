import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useUnits = () => {
  const [units, setUnits] = useState([]);
  const { request, loading, error } = useApi();

  const fetchUnits = async () => {
    try {
      const data = await request({
        method: 'GET',
        url: '/api/units'
      });
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const createUnit = async (unitData) => {
    const data = await request({
      method: 'POST',
      url: '/api/units',
      data: unitData
    });
    await fetchUnits();
    return data;
  };

  const updateUnit = async (id, unitData) => {
    const data = await request({
      method: 'PUT',
      url: `/api/units/${id}`,
      data: unitData
    });
    await fetchUnits();
    return data;
  };

  const deleteUnit = async (id) => {
    await request({
      method: 'DELETE',
      url: `/api/units/${id}`
    });
    await fetchUnits();
  };

  return {
    units,
    loading,
    error,
    createUnit,
    updateUnit,
    deleteUnit,
    refreshUnits: fetchUnits
  };
};
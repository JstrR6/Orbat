import React, { useState, useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card } from '@/components/ui/card';
import websocket from '../../services/websocket';

export default function UnitHierarchy() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    // Subscribe to unit updates
    websocket.subscribe('unit_update', handleUnitUpdate);
    
    return () => {
      websocket.unsubscribe('unit_update', handleUnitUpdate);
    };
  }, []);

  const handleUnitUpdate = (data) => {
    setUnits(prevUnits => {
      const updated = [...prevUnits];
      const index = updated.findIndex(u => u._id === data.unit._id);
      if (index > -1) {
        updated[index] = data.unit;
      }
      return updated;
    });
  };

  const renderUnit = (unit) => (
    <TreeNode
      key={unit._id}
      label={
        <Card className="p-4">
          <h3 className="font-bold">{unit.name}</h3>
          <p className="text-sm text-gray-500">{unit.type}</p>
        </Card>
      }
    >
      {unit.children?.map(child => renderUnit(child))}
    </TreeNode>
  );

  return (
    <div className="overflow-x-auto">
      <Tree
        lineWidth="2px"
        lineColor="#CBD5E0"
        lineBorderRadius="5px"
      >
        {units.map(unit => renderUnit(unit))}
      </Tree>
    </div>
  );
}
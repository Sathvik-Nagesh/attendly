import React, { useState } from 'react';

type ClassSection = {
  id: string;
  name: string;
};

type PointsEntry = {
  categoryId: string;
  classSectionId: string;
  position: string;
  points: number;
};

export function PointsEntryPanel() {
  const [entries, setEntries] = useState<PointsEntry[]>([]);

  // Placeholder data
  const categories = [{ id: '1', name: '100m Race' }, { id: '2', name: 'Tug of War' }];
  const classes = [{ id: 'c1', name: 'BCA A' }, { id: 'c2', name: 'BCA B' }, { id: 'c3', name: 'BCA C' }];

  const handleAddEntry = () => {
    setEntries([...entries, { categoryId: categories[0].id, classSectionId: classes[0].id, position: '1st', points: 5 }]);
  };

  const handleUpdateEntry = (index: number, field: keyof PointsEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    // Auto points mapping
    if (field === 'position') {
      if (value === '1st') newEntries[index].points = 5;
      else if (value === '2nd') newEntries[index].points = 3;
      else if (value === '3rd') newEntries[index].points = 1;
    }
    
    setEntries(newEntries);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Assign Event Points</h2>
        <button 
          onClick={handleAddEntry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Add Entry
        </button>
      </div>

      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 rounded-tl-lg">Category</th>
            <th className="p-4">Class/Section</th>
            <th className="p-4">Position</th>
            <th className="p-4">Points</th>
            <th className="p-4 rounded-tr-lg">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-4">
                <select 
                  className="w-full p-2 border rounded"
                  value={entry.categoryId}
                  onChange={e => handleUpdateEntry(idx, 'categoryId', e.target.value)}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
              <td className="p-4">
                <select 
                  className="w-full p-2 border rounded"
                  value={entry.classSectionId}
                  onChange={e => handleUpdateEntry(idx, 'classSectionId', e.target.value)}
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
              <td className="p-4">
                <select 
                  className="w-full p-2 border rounded"
                  value={entry.position}
                  onChange={e => handleUpdateEntry(idx, 'position', e.target.value)}
                >
                  <option value="1st">1st Place</option>
                  <option value="2nd">2nd Place</option>
                  <option value="3rd">3rd Place</option>
                  <option value="Participant">Participant</option>
                </select>
              </td>
              <td className="p-4">
                <input 
                  type="number" 
                  className="w-20 p-2 border rounded"
                  value={entry.points}
                  onChange={e => handleUpdateEntry(idx, 'points', parseInt(e.target.value))}
                />
              </td>
              <td className="p-4">
                <button 
                  onClick={() => setEntries(entries.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">
                No entries added yet. Click "Add Entry" to begin.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {entries.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
            Save All Entries
          </button>
        </div>
      )}
    </div>
  );
}

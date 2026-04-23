import React, { useState } from 'react';

// Mock data structure based on the PRISMA schema
type LeaderboardEntry = {
  rank: number;
  studentName: string;
  section: string;
  marks: number;
};

export function Leaderboard() {
  const [filterClass, setFilterClass] = useState('All');
  const [filterSection, setFilterSection] = useState('All');

  // Example placeholder data
  const entries: LeaderboardEntry[] = [
    { rank: 1, studentName: "Rahul Sharma", section: "BCA A", marks: 19.5 },
    { rank: 2, studentName: "Priya Singh", section: "BCA A", marks: 18.5 },
    { rank: 3, studentName: "Amit Kumar", section: "BCA B", marks: 18.0 },
    { rank: 4, studentName: "Sneha Gupta", section: "BCA C", marks: 17.5 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Academic Leaderboard</h1>
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded-md"
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
          >
            <option value="All">All Classes</option>
            <option value="BCA">BCA</option>
          </select>
          <select 
            className="p-2 border rounded-md"
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Top 3 Performers */}
      <div className="flex justify-center gap-6 mb-8">
        {entries.slice(0, 3).map((entry, index) => (
          <div key={index} className={`flex flex-col items-center p-6 rounded-xl shadow-lg ${index === 0 ? 'bg-yellow-100 scale-110' : index === 1 ? 'bg-gray-200' : 'bg-orange-100'}`}>
            <div className="text-4xl mb-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
            <div className="font-bold text-lg">{entry.studentName}</div>
            <div className="text-sm text-gray-600">{entry.section}</div>
            <div className="mt-2 text-xl font-bold">{entry.marks}/20</div>
          </div>
        ))}
      </div>

      {/* Remaining List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Section</th>
              <th className="p-4">Marks</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(3).map((entry, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-500">#{entry.rank}</td>
                <td className="p-4 font-medium">{entry.studentName}</td>
                <td className="p-4 text-gray-600">{entry.section}</td>
                <td className="p-4 font-bold text-blue-600">{entry.marks}/20</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

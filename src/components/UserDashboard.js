import React from 'react';
// We import the necessary components from the recharts library
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// The UserDashboard component
const UserDashboard = ({ documents }) => {
  // We'll calculate the verified and not verified counts from the documents array
  const verifiedCount = documents.filter(doc => doc.isVerified).length;
  const notVerifiedCount = documents.length - verifiedCount;
  const totalDocs = documents.length;
  const verificationRate = totalDocs > 0 ? Math.round((verifiedCount / totalDocs) * 100) : 0;

  // Data for the pie chart
  const data = [
    { name: 'Verified', value: verifiedCount },
    { name: 'Not Verified', value: notVerifiedCount },
  ];

  // Colors for the chart sections
  const COLORS = ['#00C49F', '#FF8042']; // Green for Verified, Orange for Not Verified

  return (
    <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'white' }}>
      <div style={{ width: '200px', height: '200px' }}>
        {/* ResponsiveContainer makes the chart fit its parent container */}
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {/* This maps our data to the chart sections and applies the colors */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {/* The text inside the pie chart */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="24px" fontWeight="bold">
              {`${verificationRate}%`}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="dashboard-stats" style={{ marginLeft: '40px' }}>
        <h3 style={{ margin: 0 }}>Verification Rate</h3>
        <p>{`Total Documents: ${totalDocs}`}</p>
        <p style={{ color: '#00C49F' }}>{`Verified: ${verifiedCount}`}</p>
        <p style={{ color: '#FF8042' }}>{`Pending: ${notVerifiedCount}`}</p>
      </div>
    </div>
  );
};

export default UserDashboard;
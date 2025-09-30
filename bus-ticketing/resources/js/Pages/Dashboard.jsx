// resources/js/Pages/Dashboard.jsx
import React from 'react';
import Sidebar from '@/Components/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Bienvenue sur le Dashboard</h1>
      </main>
    </div>
  );
};

export default Dashboard;

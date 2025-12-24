import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4">
    {icon && <div className="text-blue-600 text-2xl">{icon}</div>}
    <div>
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);

const DashboardTab: React.FC = () => {
  const stats = [
    { title: 'Utilisateurs inscrits', value: 234 },
    { title: 'Discussions actives', value: 42 },
    { title: 'Messages publiés', value: 785 },
    { title: 'Modérateurs', value: 5 },
  ];

  const recentThreads = [
    { id: 1, title: 'Présentation des membres', author: 'Alice', replies: 12 },
    { id: 2, title: 'Comment bien poster ?', author: 'Modérateur', replies: 8 },
    { id: 3, title: 'Suggestions pour le forum', author: 'Bob', replies: 5 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord du forum</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Discussions récentes</h2>
        <ul className="space-y-3">
          {recentThreads.map((thread) => (
            <li
              key={thread.id}
              className="border-b pb-2 last:border-b-0 last:pb-0"
            >
              <div className="font-medium text-blue-700">{thread.title}</div>
              <div className="text-sm text-gray-500">
                Par {thread.author} • {thread.replies} réponses
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardTab;

// ✅ App.tsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ThreadList from './components/ThreadList';
// import Profile from './components/Profile';
import Login from './pages/Login';

export default function App() {
  const isAuthenticated = localStorage.getItem('token');

  return isAuthenticated ? (
    <Layout>
      <Routes>
        <Route path="/threads" element={<ThreadList />} />
      </Routes>
    </Layout>
  ) : (
     <Layout>
    <Routes>
      <Route path="*" element={<Login />} />
    </Routes>
    </Layout>
  );
}

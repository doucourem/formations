import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import ThreadList from './components/ThreadList';
import NewThreadForm from './components/NewThreadForm';
import ThreadDetailPage from './components/ThreadDetailPage';
import { useAuth } from './components/AuthContext';

function App() {
  const { token, logout } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>🎯 Forum connecté</h1>
      {token && <button onClick={logout}>Se déconnecter</button>}

      <Routes>
        {!token ? (
          <>
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        ) : (
          <>
            <Route path="/" element={<ThreadList />} />
            <Route path="/threads/new" element={<NewThreadForm />} />
            <Route path="/threads/:id" element={<ThreadDetailPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;

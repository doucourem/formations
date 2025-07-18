import Login from './components/Login';
import Register from './components/Register';
import ThreadList from './components/ThreadList';
import  NewThreadForm  from './components/NewThreadForm';
import { useAuth } from './components/AuthContext';

function App() {
  const { token, logout } = useAuth();

  if (!token) return (
    <>
      <Login />
      <Register />
    </>
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>🎯 Forum connecté</h1>
      <button onClick={logout}>Se déconnecter</button>
      <NewThreadForm onSubmit={(title, content) => {
  console.log("Titre :", title);
  console.log("Contenu :", content);
  // Tu peux ici appeler une API ou mettre à jour un state global
}} />
      <ThreadList />
    </div>
  );
}

export default App;

import { useState } from 'react';
import api from '../api';

export default function NewThreadForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const create = async () => {
    if (!title || !content) return;
    await api.post('/threads', { title, content });
    alert('Sujet créé');
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <h3>Nouveau sujet</h3>
      <input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Message" value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={create}>Créer</button>
    </div>
  );
}

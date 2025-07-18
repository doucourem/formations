import React, { useState } from 'react';

interface Props {
  threadId: number;
  onSubmit: (threadId: number, content: string) => void;
}

const ReplyForm: React.FC<Props> = ({ threadId, onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content) {
      onSubmit(threadId, content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre réponse" required />
      <br />
      <button type="submit">Répondre</button>
    </form>
  );
};

export default ReplyForm;

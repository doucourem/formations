const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const authenticate = require('./routes/authMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
// Middleware to authenticate requests
app.use(authenticate);

// GET all threads with last message preview
app.get('/threads', async (req, res) => {
  try {
    const threadsRes = await db.query(
      `SELECT t.id, t.title, t.created_at,
        (SELECT content FROM messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message
       FROM threads t ORDER BY t.created_at DESC`
    );
    res.json(threadsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET messages of a thread
app.get('/threads/:id/messages', async (req, res) => {
  const threadId = req.params.id;
  try {
    const messagesRes = await db.query(
      'SELECT * FROM messages WHERE thread_id = $1 ORDER BY created_at ASC',
      [threadId]
    );
    res.json(messagesRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST new thread + first message
app.post('/threads', async (req, res) => {
  const { title, content, user_id } = req.body;
 

if (!title || !content || !user_id) {
  return res.status(400).json({ error: 'Title, content et user_id requis' });
}

try {
  const threadRes = await db.query(
    'INSERT INTO threads(title, user_id, content) VALUES ($1, $2, $3) RETURNING *',
    [title, user_id, content]
  );
  const thread = threadRes.rows[0];

  await db.query(
    'INSERT INTO messages(thread_id, author, content) VALUES ($1, $2, $3)',
    [thread.id, user_id, content]
  );

  res.status(201).json(thread);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
}

});

// POST reply to a thread
app.post('/threads/:id/messages', async (req, res) => {
  const threadId = req.params.id;
  const { content, author = 'Anonyme' } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content requis' });
  }
  try {
    await db.query(
      'INSERT INTO messages(thread_id, author, content) VALUES ($1, $2, $3)',
      [threadId, author, content]
    );
    res.status(201).json({ message: 'Réponse ajoutée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});

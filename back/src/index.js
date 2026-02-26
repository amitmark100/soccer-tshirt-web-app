require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors
const db = require('./config/db');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const commentRoutes = require('./routes/commentRoutes');


const app = express();

app.use(cors()); // Use cors middleware
app.use(express.json())
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/post', postRoutes);
app.use('/api/comments', commentRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Posts & Comments API' });
});

const PORT = process.env.PORT || 5000;

  db.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const roomsRouter = require('./src/routes/rooms');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomsRouter);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'RRMP API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
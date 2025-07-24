const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
// Make io accessible in other modules
module.exports.io = io;

connectDB();

app.use(cors());
app.use(express.json());

const reportRoutes = require('./routes/reportRoutes');
app.use(reportRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('SEO Checker API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

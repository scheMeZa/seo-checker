const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
require('dotenv').config();

const app = express();
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:5000';

app.post('/signup', async (req, res) => {
  try {
    const response = await axios.post(`${WORKER_URL}/process-signup`, req.body, { timeout: 20000 });
    return res.json(response.data);
  } catch (err) {
    console.error('API signup error', err.message || err);
    if (err.response && err.response.data) return res.status(err.response.status || 500).json(err.response.data);
    return res.status(500).json({ success: false, message: 'Worker unreachable', details: err.message });
  }
});

app.post('/verify', async (req, res) => {
  try {
    const response = await axios.post(`${WORKER_URL}/verify-code`, req.body, { timeout: 20000 });
    return res.json(response.data);
  } catch (err) {
    console.error('API verify error', err.message || err);
    if (err.response && err.response.data) return res.status(err.response.status || 500).json(err.response.data);
    return res.status(500).json({ success: false, message: 'Worker unreachable', details: err.message });
  }
});

app.post('/resend', async (req, res) => {
  try {
    const response = await axios.post(`${WORKER_URL}/resend-code`, req.body, { timeout: 20000 });
    return res.json(response.data);
  } catch (err) {
    console.error('API resend error', err.message || err);
    if (err.response && err.response.data) return res.status(err.response.status || 500).json(err.response.data);
    return res.status(500).json({ success: false, message: 'Worker unreachable', details: err.message });
  }
});

app.get('/', (req, res) => res.send('API Server running'));

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));

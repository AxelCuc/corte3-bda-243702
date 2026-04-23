const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar Clientes
const db = require('./db');
const cache = require('./cache');

// Rutas
const mascotasRoutes = require('./routes/mascotas');
const vacunacionRoutes = require('./routes/vacunacion');
const citasRoutes = require('./routes/citas');
const vacunasRoutes = require('./routes/vacunas');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date() 
  });
});

// Rutas API
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/vacunacion-pendiente', vacunacionRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/vacunas', vacunasRoutes);

app.listen(PORT, () => {
  console.log(`📡 Servidor API escuchando en el puerto ${PORT}`);
});
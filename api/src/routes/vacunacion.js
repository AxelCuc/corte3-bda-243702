const express = require('express');
const router = express.Router();
const db = require('../db');
const redis = require('../cache');

// GET /api/vacunacion-pendiente
router.get('/', async (req, res) => {
  const CACHE_KEY = 'vacunacion_pendiente';

  try {
    // 2. Intentar leer de Redis
    const cachedData = await redis.get(CACHE_KEY);

    // 3. CACHE HIT
    if (cachedData) {
      console.log(`[${new Date().toISOString()}] [CACHE HIT] ${CACHE_KEY}`);
      return res.json({ 
        source: 'cache', 
        data: JSON.parse(cachedData) 
      });
    }

    // 4. CACHE MISS
    console.log(`[${new Date().toISOString()}] [CACHE MISS] ${CACHE_KEY}`);
    const inicio = Date.now();

    // Consultar la vista
    const result = await db.pool.query('SELECT * FROM v_mascotas_vacunacion_pendiente');
    
    // Calcular latencia
    const latencia = Date.now() - inicio;
    console.log(`[BD] Consulta completada en ${latencia}ms`);

    // Guardar en Redis con TTL de 300 segundos
    await redis.setex(CACHE_KEY, 300, JSON.stringify(result.rows));

    // Responder
    res.json({ 
      source: 'db', 
      data: result.rows 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte de vacunación pendiente' });
  }
});

module.exports = router;